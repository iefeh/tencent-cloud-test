import { Tab, Tabs } from '@nextui-org/react';
import { FC, Key, useEffect, useState } from 'react';
import Assets from './Assets';
import type { NFTItem } from '@/http/services/mint';
import { queryMyNFTListAPI } from '@/http/services/astrark';
import { AA_ASSETS_PAGE_SIZE, NFTCategory } from '@/constant/nft';
import CircularLoading from '@/pages/components/common/CircularLoading';
import useScrollLoad from '@/hooks/useScrollLoad';
import { useUserContext } from '@/store/User';
import { observer } from 'mobx-react-lite';

interface Props {
  displayItems: NFTItem[];
  onUpdate?: () => void;
}

const MyAssets: FC<Props> = ({ displayItems, onUpdate }) => {
  const { token } = useUserContext();
  const [tabs, setTabs] = useState([
    {
      label: 'SBT',
      key: NFTCategory.SBT,
    },
    {
      label: 'TETRA NFT',
      key: NFTCategory.TETRA_NFT,
    },
  ]);
  const [selectedKey, setSelectedKey] = useState(NFTCategory.SBT);
  const { scrollRef, data = [], total, queryData, loading } = useScrollLoad({
    minCount: AA_ASSETS_PAGE_SIZE,
    pageSize: AA_ASSETS_PAGE_SIZE,
    queryFn: queryMyNFTListAPI,
    queryKey: 'nfts',
    paramsFn: () => ({ category: selectedKey }),
    pullupLoad: true,
    bsOptions: { scrollX: true, scrollY: false, pullUpLoad: true },
  });

  const items =
    data.length < AA_ASSETS_PAGE_SIZE ? [...data, ...Array(AA_ASSETS_PAGE_SIZE - data.length).fill(null)] : data;

  function onSelectionChange(key: Key) {
    const newKey = key.toString() as NFTCategory;
    setSelectedKey(newKey);
  }

  function onAssetsUpdate() {
    onUpdate?.();
  }

  useEffect(() => {
    if (!token) return;
    queryData(true);
  }, [selectedKey, token]);

  return (
    <div className="w-[78.25rem] aspect-[1252/759] mt-5 bg-[url('https://moonveil-public.s3.ap-southeast-2.amazonaws.com/astrark/assets/bg_assets_card.png')] bg-contain bg-no-repeat pl-5 pr-8 pt-16 flex flex-col">
      <div className="font-semakin text-basic-yellow text-2xl pl-11">My Asset ( {total} )</div>

      <div className="min-h-[25rem] mt-12 relative flex flex-nowrap gap-8">
        <Tabs
          aria-label="Options"
          color="primary"
          selectedKey={selectedKey}
          classNames={{
            base: 'w-[13.9375rem] shrink-0',
            tabList: 'gap-5 flex-col w-full relative rounded-none p-0 bg-transparent',
            cursor: 'w-full bg-transparent',
            tab: "px-0 font-semakin w-full h-[5.125rem] bg-[url('https://moonveil-public.s3.ap-southeast-2.amazonaws.com/astrark/assets/bg_tab_unselected.png')] bg-no-repeat bg-contain data-[selected=true]:bg-[url('https://moonveil-public.s3.ap-southeast-2.amazonaws.com/astrark/assets/bg_tab_selected.png')]",
            tabContent: 'text-white text-xl group-data-[selected=true]:text-basic-yellow',
          }}
          onSelectionChange={onSelectionChange}
        >
          {tabs.map((tab) => (
            <Tab
              key={tab.key}
              title={
                <div className="flex items-center space-x-2">
                  <span>{tab.label}</span>
                </div>
              }
            ></Tab>
          ))}
        </Tabs>

        <Assets
          total={total}
          items={items}
          scrollRef={scrollRef}
          selectedKey={selectedKey}
          displayItems={displayItems}
          onUpdate={onAssetsUpdate}
        />

        {loading && <CircularLoading />}
      </div>
    </div>
  );
};

export default observer(MyAssets);
