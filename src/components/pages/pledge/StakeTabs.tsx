import { Tab, Tabs } from '@nextui-org/react';
import Image from 'next/image';
import { FC, Key, useState } from 'react';
import StakeTabPanel from './tabPanels/StakeTabPanel';
import HistoryTabPanel from './tabPanels/HistoryTabPanel';
import WithdrawTabPanel from './tabPanels/WithdrawTabPanel';

interface Props {
  poolKey: string;
}

const StakeTabs: FC<Props> = ({ poolKey }) => {
  const tabs = [
    {
      key: 'stake',
      label: 'Stake',
      panel: <StakeTabPanel poolKey={poolKey} />,
    },
    {
      key: 'history',
      label: 'History',
      panel: <HistoryTabPanel />,
    },
    {
      key: 'withdraw',
      label: 'Withdraw',
      panel: <WithdrawTabPanel poolKey={poolKey} />,
    },
  ];
  const [selectedKey, setSelectedKey] = useState('stake');

  function onSelectionChange(key: Key) {
    const newKey = key.toString();
    setSelectedKey(newKey);
  }

  return (
    <div className="relative z-0 w-full aspect-[1408/742]">
      <Image
        src="https://d3dhz6pjw7pz9d.cloudfront.net/pledge/bg_stake.png"
        alt=""
        fill
        sizes="100%"
        unoptimized
      />

      <Tabs
        aria-label="Options"
        color="primary"
        selectedKey={selectedKey}
        radius="full"
        classNames={{
          base: 'w-full relative z-0 mt-8',
          tabList: 'justify-center gap-6 w-full relative rounded-none p-0 bg-transparent',
          cursor: 'w-full bg-transparent border-1 border-[#F6C799]',
          tab: 'max-w-fit h-10 p-0 font-semakin border-1 border-white data-[selected=true]:border-transparent transition-colors',
          tabContent: 'px-9 py-0 text-white text-xl leading-10 group-data-[selected=true]:text-basic-yellow',
          panel: 'p-0 mt-6 relative z-0',
        }}
        onSelectionChange={onSelectionChange}
      >
        {tabs.map((tab, index) => (
          <Tab key={index} title={tab.label}>
            {tab.panel}
          </Tab>
        ))}
      </Tabs>
    </div>
  );
};

export default StakeTabs;
