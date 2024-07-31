import { Tab, Tabs, cn } from '@nextui-org/react';
import { FC, useState } from 'react';
import OverviewTabPanel from './OverviewTabPanel';
import TasksTabPanel from './TasksTabPanel';
import RankingTabPanel from './RankingTabPanel';
import BadgesTabPanel from './BadgesTabPanel';
import Link from 'next/link';
import FollowUs from './FollowUs';
import styles from './index.module.scss';
import { useMGDContext } from '@/store/MiniGameDetails';
import { observer } from 'mobx-react-lite';

interface TabItem {
  name: string;
  label: string;
  title?: string;
  content: JSX.Element;
  right?: JSX.Element;
}

const DetailTabs: FC = () => {
  const { data } = useMGDContext();
  const { tasks, ranking } = data || {};
  const tabs = getTabs();

  const [selectedKey, setSelectedKey] = useState(tabs[0].name);

  function getTabs() {
    const list: TabItem[] = [
      {
        name: 'overview',
        label: 'Overview',
        title: 'About',
        content: <OverviewTabPanel />,
      },
    ];

    if ((tasks?.length || 0) > 0) {
      list.push({
        name: 'tasks',
        label: 'Tasks',
        content: <TasksTabPanel />,
      });
    }

    if (ranking) {
      list.push({
        name: 'ranking',
        label: 'Ranking',
        content: <RankingTabPanel />,
      });
    }

    list.push({
      name: 'badges',
      label: 'Badges & SBTs',
      content: <BadgesTabPanel />,
      right: (
        <Link href="/Profile/MyBadges" target="_blank">
          More &gt;&gt;
        </Link>
      ),
    });

    return list;
  }

  return (
    <div className="w-full min-h-screen bg-[#472E24] bg-[url('https://moonveil-public.s3.ap-southeast-2.amazonaws.com/minigames/bg_detail_2048.png')] bg-[length:100%_auto] bg-repeat-y">
      <div className="w-[87.5rem] mx-auto mt-[3.75rem] pb-[9.875rem]">
        <Tabs
          aria-label="Options"
          color="primary"
          variant="underlined"
          selectedKey={selectedKey}
          classNames={{
            base: 'w-full',
            tabList: cn(['gap-16 w-full relative rounded-none p-0', styles.tabList]),
            cursor: 'w-full h-five bg-yellow-1 rounded-[0.1563rem]',
            tab: 'max-w-fit px-0 h-14 py-0 overflow-visible',
            tabContent: 'text-white text-xl group-data-[selected=true]:text-yellow-1',
            panel: 'p-0',
          }}
          onSelectionChange={(key) => setSelectedKey(key.toString())}
        >
          {tabs.map((tab) => (
            <Tab
              key={tab.name}
              title={
                <div className="flex items-center space-x-2 px-1">
                  <span>{tab.label}</span>
                </div>
              }
            >
              <div className="mt-14 mb-8 w-full flex justify-between items-center">
                <span className="text-3xl leading-none">{tab.title || tab.label}</span>

                {tab.right}
              </div>
              {tab.content}
            </Tab>
          ))}
        </Tabs>

        <FollowUs />
      </div>
    </div>
  );
};

export default observer(DetailTabs);
