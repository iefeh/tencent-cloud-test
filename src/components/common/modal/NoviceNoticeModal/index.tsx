import LGButton from '@/pages/components/common/buttons/LGButton';
import { Checkbox, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader } from '@nextui-org/react';
import { FC, useState } from 'react';
import BasicButton from '@/pages/components/common/BasicButton';
import { observer } from 'mobx-react-lite';
import usePluginModal, { showModal } from '@/hooks/common/useShowModal';
import { checkNoviceNotchAPI } from '@/http/services/profile';
import { useRouter } from 'next/router';

const URL_EVENT_NOVICE_NOTCH = '/LoyaltyProgram/event?id=6becf936-fdf6-4807-876f-552d723b3c4a';

const NoviceNoticeModal: FC = () => {
  const [isSelected, setIsSelected] = useState(false);
  const router = useRouter();
  const { disclosure, onOk, onCancel } = usePluginModal();

  const onConfirm = async () => {
    onOk();
    router.push(URL_EVENT_NOVICE_NOTCH);
  };

  const onLaterClick = async () => {
    if (isSelected) await checkNoviceNotchAPI({ period: 24 });
    onCancel();
  };

  return (
    <Modal
      classNames={{ header: 'p-0', closeButton: 'z-10', body: '26.25rem', footer: '!justify-center mb-4' }}
      hideCloseButton
      isDismissable={false}
      placement='center'
      {...disclosure}
    >
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader>
              <div className="relative w-full h-[6.25rem] bg-no-repeat bg-[url('/img/invite/bg_rule_head.png')] bg-contain flex items-center gap-3 px-6">
                <div className="font-semakin text-basic-yellow text-2xl">Notification</div>
              </div>
            </ModalHeader>

            <ModalBody>
              <div className="pt-4">
                Earn your exclusive{' '}
                <span className="text-basic-yellow underline cursor-pointer" onClick={onConfirm}>
                  Novice Notch badge
                </span>{' '}
                now! Join the community and unlock even more rewards.
              </div>
            </ModalBody>

            <ModalFooter className="flex-col items-center">
              <div className="flex items-center gap-8">
                <LGButton label="Sure" actived onClick={onConfirm} />

                <BasicButton className="normal-case" label="Later" onClick={onLaterClick} />
              </div>

              <div className="mt-4">
                <Checkbox color="default" isSelected={isSelected} onValueChange={setIsSelected}>
                  Dont remind me again in 24h
                </Checkbox>
              </div>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
};

export default observer(NoviceNoticeModal);

export const showNoviceNoticeModal = () => showModal(NoviceNoticeModal);
