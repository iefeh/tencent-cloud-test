import { PoolType } from '@/constant/pledge';
import { Tab, Tabs, useDisclosure } from '@nextui-org/react';
import { FC, Key } from 'react';
import InfoCardItem from './InfoCardItem';
import TotalStakedCard from './TotalStakedCard';
import StakeTabs from './StakeTabs';
import Image from 'next/image';
import QAModal from './QAModal';
import usePledge from '@/hooks/pages/pledge/usePledge';
import { usePledgeContext } from '@/store/Pledge';
import { observer } from 'mobx-react-lite';
import { formatUnits } from 'ethers';

const PoolTabs: FC = () => {
  const { currentType, setCurrentType, currentPoolInfo } = usePledgeContext();
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
  const qaDisclosure = useDisclosure();
  const { connected } = usePledge();

  function onSelectionChange(key: Key) {
    const newKey = key.toString() as PoolType;
    setCurrentType(newKey);
  }

  return (
    <div className="mt-[4.5rem] relative">
      <Tabs
        aria-label="Options"
        color="primary"
        variant="underlined"
        selectedKey={currentType}
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
        {tabs.map((tab) => (
          <Tab key={tab.key} title={tab.label}>
            <div className="flex flex-wrap justify-between gap-x-[1.875rem] gap-4">
              <InfoCardItem
                label="Total Stake:"
                value={`$${formatUnits(currentPoolInfo[2]?.toString() || '0', currentPoolInfo[1]) || '-'}`}
                unit={tab.key}
              />
              <InfoCardItem
                label="$Value:"
                value={`$${formatUnits(currentPoolInfo[2]?.toString() || '0', currentPoolInfo[1]) || '-'}`}
              />
              <InfoCardItem
                label="Output quantity:"
                value={currentPoolInfo[3]?.toString() || '-'}
                unit="Staking Points<span>/Block</span>"
              />
              <InfoCardItem
                label="Output Speed:"
                value={currentPoolInfo[5]?.toString() || '-'}
                unit="Second<span>/Block</span>"
              />
            </div>

            {connected && (
              <>
                <TotalStakedCard poolKey={tab.key} />

                <div className="w-full h-1px bg-[#EBDDB6] my-14"></div>

                <StakeTabs poolKey={tab.key} />
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

export default observer(PoolTabs);
