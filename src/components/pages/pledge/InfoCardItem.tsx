import Image from 'next/image';
import { FC } from 'react';

interface Props {
  label: string;
  value: string;
  unit?: string | JSX.Element;
  append?: JSX.Element;
}

const InfoCardItem: FC<Props> = ({ label, value, unit, append }) => {
  return (
    <div className="flex justify-between items-center flex-nowrap gap-2 relative w-[42.8125rem] aspect-[694/131] pl-8">
      <Image
        className="object-contain"
        src="https://moonveil-public.s3.ap-southeast-2.amazonaws.com/pledge/bg_card_item.png"
        alt=""
        fill
        sizes="100%"
        unoptimized
      />

      <div className="relative z-0 leading-none">
        <div className="font-semibold">{label}</div>

        <div className="flex items-end gap-6 text-[#EBDDB6] font-semakin mt-5">
          <div className="text-[2.5rem]">{value || '--'}</div>
          {typeof unit === 'string' ? (
            <div className="text-2xl leading-8 [&>span]:text-base" dangerouslySetInnerHTML={{ __html: unit }}></div>
          ) : (
            unit
          )}
        </div>
      </div>

      {append && <div className="shrink-0 relative z-0">{append}</div>}
    </div>
  );
};

export default InfoCardItem;
