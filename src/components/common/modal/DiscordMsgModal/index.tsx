import LGButton from '@/pages/components/common/buttons/LGButton';
import { Modal, ModalBody, ModalContent, ModalFooter } from '@nextui-org/react';
import { FC } from 'react';

interface Props {
  disclosure: Disclosure;
  onConfirmed?: () => void;
}

const DiscordMsgModal: FC<Props> = ({ disclosure: { isOpen, onOpenChange }, onConfirmed }) => {
  return (
    <Modal
      placement="center"
      backdrop="blur"
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      classNames={{ base: 'bg-[#070707] border-1 border-[#1D1D1D] rounded-[0.625rem] pt-8 pb-4' }}
    >
      <ModalContent>
        {(onClose) => (
          <>
            <ModalBody>
              <p className="font-poppins-medium text-base">
                Before starting this task, please ensure that you have completed the following steps:
                <ol className="mt-2">
                  <li>
                    1. Join our official Discord server,
                    <a className="text-basic-yellow underline" href="https://discord.gg/moonveil" target="_blank">
                      Moonveil
                    </a>
                    .
                  </li>
                  <li>
                    2. Get the &quot;<span className="text-basic-yellow">Verified</span>&quot; role.
                  </li>
                </ol>
              </p>
            </ModalBody>

            <ModalFooter className="justify-center">
              <LGButton
                squared
                actived
                label="Confirmed"
                onClick={onConfirmed}
                // onClick={() => {
                //   onConnectURL();
                //   onPrepare();
                //   onClose();
                // }}
              />
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
};

export default DiscordMsgModal;
