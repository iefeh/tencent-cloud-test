import {
  Pagination,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
  Tabs,
  Tooltip,
} from '@nextui-org/react';
import { FC, useState } from 'react';
import { Invitee } from '@/http/services/profile';
import Image from 'next/image';
import PaginationRenderItem from '@/pages/LoyaltyProgram/earn/components/TaskTabs/components/PaginationRenderItem';

const RewardHistory: FC = () => {
  const [data, setData] = useState<Invitee[]>([]);
  const [pagiTotal, setPagiTotal] = useState(1);

  function onPagiChange(index: number) {}

  return (
    <div className="flex-1">
      <div className="font-semakin text-2xl">Reward History</div>

      <div className="text-base text-[#999]">
        Earned <span className="text-basic-yellow mt-2">7</span> Moon Beams
      </div>

      <Tabs
        variant="underlined"
        classNames={{
          base: 'mt-7',
          cursor: 'w-full bg-basic-yellow',
          tab: 'text-base',
          tabContent: 'text-white hover:text-white group-data-[selected=true]:text-basic-yellow',
        }}
      >
        <Tab title="Social Media Connect" />
        <Tab title="Wallet Connect" />
      </Tabs>

      <Table
        className="mt-[1.875rem]"
        aria-label="Events participated"
        classNames={{
          wrapper: 'bg-black p-0 !rounded-base border-1 border-basic-gray font-poppins-medium',
          thead: '[&>tr:last-child]:hidden [&>tr]:border-none h-16',
          tbody: 'pl-[2.1875rem] pr-[1.1875rem] max-h-[25rem] overflow-y-auto',
          tr: '!rounded-none relative',
          th: 'bg-[#111111] !rounded-none [&:first-child]:pl-[2.1875rem] [&:last-child]:pr-[2.1875rem]',
          td: '[&:first-child]:pl-[2.1875rem] [&:last-child]:pr-[2.1875rem]',
        }}
      >
        <TableHeader>
          <TableColumn>User</TableColumn>
          <TableColumn>Details</TableColumn>
          <TableColumn>Reward</TableColumn>
        </TableHeader>

        <TableBody emptyContent="No data.">
          {data.map((row, index) => (
            <TableRow key={index}>
              <TableCell>
                <div className="relative w-[3.75rem] h-[3.75rem] border-1 border-basic-yellow">
                  <Image className="object-cover" src={row.avatar} alt="" fill sizes="100%" />
                </div>
              </TableCell>

              <TableCell>
                <Tooltip content={<div className="max-w-[20rem]">{row.details || '--'}</div>}>
                  <div className="overflow-hidden whitespace-nowrap text-ellipsis">{row.details || '--'}</div>
                </Tooltip>
              </TableCell>

              <TableCell>+{row.reward || '--'} MB</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <Pagination
        className="mt-4 flex justify-center"
        showControls
        total={pagiTotal}
        initialPage={1}
        renderItem={PaginationRenderItem}
        classNames={{
          wrapper: 'gap-3',
          item: 'w-12 h-12 font-poppins-medium text-base text-white',
        }}
        disableCursorAnimation
        radius="full"
        variant="light"
        onChange={onPagiChange}
      />
    </div>
  );
};

export default RewardHistory;
