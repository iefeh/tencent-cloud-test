import { Listbox, ListboxItem, ScrollShadow } from '@nextui-org/react';
import { FC } from 'react';
import NodeTokenRow from './NodeTokenRow';
import type { NodeTokensRecord } from '@/http/services/token';
import Image from 'next/image';
import teamsImg from 'img/loyalty/task/teams.png';
import CircularLoading from '@/pages/components/common/CircularLoading';

interface Props {
  loading?: boolean;
  items: NodeTokensRecord[];
}

const NodeTable: FC<Props> = ({ loading, items }) => {
  const emptyContent = (
    <div className="absolute inset-0 backdrop-saturate-150 backdrop-blur-md bg-overlay/30 z-[999] flex flex-col justify-center items-center font-poppins text-2xl pointer-events-none">
      <p>No history found.</p>
      <Image className="w-[54rem] h-auto" src={teamsImg} alt="" />
    </div>
  );

  return (
    <>
      <ul className="w-full flex justify-between items-center h-16 bg-[#111111] text-[#999] px-10 gap-4">
        <li className="flex-[360]">Source</li>
        <li className="flex-[264]">Level</li>
        <li className="flex-[224]">Amount</li>
        <li className="w-40 shrink-0 text-right">Claim Time</li>
      </ul>

      <ScrollShadow className="w-full h-[31.375rem] font-poppins-medium relative">
        <Listbox items={items} classNames={{ base: 'p-0 bg-black' }} label="Moon Beams History">
          {(item) => (
            <ListboxItem
              key={Math.random().toString()}
              className="rounded-none p-0 !bg-transparent"
              textValue={`${item.source}_${item.created_time}`}
            >
              <NodeTokenRow item={item} />
            </ListboxItem>
          )}
        </Listbox>

        {loading && <CircularLoading />}

        {!loading && items.length < 1 && emptyContent}
      </ScrollShadow>
    </>
  );
};

export default NodeTable;
