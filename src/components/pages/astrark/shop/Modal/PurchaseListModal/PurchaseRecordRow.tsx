import S3Image from '@/components/common/medias/S3Image';
import { AstrArk } from '@/types/astrark';
import { Popover, PopoverContent, PopoverTrigger, cn } from '@nextui-org/react';
import dayjs from 'dayjs';
import { FC } from 'react';

interface Props {
  actived?: boolean;
  row: AstrArk.PurchaseRecordDTO;
}

const PurchaseRecordRow: FC<Props> = ({ row }) => {
  return (
    <div className="flex items-center w-full px-10 gap-4 h-14 border-[0.125rem] border-[#2D3E4C] rounded-base bg-black row-record text-base leading-none">
      <Popover placement="top">
        <PopoverTrigger>
          <div className="flex-[240] whitespace-nowrap text-ellipsis overflow-hidden">{row.product.name || '--'}</div>
        </PopoverTrigger>
        <PopoverContent>
          <div className="px-1 py-2">
            <div className="text-base font-bold max-w-[18rem]">{row.product.name || '--'}</div>
          </div>
        </PopoverContent>
      </Popover>

      <div className="flex-[180] whitespace-nowrap text-ellipsis overflow-hidden">
        ${row.product_price_in_usd || '--'}
      </div>
      <div className="flex-[224] whitespace-nowrap text-ellipsis overflow-hidden">
        {row.token_amount_formatted || '--'}
      </div>
      <div className="flex-[156] whitespace-nowrap text-ellipsis overflow-hidden flex items-center h-full">
        <S3Image className="w-6 h-6 object-contain" src={row.token.icon_url} />

        <span className="ml-2">{row.token.symbol}</span>
      </div>
      <div className="flex-[200] whitespace-nowrap text-ellipsis overflow-hidden">
        {dayjs(row.request_time).format('MM-DD HH:mm') || '--'}
      </div>
      <div className="w-28 shrink-0 flex items-center h-full">
        <S3Image
          className="w-6 h-6 object-contain"
          src={`/astrark/shop/icons/${row.payment_confirmed ? 'done' : 'pending'}.png`}
        />

        <div className={cn(['ml-3 mt-1', row.payment_confirmed ? 'text-[#31B73D]' : 'text-[#F5C98D]'])}>
          {row.payment_confirmed ? 'Done' : 'Processing'}
        </div>
      </div>
    </div>
  );
};

export default PurchaseRecordRow;
