import React, { FC } from 'react';
import { GyozaTabsEnum } from './GyozaTabs'
import useDataHook from './useDataHook'
import Card from './Card';
import Image from 'next/image';
import { Button } from '@nextui-org/react';
import CommonTable from '@/components/common/CommonTable';

interface TabContentsProps {
  tabKey: GyozaTabsEnum;
}

const TabContents: FC<TabContentsProps> = (props) => {
  const { tabKey } = props;

  const columns = [
    {
      dataIndex: '',
      name: 'Rack',
      render: (_: string, __: any, idx: number) => `# ${idx + 1}`
    },
    {
      dataIndex: '',
      name: 'Player',
      render: (t: string, r: Dict<string>) => (
        <div>
          <Image className='w-12 h-12 rounded-' src="" alt=''></Image>
          <span></span>
        </div>
      )
    },
    {
      dataIndex: '',
      name: 'Score',
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

  const renderTasks = () => {
    return (
      <div className='flex flex-wrap gap-x-6 gap-y-8'>
        {tasksList.map((item, index) => (
          <Card key={index}>
            <div className='p-10 w-[28.125rem]'>
              <div className='text-lg text-[#2E1A0F]'>Connect Your Wallet</div>

              <div className='text-sm text-[#8C7264] pt-5 pb-10'>
                Connect to your crypto wallet Be sure to use the most valuable ...
              </div>

              <div className='text-lg text-[#2E1A0F] flex'>
                <Image className='w-8 h-8' src='' alt=''></Image>
                3500 MBs Max
              </div>

              <div className='pt-5'>
                <Button
                  variant="bordered"
                  radius="full"
                  className='mr-2 text-[#2E1A0F] border-[#C6886A] bg-[#F9E9DB] h-auto px-6 py-1 text-[.875rem]'
                >
                  Connect
                </Button>
                <Button
                  variant="bordered"
                  radius="full"
                  className='text-[#6B5549] border-[#6B5549] bg-[#E5C9B1] h-auto py-1 text-[.875rem]'
                >
                  Verify
                </Button>
              </div>

            </div>
          </Card>
        ))
        }
      </div>
    )
  }

  const renderRanking = () => {
    return (
      <CommonTable<Dict<string>>
        columns={columns}
        dataList={rankingList}
      ></CommonTable>
    )
  }

  const renderTabContent = () => {
    switch (tabKey) {
      case GyozaTabsEnum.Overview:

        return renderOverview();

      case GyozaTabsEnum.Tasks:

        return renderTasks()

      case GyozaTabsEnum.Ranking:

        return renderRanking()

      default:
        break;
    }
  }

  return (
    <div className='pt-[3.6875rem]'>
      {renderTabContent()}
    </div>
  )
}

export default TabContents;