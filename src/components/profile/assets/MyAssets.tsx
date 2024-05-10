import { Tab, Tabs } from '@nextui-org/react';
import { FC, Key, useState } from 'react';
import Assets from './Assets';
import usePageQuery from '@/hooks/usePageQuery';
import { MyNFTQueryParams, NFTItem, queryMyNFTListAPI } from '@/http/services/mint';
import { NFTCategory } from '@/constant/nft';

const MyAssets: FC = () => {
  const [tabs, setTabs] = useState([NFTCategory.TETRA_NFT, NFTCategory.SBT]);
  const [selectedKey, setSelectedKey] = useState(NFTCategory.TETRA_NFT);
  const { loading, data, total } = usePageQuery<NFTItem, MyNFTQueryParams>({ key: 'nfts', fn: queryMyNFTListAPI });

  function onSelectionChange(key: Key) {
    setSelectedKey(key.toString() as NFTCategory);
  }

  return (
    <div className="flex">
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
        onSelectionChange={onSelectionChange}
      >
        {tabs.map((tab) => (
          <Tab
            key={tab}
            title={
              <div className="flex items-center space-x-2">
                <span>{tab}</span>
              </div>
            }
          ></Tab>
        ))}
      </Tabs>

      <Assets items={data} />
    </div>
  );
};

export default MyAssets;
