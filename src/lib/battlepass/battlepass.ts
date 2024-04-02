import BattlePassSeasons from '@/lib/models/BattlePassSeasons';
import UserBattlePassSeasons, { BattlePassType } from '@/lib/models/UserBattlePassSeasons';
import Quest from '@/lib/models/Quest';
import UserMetrics from '@/lib/models/UserMetrics';
import { sendBadgeCheckMessages } from '@/lib/kafka/client';

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

//更新用户通行证信息
export async function updateUserBattlepassMetricAndBadgeCheck(userId: string, questId: string, mbAmont: number, session: any) {
  const userBattlepass = await getUserBattlePass(userId);
  //判断用户是否有通行证
  if (userBattlepass) {
    const quest = await Quest.findOne({ id: questId });
    let seasonPassProgress: number = 1;
    if (quest.reward.season_pass_progress) {
      seasonPassProgress = quest.reward.season_pass_progress;
    }
    await UserBattlePassSeasons.updateOne({ user_id: userId, battlepass_season_id: userBattlepass.battlepass_season_id }, {
      $inc: { finished_tasks: seasonPassProgress, total_moon_beam: mbAmont },
      updated_time: Date.now()
    }, { upsert: true, session: session });
    //指标不采用inc的原因是防止中途用户从标准通证升级为高阶通证，导致任务数不对。
    let metricUpdateDoc: any = {};
    metricUpdateDoc[`battlepass_season_${userBattlepass.battlepass_season_id}_standard_pass`] = userBattlepass.finished_tasks + seasonPassProgress;
    if (userBattlepass.type === BattlePassType.PremiumPass) {
      metricUpdateDoc[`battlepass_season_${userBattlepass.battlepass_season_id}_premium_pass`] = userBattlepass.finished_tasks + seasonPassProgress;
    }
    await UserMetrics.updateOne({ user_id: userId }, metricUpdateDoc, { upsert: true, session: session });
    await sendBadgeCheckMessages(userId, metricUpdateDoc).catch((error: Error) => {
      console.log(error);
    });//检查是否可以下发徽章
  }
}


//判断用户是否具有高阶通行证资格
export async function isPremiumSatisfied(user_id: string): Promise<boolean> {
  const user_metric: any = await UserMetrics.findOne({ user_id: user_id });
  let satisfied: boolean = false;
  if (user_metric) {
    if (Number(user_metric.tetra_holder) === 1) {
      satisfied = true;
    }
  }

  return satisfied;
}