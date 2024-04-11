import LGButton from '@/pages/components/common/buttons/LGButton';
import { Input, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader } from '@nextui-org/react';
import { FC, useState } from 'react';
import { throttle } from 'lodash';
import { toast } from 'react-toastify';
import { useUserContext } from '@/store/User';
import BasicButton from '@/pages/components/common/BasicButton';
import { observer } from 'mobx-react-lite';

const RedeemModal: FC = () => {
  const STANDARD_CODE_LENGTH = 12;
  const { redeemModalVisible, toggleRedeemModal } = useUserContext();
  const [loading, setLoading] = useState(false);
  const [code, setCode] = useState('');

  function onCodeChange(val: string) {
    setCode(val.replace(/\s/g, ''));
  }

  const onConfirm = throttle(async () => {
    setLoading(true);

    await new Promise((resolve) => setTimeout(resolve, 500));

    setLoading(false);
  }, 500);

  return (
    <Modal
      classNames={{ header: 'p-0', closeButton: 'z-10', body: '26.25rem', footer: '!justify-center mb-4' }}
      isOpen={redeemModalVisible}
      onOpenChange={toggleRedeemModal}
    >
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader>
              <div className="relative w-full h-[6.25rem] bg-no-repeat bg-[url('/img/invite/bg_rule_head.png')] bg-contain flex items-center gap-3 px-6">
                <div className="font-semakin text-basic-yellow text-2xl">Rewards</div>
              </div>
            </ModalHeader>

            <ModalBody>
              <Input
                isClearable
                type="text"
                placeholder="Your redeem code."
                variant="bordered"
                classNames={{ inputWrapper: 'h-full !rounded-base mt-6 mb-4', input: 'text-center' }}
                maxLength={STANDARD_CODE_LENGTH}
                value={code}
                onValueChange={onCodeChange}
              />
            </ModalBody>

            <ModalFooter>
              <BasicButton label="Cancel" onClick={onClose} />

              <LGButton
                className="uppercase h-9"
                label="Confirm"
                actived
                disabled={code.length !== STANDARD_CODE_LENGTH}
                loading={loading}
                onClick={onConfirm}
              />
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
};

export default observer(RedeemModal);
