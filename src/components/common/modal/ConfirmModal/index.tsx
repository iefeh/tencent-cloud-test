import { Modal, ModalBody, ModalContent, ModalFooter, ModalHeader } from '@nextui-org/react';
import { FC } from 'react';
import BasicButton from '@/pages/components/common/BasicButton';
import usePluginModal, { showModal } from '@/hooks/common/useShowModal';
import LGButton from '@/pages/components/common/buttons/LGButton';

interface ConfirmModalProps {
  title?: string;
  content: string | JSX.Element;
  confirmBtnLabel?: string;
  cancelBtnLabel?: string;
  showConfirmBtn?: boolean;
  showCancelBtn?: boolean;
}

const ConfirmModal: FC<ConfirmModalProps> = ({
  title,
  content,
  confirmBtnLabel,
  cancelBtnLabel,
  showConfirmBtn = true,
  showCancelBtn = true,
}) => {
  const { disclosure, onOk, onCancel } = usePluginModal();

  return (
    <Modal
      classNames={{
        base: 'w-[42rem] max-w-[90vw]',
        header: 'p-0',
        closeButton: 'z-10',
        footer: '!justify-center mb-4',
      }}
      isDismissable={false}
      isKeyboardDismissDisabled
      placement='center'
      {...disclosure}
    >
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader>
              <div className="relative w-full h-16 bg-no-repeat bg-[url('/img/invite/bg_rule_head.png')] bg-contain flex items-center gap-3 px-6">
                <div className="font-semakin text-basic-yellow text-xl">{title || 'Attention Here'}</div>
              </div>
            </ModalHeader>

            <ModalBody>
              {typeof content === 'string' ? <div dangerouslySetInnerHTML={{ __html: content }}></div> : content}
            </ModalBody>

            <ModalFooter>
              {showConfirmBtn && <LGButton label={confirmBtnLabel || 'Confirm'} actived onClick={onOk} />}
              {showCancelBtn && <BasicButton label={cancelBtnLabel || 'Cancel'} onClick={onCancel} />}
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
};

export default ConfirmModal;

export const showConfirmModal = (props: ConfirmModalProps) => showModal(ConfirmModal, props);
