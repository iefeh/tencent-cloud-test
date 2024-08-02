import { cn } from '@nextui-org/react';
import { FC } from 'react';
import { createPortal } from 'react-dom';

const FloatTips: FC = () => {
  const content = (
    <div
      className={cn([
        // 'fixed right-0 bottom-16 z-20 w-[40.625rem] h-[13.125rem]',
        'absolute right-0 top-[46.25rem] z-20 w-[40.625rem] h-[13.125rem]',
        'border-[0.4375rem] border-r-0 border-[#B3DCFF] rounded-l-[3.125rem] bg-white text-brown font-jcyt6 text-lg leading-[1.875rem]',
        'pl-[2.8125rem] pr-[3.125rem] flex items-center',
      ])}
    >
      A charming game series by Moonveil featuring Puffy the cat. With delightful cartoon graphics and simple, intuitive
      gameplay, it&apos;s perfect for players of all ages. Join our vibrant community and dive into the playful world of
      Moonveil Mini today!
    </div>
  );

  // return createPortal(content, document.body);
  return content;
};

export default FloatTips;
