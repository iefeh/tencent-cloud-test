import { Table, TableBody, TableCell, TableColumn, TableHeader, TableRow, cn } from '@nextui-org/react';
import Image from 'next/image';
import { CSSProperties, FC, useState } from 'react';

interface RankingItem {
  rank: number;
  player: string;
  score: number;
  avatar: string;
}

const RankingTabPanel: FC = () => {
  const columns = ['Rank', 'Player', 'Score'];
  const [data, setData] = useState<RankingItem[]>([
    {
      rank: 1,
      player: 'Will',
      score: 8962551,
      avatar: 'https://moonveil-public.s3.ap-southeast-2.amazonaws.com/avatar/default.png',
    },
    {
      rank: 2,
      player: 'Will',
      score: 6548652,
      avatar: 'https://moonveil-public.s3.ap-southeast-2.amazonaws.com/avatar/default.png',
    },
    {
      rank: 3,
      player: 'Will',
      score: 5133541,
      avatar: 'https://moonveil-public.s3.ap-southeast-2.amazonaws.com/avatar/default.png',
    },
    {
      rank: 4,
      player: 'Will',
      score: 2541354,
      avatar: 'https://moonveil-public.s3.ap-southeast-2.amazonaws.com/avatar/default.png',
    },
    {
      rank: 5,
      player: 'Will',
      score: 985642,
      avatar: 'https://moonveil-public.s3.ap-southeast-2.amazonaws.com/avatar/default.png',
    },
  ]);
  const varStyles = { '--stroke-color': '#7A0A08' } as CSSProperties;

  return (
    <div className="pt-6 px-[1.875rem] pb-9 rounded-[1.25rem] bg-[#F7E9CC]" style={varStyles}>
      <Table
        aria-label="Events participated"
        classNames={{
          table: 'border-collapse',
          wrapper: 'bg-transparent shadow-none p-0 rounded-none',
          thead: '[&>tr:nth-child(2)]:hidden rounded-tl-[1.25rem]',
          tbody: 'pl-[2.1875rem] pr-[1.1875rem] ',
          tr: 'relative',
          th: 'bg-transparent text-white text-xl leading-none outline-none p-0 h-auto',
          td: '',
        }}
      >
        <TableHeader>
          {columns.map((column, index) => (
            <TableColumn key={index} className={cn([index === 0 && 'w-[9.625rem]', index === 1 && 'w-80'])}>
              <div
                className={cn([
                  'border-y-3 border-[#CAB790] bg-[#472E24] h-12 leading-[2.625rem] pl-6',
                  index === 0 && 'border-l-3 rounded-tl-[1.25rem] rounded-bl-base',
                  index === columns.length - 1 && 'border-r-3 rounded-tr-[1.25rem] rounded-br-base',
                ])}
              >
                {column}
              </div>
            </TableColumn>
          ))}
        </TableHeader>
        <TableBody emptyContent={'Coming Soon.'}>
          {data.map((row, index) => (
            <TableRow key={index} className="[&:nth-child(2n+1)]:bg-[#E4D4B2] h-[4.125rem]">
              <TableCell className="rounded-l-base pl-5">
                <Image
                  className="object-contain w-[2.0625rem] h-[2.0625rem]"
                  src={`https://moonveil-public.s3.ap-southeast-2.amazonaws.com/minigames/icons/icon_${row.rank}.png`}
                  alt=""
                  width={66}
                  height={66}
                  unoptimized
                  priority
                />
              </TableCell>

              <TableCell className="pl-5 flex items-center">
                <div className="w-12 h-12 relative rounded-full overflow-hidden bg-[#8F5535] border-1 border-brown">
                  <Image className="object-contain" src={row.avatar} alt="" fill sizes="100%" unoptimized priority />
                </div>
                <span className="text-lg leading-none ml-[1.125rem] text-brown max-w-[15.5rem] overflow-hidden text-ellipsis whitespace-nowrap">
                  {row.player}
                </span>
              </TableCell>

              <TableCell className="rounded-r-base pl-5 text-yellow-1 text-2xl">
                <div className="stroke-text-normal" data-text={row.score}></div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <div className="flex items-center bg-[#E4D4B2] rounded-base border-1 border-dashed border-[#8F5535] h-20 mt-3 pl-6">
        <span className="text-brown text-2xl">My Rank</span>

        <Image
          className="object-contain w-[3.125rem] h-[3.125rem] ml-11"
          src="https://moonveil-public.s3.ap-southeast-2.amazonaws.com/minigames/icons/icon_star.png"
          alt=""
          width={100}
          height={100}
          unoptimized
          priority
        />

        <span className="ml-[0.875rem] stroke-text-normal text-3xl text-[#FDC511]" data-text={1000}></span>
      </div>
    </div>
  );
};

export default RankingTabPanel;
