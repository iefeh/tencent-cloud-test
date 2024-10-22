import React, { FC } from 'react';
import { GyozaTabsEnum } from './GyozaTabs'
import useDataHook from './useDataHook'
import Card from './Card';
import Image from 'next/image';
import { Button } from '@nextui-org/react';
import CommonTable from '@/components/common/CommonTable';
import FollowUs from '@/components/pages/minigames/details/DetailTabs/FollowUs';
import { MediaLinks } from '@/constant/common';
import { BaseButton } from './Buttons/gostButton';
import BadgePanel from './TabsItem/BadgesPanel';
import TasksTabPanel from './TasksTabPanel'
import { cn } from '@nextui-org/react';

interface TabContentsProps {
  tabKey: GyozaTabsEnum;
}

const commonBtnStyle = 'hover:bg-[#EBAB8B] shadow-[0px_2px_5px_0px_rgba(46,26,15,0.5)]'
const firstWidth = '10rem'
const secondWidth = '20rem'

const titleMap = {
  [GyozaTabsEnum.Overview]: 'Game data',
  [GyozaTabsEnum.Tasks]: 'Tasks',
  [GyozaTabsEnum.Ranking]: 'Ranking',
  [GyozaTabsEnum.BadgesAndSBTs]: 'Badges and SBTs',
}

const TabContents: FC<TabContentsProps> = (props) => {
  const { tabKey } = props;

  const columns = [
    {
      dataIndex: '',
      name: 'Rack',
      width: firstWidth,
      render: (_: string, __: any, idx: number) => (<div className='text-[#6D5346] text-lg px-4'># {idx + 1}</div>)
    },
    {
      dataIndex: '',
      name: 'Player',
      width: secondWidth,
      render: (t: string, r: Dict<string>) => (
        <div className='flex items-center gap-x-4 text-[#6D5346] text-lg'>
          <Image className='w-12 h-12 rounded-full border-[#C6886A]' src="" alt=''></Image>
          <span>Panda</span>
        </div>
      )
    },
    {
      dataIndex: '',
      name: 'Score',
      render: (t: string, r: Dict<string>) => (
        <div className='text-[#8F6E35] text-xl'>2,364,487</div>
      )
    }
  ]

  const { rankingList, overviewList, tasksList } = useDataHook(tabKey)

  const renderOverview = () => {
    return (
      <div className='flex flex-wrap gap-[1.625rem]'>
        {
          overviewList.map((item, index) => (
            <Card key={index}>
              <div className='p-5 pt-[2.375rem] w-[20.625rem]'>
                <Image className='w-20 h-20 mx-auto' src='' alt=''></Image>
                <div className='text-center py-6'>Current Gold Pool</div>
                <div className='text-center rounded-[.625rem] w-full bg-[#D2A88A] shadow-[0px_5px_13px_0px_rgba(182,136,103,0.92)_inset] pt-4 pb-2 text-[1.75rem] color-[#2E1A0F]'>32,545</div>
              </div>
            </Card>
          ))
        }
      </div>
    )
  }

  const renderRanking = () => {
    const renderMyRanK = () => {
      return (
        <div className='flex items-center text-[#2E1A0F] text-3xl py-6 mt-3 bg-[#EFD4A4] shadow-[0px_2px_5px_0px_rgba(46,26,15,0.5)] rounded-xl'>
          <div style={{ width: firstWidth }} className='pl-6'>My Rank</div>
          <div style={{ width: secondWidth }} className='pl-6'># 123123</div>
          <div className='pl-2'>2,232,233</div>
        </div>
      )
    }

    return (
      // FIXME: 结构展示未知
      <CommonTable<any>
        warpperClassNames='bg-[#e5c9b1] rounded-[1.25rem] px-[1.875rem] py-6'
        classNames={{
          table: 'border-collapse',
          wrapper: 'bg-transparent shadow-none p-0',
          thead: '[&>tr:nth-child(2)]:hidden bg-transparent rounded-t-[1.25rem] rounded-b-[.625rem] shadow-[0px_5px_13px_0px_rgba(182,136,103,0.92)_inset]',
          th: 'bg-transparent text-[#2E1A0F] text-lg leading-none outline-none pt-3 pb-4 px-6 h-auto',
          tr: '!rounded-lg',
        }}
        calcHeaderItemClassNames={(index: number) => cn([
          'bg-[rgba(210,168,138,.6)]',
          index === 0 && '!rounded-tl-[1.25rem]',
          index === columns.length - 1 && '!rounded-tr-[1.25rem]',
        ])}
        calcRowClassNames={(rowIdx: number) => cn([
          rowIdx % 2 === 0 ? 'bg-[#F3DCC8]' : 'bg-[#e5c9b1]',
        ])}
        columns={columns}
        dataList={rankingList}
        renderComp={{
          renderContent: renderMyRanK
        }}
      />
    )
  }

  const renderTabContent = () => {
    switch (tabKey) {
      case GyozaTabsEnum.Overview:
        return renderOverview();

      case GyozaTabsEnum.Tasks:
        return <TasksTabPanel></TasksTabPanel>

      case GyozaTabsEnum.Ranking:
        return renderRanking()

      case GyozaTabsEnum.BadgesAndSBTs:
        return <BadgePanel></BadgePanel>

      default:
        break;
    }
  }

  return (
    <div className='mb-12'>
      <div className='text-white text-3xl pt-14 pb-9'>{titleMap[tabKey]}</div>
      {renderTabContent()}
      <FollowUs
        className="bg-[#e6cab1]"
        medias={[
          {
            name: '/minigames/miner/media_x.png',
            label: 'Twitter Follow @Moonveil_Studio',
            btn: 'Follow us',
            renderBtn: (btn: string) => (
              <BaseButton className={commonBtnStyle}>
                {btn}
              </BaseButton>
            ),
            link: MediaLinks.TWITTER,
          },
          {
            name: '/minigames/miner/media_discord.png',
            label: 'Join Moonveil’s Discord',
            btn: 'Join us',
            renderBtn: (btn: string) => (
              <BaseButton className={commonBtnStyle}>
                {btn}
              </BaseButton>
            ),
            link: MediaLinks.DISCORD,
          },
          {
            name: '/minigames/miner/media_tg.png',
            label: 'Telegram',
            btn: 'Follow us',
            renderBtn: (btn: string) => (
              <BaseButton className={commonBtnStyle}>
                {btn}
              </BaseButton>
            ),
            link: MediaLinks.TELEGRAM,
          },
        ]}
      />
    </div >
  )
}

export default TabContents;