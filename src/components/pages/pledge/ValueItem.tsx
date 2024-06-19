import Image, { type StaticImageData } from 'next/image';
import { FC } from 'react';

interface Props {
  icon: string | StaticImageData;
  label: string;
  value: string | number;
}

const ValueItem: FC<Props> = ({ icon, label, value }) => {
  return (
    <div className="flex items-center">
      <Image
        className="w-[3.125rem] h-[3.125rem] object-contain mr-4"
        src={icon}
        alt=""
        width={50}
        height={50}
        unoptimized
      />

      <div className="font-semakin">
        <div className="text-5xl text-[#EBDDB6]">{value}</div>
        <div className="text-transparent text-sm bg-clip-text bg-gradient-to-r from-[#8C7056] to-[#DAA96F]">
          {label}
        </div>
      </div>
    </div>
  );
};

export default ValueItem;
