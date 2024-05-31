import { PipelineStage } from 'mongoose';
import UserTwitter from '@/lib/models/UserTwitter';
import { IQuest } from '@/lib/models/Quest';
import { QuestRewardType, ThinkingDataQuery, ThinkingDataQuestType, checkClaimableResult, claimRewardResult } from '@/lib/quests/types';
import { QuestBase } from '@/lib/quests/implementations/base';
import { AuthorizationType } from '@/lib/authorization/types';
import UserMetrics, { Metric, IUserMetrics, createUserMetric } from '@/lib/models/UserMetrics';
import { sendBadgeCheckMessage } from '@/lib/kafka/client';
import { IOAuthToken } from '@/lib/models/OAuthToken';
import axios from 'axios';
import { format } from 'date-fns';
const { parse } = require('csv-parse/sync');

export class ThinkingDataQueryQuest extends QuestBase {
  // 用户的授权twitter_id，在checkClaimable()时设置
  protected twitter_id = "";
  constructor(quest: IQuest) {
    super(quest);
  }

  async checkClaimable(userId: string): Promise<checkClaimableResult> {
    const questProp = this.quest.properties as ThinkingDataQuery;
    const result = await this.checkUserQuestFromThinkingData(questProp, userId);
    if (!result) {// 若直接返回false,则直接返回
      return {
        claimable: result,
      };
    }

    if (questProp.rewardType && questProp.rewardType === QuestRewardType.Range) {
      // 检查是否有排名信息
      if (!result[1]) {
        return { claimable: false, tip: "The rankings are still being updated. Please verify again after today's game has ended." }
      }
      const s = result[1][0];

      // 此时s为排名信息，保存为用户指标
      await createUserMetric(userId, Metric.PrevdayRankFor2048, Number(s));
      // 检查 2048大王徽章
      await sendBadgeCheckMessage(userId, Metric.PrevdayRankFor2048);

      return { claimable: true, tip: `Your rank on yesterday is ${Number(s)}` };
    } else {
      const s = result[1][0];

      // 判断是否有其他信息
      if (result[1].length === 3) {
        let extra: any = {};
        extra.current_progress = result[1][1] ? result[1][1] : "0";// 任务当前进度
        extra.target_progress = result[1][2];// 任务目标进度
        return { claimable: s === 'true', tip: `Quest progress ${extra.current_progress}/${extra.target_progress}`, extra: extra };
      }

      return { claimable: s === 'true', tip: "This account didn't reach the reward condition." };
    }
  }

  async checkUserQuestFromThinkingData(questProp: ThinkingDataQuery, userId: string): Promise<any> {
    const serverURL = "http://13.212.32.231:8992/querySql";
    // 创建查询参数
    const params = new URLSearchParams({
      token: process.env.THINKINGDATA_API_TOKEN!,
      format: 'csv_header',
      timeoutSeconds: '15',
      sql: questProp.sql_template.replace('{userId}', userId)
    }); 

    try {
      // 发送POST请求
      const response = await axios.post(`${serverURL}?${params.toString()}`, null, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      });

      // 读取响应
      const body = response.data; console.log("body", body);
      if (body && !body.includes("_col0")) {
        console.error('Error:', body);
        return false;
      }
      // 解析CSV响应
      const records = parse(body, {
        skip_empty_lines: true
      });

      return records;

    } catch (error) {
      console.error('Error:', error);
      return false;
    }
  }

  async claimReward(userId: string): Promise<claimRewardResult> {
    const claimableResult = await this.checkClaimable(userId);
    if (!claimableResult.claimable) {
      return {
        verified: claimableResult.tip ? claimableResult.tip.indexOf("progress") > -1 : false,
        require_authorization: claimableResult.require_authorization,
        tip: claimableResult.tip,
        extra: claimableResult.extra
      }
    }
    const questProp = this.quest.properties as ThinkingDataQuery;
    let taint = `${this.quest.id},user,${userId}`;

    if (questProp.type && questProp.type === ThinkingDataQuestType.Daily) {
      // 若为每日任务，则修改taint和questid
      const datestamp = format(Date.now(), 'yyyy-MM-dd');
      taint = `${this.quest.id},user,${userId},${datestamp}`;
      this.quest.id = `${this.quest.id},${datestamp}`;
    }

    const rewardDelta = await this.checkUserRewardDelta(userId);
    if (rewardDelta === 0) {
      return {
        verified: false,
        tip: 'This account has no reward for this quest.',
      };
    }

    const result = await this.saveUserReward(userId, taint, rewardDelta, null);
    if (result.duplicated) {
      return {
        verified: false,
        tip: 'This account has already claimed reward.',
      };
    }
    return {
      verified: result.done,
      claimed_amount: result.done ? rewardDelta : undefined,
      tip: result.done ? `You have claimed ${rewardDelta} MB.` : 'Server Internal Error',
    };
  }
}