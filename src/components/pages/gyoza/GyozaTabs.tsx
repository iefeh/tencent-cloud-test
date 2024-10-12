import React, { FC } from "react";
import { Tab, Tabs, cn } from '@nextui-org/react';

export enum GyozaTabsEnum {
  Overview = "overview",
  Tasks = "tasks",
  Ranking = "ranking",
  BadgesAndSBTs = "badges&SBTs"
}

interface IProps {
  value?: string;
  onSelectionChange?: (key: string) => void;
}

const tabs = [
  { name: GyozaTabsEnum.Overview, label: "Overview" },
  { name: GyozaTabsEnum.Tasks, label: "Tasks" },
  { name: GyozaTabsEnum.Ranking, label: "Ranking" },
  { name: GyozaTabsEnum.BadgesAndSBTs, label: "Badges & SBTs" },
]

const GyozaTabs: FC<IProps> = (props) => {
  const { value, onSelectionChange } = props

  return (
    <Tabs
      aria-label="Options"
      color="primary"
      variant="underlined"
      classNames={{
        base: "w-full",
        tabList: "gap-[3.75rem] w-full relative rounded-none p-0 border-b border-divider",
        cursor: "w-full bg-white h-[3px] rounded-sm",
        tab: "max-w-fit px-0 h-12",
        tabContent: "text-xl text-white group-data-[selected=true]:text-white"
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
  )
}

export default GyozaTabs;