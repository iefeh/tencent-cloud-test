import { Tabs, Tab } from '@nextui-org/react';
import RegularTasks from './RegularTasks';
import SeasonalCampaigns from './SeasonalCampaigns';

export default function TaskTabs() {
  const tabs = [
    {
      key: 'Regular Tasks',
      // key: 'Whitelist Tasks',
      content: <RegularTasks />,
    },
    {
      key: 'Seasonal Campaigns',
      content: <SeasonalCampaigns />,
    },
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
