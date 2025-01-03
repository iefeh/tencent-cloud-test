import { Accelerator } from '@/lib/accelerator/implementations/base';
export const enum EventsStatus {
  COMING_SOON,
  IN_PROGRESS,
  COMPLETED,
}

/** 任务唯一标识 */
export const enum QuestType {
  ConnectWallet = 'connect_wallet',
  ConnectTwitter = 'connect_twitter',
  ConnectDiscord = 'connect_discord',
  ConnectTelegram = 'connect_telegram',
  ConnectSteam = 'connect_steam',
  ConnectGoogle = 'connect_google',
  ConnectEmail = 'connect_email',
  ConnectApple = 'connect_apple',
  FollowOnTwitter = 'follow_on_twitter',
  RetweetTweet = 'retweet_tweet',
  CommentTweet = 'comment_tweet',
  LikeTwitter = 'like_tweet',
  TweetInteraction = 'tweet_interaction',
  TwitterTopic = 'twitter_topic',
  HoldDiscordRole = 'hold_discord_role',
  Whitelist = 'whitelist',
  GamePreRegister = 'game_pre_register',
  HoldNFT = 'hold_nft',
  JOIN_DISCORD_SERVER = 'join_discord_server',
  ASTRARK_PRE_REGISTER = 'user_metric',
  SEND_DISCORD_MESSAGE = 'send_discord_message',
  TwitterFollower = 'twitter_follower',
  ThinkingDataQuery = 'thinking_data_query',
  Claim2048Ticket = 'claim_2048_ticket',
  ViewWebsite = 'view_website',
}

export const enum QuestRewardType {
  // 固定奖励，奖励数量配置于当前任务中
  Fixed = 'fixed',
  // 范围奖励，奖励数量特定于任务进行动态分配
  Range = 'range',
}

/** 媒体连接类型 */
export const enum MediaType {
  EMAIL = 'email',
  TWITTER = 'twitter',
  DISCORD = 'discord',
  FACEBOOK = 'facebook',
  TELEGRAM = 'telegram',
  STEAM = 'steam',
  GOOGLE = 'google',
  METAMASK = 'wallet',
  APPLE = 'apple',
}

export const enum EventStatus {
  UPCOMING = 'upcoming',
  ONGOING = 'ongoing',
  ENDED = 'ended',
}

export const EVENT_STATUS_CLASS_DICT = {
  [EventStatus.UPCOMING]: {
    label: 'Coming Soon',
    class: 'text-[#4FDCFF] pl-[0.8125rem]',
  },
  [EventStatus.ONGOING]: {
    label: 'In Progress',
    class: 'text-basic-yellow pl-[1.1875rem]',
  },
  [EventStatus.ENDED]: {
    label: 'Ended',
    class: 'text-white pl-[1.1875rem]',
  },
};

export const EVENT_STATUS_OPTIONS = [
  {
    label: 'All',
    value: 'all',
  },
  {
    label: 'In Progress',
    value: EventStatus.ONGOING,
  },
  {
    label: 'Ended',
    value: EventStatus.ENDED,
  },
  {
    label: 'Coming Soon',
    value: EventStatus.UPCOMING,
  },
];

export const enum EVENT_REWARD_TYPE {
  MOON_BEAM = 'moon_beam',
  BADGE = 'badge',
  LUCKY_DRAW = 'lucky_draw',
  Multiplier = 'multiplier',
  TASK = 'task',
}

export const enum AcceleratorType {
  NFT = 'nft_holder',
  BADGE = 'badge_holder',
}

export const AcceleratorProps = {
  [AcceleratorType.NFT]: {
    title:
      'Moonveil ecosystem NFT (Lv1 TETRA +20% per item, Lv2 TETRA +100% per item) and selected partner NFT holder can receive:',
  },
  [AcceleratorType.BADGE]: {
    title: 'Moonveil Badge holders can receive +5% to 100% based on your Badge level:',
  },
};

export const enum TokenRewardDistributeType {
  // 用户verify任务以后直接发奖
  DirectDistribute = 'direct_distribute',
  // 用户verify任务以后, 统一在指定时间发奖
  AutoRaffle = 'auto_raffle',
  // 用户verify任务以后, 统一手工发奖
  ManualRaffle = 'manual_raffle',
}
