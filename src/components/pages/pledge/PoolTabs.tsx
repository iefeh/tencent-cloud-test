import { PoolType } from '@/constant/pledge';
import { Tab, Tabs } from '@nextui-org/react';
import { FC, Key, useState } from 'react';

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
        base: 'mt-6',
        tabList: 'gap-6 w-full relative rounded-none p-0',
        cursor: 'w-full bg-basic-yellow',
        tab: 'max-w-fit px-0 h-12 font-semakin',
        tabContent: 'text-white text-xl group-data-[selected=true]:text-basic-yellow',
      }}
      onSelectionChange={onSelectionChange}
    >
      {tabs.map((tab, index) => (
        <Tab key={index} title={tab.label} />
      ))}
    </Tabs>
  );
};

export default PoolTabs;
