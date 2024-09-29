import { isAxiosError } from 'axios';
import { PipelineStage } from 'mongoose';

import { twitterOAuthProvider } from '@/lib/authorization/provider/twitter';
import { deleteAuthToken } from '@/lib/authorization/provider/util';
import { AuthorizationType } from '@/lib/authorization/types';
import {
    findUserWithDiscordWhitelist, findUserWithEmailWhitelist, findUserWithGoogleWhitelist,
    findUserWithSteamWhitelist, findUserWithTwitterWhitelist, findUserWithUserWhitelist,
    findUserWithWalletWhitelist, isPremiumSatisfied
} from '@/lib/battlepass/battlepass';
import logger from '@/lib/logger/winstonLogger';
import Badges from '@/lib/models/Badge';
import ContractNFT from '@/lib/models/ContractNFT';
import LotteryPool, { ILotteryPool, LotteryTwitterTopic } from '@/lib/models/LotteryPool';
import LotteryPoolRequirement, {
    LotteryPoolRequirementType
} from '@/lib/models/LotteryPoolRequirements';
import { getUserNodePurchaseAmount } from '@/lib/models/PurchaseNodeEvent';
import User from '@/lib/models/User';
import UserBadges from '@/lib/models/UserBadges';
import UserLotteryPool, { IUserLotteryPool } from '@/lib/models/UserLotteryPool';
import UserMoonBeamAudit, { UserMoonBeamAuditType } from '@/lib/models/UserMoonBeamAudit';
import UserWallet from '@/lib/models/UserWallet';
import { queryUserTwitterAuthorization } from '@/lib/quests/implementations/connectTwitterQuest';
import { redis } from '@/lib/redis/client';

import { WhitelistEntityType } from '../quests/types';

export async function getActiveLotteryPoolById(lotteryPoolId: string): Promise<ILotteryPool | null> {
  const now = Date.now()
  const lotteryPool = await LotteryPool.findOne({ lottery_pool_id: lotteryPoolId, active: true, deleted_time: null, start_time: { $lte: now }, end_time: { $gte: now }});
  return lotteryPool;
}

export async function canClaimPremiumBenifits(userId: string, lotteryPoolId: string): Promise<boolean> {
  const isPremium = await isPremiumSatisfied(userId); 
  const userLotteryPool = await UserLotteryPool.findOne({ user_id: userId, lottery_pool_id: lotteryPoolId, deleted_time: null });
  return isPremium && (!userLotteryPool || !userLotteryPool.premium_benifits_claimed);
}

export function constructVerifyResponse(verified: boolean, message: string, requireAuthorization?: boolean) {
  return { verified: verified, message: message, require_authorization: requireAuthorization? AuthorizationType.Twitter : undefined };
}

