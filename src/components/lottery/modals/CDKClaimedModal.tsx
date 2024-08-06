import LGButton from '@/pages/components/common/buttons/LGButton';
import { Modal, ModalBody, ModalContent, ModalHeader } from '@nextui-org/react';
import { FC } from 'react';
import { toast } from 'react-toastify';

const CDKClaimedModal: FC<{ disclosure: Disclosure; cdks: string[] }> = ({
  cdks = [],
  disclosure: { isOpen, onOpenChange },
}) => {
  async function onCopyCode(code: string) {
    try {
      await navigator.clipboard.writeText(code);
      toast.success('Copied!');
    } catch (error: any) {
      toast.error(error?.message || error);
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      backdrop="blur"
      placement="center"
      classNames={{
        base: 'bg-black max-w-[28rem] lg:max-w-[42rem]',
        header: 'p-0',
        closeButton: 'z-10',
        body: 'text-[#CCCCCC] font-poppins text-base leading-[1.875rem] pt-5 pb-8 px-10 max-h-[37.5rem] overflow-y-auto flex flex-col items-center text-center',
      }}
    >
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader>
              <div className="relative w-full h-[6.25rem] bg-no-repeat bg-[url('/img/invite/bg_rule_head.png')] bg-contain flex items-center gap-3 px-6">
                <div className="font-semakin text-basic-yellow text-2xl">Reward Claimed</div>
              </div>
            </ModalHeader>

            <ModalBody>
              <div>
                Contragulations on winning your AstrArk in game reward. Here is your in-game code:&nbsp;
                {cdks.length > 0 ? (
                  cdks.map((cdk, index) => (
                    <>
                      {index > 0 && ', '}

                      <span
                        className="text-basic-yellow cursor-pointer hover:underline"
                        onClick={() => onCopyCode(cdk)}
                      >
                        {cdk}
                      </span>
                    </>
                  ))
                ) : (
                  <span className="text-basic-yellow">-</span>
                )}
                . You can copy and redeem your reward in the AstrArk game app. Have fun!
              </div>

              <LGButton label="Confirm" actived onClick={onClose} />
            </ModalBody>
          </>
        )}
      </ModalContent>
    </Modal>
  );
};

export default CDKClaimedModal;
