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
  FollowOnTwitter = 'follow_on_twitter',
  RetweetTweet = 'retweet_tweet',
  HoldDiscordRole = 'hold_discord_role',
  Whitelist = 'whitelist',
  GamePreRegister = 'game_pre_register',
  HoldNFT = 'hold_nft',
  JOIN_DISCORD_SERVER = 'join_discord_server',
  ASTRARK_PRE_REGISTER = 'user_metric',
}

export const enum QuestRewardType {
  // 固定奖励，奖励数量配置于当前任务中
  Fixed = 'fixed',
  // 范围奖励，奖励数量特定于任务进行动态分配
  Range = 'range',
}

/** 媒体连接类型 */
export const enum MediaType {
  EMAIL,
  TWITTER,
  DISCORD,
  FACEBOOK,
  TELEGRAM,
  STEAM,
  GOOGLE,
  METAMASK,
}
