import CircularLoading from '@/pages/components/common/CircularLoading';
import { Tab, Tabs } from '@nextui-org/react';
import { useState, type FC, type Key, useEffect } from 'react';
import { type CateTab, cateTabs } from './model';
import ShopItem from './ShopItem';

const CateTabs: FC = () => {
  const [tabs, setTabs] = useState<CateTab[]>([]);
  const [listTabs, setListTabs] = useState<CateTab[]>([]);
  const [selectedKey, setSelectedKey] = useState<string>();
  const [selectedListKey, setSelectedListKey] = useState<string>();
  const [selectedListTab, setSelectedListTab] = useState<CateTab | undefined>();
  const [loading, setLoading] = useState(false);

  async function queryTabs() {
    setLoading(true);

    setTabs(cateTabs);
    setTimeout(() => onSelectionChange(cateTabs[0].key || ''), 0);

    setLoading(false);
  }

  function onSelectionChange(key: Key) {
    const newKey = key.toString();
    setSelectedKey(newKey);

    const { children = [] } = tabs.find((item) => item.key === newKey) || {};
    setListTabs(children);
    setSelectedListKey(children[0]?.key || '');
  }

  function onListSelectionChange(key: Key) {
    const newKey = key.toString();
    setSelectedListKey(newKey);

    const tab = listTabs.find((item) => item.key === newKey);
    setSelectedListTab(tab);
  }

  useEffect(() => {
    queryTabs();
  }, []);

  return (
    <div className="min-h-[25rem] mt-12 relative flex flex-nowrap gap-8 z-0">
      <Tabs
        aria-label="Options"
        color="primary"
        selectedKey={selectedKey}
        classNames={{
          base: 'w-[13.9375rem] shrink-0',
          tabList: 'gap-5 flex-col w-full relative rounded-none p-0 bg-transparent',
          cursor: 'w-full bg-transparent',
          tab: "px-0 w-full h-[5.125rem] bg-[url('https://moonveil-public.s3.ap-southeast-2.amazonaws.com/astrark/assets/bg_tab_unselected.png')] bg-no-repeat bg-contain data-[selected=true]:bg-[url('https://moonveil-public.s3.ap-southeast-2.amazonaws.com/astrark/assets/bg_tab_selected.png')]",
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

      <Tabs selectedKey={selectedListKey} onSelectionChange={onListSelectionChange}>
        {listTabs.map((tab) => (
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

      {selectedListTab?.items instanceof Array
        ? selectedListTab.items.map((item) => <ShopItem key={item.id} item={item} />)
        : selectedListTab?.items}

      {loading && <CircularLoading />}
    </div>
  );
};

export default CateTabs;
