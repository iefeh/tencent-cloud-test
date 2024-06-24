import { PoolType } from '@/constant/pledge';
import { Tab, Tabs } from '@nextui-org/react';
import { FC, Key, useState } from 'react';
import InfoCardItem from './InfoCardItem';

const PoolTabs: FC = () => {
  const tabs = [
    {
      key: PoolType.USDT,
      label: 'USDT Pool',
    },
    {
      key: PoolType.USDC,
      label: 'USDC Pool',
    },
    {
      key: PoolType.ETH,
      label: 'ETH Pool',
    },
  ];
  const [selectedKey, setSelectedKey] = useState(PoolType.USDT);

  function onSelectionChange(key: Key) {
    const newKey = key.toString() as PoolType;
    setSelectedKey(newKey);
  }

  return (
    <Tabs
      aria-label="Options"
      color="primary"
      variant="underlined"
      selectedKey={selectedKey}
      classNames={{
        base: 'mt-[4.5rem] w-full border-b-1 border-b-[#EBDDB6]',
        tabList: 'gap-6 w-full relative rounded-none p-0',
        cursor: 'w-full bg-basic-yellow',
        tab: 'max-w-fit px-0 h-12 font-semakin',
        tabContent: 'text-white text-xl group-data-[selected=true]:text-basic-yellow',
        panel: 'p-0 mt-6',
      }}
      onSelectionChange={onSelectionChange}
    >
      {tabs.map((tab, index) => (
        <Tab key={index} title={tab.label}>
          <div className="flex flex-wrap gap-x-[1.875rem] gap-4">
            <InfoCardItem label="Total Stake:" value="1000" unit="ETH" />
            <InfoCardItem label="$Value:" value="$5000" />
            <InfoCardItem label="Output quantity:" value="1000" unit="Staking Points<span>/Block</span>" />
            <InfoCardItem label="Output Speed:" value="2" unit="Second<span>/Block</span>" />
          </div>
        </Tab>
      ))}
    </Tabs>
  );
};

export default PoolTabs;
