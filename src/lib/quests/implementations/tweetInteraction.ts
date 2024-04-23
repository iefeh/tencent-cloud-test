import { PipelineStage } from 'mongoose';
import UserTwitter from '@/lib/models/UserTwitter';
import { IQuest } from '@/lib/models/Quest';
import { TweetInteraction, checkClaimableResult, claimRewardResult } from '@/lib/quests/types';
import { ConnectTwitterQuest } from './connectTwitterQuest';
import TwitterTopicTweet from '@/lib/models/TwitterTopicTweet';
import QuestAchievement from '@/lib/models/QuestAchievement';
import { LikeTweetQuest } from './likeTweetQuest';
import { AuthorizationType } from '@/lib/authorization/types';
import { RetweetTweetQuest } from './retweetTweetQuest';
import logger from '@/lib/logger/winstonLogger';

export class TweetInteractionQuest extends ConnectTwitterQuest {
  constructor(quest: IQuest) {
    super(quest);
  }

  async checkClaimable(userId: string): Promise<checkClaimableResult> {
    // 获取用户的Twitter授权信息
    const twitterAuth = await queryUserTwitterAuthorization(userId);
    if (!twitterAuth) {
      return {
        claimable: false,
        require_authorization: AuthorizationType.Twitter,
      }
    }
    this.twitter_id = twitterAuth.twitter_id;
    // 检查用户的任务完成进度
    let achievement = await QuestAchievement.findOne({ user_id: userId, quest_id: this.quest.id });
    if (!achievement) {
      achievement = {
        user_id: userId,
        quest_id: this.quest.id,
        created_time: Date.now(),
        verified_time: null,
        progress: {
          liked_tweet_id: null,
          retweeted_tweet_id: null,
          commented_tweet_id: null,
        }
      };
    }
    const questProp = this.quest.properties as TweetInteraction;
    // 检查点赞，如果没有点赞过，则执行点赞任务
    if (!achievement.progress?.liked_tweet_id) {
      const likeResult = await LikeTweetQuest.likeTweet(twitterAuth, questProp.tweet_id);
      if (likeResult.require_authorization) {
        return {
          claimable: false,
          require_authorization: AuthorizationType.Twitter,
          tip: "You should connect your Twitter Account first.",
        }
      }
      if (likeResult.liked) {
        logger.debug(`User ${userId} liked tweet ${questProp.tweet_id} successfully.`);
        achievement.progress.liked_tweet_id = questProp.tweet_id;
      }
    }
    // 检查转发，如果没有转发过，则执行转发任务
    if (!achievement.progress?.retweeted_tweet_id) {
      const retweetResult = await RetweetTweetQuest.retweetTweet(twitterAuth, questProp.tweet_id);
      if (retweetResult.require_authorization) {
        return {
          claimable: false,
          require_authorization: AuthorizationType.Twitter,
          tip: "You should connect your Twitter Account first.",
        }
      }
      if (retweetResult.retweeted) {
        logger.debug(`User ${userId} retweeted tweet ${questProp.tweet_id} successfully.`);
        achievement.progress.retweeted_tweet_id = questProp.tweet_id;
      }
    }
    // 检查推文评论
    const tweet = await TwitterTopicTweet.findOne({ author_id: this.twitter_id, topic_id: questProp.topic_id }, { _id: 0, tweeted_at: 1 });
    if (tweet) {
      achievement.progress.commented_tweet_id = tweet.tweeted_at;
    }
    // 更新任务进度
    await QuestAchievement.updateOne(
      { user_id: userId, quest_id: this.quest.id, verified_time: null },
      {
        $set: {
          progress: achievement.progress,
        },
        $setOnInsert: {
          created_time: Date.now(),
        },
      },
      { upsert: true },
    );
    return {
      claimable: achievement.progress.liked_tweet_id && achievement.progress.retweeted_tweet_id && achievement.progress.commented_tweet_id,
    }
  }


  async claimReward(userId: string): Promise<claimRewardResult> {
    const claimableResult = await this.checkClaimable(userId);
    if (!claimableResult.claimable) {
      return {
        verified: false,
        require_authorization: claimableResult.require_authorization,
        tip: claimableResult.tip,
      }
    }
    return this.claimUserTwitterReward(userId);
  }
}