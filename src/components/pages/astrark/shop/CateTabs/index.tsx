import CircularLoading from '@/pages/components/common/CircularLoading';
import { Button, Tab, Tabs, cn } from '@nextui-org/react';
import { useState, type FC, type Key } from 'react';
import { type CateTab } from '../model';
import S3Image from '@/components/common/medias/S3Image';
import styles from './index.module.scss';
import ItemCollections from './ItemCollections';
import PayModal from '../Modal/PayModal';
import useModalDataHook from '../Modal/useModalDataHook';
import useShopInfo from './useShopInfo';
import { observer } from 'mobx-react-lite';

const CateTabs: FC = () => {
  const [listTabs, setListTabs] = useState<CateTab[]>([]);
  const [selectedKey, setSelectedKey] = useState<string>();
  const [selectedListKey, setSelectedListKey] = useState<string>();
  const [selectedListTab, setSelectedListTab] = useState<CateTab | undefined>();

  const { modalData, openModal } = useModalDataHook();

  const { cates: tabs, loading, queryShopInfo } = useShopInfo();

  function onSelectionChange(key: Key) {
    const newKey = key.toString();
    setSelectedKey(newKey);

    const { children = [] } = tabs.find((item) => item.key === newKey) || {};
    setListTabs(children);
    const listKey = children[0]?.key || '';
    setSelectedListKey(listKey);
    onListSelectionChange(listKey, children);
  }

  function onListSelectionChange(key: Key, list = listTabs) {
    const newKey = key.toString();
    setSelectedListKey(newKey);

    const tab = list.find((item) => item.key === newKey);
    setSelectedListTab(tab);
  }

  return (
    <div className="flex-1 relative flex flex-nowrap gap-14 z-0 pr-12 overflow-hidden">
      <div className="bg-gradient-to-b from-transparent via-black/30 to-transparent flex flex-col w-[11.3125rem] overflow-x-visible pt-12">
        <Tabs
          aria-label="Options"
          color="primary"
          selectedKey={selectedKey}
          classNames={{
            base: 'w-48 shrink-0 flex-1',
            tabList: 'gap-0 flex-col w-full relative rounded-none p-0 bg-transparent overflow-x-visible',
            cursor: 'w-full bg-transparent',
            tab: 'px-0 w-full h-[4.125rem]',
            tabContent: 'text-[#8BA4BE] text-[1.375rem] group-data-[selected=true]:text-white w-full h-full',
          }}
          onSelectionChange={onSelectionChange}
        >
          {tabs.map((tab) => (
            <Tab
              key={tab.key}
              title={
                <div className="flex justify-center items-center w-full h-full relative">
                  {tab.key === selectedKey && (
                    <S3Image
                      className="object-contain !h-[5.5rem] !top-1/2 -translate-y-1/2"
                      src="/astrark/shop/bg_tab_cate_selected.png"
                      fill
                    />
                  )}

                  <span className="relative z-0">{tab.label}</span>
                </div>
              }
            ></Tab>
          ))}
        </Tabs>

        <Button
          className="w-[10.75rem] h-[5.75rem] bg-transparent pt-[0.8125rem] flex-shrink-0 ml-2 rounded-none"
          disableRipple
        >
          <S3Image className="object-contain" src="/astrark/shop/btn_process.png" fill />

          <S3Image className="w-5 h-5 object-contain relative z-0" src="/astrark/shop/icons/icon_question.png" />

          <span className="relative z-0 text-base leading-[1.125rem] text-left">
            Purchase
            <br />
            Process
          </span>
        </Button>

        <Button
          className="w-[10.75rem] h-[5.75rem] bg-transparent pt-[0.1875rem] flex-shrink-0 -mt-ten mb-4 ml-2 rounded-none"
          disableRipple
        >
          <S3Image className="object-contain" src="/astrark/shop/btn_back.png" fill />

          <S3Image className="w-5 h-5 object-contain relative z-0" src="/astrark/shop/icons/icon_back.png" />

          <span className="relative z-0 text-base leading-[1.125rem] text-[#5D3C13] text-left">
            Return to
            <br />
            Game
          </span>
        </Button>
      </div>

      <div className="flex-1 flex flex-col overflow-hidden pt-2">
        <Tabs
          color="primary"
          selectedKey={selectedListKey}
          classNames={{
            tabList: cn(['flex-1 bg-transparent p-0 rounded-none relative', styles.listTabs]),
            cursor: 'w-full bg-transparent',
            tab: "data-[selected=true]:bg-[url('https://moonveil-public.s3.ap-southeast-2.amazonaws.com/astrark/shop/bg_list_tab_repeat.png')] bg-[length:auto_100%] bg-no-repeat bg-repeat-x px-6 pt-0 pb-2 h-[3.125rem] rounded-none w-auto",
            tabContent: 'text-[#8BA4BE] text-lg group-data-[selected=true]:text-white',
          }}
          onSelectionChange={onListSelectionChange}
        >
          {listTabs.map((tab) => (
            <Tab
              key={tab.key}
              title={
                <div className="flex items-center">
                  <span>{tab.label}</span>
                </div>
              }
            ></Tab>
          ))}
        </Tabs>

        {selectedListTab && (
          <ItemCollections key={selectedListTab?.key || ''} item={selectedListTab} handleItemClick={openModal} />
        )}
      </div>

      {loading && <CircularLoading noBlur />}

      <PayModal {...modalData} onUpdate={queryShopInfo}></PayModal>
    </div>
  );
};

export default observer(CateTabs);
