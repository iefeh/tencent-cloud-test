import { UserContextRequest } from '@/lib/middleware/auth';
import type { NextApiResponse } from 'next';
import AirdropConfigs, { IAirdropConfigs, AirdropStage, AirdropStageConfig } from '../models/AirdropConfig';
import logger from '@/lib/logger/winstonLogger';
import doTransaction from '@/lib/mongodb/transaction';
import User, { IUser } from '@/lib/models/User';
import UserWallet, { IUserWallet } from '../models/UserWallet';
import UserMoreSnapshot, { IUserMoreSnapshot, UserMoreSnapshotClaimStatus } from '@/lib/models/UserMoreSnapshot';
import UserMoreAudit, { IUserMoreAudit } from '@/lib/models/UserMoreAudit';
import Badges from '../models/Badge';
import Mint, { IMint, MintSourceType, MintStatus } from '@/lib/models/Mint';
import UserBadges, { IUserBadges } from '../models/UserBadges';
import { PipelineStage } from 'mongoose';
import * as response from '@/lib/response/response';
import { findAirdropContract } from '../models/Contract';
import { ethers } from 'ethers';

export interface AirdropStageStatus {
  current_stage: AirdropStage; // 当前阶段
  remain?: number; // 剩余时间MS
  end_time?: number; // 结束时间MS
}

export interface AirdropMoonbeamInfo {
  total_moon_beam: number; // 总MB数
  booster: number; // 倍率
  more?: number; // 对应MORE数值，有汇率后才能计算出此项
}

export interface AirdropQuestInfo {
  play_to_airdrop: number; // P2A任务可领取的MORE
  nft_sbt: number; // NFT和SBT任务可领取的MORE
}

export interface AirdropTokenBadgeInfo {
  badge_name: string; // token box badge名称
  img: string; // token box badge图标URL
}

export interface AirdropTokenBoxInfo {
  badges: AirdropTokenBadgeInfo[]; // badge信息
  more?: number; // 对应MORE数值，FDV后才能计算出此项
}

export interface AirdropUserInfo {
  available: boolean; // 是否有资格领取空投
  claimed?: boolean; // 是否已领取空投
  total_more: number; // 总计可领取/已领取的MORE数
  moon_beam?: AirdropMoonbeamInfo; // MB信息
  quests?: AirdropQuestInfo; // 任务信息
  token_box?: AirdropTokenBoxInfo; // Token box 信息
}

interface UserAirdropInfo {
  moon_beam: number; // MB信息
  total_more: number; // 总计可领取/已领取的MORE数
  // P2A任务获取的More总数量
  p2a_more: number;
  // NFT和SBT验证任务获取的More总数量
  nft_sbt_more: number;
  moonbeam_booster: number; // MB兑换more倍率
  token_box: string[]; // 拥有的token box id
}

