import { EventsStatus } from '@/constant/task';
import { Table, TableBody, TableCell, TableColumn, TableHeader, TableRow } from '@nextui-org/react';
import { useState } from 'react';
import styles from './index.module.css';

interface EventItem {
  event: string;
  status: EventsStatus;
  time: string;
}

export default function EventsParticipated() {
  const [tableData, setTableData] = useState<EventItem[]>([
    // {
    //   event: 'AstrArk Character Voice Rally',
    //   status: EventsStatus.IN_PROGRESS,
    //   time: 'January 30, 2024',
    // },
    // {
    //   event: 'AstrArk Character Voice Rally',
    //   status: EventsStatus.IN_PROGRESS,
    //   time: 'January 30, 2024',
    // },
    // {
    //   event: 'AstrArk Character Voice Rally',
    //   status: EventsStatus.IN_PROGRESS,
    //   time: 'January 30, 2024',
    // },
    // {
    //   event: 'AstrArk Character Voice Rally',
    //   status: EventsStatus.COMPLETED,
    //   time: 'January 30, 2024',
    // },
    // {
    //   event: 'AstrArk Character Voice Rally',
    //   status: EventsStatus.COMPLETED,
    //   time: 'January 30, 2024',
    // },
  ]);

  return (
    <div className="mt-[6.875rem]">
      <div className="mt-20 font-semakin text-2xl text-basic-yellow">Events Participated</div>

      <Table
        className="mt-[1.875rem]"
        aria-label="Events participated"
        classNames={{
          wrapper: 'bg-black p-0 rounded-none border-1 border-[#1E1E1E] font-poppins-medium',
          thead: '[&>tr:last-child]:hidden [&>tr]:border-none',
          tbody: 'pl-[2.1875rem] pr-[1.1875rem] ',
          tr: `!rounded-none relative ${styles.tRow}`,
          th: 'bg-[#111111] !rounded-none [&:first-child]:pl-[2.1875rem] [&:last-child]:pr-[2.1875rem]',
          td: '[&:first-child]:pl-[2.1875rem] [&:last-child]:pr-[2.1875rem]',
        }}
      >
        <TableHeader>
          <TableColumn>Event</TableColumn>
          <TableColumn>Status</TableColumn>
          <TableColumn>Time</TableColumn>
        </TableHeader>
        <TableBody emptyContent={'Coming Soon.'}>
          {tableData.map((row, index) => (
            <TableRow key={index}>
              <TableCell>{row.event}</TableCell>
              <TableCell>{row.status}</TableCell>
              <TableCell>{row.time}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
