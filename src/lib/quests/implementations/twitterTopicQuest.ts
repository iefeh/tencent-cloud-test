import { PipelineStage } from 'mongoose';
import UserTwitter from '@/lib/models/UserTwitter';
import { IQuest } from '@/lib/models/Quest';
import { TwitterTopic, checkClaimableResult, claimRewardResult } from '@/lib/quests/types';
import { ConnectTwitterQuest } from './connectTwitterQuest';
import TwitterTopicTweet from '@/lib/models/TwitterTopicTweet';

export class TwitterTopicQuest extends ConnectTwitterQuest {
  constructor(quest: IQuest) {
    super(quest);
  }

  async checkClaimable(userId: string): Promise<checkClaimableResult> {
    // 检查用户是否绑定了twitter
    const claimableResult = await super.checkClaimable(userId);
    if (!claimableResult.claimable) {
      return claimableResult;
    }
    // 检查话题参与情况
    const questProp = this.quest.properties as TwitterTopic;
    const tweet = await TwitterTopicTweet.findOne({ author_id: this.twitter_id, topic_id: questProp.topic_id }, { _id: 0, tweeted_at: 1 });
    return {
      claimable: !!tweet,
    };
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
    return this.claimUserTwitterReward(userId);
  }
}
