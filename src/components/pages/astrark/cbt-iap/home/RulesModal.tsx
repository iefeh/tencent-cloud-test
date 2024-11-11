import PageDesc from '@/components/common/PageDesc';
import S3Image from '@/components/common/medias/S3Image';
import { Modal, ModalBody, ModalContent } from '@nextui-org/react';
import { FC } from 'react';

const RulesModal: FC<DisclosureProps> = ({ disclosure: { isOpen, onOpenChange } }) => {
  return (
    <Modal
      placement="center"
      isDismissable={false}
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      classNames={{
        wrapper: 'justify-start',
        base: 'w-1/2 max-w-[50%] h-screen !m-0 rounded-none bg-black overflow-visible',
        body: 'px-24 py-24 h-screen overflow-y-auto',
        closeButton:
          "[&>svg]:hidden w-[4.875rem] aspect-square !bg-transparent bg-[url('https://moonveil-public.s3.ap-southeast-2.amazonaws.com/icons/modal_fold.png')] bg-contain top-1/2 right-0 translate-x-1/2 -translate-y-1/2",
      }}
      motionProps={{
        variants: {
          enter: {
            x: 0,
            opacity: 1,
            transition: {
              duration: 0.3,
              ease: 'easeOut',
            },
          },
          exit: {
            x: -600,
            opacity: 0,
            transition: {
              duration: 0.2,
              ease: 'easeIn',
            },
          },
        },
      }}
    >
      <ModalContent>
        {(onClose) => (
          <>
            <ModalBody>
              <PageDesc
                hasBelt
                className="items-start"
                title={<div className="font-semakin text-5xl text-basic-yellow">Rules Explanation</div>}
              />

              <S3Image
                className="w-full h-auto mt-10"
                src="https://moonveil-public.s3.ap-southeast-2.amazonaws.com/astrark/cbt-iap/table.png"
              />

              <div className="mt-12">
                <p className="font-semakin text-2xl text-basic-yellow">Dear MoonWalkers,</p>
                <p className="font-poppins-medium text-base leading-[1.875rem] mt-4">
                  Thank you for participating in the AstrArk Paid Marching Test with Data Wipe. During this
                  test, your total IAP will be returned to your MOONVEIL account after the official game launch,
                  following the IAP Return Rules.
                </p>
              </div>

              <div className="mt-[3.75rem]">
                <p className="font-semakin text-2xl text-basic-yellow">IAP Return Rules:</p>
                <p className="font-poppins-medium text-base leading-[1.875rem] mt-4">
                  The MOONVEIL team will track the IAP amounts made through each player&apos;s MOONVEIL account and,
                  upon meeting the incentive criteria, distribute the equivalent value in Pluse Fragment accordingly.
                </p>
              </div>
            </ModalBody>
          </>
        )}
      </ModalContent>
    </Modal>
  );
};

export default RulesModal;
