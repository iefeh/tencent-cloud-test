import type { NextApiResponse } from "next";
import { createRouter } from "next-connect";
import * as response from "@/lib/response/response";
import { mustAuthInterceptor, UserContextRequest } from "@/lib/middleware/auth";
import logger from "@/lib/logger/winstonLogger";
import Quest from "@/lib/models/Quest";
import { PipelineStage } from "mongoose";
import UserMoonBeamAudit, { UserMoonBeamAuditType } from "@/lib/models/UserMoonBeamAudit";
import { getCurrentBattleSeasonId } from "@/lib/battlepass/battlepass";
import User from "@/lib/models/User";
import Badges from "@/lib/models/Badge";
import Campaign from "@/lib/models/Campaign";
import RewardAccelerator from "@/lib/models/RewardAccelerator";

const router = createRouter<UserContextRequest, NextApiResponse>();

router.use(mustAuthInterceptor).get(async (req, res) => {
    let { page_num, page_size, tab } = req.query;
    if (!page_num || !page_size) {
        res.json(response.invalidParams());
        return
    }
    const pageNum = Number(page_num);
    const pageSize = Number(page_size);
    // 若当前未传入tab, 则默认查询Season tab.
    const seasonId: string = await getCurrentBattleSeasonId();
    let tabs: any[] = [`Season ${seasonId}`, "Referral Program", "Badge", "Special Reward"];
    if (!tab) {
        tab = tabs[0];
    }

    const userId = req.userId!;
    const pagination = await paginationUserMoonbeamHistory(userId, tab as string, seasonId, pageNum, pageSize);
    if (pagination.total == 0 || pagination.mbs.length == 0) {
        // 当前没有匹配的数据
        res.json(response.success({
            tabs: tabs,
            current_tab: tab,
            total: pagination.total,
            page_num: pageNum,
            page_size: pageSize,
            quests: pagination.mbs,
        }));
        return;
    }
    // 查询奖励细节
    const mbs = pagination.mbs;
    await enrichMbsDetail(tab as string, seasonId, mbs);

    res.json(response.success({
        tabs: tabs,
        current_tab: tab,
        total: pagination.total,
        page_num: pageNum,
        page_size: pageSize,
        quests: mbs,
    }));
});

// 查询MB数据
async function paginationUserMoonbeamHistory(userId: string, tab: string, seasonId: string, pageNum: number, pageSize: number): Promise<{ total: number, mbs: any[] }> {
    let matchOpts: any = {
        user_id: userId,
        deleted_time: null,
        moon_beam_delta: { $ne: 0 }
    };
    // 根据不同的组合类型查询不同的数据
    let types: any[];
    switch (tab) {
        case "Referral Program":
            types = [UserMoonBeamAuditType.DirectReferral, UserMoonBeamAuditType.IndirectReferral];
            matchOpts.type = { $in: types };
            break;
        case "Badge":
            matchOpts.type = UserMoonBeamAuditType.Badges;
            break;
        case "Special Reward":
            types = [UserMoonBeamAuditType.CDK];
            matchOpts.type = { $in: types };
            break;
        default:
            types = [UserMoonBeamAuditType.Quests, UserMoonBeamAuditType.Campaigns, UserMoonBeamAuditType.CampaignBonus];
            let or: any = { $or: [] };
            or.$or.push({ type: { $in: types } });
            or.$or.push({ type: UserMoonBeamAuditType.BattlePass, corr_id: String(seasonId) });
            matchOpts.$and = [or];
    }

    const skip = (pageNum - 1) * pageSize;

    const aggregateQuery: PipelineStage[] = [
        {
            $match: matchOpts
        },
        {
            $sort: {
                created_time: -1
            }
        },
        {
            $project: {
                _id: 0,
                type: 1,
                moon_beam_delta: 1,
                reward_taint: 1,
                created_time: 1,
                corr_id: 1,
                extra_info: 1,
            }
        },
        {
            $facet: {
                metadata: [{ $count: "total" }],
                data: [{ $skip: skip }, { $limit: pageSize }]
            }
        }
    ];
    const results = await UserMoonBeamAudit.aggregate(aggregateQuery);
    if (results[0].metadata.length == 0) {
        return { total: 0, mbs: [] }
    }
    return { total: results[0].metadata[0].total, mbs: results[0].data }
}