export async function verifyTwitterTopic(userId: string, lotteryPoolId: string, maxRewardClaimType: number): Promise<any> {
  const lotteryPool = await getActiveLotteryPoolById(lotteryPoolId) as ILotteryPool;
  if (!lotteryPool) {
    return constructVerifyResponse(false, "The lottery pool is not opened or has been closed.");
  }
  const twitterAuth = await queryUserTwitterAuthorization(userId);
  if (!twitterAuth) {
    return constructVerifyResponse(false, "You should connect your Twitter Account first.", true);
  }
  const rateLimitedKey = `twitter_tweets:${twitterAuth.twitter_id}`;
  const rateLimited = await redis.get(rateLimitedKey);
  if (rateLimited) {
    logger.warn(`user ${twitterAuth.user_id} twitter ${twitterAuth.twitter_id} tweets limited by redis`);
    return constructVerifyResponse(false, "Network busy, please try again later.");
  }
  const twitterUrl = `https://api.twitter.com/2/users/${twitterAuth.twitter_id}/tweets?exclude=retweets&max_results=10&tweet.fields=text,entities`;
  const twitterRequest = twitterOAuthProvider.createRequest(twitterAuth.token);
  try {
    const data: any = await twitterRequest.get(twitterUrl);
    let verified = false;
    if (data.meta.result_count > 0) {
      let urlText = "";
      const twitterTopic = lotteryPool.twitter_topics.find(topics => (topics.reward_claim_type === maxRewardClaimType)) as LotteryTwitterTopic;
      if (twitterTopic.twitter_topic_urls && twitterTopic.twitter_topic_urls.length > 0) {
        urlText = twitterTopic.twitter_topic_urls.join(",");
      }
      // 把奖池的hashtag转换成推文的格式
      let hashtagsText = "";
      if (twitterTopic.twitter_topic_hashtags && twitterTopic.twitter_topic_hashtags.length > 0) {
        hashtagsText = "#" + twitterTopic.twitter_topic_hashtags.join("#");
      }
      // 拼接整体推文, 格式是{text} + {url} + {hashtags}
      const mustHaveText = `${twitterTopic.twitter_topic_text}${urlText}${hashtagsText}`.replace(/(\r\n|\n|\r|\s)/gm, "");
      for(let twitter of data.data) {
        let twitterText: string = twitter.text.replace(/(\r\n|\n|\r|\s)/gm, "");
        if (twitter.entities && twitter.entities.urls) {
          for (let url of twitter.entities.urls) {
            twitterText = twitterText.replace(url.url, url.unwound_url);
          }
        }
        if (twitterText.includes(mustHaveText)) {
          verified = true;
          break;
        }
      }
    }
    return constructVerifyResponse(verified, verified? "" : "No Twitter content detected. Please check your post and verify again after 1 minute.");
  } catch (error) {
    if (!isAxiosError(error)) {
      throw error;
    }
    // 检查响应
    const response = error.response!;
    // 当前无权限，移除用户的授权token
    if (response.status === 403 || response.data.error_description == "Value passed for the token was invalid.") {
      logger.warn(`user ${userId} twitter ${twitterAuth.twitter_id} tweets invalidated: ${JSON.stringify(response.data)}`);
      await deleteAuthToken(twitterAuth.token);
      return constructVerifyResponse(false, "You should connect your Twitter Account first.", true);
    }
    // 当前是否已经被限流，需要添加限流处理
    if (response.status === 429) {
      logger.warn(`user ${userId} twitter ${twitterAuth.twitter_id} tweets rate limited: ${JSON.stringify(response.data)}`);
      const resetAt = response.headers["x-rate-limit-reset"];
      if (resetAt) {
        const wait = Number(resetAt) - Math.ceil(Date.now() / 1000);
        if (wait) {
            await redis.setex(rateLimitedKey, wait, 1);
        }
      }
      return constructVerifyResponse(false, "Network busy, please try again later.");
    }
    throw error;
  }
}

export async function verifyLotteryQualification(lotteryPoolId: string, drawCount: number, lotteryTicketCost: number, mbCost: number, userId: string): Promise<{ verified: boolean, message: string }> {
  const lockKey = `claim_draw_lock:${lotteryPoolId}:${userId}`;
  // 锁定用户抽奖资源10秒
  let interval: number = 10;
  const locked = await redis.set(lockKey, Date.now(), "EX", interval, "NX");
  if (!locked) {
    return {
      verified: false,
      message: `You may perform a lottery draw per ${interval}s, please try again later.`,
    };
  }
  const user = await User.findOne({ user_id: userId });
  const lotteryPool = await getActiveLotteryPoolById(lotteryPoolId) as ILotteryPool;
  if (!lotteryPool) {
    return {
      verified: false,
      message: "The lottery pool is not opened or has been closed."
    };
  }
  const userLotteryPool = await UserLotteryPool.findOne({ user_id: userId, lottery_pool_id: lotteryPoolId, deleted_time: null });
  const userS1LotteryTicketAmount = user.lottery_ticket_amount;
  const userMbAmount = user.moon_beam;
  const userAvailableDrawCount = lotteryPool.draw_limits? lotteryPool.draw_limits - (userLotteryPool ? userLotteryPool.draw_amount : 0) : 1000;
  // 验证用户是否还有可用的抽奖次数
  if (userAvailableDrawCount < drawCount) {
    return {
      verified: false,
      message: `In this pool you have ${userAvailableDrawCount} draw times left however you choose to draw ${drawCount} times.`
    }
  }
  // 验证用户本次抽奖需要消耗的资源, 默认先消耗当前奖池的免费抽奖券, 然后是其他资源, 如果资源不足或者与当前抽奖次数不匹配则返回错误信息
  if (mbCost%25 !== 0 || mbCost > userMbAmount) {
    return {
      verified: false,
      message: "Invalid moon beam cost. The moon beam cost should be mutiples of 25 or you don't have enough moon beams."
    };
  }
  if (userS1LotteryTicketAmount < lotteryTicketCost) {
    return {
      verified: false,
      message: `Invalid resource cost, you choose to use ${lotteryTicketCost} S1 tickets, however you have only ${userS1LotteryTicketAmount} S1 tickets.`
    };
  }
  let availableResourceDrawCount = 0;
  if (userLotteryPool) {
    if (userLotteryPool.free_lottery_ticket_amount >= drawCount) {
      availableResourceDrawCount = drawCount;
    }
    else {
      availableResourceDrawCount = userLotteryPool.free_lottery_ticket_amount;
    }
  }
  availableResourceDrawCount += lotteryTicketCost + mbCost/25;
  if (availableResourceDrawCount > drawCount) {
    return {
      verified: false,
      message: `Invalid resource cost, you are going to draw ${drawCount} times, however the resource you choose can draw ${availableResourceDrawCount} times.`
    };
  }
  else if (availableResourceDrawCount < drawCount) {
    return {
      verified: false,
      message: `No enough resource, you are going to draw ${drawCount} times, however the resource you choose can draw ${availableResourceDrawCount} times.`
    }
  }

  //Todo check lottery pool requirements before drawing
  const canEnterlottery = await lotteryRequirementSatisfy(userId, lotteryPoolId);
  if (!canEnterlottery.meet_requirement) {
    return {
      verified: false,
      message: "Sorry you don't meet the draw requirement of this lottery pool."
    };
  }
  return {
    verified: true,
    message: ""
  };
}

