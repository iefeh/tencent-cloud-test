import { Popover, PopoverContent, PopoverTrigger, cn } from '@nextui-org/react';
import Image from 'next/image';
import { FC } from 'react';
import { isMobile } from 'react-device-detect';
import { createPortal } from 'react-dom';

const FloatTips: FC = () => {
  if (!isMobile) {
    return (
      <div
        className={cn([
          // 'fixed right-0 bottom-16 z-20 w-[40.625rem] h-[13.125rem]',
          'absolute right-0 top-[46.25rem] z-20 w-[40.625rem] h-[13.125rem]',
          'border-[0.4375rem] border-r-0 border-[#B3DCFF] rounded-l-[3.125rem] bg-white text-brown font-jcyt6 text-lg leading-[1.875rem]',
          'pl-[2.8125rem] pr-[3.125rem] flex items-center',
        ])}
      >
        A charming game series by Moonveil featuring Puffy the cat. With delightful cartoon graphics and simple,
        intuitive gameplay, it&apos;s perfect for players of all ages. Join our vibrant community and dive into the
        playful world of Moonveil Mini today!
      </div>
    );
  }

  const content = (
    <Popover placement="bottom" showArrow={true}>
      <PopoverTrigger>
        <div
          className={cn([
            'fixed right-0 bottom-16 z-20 w-16 h-16 overflow-hidden',
            'border-[0.4375rem] border-r-0 border-[#B3DCFF] rounded-l-[3.125rem] bg-white',
            'flex justify-center items-center',
          ])}
        >
          <Image
            className="w-8 h-8 object-contain"
            src="https://d3dhz6pjw7pz9d.cloudfront.net/pledge/icons/icon_info_big.png"
            alt=""
            width={64}
            height={64}
            unoptimized
            priority
          />
        </div>
      </PopoverTrigger>

      <PopoverContent className="bg-white">
        <div className="px-1 py-2">
          <div className="text-brown font-jcyt6 text-lg leading-[1.875rem]">
            A charming game series by Moonveil featuring Puffy the cat. With delightful cartoon graphics and simple,
            intuitive gameplay, it&apos;s perfect for players of all ages. Join our vibrant community and dive into the
            playful world of Moonveil Mini today!
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );

  return createPortal(content, document.body);
};

export default FloatTips;
