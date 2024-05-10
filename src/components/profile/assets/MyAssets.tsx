import { Tab, Tabs } from '@nextui-org/react';
import { FC, useState } from 'react';
import Assets from './Assets';

const MyAssets: FC = () => {
  const [tabs, setTabs] = useState(['Regular Tasks', 'Events']);
  const [selectedKey, setSelectedKey] = useState('');

  function onSelectionChange() {}

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
          >
            <Assets />
          </Tab>
        ))}
      </Tabs>
    </div>
  );
};

export default MyAssets;
