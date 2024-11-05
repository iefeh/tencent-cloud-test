import EmptyContent from '@/components/common/EmptyContent';
import { usePledgeContext } from '@/store/Pledge';
import { Table, TableBody, TableCell, TableColumn, TableHeader, TableRow, cn } from '@nextui-org/react';
import dayjs from 'dayjs';
import Duration from 'dayjs/plugin/duration';
import { observer } from 'mobx-react-lite';
import { FC } from 'react';

dayjs.extend(Duration);

const FORMAT_TIME = 'YYYY/M/D H:MM A';

const HistoryTabPanel: FC = () => {
  const { stakeInfo, currentType, formatUnits } = usePledgeContext();
  const history = (stakeInfo[4] || []).slice().reverse();

  return (
    <div className="mt-[3.75rem] px-[4.5rem]">
      <Table
        className="mt-[1.875rem]"
        aria-label="Locked History"
        classNames={{
          wrapper: 'bg-black p-0 rounded-none font-poppins-medium',
          thead:
            "[&>tr:last-child]:hidden [&>tr]:border-non border-none bg-[url('https://d3dhz6pjw7pz9d.cloudfront.net/pledge/bg_table_head.png')] bg-contain bg-no-repeat",
          tbody: 'pl-[2.1875rem] pr-[1.1875rem] ',
          tr: cn([
            'relative h-[3.0625rem]',
            '[&:nth-child(2n)]:h-[2.5625rem]',
            '[&:nth-child(2n)>td]:bg-[#8383835c]',
            '[&:nth-child(2n)>td:first-child]:rounded-l-[0.3125rem]',
            '[&:nth-child(2n)>td:last-child]:rounded-r-[0.3125rem]',
          ]),
          th: 'bg-transparent text-white text-lg font-semakin font-normal !rounded-none [&:first-child]:pl-6 [&:last-child]:pr-6',
          td: '[&:first-child]:pl-[2.1875rem] [&:last-child]:pr-[2.1875rem]',
        }}
      >
        <TableHeader className="uppercase">
          <TableColumn>Stake Time</TableColumn>
          <TableColumn>Stake Value</TableColumn>
          <TableColumn>Stake Duration</TableColumn>
          <TableColumn>Staking Points</TableColumn>
          <TableColumn>Locked Value</TableColumn>
          <TableColumn>Unlock Value</TableColumn>
          <TableColumn className="text-right">Unlocked Time</TableColumn>
        </TableHeader>
        <TableBody
          emptyContent={
            <div className="relative w-full h-[32.5rem]">
              <EmptyContent className="py-8" />
            </div>
          }
        >
          {history.map((row, index) => {
            const duration = (row[1] - row[4]) * 1000n;

            return (
              <TableRow key={index}>
                <TableCell>{dayjs(parseInt(((row[4] || 0n) * 1000n).toString())).format(FORMAT_TIME)}</TableCell>
                <TableCell>
                  {formatUnits(row[0])}
                  <span className="uppercase"> {currentType}</span>
                </TableCell>
                <TableCell>{dayjs.duration(+duration.toString()).asWeeks()} Weeks</TableCell>
                <TableCell>{row[5].toString()}</TableCell>
                <TableCell>
                  {formatUnits(row[0] - row[7])} <span className="uppercase"> {currentType}</span>
                </TableCell>
                <TableCell>{formatUnits(row[7])}</TableCell>
                <TableCell>
                  {duration !== 0n && row[1]
                    ? dayjs(parseInt(((row[1] || 0n) * 1000n).toString())).format(FORMAT_TIME)
                    : '-'}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
};

export default observer(HistoryTabPanel);
