import { PipelineStage } from 'mongoose';
import UserTwitter from '@/lib/models/UserTwitter';
import { IQuest } from '@/lib/models/Quest';
import { ThinkingDataQuery, checkClaimableResult, claimRewardResult } from '@/lib/quests/types';
import { QuestBase } from '@/lib/quests/implementations/base';
import { AuthorizationType } from '@/lib/authorization/types';
import UserMetrics, { Metric, IUserMetrics } from '@/lib/models/UserMetrics';
import { sendBadgeCheckMessage } from '@/lib/kafka/client';
import { IOAuthToken } from '@/lib/models/OAuthToken';
import axios from 'axios';
const { parse } = require('csv-parse/sync');

export class ThinkingDataQueryQuest extends QuestBase {
  // 用户的授权twitter_id，在checkClaimable()时设置
  protected twitter_id = "";
  constructor(quest: IQuest) {
    super(quest);
  }

  async checkClaimable(userId: string): Promise<checkClaimableResult> {
    const questProp = this.quest.properties as ThinkingDataQuery;
    const result = await this.checkUserQuestFromThinkingData(questProp.sql_template, userId);
    return {
      claimable: result,
    };
  }

  async checkUserQuestFromThinkingData(sqlTemplate: string, userId: string): Promise<boolean> {
    const serverURL = "http://13.212.32.231:8992/querySql";
    // 创建查询参数
    const params = new URLSearchParams({
      token: process.env.THINKINGDATA_API_TOKEN!,
      format: 'csv_header',
      timeoutSeconds: '15',
      sql: sqlTemplate.replace('{userId}', userId)
    });

    try {
      // 发送POST请求
      const response = await axios.post(`${serverURL}?${params.toString()}`, null, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      });

      // 读取响应
      const body = response.data;
      if (body && !body.includes("_col0")) {
        console.error('Error:', body);
        return false;
      }
      // 解析CSV响应
      const records = parse(body, {
        skip_empty_lines: true
      });
      // 检查是否为 "true"
      const s = records[1][0];
      return s === 'true';
    } catch (error) {
      console.error('Error:', error);
      return false;
    }
  }

  async claimReward(userId: string): Promise<claimRewardResult> {
    const claimableResult = await this.checkClaimable(userId);
    if (!claimableResult.claimable) {
      return {
        verified: false,
        require_authorization: claimableResult.require_authorization,
        tip: claimableResult.require_authorization ? "You should connect your Twitter Account first." : undefined,
      }
    }
    const taint = `${this.quest.id},user,${userId}`;
    const rewardDelta = await this.checkUserRewardDelta(userId);
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