async function enrichMbsDetail(tab: string, seasonId: string, mbs: any[]): Promise<any> {
    switch (tab) {
        case "Referral Program":
            let referralUsers: any[] = [];
            mbs.forEach(mb => {
                if (mb.type === UserMoonBeamAuditType.DirectReferral) {
                    mb.type = "Direct Referral";
                } else {
                    mb.type = "Indirect Referral";
                }
                referralUsers.push(mb.corr_id);
            });
            let userInfo: any[] = await User.find({ user_id: { $in: referralUsers } }, { user_id: 1, username: 1 });
            const usernameMap = new Map<string, string>(userInfo.map(user => [user.user_id, user.username]));
            mbs.forEach(mb => {
                mb.item = `Successfully invited ${usernameMap.get(mb.corr_id) ? usernameMap.get(mb.corr_id) : " 1 user"}`;
            })
            break;
        case "Badge":
            let badgeIds: any[] = [];
            mbs.forEach(mb => {
                badgeIds.push(mb.corr_id);
            });
            const badgeInfos: any[] = await Badges.find({ id: { $in: badgeIds } }, { id: 1, name: 1, series: 1 });
            badgeInfos.forEach(badge => {
                // 判断是否为没有等级的一级徽章
                badge.exclusive_level = (badge.series.size === 1);
            });
            const badgeMap = new Map<string, any>(badgeInfos.map(badge => [badge.id, badge]));
            mbs.forEach(mb => {
                if (badgeMap.get(mb.corr_id).exclusive_level) {
                    mb.type = "Exclusive Level";
                } else {
                    mb.type = `Level ${mb.extra_info}`;
                }
                mb.item = `Claim ${badgeMap.get(mb.corr_id).name} Badge`;
            });
            break;
        case "Special Reward":
            mbs.forEach(mb => {
                if (mb.type === UserMoonBeamAuditType.CDK) {
                    mb.type = "Redeem Code";
                    mb.item = `Redeem code ${mb.corr_id}`;
                } else {
                    mb.type = "Lottery Prize";
                    mb.item = `Win a lottery prize`;
                }
            })
            break;
        default:
            let questIds: any[] = [];
            let campaignIds: any[] = [];
            let multiplierIds: any[] = [];
            mbs.forEach(mb => {
                if (mb.type === UserMoonBeamAuditType.Quests) {
                    // 常规任务ID
                    questIds.push(mb.corr_id);
                } else if (mb.type === UserMoonBeamAuditType.Campaigns) {
                    // 活动ID
                    campaignIds.push(mb.corr_id);
                } else {
                    // 保存加速器ID
                    multiplierIds.push(mb.extra_info);
                }
            });
            // 查询关联信息
            const quests: any[] = await Quest.find({ id: { $in: questIds } }, { id: 1, name: 1 });
            const campaigns: any[] = await Campaign.find({ id: { $in: campaignIds } }, { id: 1, name: 1 })
            const multipliers: any[] = await RewardAccelerator.find({ id: { $in: multiplierIds } }, { id: 1, name: 1 });
            const questsNameMap = new Map<string, string>(quests.map(quest => [quest.id, quest.name]));
            const campaignsNameMap = new Map<string, string>(campaigns.map(camp => [camp.id, camp.name]));
            const multipliersNameMap = new Map<string, string>(multipliers.map(multiplier => [multiplier.id, multiplier.name]));

            // 填充名字信息
            mbs.forEach(mb => {
                if (mb.type === UserMoonBeamAuditType.Quests) {
                    mb.item = questsNameMap.get(mb.corr_id);
                    mb.type = "Basic";
                } else if (mb.type === UserMoonBeamAuditType.Campaigns) {
                    mb.item = campaignsNameMap.get(mb.corr_id);
                    mb.type = "Basic";
                } else if (mb.type === UserMoonBeamAuditType.CampaignBonus) {
                    mb.item = campaignsNameMap.get(mb.corr_id);
                    mb.type = `${multipliersNameMap.get(mb.extra_info)} Multiplier`;
                } else {
                    mb.type = "Season Milestone";
                    if (mb.reward_taint.indexOf("standard") !== -1) {
                        mb.item = `Achieve S${seasonId} Standard Pass Lv${mb.extra_info}`;
                    } else {
                        mb.item = `Achieve S${seasonId} Premium Pass Lv${mb.extra_info}`;
                    }
                }
            });

    }
    mbs.forEach(mb => {
        delete mb.corr_id;
        delete mb.extra_info;
        delete mb.reward_taint;
    });
}

// this will run if none of the above matches
router.all((req, res) => {
    res.status(405).json({
        error: "Method not allowed",
    });
});

export default router.handler({
    onError(err, req, res) {
        console.error(err);
        res.status(500).json(response.serverError());
    },
});