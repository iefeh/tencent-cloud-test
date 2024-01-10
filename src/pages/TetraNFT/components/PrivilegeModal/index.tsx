import React from 'react';
import { Modal, ModalBody, ModalContent, ModalHeader, useDisclosure } from '@nextui-org/react';
import PrivilegeList from '../PrivilegeList';
import Image from 'next/image';
import BasicButton from '@/pages/components/common/BasicButton';
import { TrifleCards } from '@/constant/card';
import closeImg from 'img/nft/trifle/close.png';
import { createPortal } from 'react-dom';

const PrivilegeModal: React.FC = (props: any) => {
  const { isOpen, onOpen, onOpenChange } = useDisclosure();

  return (
    <>
      <BasicButton label="View Full Previleges" active onClick={onOpen} />

      <Modal
        className="max-w-[75rem] bg-black border-2 border-basic-yellow"
        isOpen={isOpen}
        isDismissable={false}
        scrollBehavior="outside"
        hideCloseButton
        onOpenChange={onOpenChange}
      >
        <ModalContent>
          <ModalHeader>
            <div className="flex-1 flex flex-col items-center text-center pt-[5.3125rem] pb-[4.5rem]">
              <div className="font-semakin text-basic-yellow text-4xl">Previleges of the TETRA NFT Series</div>
              <div className="font-decima text-base max-w-[50rem] text-center mt-[1.75rem]">
                In the future, if you successfully obtain the upgraded Level Level II-Enterity TETRA NFT or Level
                III-Infinity TETRA NFT, you will receive exponentially increased benefits and unlock more diverse
                gameplay and rewards.
              </div>
            </div>
          </ModalHeader>

          <ModalBody className="p-0">
            <div className="cards relative flex mx-[2.625rem] border-t-5 border-x-1 border-[#31281F]">
              {TrifleCards.map(({ isActive, activeImg, inactiveImg }, index) => {
                return (
                  <div
                    key={index}
                    className="flex-1 w-[33.33%] flex flex-col items-center [&:not(:first-child)]:border-l border-[#31281F] pt-[2.625rem]"
                  >
                    <Image className="w-[15.9375rem] h-[19.4375rem]" src={isActive ? activeImg : inactiveImg} alt="" />

                    <div className="w-full px-[1.625rem] pt-[2.75rem] pb-[6rem] mt-[3.1875rem] border-t border-[#31281F]">
                      <PrivilegeList step={index} />
                    </div>
                  </div>
                );
              })}
            </div>
          </ModalBody>
        </ModalContent>
      </Modal>

      {isOpen &&
        createPortal(
          <div
            className="fixed right-[20rem] min-[640px]:top-[4.25rem] translate-x-full flex items-center z-[100] cursor-pointer"
            onClick={onOpenChange}
          >
            <Image className="w-6 h-6" src={closeImg} alt="" />

            <span className="uppercase font-semakin text-base text-basic-yellow leading-none ml-3">close</span>
          </div>,
          document.body,
        )}
    </>
  );
};

export default PrivilegeModal;
