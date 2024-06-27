import CirclePagination from '@/components/common/CirclePagination';
import { Table, TableBody, TableCell, TableColumn, TableHeader, TableRow, cn } from '@nextui-org/react';
import { FC, useState } from 'react';

const HistoryTabPanel: FC = () => {
  const [tableData, setTableData] = useState<Pledge.LockedHistoryItem[]>([
    {
      id: '1',
      date: '2024/2/22',
      time: '11:20am',
      description: 'locked 5000 uSDT for 3 months',
      dueDate: '2024/5/22  11:20am',
    },
    {
      id: '1',
      date: '2024/2/22',
      time: '11:20am',
      description: 'locked 5000 uSDT for 3 months',
      dueDate: '2024/5/22  11:20am',
    },
    {
      id: '1',
      date: '2024/2/22',
      time: '11:20am',
      description: 'locked 5000 uSDT for 3 months',
      dueDate: '2024/5/22  11:20am',
    },
    {
      id: '1',
      date: '2024/2/22',
      time: '11:20am',
      description: 'locked 5000 uSDT for 3 months',
      dueDate: '2024/5/22  11:20am',
    },
    {
      id: '1',
      date: '2024/2/22',
      time: '11:20am',
      description: 'locked 5000 uSDT for 3 months',
      dueDate: '2024/5/22  11:20am',
    },
  ]);
  const [total, setTotal] = useState(1);

  function onPagiChange() {}

  return (
    <div className="mt-[3.75rem] px-[4.5rem]">
      <Table
        className="mt-[1.875rem]"
        aria-label="Locked History"
        classNames={{
          wrapper: 'bg-black p-0 rounded-none font-poppins-medium',
          thead:
            "[&>tr:last-child]:hidden [&>tr]:border-non border-none bg-[url('https://moonveil-public.s3.ap-southeast-2.amazonaws.com/pledge/bg_table_head.png')] bg-contain bg-no-repeat",
          tbody: 'pl-[2.1875rem] pr-[1.1875rem] ',
          tr: cn([
            'relative h-[3.0625rem]',
            '[&:nth-child(2n)]:h-[2.5625rem]',
            '[&:nth-child(2n)>td]:bg-[#8383835c]',
            '[&:nth-child(2n)>td:first-child]:rounded-l-[0.3125rem]',
            '[&:nth-child(2n)>td:last-child]:rounded-r-[0.3125rem]',
          ]),
          th: 'bg-transparent text-white text-xl font-semakin font-normal !rounded-none [&:first-child]:pl-6 [&:last-child]:pr-6',
          td: '[&:first-child]:pl-[2.1875rem] [&:last-child]:pr-[2.1875rem]',
        }}
      >
        <TableHeader className="uppercase">
          <TableColumn>Date</TableColumn>
          <TableColumn>Time</TableColumn>
          <TableColumn>Description</TableColumn>
          <TableColumn>Due Date</TableColumn>
          <TableColumn className="text-right">Details</TableColumn>
        </TableHeader>
        <TableBody emptyContent={'Coming Soon.'}>
          {tableData.map((row, index) => {
            const isZebra = index % 2 === 1;

            return (
              <TableRow key={index}>
                <TableCell>{row.date}</TableCell>
                <TableCell>{row.time}</TableCell>
                <TableCell>{row.description}</TableCell>
                <TableCell>{row.dueDate}</TableCell>
                <TableCell>
                  <a className="underline cursor-pointer">View</a>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>

      <CirclePagination total={total} className="flex justify-center mt-6" onChange={onPagiChange} />
    </div>
  );
};

export default HistoryTabPanel;