export function constructMoonBeamAudit(userId: string, lotteryPoolId: string, rewardId: string, moonBeamAmount: number, drawTimes?: number) {
  let audit = new UserMoonBeamAudit({
    user_id: userId,
    type: UserMoonBeamAuditType.LuckyDraw,
    moon_beam_delta: moonBeamAmount,
    reward_taint: `lottery_pool_id:${lotteryPoolId},reward_id:${rewardId},user:${userId}`,
    corr_id: rewardId,
    extra_info: drawTimes? String(drawTimes) : null,
    created_time: Date.now(),
  });
  return audit;
}

//判断用户是否有抽奖资格
export async function lotteryRequirementSatisfy(userId: string, lotteryPoolId: string): Promise<{ requirement_type: string, meet_requirement: boolean }> {
  //先判断徽章是否达到要求
  const requirements = await LotteryPoolRequirement.find({ lottery_pool_id: lotteryPoolId });
  let result = { requirement_type: "", meet_requirement: true };
  if (requirements && requirements.length > 0) {
    result = await lotterySatisfyByBadge(userId, requirements);
    if (!result.meet_requirement) {
      //判断白名单是否满足要求
      result = await lotterySatisfyByWhiteList(userId, requirements);
    }
    if (!result.meet_requirement) {
      //判断NFT是否满足要求
      result = await lotterySatisfyByNFT(userId, requirements);
    }
    if (!result.meet_requirement) {
      //判断node是否满足要求
      result = await lotterySatisfyByNodeHolder(userId, requirements);
    }
    if (!result.meet_requirement) {
      //判断MB是否满足要求
      result = await lotterySatisfyMB(userId, requirements);
    }
  }
  return { requirement_type: result.requirement_type, meet_requirement: result.meet_requirement };
}

export async function enrichRequirementsInfo(requirements: any[]): Promise<any> {
  let badgeIds: string[] = [];
  for (let r of requirements) {
    if (r.type === LotteryPoolRequirementType.Badge) {
      for (let p of r.properties) {
        badgeIds.push(p.badge_id);
      }
    }
  }
  //查询徽章
  const pipeline: PipelineStage[] = [{
    $match: {
      id: { $in: badgeIds }
    }
  }, {
    $project: {
      id: 1,
      series: 1
    }
  }];
  const badges: any[] = await Badges.aggregate(pipeline);
  //处理徽章查询结果，方便根据徽章ID，取出徽章信息
  let badgeInfos: Map<string, any> = new Map();
  for (let b of badges) {
    badgeInfos.set(b.id, b);
  }
  let targetBadge: any;
  for (let r of requirements) {
    if (r.type === LotteryPoolRequirementType.Badge) {
      for (let p of r.properties) {
        targetBadge = badgeInfos.get(p.badge_id);
        if (targetBadge) {
          let targetBadgeLevel = targetBadge.series[p.lvl];
          p.icon_url = targetBadgeLevel.icon_url;
          p.image_url = targetBadgeLevel.image_url;
          p.description = targetBadgeLevel.description;
        }
      }
    } else if (r.type === LotteryPoolRequirementType.WhiteList) {
      for (let p of r.properties) {
        delete p.whitelist_id;
        delete p.whitelist_entity_type;
      }
    }
  }
}

