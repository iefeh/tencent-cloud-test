import { Tabs, Tab } from '@nextui-org/react';
import RegularTasks from './RegularTasks';
import SeasonalCampaigns from './SeasonalCampaigns';

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
}

export const enum QuestRewardType {
  // 固定奖励，奖励数量配置于当前任务中
  Fixed = 'fixed',
  // 范围奖励，奖励数量特定于任务进行动态分配
  Range = 'range',
}

export default function TaskTabs() {
  const tabs = [
    {
      // key: 'Regular Tasks',
      key: 'Whitelist Tasks',
      content: <RegularTasks />,
    },
    // {
    //   key: 'Seasonal Campaigns',
    //   content: <SeasonalCampaigns />,
    // },
  ];

  return (
    <div className="w-full flex flex-col mt-[4.25rem]">
      <Tabs
        aria-label="Options"
        color="primary"
        variant="underlined"
        classNames={{
          tabList: 'gap-6 w-full relative rounded-none p-0 border-b border-divider',
          cursor: 'w-full bg-basic-yellow',
          tab: 'max-w-fit px-0 h-12 font-semakin',
          tabContent: 'text-white text-xl group-data-[selected=true]:text-basic-yellow',
        }}
      >
        {tabs.map((tab) => (
          <Tab
            key={tab.key}
            title={
              <div className="flex items-center space-x-2">
                <span>{tab.key}</span>
              </div>
            }
          >
            {tab.content}
          </Tab>
        ))}
      </Tabs>
    </div>
  );
}
