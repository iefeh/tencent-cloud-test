import S3Image from '@/components/common/medias/S3Image';
import BasicButton from '@/pages/components/common/BasicButton';
import { cn } from '@nextui-org/react';
import { FC } from 'react';

const CbtIapHeader: FC<ClassNameProps> = ({ className }) => {
  return (
    <div className={cn(['flex justify-between items-center relative z-0 pl-9 pr-[3.75rem]', className])}>
      <S3Image className="w-[8.4375rem] aspect-[135/80] mr-8" src="/logo/moonveil_white.png" />
      <S3Image className="w-[4.5625rem] aspect-[73/70]" src="/logo/astrark.png" />

      <div className="flex-1"></div>

      <BasicButton
        className="text-base py-2 hover:text-white hover:border-white hover:shadow-none"
        label="LOGIN"
        prefix={<S3Image className="w-5 aspect-square inline-block mr-3" src="/astrark/cbt-iap/icons/user.png" />}
      />

      <BasicButton
        className="text-base py-2 ml-3 hover:text-white hover:border-white hover:shadow-none"
        label="SHARE"
        prefix={<S3Image className="w-4 aspect-[17/21] inline-block mr-3" src="/astrark/cbt-iap/icons/share.png" />}
      />
    </div>
  );
};

export default CbtIapHeader;