//判断徽章获得情况，判断是否满足高阶条件
async function lotterySatisfyByBadge(userId: string, requirements: any[]): Promise<{ requirement_type: string, meet_requirement: boolean }> {
  //取出徽章ID用于查询
  let badgeIds: string[] = [];
  for (let r of requirements) {
    if (r.type === LotteryPoolRequirementType.Badge) {
      for (let p of r.properties) {
        badgeIds.push(p.badge_id);
      }
    }
  }
  //查询用户已拥有的徽章
  const pipeline: PipelineStage[] = [{
    $match: {
      user_id: userId,
      badge_id: { $in: badgeIds }
    }
  }, {
    $project: {
      badge_id: 1,
      series: 1
    }
  }];
  const userBadges: any[] = await UserBadges.aggregate(pipeline);
  //处理徽章查询结果，方便根据徽章ID，取出徽章信息
  let badgeInfos: Map<string, any> = new Map();
  for (let b of userBadges) {
    badgeInfos.set(b.badge_id, b);
  }

  //判断徽章是否满足要求
  let targetBadge: any;
  let badgeSatisfied: boolean = false;
  for (let r of requirements) {
    //是否为徽章类要求
    if (r.type === LotteryPoolRequirementType.Badge) {
      for (let p of r.properties) {
        targetBadge = badgeInfos.get(p.badge_id)
        if (targetBadge) {
          for (let s of Object.keys(targetBadge.series)) {
            if (targetBadge.series[s]?.claimed_time != null) {
              //判断是否有更高阶的徽章被领取
              if (Number(s) >= Number(p.lvl)) {
                badgeSatisfied = true;
                break;
              }
            } else {
              badgeSatisfied = false;
            }
          }
        } else {
          badgeSatisfied = false;
        }
        //当有多个徽章等级要求时，出现一个不满足即退出不再进行判断，即多徽章要求之间是且的关系。若需要徽章之间是或的关系，则可以配置成单个的要求。
        if (!badgeSatisfied) {
          break;
        }
      }
      //出现满足的徽章条件即退出
      if (badgeSatisfied) {
        return { requirement_type: LotteryPoolRequirementType.Badge, meet_requirement: true };
      }
    }
  }

  return { requirement_type: LotteryPoolRequirementType.Badge, meet_requirement: false };
}

async function lotterySatisfyByWhiteList(userId: string, requirements: any[]): Promise<{ requirement_type: string, meet_requirement: boolean }> {
  let whitelistSatisfied: boolean = false;
  let userWhitelist: any;
  for (let r of requirements) {
    //是否为白名单类要求
    if (r.type === LotteryPoolRequirementType.WhiteList) {
      //判断所有的白名单要求
      for (let p of r.properties) {
        switch (p.whitelist_entity_type) {
          case WhitelistEntityType.WalletAddr:
            userWhitelist = await findUserWithWalletWhitelist(userId, p.whitelist_id);
            break;
          case WhitelistEntityType.DiscordId:
            userWhitelist = await findUserWithDiscordWhitelist(userId, p.whitelist_id);
            break;
          case WhitelistEntityType.TwitterId:
            userWhitelist = await findUserWithTwitterWhitelist(userId, p.whitelist_id);
            break;
          case WhitelistEntityType.GoogleId:
            userWhitelist = await findUserWithGoogleWhitelist(userId, p.whitelist_id);
            break;
          case WhitelistEntityType.SteamId:
            userWhitelist = await findUserWithSteamWhitelist(userId, p.whitelist_id);
            break;
          case WhitelistEntityType.UserId:
            userWhitelist = await findUserWithUserWhitelist(userId, p.whitelist_id);
            break;
          case WhitelistEntityType.Email:
            userWhitelist = await findUserWithEmailWhitelist(userId, p.whitelist_id);
            break;
        }
        whitelistSatisfied = !!userWhitelist;

        if (!whitelistSatisfied) {
          break;
        }
      }
      //如果用户通过白名单获得高阶通证，则需要进行更新
      if (whitelistSatisfied) {
        return { requirement_type: LotteryPoolRequirementType.WhiteList, meet_requirement: true };
      }
    }
  }
  return { requirement_type: LotteryPoolRequirementType.WhiteList, meet_requirement: false };
}

