import { Table, TableBody, TableCell, TableColumn, TableHeader, TableRow } from '@nextui-org/react';
import { FC, useState } from 'react';
import styles from './index.module.scss';

const HistoryTabPanel: FC = () => {
  const [tableData, setTableData] = useState<Pledge.LockedHistoryItem[]>([]);

  return (
    <div className="mt-15 px-[4.5rem]">
      <Table
        className="mt-[1.875rem]"
        aria-label="Locked History"
        classNames={{
          wrapper: 'bg-black p-0 rounded-none border-1 border-[#1E1E1E] font-poppins-medium',
          thead: '[&>tr:last-child]:hidden [&>tr]:border-none',
          tbody: 'pl-[2.1875rem] pr-[1.1875rem] ',
          tr: `!rounded-none relative ${styles.tRow}`,
          th: 'bg-[#111111] !rounded-none [&:first-child]:pl-[2.1875rem] [&:last-child]:pr-[2.1875rem]',
          td: '[&:first-child]:pl-[2.1875rem] [&:last-child]:pr-[2.1875rem]',
        }}
      >
        <TableHeader className="uppercase">
          <TableColumn>Date</TableColumn>
          <TableColumn>Time</TableColumn>
          <TableColumn>Description</TableColumn>
          <TableColumn>Due Date</TableColumn>
          <TableColumn>Details</TableColumn>
        </TableHeader>
        <TableBody emptyContent={'Coming Soon.'}>
          {tableData.map((row, index) => (
            <TableRow key={index}>
              <TableCell>{row.date}</TableCell>
              <TableCell>{row.time}</TableCell>
              <TableCell>{row.description}</TableCell>
              <TableCell>{row.dueDate}</TableCell>
              <TableCell>
                <a className="underline">View</a>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default HistoryTabPanel;
