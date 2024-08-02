import React, { FC } from 'react';
import EmptyContent from '../common/EmptyContent';
import { createPortal } from 'react-dom';


const EndedModal: FC<{ container?: HTMLElement; disclosure: Disclosure }> = ({ container, disclosure }) => {

  const bodyContainer = (
    <div className='bg-[rgba(0,0,0,.5)] flex w-screen h-[100dvh] inset-0 z-50 overflow-x-auto justify-center [--scale-enter:100%] [--scale-exit:100%] [--slide-enter:0px] [--slide-exit:80px] sm:[--scale-enter:100%] sm:[--scale-exit:103%] sm:[--slide-enter:0px] sm:[--slide-exit:0px] items-end sm:items-center absolute'>
      <div className='flex flex-col z-50 w-full box-border bg-content1 outline-none mx-1 my-1 sm:mx-6 sm:my-16 rounded-large shadow-small overflow-y-hidden max-w-[50rem] h-[25rem] absolute'>
        <EmptyContent content="This lottery round has ended and rewards are being distributed.<br />The next round is coming soon. Stay tuned!" />,
      </div>
    </div>
  )

  if (!container) return null

  if (!disclosure.isOpen) return null

  return (
    <>
      {createPortal(bodyContainer, container)}
    </>
  );
};

export default EndedModal;