//判断NFT获得情况，判断是否满足高阶条件
async function lotterySatisfyByNFT(userId: string, requirements: any[]): Promise<{ requirement_type: string, meet_requirement: boolean }> {
  let nftSatisfied: boolean = false;
  for (let r of requirements) {
    //是否为NFT类要求
    if (r.type === LotteryPoolRequirementType.NFT) {
      //判断所有的NFT要求
      for (let p of r.properties) {
        const userWallet = await UserWallet.findOne({ user_id: userId, deleted_time: null });
        if (userWallet) {
          const userNFT = await ContractNFT.findOne({ wallet_addr: userWallet.wallet_addr, contract_address: p.contract_addr, deleted_time: null, transaction_status: 'confirmed' });
          nftSatisfied = !!userNFT;
        } else {
          nftSatisfied = false;
        }
        //当有多个NFT持有要求时，出现一个不满足即退出不再进行判断，即多NFT要求之间是且的关系。若需要NFT之间是或的关系，则可以配置成单个的要求。
        if (!nftSatisfied) {
          break;
        }
      }
      if (nftSatisfied) {
        return { requirement_type: LotteryPoolRequirementType.NFT, meet_requirement: true };
      }
    }
  }
  return { requirement_type: LotteryPoolRequirementType.NFT, meet_requirement: false };
}

async function lotterySatisfyByNodeHolder(userId: string, requirements: any[]): Promise<{ requirement_type: string, meet_requirement: boolean }> {
  let nodeSatisfied: boolean = false;
  for (let r of requirements) {
    //是否为Node类要求
    if (r.type === LotteryPoolRequirementType.Node) {
      //判断所有的Node要求
      for (let p of r.properties) {
        const userWallet = await UserWallet.findOne({ user_id: userId, deleted_time: null });
        if (userWallet) {
          const userNodePurchaseAmount = await getUserNodePurchaseAmount(userWallet.wallet_addr, p.contract_addr);
          let nodeAmountSatisfy = true;
          if (p.node_amount > 0) {
            nodeAmountSatisfy = userNodePurchaseAmount >= p.node_amount;
          }
          nodeSatisfied = nodeAmountSatisfy && !!userNodePurchaseAmount;
        } else {
          nodeSatisfied = false;
        }
        //当有多个node持有要求时，出现一个不满足即退出不再进行判断，即多NFT要求之间是且的关系。若需要node之间是或的关系，则可以配置成单个的要求。
        if (!nodeSatisfied) {
          break;
        }
      }
      if (nodeSatisfied) {
        return { requirement_type: LotteryPoolRequirementType.Node, meet_requirement: true };
      }
    }
  }
  return { requirement_type: LotteryPoolRequirementType.Node, meet_requirement: false };
}

async function lotterySatisfyMB(userId: string,  requirements: any[]): Promise<{ requirement_type: string, meet_requirement: boolean }> {
  let mbSatisfied: boolean = false;
  for (let r of requirements) {
    //是否为NFT类要求
    if (r.type === LotteryPoolRequirementType.Moonbeam) {
      const user = await User.findOne({ user_id: userId });
      const mb = user.moon_beam;
      //判断所有的NFT要求
      for (let p of r.properties) {
        if (mb >= p.mb_amount) {
          mbSatisfied = true;
        } else {
          mbSatisfied = false;
        }
        //当有多个NFT持有要求时，出现一个不满足即退出不再进行判断，即多NFT要求之间是且的关系。若需要NFT之间是或的关系，则可以配置成单个的要求。
        if (!mbSatisfied) {
          break;
        }
      }
      if (mbSatisfied) {
        return { requirement_type: LotteryPoolRequirementType.Moonbeam, meet_requirement: true };
      }
    }
  }
  return { requirement_type: LotteryPoolRequirementType.Moonbeam, meet_requirement: false };
}