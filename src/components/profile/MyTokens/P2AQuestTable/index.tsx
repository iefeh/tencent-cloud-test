import { Listbox, ListboxItem, Pagination, ScrollShadow } from '@nextui-org/react';
import { FC } from 'react';
import P2AQuestTokenRow from './P2AQuestTokenRow';
import { P2AQuestTokensRecord } from '@/http/services/token';
import Image from 'next/image';
import teamsImg from 'img/loyalty/task/teams.png';
import useClaimToken from '@/hooks/pages/profile/myTokens/useClaimToken';
import CircularLoading from '@/pages/components/common/CircularLoading';
import PaginationRenderItem from '@/components/LoyaltyProgram/task/PaginationRenderItem';

interface Props {
  pagiTotal?: number;
  loading?: boolean;
  items: P2AQuestTokensRecord[];
  onPagiChange?: (page: number) => void;
}

const P2AQuestTable: FC<Props> = ({ pagiTotal = 1, loading, items, onPagiChange }) => {
  const emptyContent = (
    <div className="relative backdrop-saturate-150 backdrop-blur-md bg-overlay/30 z-0 flex flex-col justify-center items-center font-poppins text-2xl pointer-events-none">
      <p>No history found.</p>
      <Image className="w-[54rem] h-auto" src={teamsImg} alt="" />
    </div>
  );

  return (
    <>
      <ul className="w-full flex justify-between items-center h-16 bg-[#111111] text-[#999] px-0 md:px-10 gap-4">
        <li className="flex-[360]">Item</li>
        <li className="flex-[264]">Reward Type</li>
        <li className="flex-[224]">Token</li>
        <li className="flex-[156] text-right">Time</li>
      </ul>

      <ScrollShadow className="w-full min-h-[8rem] max-h-[31.375rem] font-poppins-medium relative">
        <Listbox items={items} classNames={{ base: 'p-0 bg-black' }} label="Moon Beams History" emptyContent={emptyContent}>
          {(item) => (
            <ListboxItem
              key={Math.random().toString()}
              className="rounded-none p-0 !bg-transparent"
              textValue={item.source}
            >
              <P2AQuestTokenRow item={item} />
            </ListboxItem>
          )}
        </Listbox>

        {loading && <CircularLoading />}
      </ScrollShadow>

      {items.length > 0 && (
        <Pagination
          className="flex justify-center mt-8"
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
      )}
    </>
  );
};

export default P2AQuestTable;
