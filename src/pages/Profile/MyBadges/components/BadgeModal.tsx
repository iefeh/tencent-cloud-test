import { BadgeItem } from '@/http/services/badges';
import LGButton from '@/pages/components/common/buttons/LGButton';
import { Modal, ModalBody, ModalContent, cn } from '@nextui-org/react';
import { throttle } from 'lodash';
import Image from 'next/image';
import { useState } from 'react';
import helpIcon from 'img/profile/badges/icon_help.png';

interface Props {
  item: BadgeItem | null;
  disclosure: {
    isOpen: boolean;
    onOpen: () => void;
    onClose: () => void;
    onOpenChange: () => void;
    isControlled: boolean;
    getButtonProps: (props?: any) => any;
    getDisclosureProps: (props?: any) => any;
  };
  onToggleDisplay?: (id: string) => void;
  onClaim?: (id: string) => void;
  onMint?: (id: string) => void;
}

export default function BadgeModal(props: Props) {
  const { item, disclosure, onToggleDisplay, onClaim, onMint } = props;
  const [loading, setLoading] = useState(false);
  const [displayLoading, setDisplayLoading] = useState(false);

  const onToggleDisplayClick = throttle(async () => {
    if (!item?.id || !onToggleDisplay) return;

    setDisplayLoading(true);
    await onToggleDisplay(item.id);
    setDisplayLoading(false);
    disclosure.onClose();
  }, 500);

  async function onClaimClick() {
    if (!onClaim || !item?.id) return;

    setLoading(true);
    try {
      await onClaim(item.id);
    } catch (error) {
      console.log('Badge Claim Error:', error);
    } finally {
      setLoading(false);
    }
  }

  async function onMintClick() {
    if (!onMint || !item?.id) return;

    setLoading(true);
    try {
      await onMint(item.id);
    } catch (error) {
      console.log('Badge Mint Error:', error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <Modal
        backdrop="blur"
        placement="center"
        isOpen={disclosure.isOpen}
        onOpenChange={disclosure.onOpenChange}
        classNames={{
          base: 'max-w-[26.25rem] bg-black border-1 border-basic-gray',
          body: 'flex flex-col items-center text-center px-12 pt-10 pb-[3.75rem]',
          closeButton: 'text-white text-base',
        }}
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalBody>
                <Image
                  className={cn(['w-60 h-60 object-contain', item?.achieved || 'grayscale opacity-50'])}
                  src={item?.imgUrl || helpIcon}
                  alt=""
                  width={300}
                  height={300}
                />

                <div className="font-semakin text-3xl mt-5">
                  <span className="relative bg-[linear-gradient(300deg,#EDE0B9_0%,#CAA67E_100%)] bg-clip-text text-transparent">
                    {item?.label || '--'}

                    {item?.isDisplayed && (
                      <div className="absolute -right-[0.1875rem] top-[0.125rem] -translate-y-full translate-x-full font-poppins text-sm leading-none text-black bg-[linear-gradient(120deg,#D9A970,#EFEBC5)] rounded-base rounded-bl-none p-[0.375rem]">
                        Displayed
                      </div>
                    )}

                    {item?.isSeries && (
                      <div className="font-semakin bg-[linear-gradient(300deg,#EDE0B9_0%,#CAA67E_100%)] bg-clip-text text-transparent absolute -right-[0.1875rem] bottom-0 translate-x-full text-base leading-none border-1 border-basic-gray px-1 py-[0.1875rem] rounded-[0.3125rem]">
                        LV.{item?.serieNo || '--'}
                      </div>
                    )}
                  </span>
                </div>

                <p className="text-base text-[#666] mt-5 px-8 [&+.btns]:mt-9">{item?.description || '--'}</p>

                {item?.achieved && !item?.claimed && (
                  <LGButton
                    label="Claim"
                    actived
                    className="!bg-[linear-gradient(270deg,#CC6AFF,#258FFB)] w-full !text-white uppercase mt-9"
                    loading={loading}
                    onClick={onClaimClick}
                  />
                )}

                {item?.claimed && item?.mintable && !item?.minted && (
                  <LGButton
                    label="Mint SBT"
                    actived
                    className="!bg-[linear-gradient(270deg,#CC6AFF,#258FFB)] w-full !text-white uppercase mt-9"
                    loading={loading}
                    onClick={onMintClick}
                  />
                )}

                <div className="flex justify-between gap-2 mt-6 w-full btns">
                  <LGButton
                    className="flex-1 uppercase"
                    label={item?.isDisplayed ? 'Remove' : 'Display'}
                    loading={displayLoading}
                    disabled={!item?.claimed}
                    onClick={onToggleDisplayClick}
                  />

                  <LGButton className="flex-1 uppercase" label="Show Off" actived disabled />
                </div>
              </ModalBody>
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  );
}
