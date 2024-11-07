import S3Image from '@/components/common/medias/S3Image';
import Link from '@/components/link';
import { Modal, ModalBody, ModalContent, ModalHeader } from '@nextui-org/react';
import { FC } from 'react';
import useQuery from './hooks/useQuery';
import { observer } from 'mobx-react-lite';
import { formatUserName } from '@/utils/common';
import { useUserContext } from '@/store/User';

const QueryModal: FC<DisclosureProps> = ({ disclosure: { isOpen, onOpenChange } }) => {
  const { logout, toggleLoginModal } = useUserContext();
  const { info } = useQuery();

  return (
    <Modal
      placement="center"
      isDismissable={false}
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      classNames={{
        base: 'max-w-[62.5rem] rounded-base bg-black',
        header:
          "h-[6.25rem] flex items-center relative bg-[url('https://moonveil-public.s3.ap-southeast-2.amazonaws.com/astrark/cbt-iap/bg_modal_header.png')] bg-contain bg-left bg-no-repeat",
        body: 'px-24 pt-12 pb-28 flex flex-col justify-center relative',
        closeButton: 'z-10 text-lg',
      }}
    >
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader>
              <S3Image
                className="w-9 aspect-square mr-4 object-contain"
                src="/astrark/cbt-iap/icons/question_active.png"
              />

              <div className="font-semakin text-basic-yellow text-2xl leading-none">AstrArk IAP Return Query</div>
            </ModalHeader>

            <ModalBody>
              <div className="flex flex-col gap-y-4">
                <div className="flex items-center">
                  <div>
                    Moonveil ID :<span className="text-basic-yellow ml-3">{formatUserName(info?.wallet)}</span>
                  </div>

                  <Link
                    className="text-white/20 underline ml-9 cursor-pointer"
                    href=""
                    onClick={async (e) => {
                      e.preventDefault();
                      await logout();
                      onClose();
                      toggleLoginModal(true);
                    }}
                  >
                    Log out
                  </Link>
                </div>

                <div className="flex items-center">
                  <div>
                    The IAP Amount :
                    <span className="text-basic-yellow ml-3">$ {info ? info.total.toFixed(2) : '--'}</span>
                  </div>
                </div>

                <div className="flex items-center">
                  <div>
                    Current Rebate Tier:
                    <span className="text-basic-yellow ml-3">{info ? (info.reabte * 100).toFixed(0) : '--'}%</span>
                  </div>
                </div>
              </div>

              <div className="font-semakin mt-20">
                <div>Result :</div>
                <div className="relative w-[29.5625rem] aspect-[473/86] flex justify-center items-center mt-6">
                  <S3Image className="object-contain" src="/astrark/cbt-iap/bg_result.png" fill />

                  <div className="text-[#93E6F8] text-[2.5rem] whitespace-nowrap">
                    {info ? Math.floor(info.total * info.reabte * 60) : '--'} Perth Shards
                  </div>
                </div>
              </div>

              <div className="absolute bottom-0 -right-4 w-[32.25rem] aspect-[516/336] flex justify-center items-end">
                <S3Image className="object-contain" src="/astrark/cbt-iap/bg_reward.png" fill />

                <S3Image className="w-[16.875rem] aspect-square" src="/astrark/cbt-iap/reward.png" />
              </div>
            </ModalBody>
          </>
        )}
      </ModalContent>
    </Modal>
  );
};

export default observer(QueryModal);
