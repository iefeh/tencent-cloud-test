import { PoolType } from '@/constant/pledge';
import { Modal, ModalBody, ModalContent, ModalHeader, Tab, Tabs, useDisclosure } from '@nextui-org/react';
import { FC, Key, useState } from 'react';
import InfoCardItem from './InfoCardItem';
import TotalStakedCard from './TotalStakedCard';
import StakeTabs from './StakeTabs';
import Image from 'next/image';
import QAModal from './QAModal';
import useWallet from '@/hooks/useWallet';

const PoolTabs: FC = () => {
  const { connected } = useWallet();
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
  const qaDisclosure = useDisclosure();

  function onSelectionChange(key: Key) {
    const newKey = key.toString() as PoolType;
    setSelectedKey(newKey);
  }

  return (
    <div className="mt-[4.5rem] relative">
      <Tabs
        aria-label="Options"
        color="primary"
        variant="underlined"
        selectedKey={selectedKey}
        classNames={{
          base: 'w-full border-b-1 border-b-[#EBDDB6]',
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
            <div className="flex flex-wrap justify-between gap-x-[1.875rem] gap-4">
              <InfoCardItem label="Total Stake:" value="1000" unit="ETH" />
              <InfoCardItem label="$Value:" value="$5000" />
              <InfoCardItem label="Output quantity:" value="1000" unit="Staking Points<span>/Block</span>" />
              <InfoCardItem label="Output Speed:" value="2" unit="Second<span>/Block</span>" />
            </div>

            {connected && (
              <>
                <TotalStakedCard />

                <div className="w-full h-1px bg-[#EBDDB6] my-14"></div>

                <StakeTabs />
              </>
            )}
          </Tab>
        ))}
      </Tabs>

      <Image
        className="absolute right-0 top-2 w-[2.125rem] h-[2.125rem] cursor-pointer"
        src="https://moonveil-public.s3.ap-southeast-2.amazonaws.com/pledge/icons/icon_info_big.png"
        alt=""
        width={34}
        height={34}
        unoptimized
        onClick={qaDisclosure.onOpen}
      />

      <QAModal disclosure={qaDisclosure} />
    </div>
  );
};

export default PoolTabs;
