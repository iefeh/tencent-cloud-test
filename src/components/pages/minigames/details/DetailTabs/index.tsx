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
import Image from 'next/image';
import { useRouter } from 'next/router';

interface TabItem {
  name: string;
  label: string;
  title?: string;
  content: JSX.Element;
  right?: JSX.Element;
}

const DetailTabs: FC = () => {
  const { data } = useMGDContext();
  const { task_category } = data || {};
  const tabs: TabItem[] = [
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
      right: (
        <Link href={`/LoyaltyProgram/earn/group/${task_category}`} target="_blank">
          More &gt;&gt;
        </Link>
      ),
    },
    {
      name: 'leaderboard',
      label: 'Leaderboard',
      content: <RankingTabPanel />,
    },
    {
      name: 'badges',
      label: 'Badges & SBTs',
      content: <BadgesTabPanel />,
      right: (
        <Link href="/Profile/MyBadges" target="_blank">
          More &gt;&gt;
        </Link>
      ),
    },
  ];
  const router = useRouter();

  const [selectedKey, setSelectedKey] = useState(tabs[0].name);

  function onBack() {
    router.replace('/minigames');
  }

  return (
    <div
      className="w-full min-h-screen bg-[#472E24] bg-[length:100%_auto] bg-repeat-y"
      style={{ backgroundImage: `url('${data?.poster?.bg_img_url}')` }}
    >
      <div className="w-[87.5rem] max-w-full mx-auto mt-[3.75rem] pb-[9.875rem] relative">
        <Tabs
          aria-label="Options"
          color="primary"
          variant="underlined"
          selectedKey={selectedKey}
          classNames={{
            base: 'w-full overflow-x-auto',
            tabList: cn(['gap-16 w-max overflow-x-visible mx-6 relative rounded-none p-0', styles.tabList]),
            cursor: 'w-full h-five bg-yellow-1 rounded-[0.1563rem]',
            tab: 'max-w-fit px-0 h-14 py-0 overflow-visible',
            tabContent: 'text-white text-xl group-data-[selected=true]:text-yellow-1',
            panel: 'px-6 py-0 md:px-0',
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

        <div
          className="flex items-center cursor-pointer absolute top-3 -left-12 -translate-x-full border-current border-1 px-3 py-2 rounded-base opacity-80 hover:bg-basic-gray/50"
          onClick={onBack}
        >
          <Image
            className="w-5 h-[1.0625rem]"
            src="https://moonveil-public.s3.ap-southeast-2.amazonaws.com/common/icon_arrow_white.png"
            alt=""
            width={26}
            height={22}
            unoptimized
          />

          <span className="ml-3 text-lg">BACK</span>
        </div>
      </div>
    </div>
  );
};

export default observer(DetailTabs);
