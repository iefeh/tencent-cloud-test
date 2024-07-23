import { Tab, Tabs } from '@nextui-org/react';
import { FC, useState } from 'react';
import OverviewTabPanel from './OverviewTabPanel';
import TasksTabPanel from './TasksTabPanel';
import RankingTabPanel from './RankingTabPanel';
import BadgesTabPanel from './BadgesTabPanel';

const DetailTabs: FC = () => {
  const tabs = [
    {
      name: 'overview',
      label: 'Overview',
      title: 'About',
      content: <OverviewTabPanel />,
    },
    {
      name: 'tasks',
      label: 'Tasks',
      content: <TasksTabPanel />,
    },
    {
      name: 'ranking',
      label: 'Ranking',
      content: <RankingTabPanel />,
    },
    {
      name: 'badges',
      label: 'Badges & SBTs',
      content: <BadgesTabPanel />,
    },
  ];
  const [selectedKey, setSelectedKey] = useState(tabs[0].name);

  return (
    <div className="w-full min-h-screen bg-[#472E24] bg-[url('https://moonveil-public.s3.ap-southeast-2.amazonaws.com/minigames/bg_detail_2048.png')] bg-cover bg-repeat-y">
      <div className="w-[87.5rem] mx-auto">
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
          onSelectionChange={(key) => setSelectedKey(key.toString())}
        >
          {tabs.map((tab) => (
            <Tab
              key={tab.name}
              title={
                <div className="flex items-center space-x-2">
                  <span>{tab.name}</span>
                </div>
              }
            >
              <div className="text-3xl leading-none mt-14 mb-8">{tab.title || tab.label}</div>
              {tab.content}
            </Tab>
          ))}
        </Tabs>
      </div>
    </div>
  );
};

export default DetailTabs;
