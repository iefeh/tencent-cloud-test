import { Listbox, ListboxItem, Pagination, ScrollShadow } from '@nextui-org/react';
import { FC } from 'react';
import QuestTokenRow from './QuestTokenRow';
import { QuestTokensRecord } from '@/http/services/token';
import Image from 'next/image';
import teamsImg from 'img/loyalty/task/teams.png';
import useClaimToken from '@/hooks/pages/profile/myTokens/useClaimToken';
import CircularLoading from '@/pages/components/common/CircularLoading';
import PaginationRenderItem from '@/components/LoyaltyProgram/task/PaginationRenderItem';

interface Props {
  pagiTotal?: number;
  loading?: boolean;
  items: QuestTokensRecord[];
  onPagiChange?: (page: number) => void;
}

const QuestTable: FC<Props> = ({ pagiTotal = 1, loading, items, onPagiChange }) => {
  const emptyContent = (
    <div className="absolute inset-0 backdrop-saturate-150 backdrop-blur-md bg-overlay/30 z-[999] flex flex-col justify-center items-center font-poppins text-2xl pointer-events-none">
      <p>No history found.</p>
      <Image className="w-[54rem] h-auto" src={teamsImg} alt="" />
    </div>
  );
  const { onClaim } = useClaimToken({ updateList: () => onPagiChange?.(1) });

  return (
    <>
      <ul className="w-full flex justify-between items-center h-16 bg-[#111111] text-[#999] px-0 md:px-10 gap-4">
        <li className="flex-[360]">Token</li>
        <li className="flex-[264]">Quantity</li>
        <li className="flex-[224]">Network</li>
        <li className="flex-[156]">Status</li>
        <li className="flex-[156]">Claim Time</li>
        <li className="w-16 md:w-40 shrink-0 text-right">View Tx</li>
      </ul>

      <ScrollShadow className="w-full h-[31.375rem] font-poppins-medium relative">
        <Listbox items={items} classNames={{ base: 'p-0 bg-black' }} label="Moon Beams History">
          {(item) => (
            <ListboxItem
              key={Math.random().toString()}
              className="rounded-none p-0 !bg-transparent"
              textValue={item.source_type}
            >
              <QuestTokenRow item={item} onClaim={onClaim} />
            </ListboxItem>
          )}
        </Listbox>

        {loading && <CircularLoading />}

        {!loading && items.length < 1 && emptyContent}
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

export default QuestTable;