async function getAirdropUserInfoFromUserData(
  req: UserContextRequest,
  res: NextApiResponse,
  config?: IAirdropConfigs | null | undefined,
): Promise<any> {
  try {
    const now = Date.now();
    if (!config) {
      config = await AirdropConfigs.findOne();
      if (!config) {
        const err = new Error(
          'getAirdropUserInfoFromUserData request time: ' + now.toString() + ', no airdrop config found.',
        );
        throw err;
      }
    }

    const stageInfo = await getAirdropStage(config);
    if (stageInfo.current_stage === AirdropStage.CLAIM || stageInfo.current_stage === AirdropStage.COOLDOWN) {
      // 已经在claim或冷却期，直接去查 UserMoreSnapshot
      return getAirdropUserInfoFromUserMoreSnapshot(req, res, config);
    }

    const aggregateQuery: PipelineStage[] = [
      {
        $match: {
          user_id: req.userId,
          deleted_time: null,
          moon_beam: { $gte: config.min_eligible_moonbeam },
        },
      },
      {
        $lookup: {
          from: 'user_badges',
          localField: 'user_id',
          foreignField: 'user_id',
          as: 'badges',
          pipeline: [
            {
              $facet: {
                total: [
                  {
                    $limit: config.moonbeam_lv2_badge_req,
                  },
                ],
                thruster: [
                  {
                    $match: {
                      badge_id: config.s1_premium_thruster_badge_id,
                    },
                  },
                  {
                    $limit: 1,
                  },
                ],
              },
            },
            {
              $project: {
                badge_count: { $size: '$total' },
                has_thruster: {
                  $gt: [
                    {
                      $size: '$thruster',
                    },
                    0,
                  ],
                },
              },
            },
          ],
        },
      },
      {
        $unwind: {
          path: '$badges',
        },
      },
      {
        $lookup: {
          from: 'mints',
          localField: 'user_id',
          foreignField: 'user_id',
          as: 'sbts',
          pipeline: [
            {
              $facet: {
                token_boxes: [
                  {
                    $match: {
                      source_id: {
                        $in: Array.from(config.token_box_config.keys()),
                      },
                      source_type: MintSourceType.Badges,
                      status: MintStatus.Confirmed,
                    },
                  },
                ],
                noviceNotch: [
                  {
                    $match: {
                      source_id: config.novice_notch_badge_id,
                      source_type: MintSourceType.Badges,
                      status: MintStatus.Confirmed,
                    },
                  },
                  { $limit: 1 },
                ],
                thruster: [
                  {
                    $match: {
                      source_id: {
                        $in: [config.s1_standard_thruster_badge_id, config.s1_premium_thruster_badge_id],
                      },
                      source_type: MintSourceType.Badges,
                      status: MintStatus.Confirmed,
                    },
                  },
                  { $limit: 1 },
                ],
              },
            },
            {
              $project: {
                token_boxes: 1,
                has_novice_notch: {
                  $gt: [
                    {
                      $size: '$noviceNotch',
                    },
                    0,
                  ],
                },
                thruster_minted: {
                  $gt: [
                    {
                      $size: '$thruster',
                    },
                    0,
                  ],
                },
              },
            },
          ],
        },
      },
      {
        $unwind: {
          path: '$sbts',
          preserveNullAndEmptyArrays: false,
        },
      },
      {
        $project: {
          _id: 0,
          moon_beam: 1,
          total_more: 1,
          p2a_more: 1,
          nft_sbt_more: 1,
          moonbeam_booster: {
            $cond: {
              if: {
                $eq: ['$sbts.has_novice_notch', false],
              },
              then: {
                $cond: {
                  if: {
                    $gte: ['$badges.badge_count', config.moonbeam_lv1_badge_req],
                  },
                  then: config.moonbeam_lv1_booster,
                  else: 0,
                },
              },
              else: {
                $cond: {
                  if: {
                    $eq: ['$sbts.thruster_minted', true],
                  },
                  then: config.moonbeam_lv4_booster,
                  else: {
                    $cond: {
                      if: {
                        $eq: ['$badges.has_thruster', true],
                      },
                      then: config.moonbeam_lv3_booster,
                      else: {
                        $cond: {
                          if: {
                            $gte: ['$badges.badge_count', config.moonbeam_lv2_badge_req],
                          },
                          then: config.moonbeam_lv2_booster,
                          else: {
                            $cond: {
                              if: {
                                $gte: ['$badges.badge_count', config.moonbeam_lv1_badge_req],
                              },
                              then: config.moonbeam_lv1_booster,
                              else: 0,
                            },
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
          token_box: { $ifNull: ['$sbts.token_boxes.source_id', []] },
        },
      },
      {
        $match: {
          moonbeam_booster: { $gte: config.moonbeam_lv1_booster },
        },
      },
    ];

    const aggregateResult: UserAirdropInfo[] = await User.aggregate(aggregateQuery);
    if (aggregateResult.length <= 0) {
      // 此时有可能snapshot数据在生成中，但标志没变，去snapshot查
      return getAirdropUserInfoFromUserMoreSnapshot(req, res, config);
    }

    const user: UserAirdropInfo = aggregateResult[0];

    user.p2a_more = !!user.p2a_more ? Number(user.p2a_more.toFixed(2)) : 0;
    user.nft_sbt_more = !!user.nft_sbt_more ? Number(user.nft_sbt_more.toFixed(2)) : 0;

    let userInfo: AirdropUserInfo = {
      available: true,
      total_more: user.p2a_more + user.nft_sbt_more,
      moon_beam: { total_moon_beam: user.moon_beam, booster: user.moonbeam_booster },
      quests: { play_to_airdrop: user.p2a_more, nft_sbt: user.nft_sbt_more },
      token_box: {
        badges: await Badges.aggregate([
          { $match: { id: { $in: user.token_box } } },
          { $project: { _id: 0, badge_name: '$name', img: '$series.1.icon_url' } },
        ]),
      },
    };

    return res.json(response.success(userInfo));
  } catch (err) {
    logger.error(err);
    return res.status(500).json(response.serverError());
  }
}

async function getAirdropUserInfoFromUserMoreSnapshot(
  req: UserContextRequest,
  res: NextApiResponse,
  config?: IAirdropConfigs | null | undefined,
): Promise<any> {
  try {
    const now = Date.now();
    if (!config) {
      config = await AirdropConfigs.findOne();
      if (!config) {
        const err = new Error(
          'getAirdropUserInfoFromUserMoreSnapshot request time: ' + now.toString() + ', no airdrop config found.',
        );
        throw err;
      }
    }

    const stageInfo = await getAirdropStage(config);

    const userMore: IUserMoreSnapshot | null = await UserMoreSnapshot.findOne({ user_id: req.userId! });
    if (!userMore) {
      return res.json(response.success({ available: false, total_more: 0 }));
    }

    if (stageInfo.current_stage === AirdropStage.COOLDOWN) {
      return res.json(
        response.success({
          available: !!userMore.status && userMore.status === UserMoreSnapshotClaimStatus.CLAIMED,
          total_more: userMore.total_more,
        }),
      );
    }

    // 上面的结果已经过滤了冷却期没有领取的情况，下面直接按非冷却期处理
    let userInfo: AirdropUserInfo = {
      available: true,
      total_more:
        stageInfo.current_stage === AirdropStage.CLAIM
          ? userMore.total_more
          : userMore.p2a_more + userMore.nft_sbt_more,
      moon_beam: {
        total_moon_beam: userMore.moonbeam,
        booster: userMore.moonbeam_booster,
      },
      quests: { play_to_airdrop: userMore.p2a_more, nft_sbt: userMore.nft_sbt_more },
    };

    if (stageInfo.current_stage === AirdropStage.CLAIM) {
      userInfo.moon_beam!.more = userMore.moonbeam_to_more;
    }

    let tokenBoxMore = 0;
    let tokenBoxKeys: string[] = [];
    if (!!userMore.token_box_info) {
      tokenBoxKeys = Array.from(userMore.token_box_info.keys());
      Array.from(userMore.token_box_info.values()).forEach((value) => {
        tokenBoxMore += value;
      });
    }

    const aggregateQuery: PipelineStage[] = [
      { $match: { id: { $in: tokenBoxKeys } } },
      { $project: { _id: 0, badge_name: '$name', img: '$series.1.icon_url' } },
    ];
    userInfo.token_box = { badges: await Badges.aggregate(aggregateQuery) };
    if (stageInfo.current_stage === AirdropStage.CLAIM && tokenBoxMore > 0) {
      userInfo.token_box!.more = tokenBoxMore;
    }

    return res.json(response.success(userInfo));
  } catch (err) {
    logger.error(err);
    return res.status(500).json(response.serverError());
  }
}

export async function getAirdropStage(config?: IAirdropConfigs | null | undefined): Promise<AirdropStageStatus> {
  const now = Date.now();
  if (!config) {
    config = await AirdropConfigs.findOne();
    if (!config) {
      const err = new Error('getAirdropStage request time: ' + now.toString() + ', no airdrop config found.');
      throw err;
    }
  }

  const stages: AirdropStageConfig[] = Array.from(config.stages.values());
  const matchingStage = stages.find((stage: AirdropStageConfig): boolean => {
    if (stage.stage_name === AirdropStage.COOLDOWN && stage.start_time <= now) {
      return true;
    }

    if (stage.start_time <= now && stage.end_time > now) {
      return true;
    }

    return false;
  });

  if (matchingStage) {
    if (matchingStage.stage_name === AirdropStage.COOLDOWN) {
      return { current_stage: matchingStage.stage_name };
    }

    return {
      current_stage: matchingStage.stage_name,
      remain: matchingStage.end_time - now,
      end_time: matchingStage.end_time,
    };
  }

  const err = new Error('getAirdropStage request time: ' + now.toString() + ', no proper airdrop stage info found.');
  throw err;
}

export async function getAirdropUserInfo(req: UserContextRequest, res: NextApiResponse): Promise<any> {
  const now = Date.now();
  const config: IAirdropConfigs | null = await AirdropConfigs.findOne();
  if (!config) {
    const err = new Error('getAirdropUserInfo request time: ' + now.toString() + ', no airdrop config found.');
    logger.error(err);
    return res.status(500).json(response.serverError());
  }

  if (!config.snapshot_created) {
    return await getAirdropUserInfoFromUserData(req, res, config);
  }

  return await getAirdropUserInfoFromUserMoreSnapshot(req, res, config);
}

export async function claimAirdropPermit(req: UserContextRequest, res: NextApiResponse): Promise<any> {
  try {
    // 查询空投配置信息
    const now = Date.now();
    const config: IAirdropConfigs | null = await AirdropConfigs.findOne();
    if (!config) {
      const err = new Error('claimAirdrop request time: ' + now.toString() + ', no airdrop config found.');
      throw err;
    }

    if (!config.snapshot_created) {
      const err = new Error('claimAirdrop request time: ' + now.toString() + ', snapshot not created.');
      throw err;
    }

    const stageInfo = await getAirdropStage(config);

    if (stageInfo.current_stage !== AirdropStage.CLAIM) {
      return res.status(400).json(response.airdropNotInClaimStage());
    }

    // 只允许从snapshot读取用户数据，后续修改也直接改snapshot的状态
    // 在此之前用户表存储的MB、MORE信息已经被清空
    const userMore: IUserMoreSnapshot | null = await UserMoreSnapshot.findOne({ user_id: req.userId! });
    if (!userMore) {
      return res.status(400).json(response.airdropUserNotEligible());
    }

    // 查询用户钱包，以构建领取许可.
    const userWallet: IUserWallet | null = await UserWallet.findOne({ user_id: req.userId!, deleted_time: null });
    if (!userWallet) {
      return res.status(400).json(response.walletNotConnected());
    }

    // 构建领取许可
    const permit = await constructAirdropPermit(config.chain_id, userWallet.wallet_addr, userMore.total_more);
    return res.json(response.success(permit));
  } catch (err) {
    logger.error(err);
    return res.status(500).json(response.serverError());
  }
}

async function constructAirdropPermit(chain_id: string, claimer: string, amount: number) {
  const airdropCtrt = await findAirdropContract(chain_id);
  if (!airdropCtrt) {
    throw new Error(`airdrop contract not found for chain ${chain_id}.`);
  }
  const domain = {
    name: 'MoonveilAirdrop',
    version: '1',
    chainId: Number(chain_id),
    verifyingContract: ethers.getAddress(airdropCtrt.address),
  };
  const types = {
    ClaimPermit: [
      { name: 'claimer', type: 'address' },
      { name: 'beneficiary', type: 'address' },
      { name: 'amount', type: 'uint256' },
    ],
  };
  const claimPermit: any = {
    claimer: ethers.getAddress(claimer),
    beneficiary: ethers.getAddress(claimer),
    amount: ethers.parseEther(amount.toString()).toString(),
  };
  const signer = new ethers.Wallet(process.env.DEVELOPER_PRIVATE_KEY!, null);
  claimPermit.signature = await signer.signTypedData(domain, types, claimPermit);
  return {
    chain_id: chain_id,
    contract_address: airdropCtrt.address,
    permit: claimPermit,
  };
}
