import { Tab, Tabs } from '@nextui-org/react';
import { FC, Key, useRef, useState } from 'react';
import Assets from './Assets';
import usePageQuery from '@/hooks/usePageQuery';
import { MyNFTQueryParams, NFTItem, queryMyNFTListAPI } from '@/http/services/mint';
import { ASSETS_PAGE_SIZE, NFTCategory } from '@/constant/nft';
import CircularLoading from '@/pages/components/common/CircularLoading';

interface Props {
  displayItems: NFTItem[];
  onUpdate?: () => void;
}

const MyAssets: FC<Props> = ({ displayItems, onUpdate }) => {
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
  const selectedKeyRef = useRef(selectedKey);
  const { loading, data, total, queryData, onPageChange } = usePageQuery<NFTItem, MyNFTQueryParams>({
    key: 'nfts',
    fn: queryMyNFTListAPI,
    paramsFn: () => ({ category: selectedKeyRef.current }),
  });

  function onSelectionChange(key: Key) {
    const newKey = key.toString() as NFTCategory;
    setSelectedKey(newKey);
    selectedKeyRef.current = newKey;
    queryData();
  }

  function onAssetsUpdate() {
    queryData();
    onUpdate?.();
  }

  return (
    <>
      <div className="font-semakin text-basic-yellow text-2xl">My Asset ( {total} )</div>

      <div className="min-h-[25rem] relative">
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

        <Assets total={Math.ceil(total / ASSETS_PAGE_SIZE)} items={data} displayItems={displayItems} onUpdate={onAssetsUpdate} onPageChange={onPageChange} />

        {loading && <CircularLoading />}
      </div>
    </>
  );
};

export default MyAssets;
