import { FC } from 'react';
import { createPortal } from 'react-dom';

const FloatTips: FC = () => {
  const content = (
    <div className="fixed right-0 bottom-16 z-20 w-[40.625rem] h-[13.125rem] border-[0.4375rem] border-r-0 border-[#B3DCFF] rounded-l-[3.125rem] bg-white"></div>
  );

  return createPortal(content, document.body);
};

export default FloatTips;
