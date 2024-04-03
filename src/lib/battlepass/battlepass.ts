import BattlePassSeasons from '@/lib/models/BattlePassSeasons';
import UserBattlePassSeasons, { BattlePassType } from '@/lib/models/UserBattlePassSeasons';
import Quest from '@/lib/models/Quest';
import BattlePassPremiumRequirements, { BattlePassRequirementType } from '../models/BattlepassPremiumRequirements';
import UserBadges from '../models/UserBadges';
import { PipelineStage } from 'mongoose';
import UserWallet from '../models/UserWallet';
import ContractNFT from '../models/ContractNFT';

//获得当前赛季ID
export async function getCurrentBattleSeasonId(): Promise<any> {
  const now: number = Date.now();
  const current_season = await BattlePassSeasons.findOne({ start_time: { $lte: now }, end_time: { $gte: now } });
  //是否
  if (current_season) {
    return current_season.id;
  } else {
    return undefined;
  }
}
//获取当前赛季
export async function getCurrentBattleSeason(): Promise<any> {
  const now: number = Date.now();
  const current_season = await BattlePassSeasons.findOne({ start_time: { $lte: now }, end_time: { $gte: now } });
  return current_season;
}

//获得用户赛季
export async function getUserBattlePass(user_id: string): Promise<any> {
  const season_id: any = await getCurrentBattleSeasonId();
  const user_season_pass = await UserBattlePassSeasons.findOne({ user_id: user_id, battlepass_season_id: season_id });
  return user_season_pass;
}

//完成quest时，更新用户通行证信息
export async function updateUserBattlepass(userId: string, questId: string, mbAmont: number, session: any) {
  const userBattlepass = await getUserBattlePass(userId);
  //判断用户是否有通行证
  if (userBattlepass) {
    const quest = await Quest.findOne({ id: questId });
    //普通任务，赛季进度+1
    let seasonPassProgress: number = 1;
    if (quest.reward.season_pass_progress) {
      //特殊任务根据配置而定
      seasonPassProgress = quest.reward.season_pass_progress;
    }
    await UserBattlePassSeasons.updateOne({ user_id: userId, battlepass_season_id: userBattlepass.battlepass_season_id }, {
      $inc: { finished_tasks: seasonPassProgress, total_moon_beam: mbAmont },
      updated_time: Date.now()
    }, { upsert: true, session: session });
  }
}

//判断用户是否具有高阶通行证资格
export async function isPremiumSatisfied(userId: string): Promise<boolean> {
  const result = await premiumSatisfy(userId);
  return result.is_premium;
}

//判断用户是否高阶通证，及具体的类型
export async function premiumSatisfy(userId: string): Promise<{ premium_type: string, is_premium: boolean, all_requirements: any }> {
  let satisfied: boolean = false;
  let allRequirements: any = { badge: [], nft: [] };
  const seasonId = await getCurrentBattleSeasonId();
  //先查询用户是否已依据徽章获得高阶通证资格
  const userBattlepass = await UserBattlePassSeasons.findOne({ user_id: userId, battlepass_season_id: seasonId });
  if (userBattlepass.is_premium) {
    return { premium_type: userBattlepass.premium_type, is_premium: userBattlepass.is_premium, all_requirements: allRequirements };
  }

  //先判断徽章是否达到要求,取出徽章ID用于查询
  const requirements = await BattlePassPremiumRequirements.find({ season_id: seasonId });
  let badgeIds: string[] = [];
  for (let r of requirements) {
    if (r.type === BattlePassRequirementType.Badge) {
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
    if (r.type === BattlePassRequirementType.Badge) {
      allRequirements.badge.push(r.description);
      for (let p of r.properties) {
        targetBadge = badgeInfos.get(p.badge_id)
        if (targetBadge) {
          if (targetBadge.series[p.lvl]?.claimed_time != null) {
            badgeSatisfied = true;
          } else {
            badgeSatisfied = false;
          }
        }
        //当有多个徽章等级要求时，出现一个不满足即退出不再进行判断，即多徽章要求之间是且的关系。若需要徽章之间是或的关系，则可以配置成单个的要求。
        if (!badgeSatisfied) {
          break;
        }
      }
      if (badgeSatisfied) {
        satisfied = badgeSatisfied;
        await UserBattlePassSeasons.updateOne({ user_id: userId, battlepass_season_id: seasonId }, { premium_type: BattlePassRequirementType.Badge, is_premium: satisfied });
        return { premium_type: BattlePassRequirementType.Badge, is_premium: satisfied, all_requirements: allRequirements };
      }
    }
  }

  //处理NFT类要求，分开判断的原因是防止NFT类先满足了高阶通证的要求，导致不能使用徽章判断降低数据库负担
  let nftSatisfied: boolean = false;
  for (let r of requirements) {
    //是否为NFT类要求
    if (r.type === BattlePassRequirementType.NFT) {
      allRequirements.nft.push(r.description);
      for (let p of r.properties) {
        const userWallet = await UserWallet.findOne({ user_id: userId, deleted_time: null });
        if (userWallet) {
          const userNFT = await ContractNFT.findOne({ wallet_addr: userWallet.wallet_addr, contract_address: p.contract_addr, transaction_status: 'confirmed' });
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
        satisfied = nftSatisfied;
        break;
      }
    }
  }

  return { premium_type: BattlePassRequirementType.NFT, is_premium: satisfied, all_requirements: allRequirements };
}