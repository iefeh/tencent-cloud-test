import S3Image from '@/components/common/medias/S3Image';
import { FC } from 'react';
import ShineButton from './ShineButton';

const MainContent: FC = () => {
  return (
    <div className="relative translate-y-[10%] translate-x-[12%]">
      <div className="w-[58.25rem] aspect-[932/421] relative">
        <S3Image className="object-contain" src="/astrark/cbt-iap/slogan.png" fill />
      </div>

      <div className="flex justify-center items-center w-[66.25rem] h-[10.75rem]">
        <ShineButton
          size="lg"
          startContent={<S3Image className="w-9 aspect-square" src="/astrark/cbt-iap/icons/question.png" />}
        >
          Rules Explanation
        </ShineButton>

        <ShineButton
          size="md"
          startContent={<S3Image className="w-9 aspect-square" src="/astrark/cbt-iap/icons/arrow_right.png" />}
        >
          IAP Return Query
        </ShineButton>

        <ShineButton
          size="sm"
          startContent={<S3Image className="w-9 aspect-square" src="/astrark/cbt-iap/icons/question.png" />}
        >
          FAQ
        </ShineButton>
      </div>
    </div>
  );
};

export default MainContent;
