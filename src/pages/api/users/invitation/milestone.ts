import type { NextApiResponse } from "next";
import { createRouter } from "next-connect";
import * as response from "@/lib/response/response";
import { mustAuthInterceptor, UserContextRequest } from "@/lib/middleware/auth";
import UserMetrics from "@/lib/models/UserMetrics";
import Badges, { RequirementType } from "@/lib/models/Badge";
import UserBadges, { IUserBadges, UserBadgeSeries } from "@/lib/models/UserBadges";
import { DIRECT_REFERRAL_MOON_BEAM_DELTA, INDIRECT_REFERRAL_MOON_BEAM_DELTA } from "@/lib/models/UserMoonBeamAudit";

const router = createRouter<UserContextRequest, NextApiResponse>();

router.use(mustAuthInterceptor).get(async (req, res) => {
    console.log(req.userId);
    // 查询拉新相关徽章
    const inviteBadgeIds: string[] = [
        process.env.DIPLOMAT_INSIGNIA_BADGE_ID!,
        process.env.WEALTHY_CIRCLE_CONNECTOR_BADGE_ID!,
    ];
    const badges = await Badges.find({ id: { $in: inviteBadgeIds }, deleted_time: null }, { _id: 0, name: 1, id: 1, obtain_url: 1, series: 1 }).lean();
    if (badges.length != inviteBadgeIds.length) {
        throw new Error(`invite badges length mismatch`);
    }
    // 查询用户的徽章情况，以丰富徽章进度信息
    const userBadges = await UserBadges.find({ user_id: req.userId, badge_id: { $in: inviteBadgeIds } }, { _id: 0, badge_id: 1, series: 1 })
    const userBadgeMap: Map<string, IUserBadges> =new Map<string, IUserBadges>(userBadges.map(badge => {
        return [badge.badge_id, badge];
    }));
    
    // 封装推荐相关徽章：外交官进度，与其他推荐徽章
    // 所有徽章均封装当前用户的达成与领取进度.
    let referralBadges: any[] = [];
    let diplomatBadge: any = {};
    let totalClaimedMbFromBadge = 0;
    for (let badge of badges) {
        const isDiplomatBadge = badge.id == process.env.DIPLOMAT_INSIGNIA_BADGE_ID;
        const userBadge = userBadgeMap.get(badge.id);
        const seriesList = Object.keys(badge.series).map(level => {
            const series = badge.series[level];
            series.level = Number(level);
            series.obtained = false;
            series.claimed = false;
            if (isDiplomatBadge && series.requirements[0].type != RequirementType.Whitelist) {
                series.milestone = series.requirements[0].properties.value;
            }
            delete series.requirements;
            delete series.open_for_mint;
            return series;
        });
        // 按升序排列
        seriesList.sort((a, b) => a.level - b.level);
        // 封装用户达成等级与领取情况
        if (userBadge) {
            // 计算用户从该徽章获取到的MB奖励值
            console.log(userBadge.series);
            userBadge.series.forEach((value: UserBadgeSeries, level: string) => {
                if (value.claimed_time) {
                    const seriesConfig = seriesList.find(series => String(series.level) == level);
                    totalClaimedMbFromBadge += seriesConfig?.reward_moon_beam | 0;
                }
            });
            // 默认已达成的最大的徽章等级以下的等级已达成并且已经领取，用户在领取最高等级徽章时会下发对应等级及以下等级未领取的奖励。
            console.log(Array.from(userBadge.series.keys()));
            const maxLevelObtained = Math.max(...Array.from(userBadge.series.keys()).map(level => Number(level)));
            seriesList.map(series => {
                if (series.level < maxLevelObtained) {
                    series.obtained = true;
                    series.claimed = true;
                }
                if (series.level == maxLevelObtained) {
                    series.obtained = true;
                    series.claimed = !!userBadge.series.get(String(maxLevelObtained))?.claimed_time;
                }
            });
        }

        // 外交官徽章，全系列返回，用于页面整体进度展示
        if (isDiplomatBadge) {
            badge.series = seriesList;
            diplomatBadge = badge;
            continue;
        }

        // 其他推荐徽章保留用户达成等级与下一级，假如达成是第5级，那会返回级别 [lv3,lv4,lv5,lv6]
        // 假如用户未达成，当前也默认返回4条数据
        if (userBadge) {
            const maxObtainedLevelIndex = Math.max(...Array.from(userBadge.series.keys()).map(level => Number(level))) -1;
            console.log(maxObtainedLevelIndex);
            let endIndex = maxObtainedLevelIndex + 1;
            let startIndex = maxObtainedLevelIndex - 2;
            if (endIndex > seriesList.length - 1) {
                endIndex = seriesList.length - 1;
                startIndex = endIndex - 4;
            }
            if (startIndex < 0) {
                startIndex = 0;
            }
            if (endIndex - startIndex < 4) {
                endIndex = startIndex + 4;
            }
            console.log(startIndex, endIndex);
            badge.series = seriesList.slice(startIndex, endIndex);
        } else {
            console.log(seriesList.slice(0, 4));
            badge.series = seriesList.slice(0, 4);
        }
        referralBadges.push(badge);
    }

    // 获取用户的拉新进度信息
    let userMetric = await UserMetrics.findOne({ user_id: req.userId }) || {};
    // 封装拉新里程碑数据
    const milestone: any = {
        direct_invitee: userMetric.total_invitee | 0,
        successful_direct_invitee: userMetric.total_novice_badge_invitee | 0,
        indirect_invitee: userMetric.total_indirect_invitee | 0,
        successful_indirect_invitee: userMetric.total_indirect_novice_badge_invitee | 0,

        total_claimed_badge_reward: totalClaimedMbFromBadge,
        diplomat: diplomatBadge,
        referrals: referralBadges,
    }
    // 直接拉新的奖励统计
    milestone.successful_direct_invitee_reward = milestone.successful_direct_invitee * DIRECT_REFERRAL_MOON_BEAM_DELTA;
    milestone.successful_indirect_invitee_reward = milestone.successful_indirect_invitee * INDIRECT_REFERRAL_MOON_BEAM_DELTA;
    // 总计奖励值
    milestone.total_reward = milestone.successful_direct_invitee_reward+milestone.successful_indirect_invitee_reward+ milestone.total_claimed_badge_reward;
    return res.json(response.success(milestone));
});


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