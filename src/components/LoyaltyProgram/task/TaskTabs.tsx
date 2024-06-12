import { Tabs, Tab } from '@nextui-org/react';
import RegularTasks from './RegularTasks';
import SeasonalCampaigns from './SeasonalCampaigns';
import { Key, useMemo, useState } from 'react';
import { useRouter } from 'next/router';
import Game2048Content from './Game2048Content';
import Image from 'next/image';

export default function TaskTabs() {
  const regularTaskContent = useMemo(() => <RegularTasks />, []);
  const seasonalCampaignsContent = useMemo(() => <SeasonalCampaigns />, []);
  const gameContent = useMemo(() => <Game2048Content />, []);

  const tabs = [
    {
      key: 'Regular Tasks',
      content: regularTaskContent,
    },
    {
      key: 'Events',
      content: seasonalCampaignsContent,
    },
    {
      key: '2048 Mini Game',
      render: (label: string) => (
        <div className="flex items-center">
          <Image
            className="object-contain w-8 h-7 mr-1"
            src="https://moonveil-public.s3.ap-southeast-2.amazonaws.com/game/2048/%E5%9B%BE%E5%B1%82+47.png"
            alt=""
            width={95}
            height={83}
            unoptimized
          />

          {label}
        </div>
      ),
      content: gameContent,
    },
  ];
  const router = useRouter();
  const [selectedKey, setSelectedKey] = useState((router.query?.tabKey as string) || tabs[0].key);

  function onSelectionChange(key: Key) {
    const str = key.toString();
    router.replace({ pathname: '/LoyaltyProgram/earn', query: { ...router.query, tabKey: str } }, undefined, {
      scroll: false,
    });
    setSelectedKey(str);
  }

  return (
    <div className="w-full flex flex-col mt-[4.25rem]">
      <Tabs
        aria-label="Options"
        color="primary"
        variant="underlined"
        selectedKey={selectedKey}
        classNames={{
          tabList: 'gap-6 w-full relative rounded-none p-0 border-b border-divider',
          cursor: 'w-full bg-basic-yellow',
          tab: 'max-w-fit px-0 h-12 font-semakin',
          tabContent: 'text-white text-xl group-data-[selected=true]:text-basic-yellow',
        }}
        onSelectionChange={onSelectionChange}
      >
        {tabs.map((tab) => (
          <Tab
            key={tab.key}
            title={
              tab.render ? (
                tab.render(tab.key)
              ) : (
                <div className="flex items-center space-x-2">
                  <span>{tab.key}</span>
                </div>
              )
            }
          >
            {tab.content}
          </Tab>
        ))}
      </Tabs>
    </div>
  );
}
