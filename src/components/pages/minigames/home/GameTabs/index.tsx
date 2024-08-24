import { Tab, Tabs, cn } from '@nextui-org/react';
import { FC, useEffect } from 'react';

interface Props extends ClassNameProps {
  value?: string;
  onSelectionChange?: (key: string) => void;
}

const GameTabs: FC<Props> = ({ className, value, onSelectionChange }) => {
  const tabs = [
    {
      name: 'all',
      label: 'All',
    },
    {
      name: 'in_progress',
      label: 'In Progress',
      content: null,
    },
    {
      name: 'coming_soon',
      label: 'Coming Soon',
    },
    {
      name: 'wait_for_next_round',
      label: 'Wait for Next Round',
    },
    {
      name: 'tickets_available',
      label: 'Tickets Available',
    },
  ];

  useEffect(() => onSelectionChange?.(tabs[0].name), []);

  return (
    <Tabs
      aria-label="Options"
      color="primary"
      variant="underlined"
      selectedKey={value}
      classNames={{
        base: cn(['text-brown w-full lg:w-auto overflow-x-auto', className]),
        tabList: 'gap-[0.375rem] w-max relative rounded-none overflow-x-visible p-0 mx-6',
        cursor: 'hidden',
        tab: 'max-w-fit h-auto px-5 py-3 bg-[#F7E9CC] !rounded-base border-2 border-[#403930] data-[selected=true]:bg-[#FFD641]',
        tabContent: 'text-brown text-base group-data-[selected=true]:text-brown',
        panel: 'p-0',
      }}
      onSelectionChange={(key) => onSelectionChange?.(key.toString())}
    >
      {tabs.map((tab) => (
        <Tab
          key={tab.name}
          title={
            <div className="flex items-center space-x-2 px-1">
              <span>{tab.label}</span>
            </div>
          }
        />
      ))}
    </Tabs>
  );
};

export default GameTabs;
