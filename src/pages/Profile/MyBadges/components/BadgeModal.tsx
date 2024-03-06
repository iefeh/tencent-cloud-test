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
  onToggleDisplay?: (id: string, display: boolean) => void;
  onClaim?: (id: string) => void;
  onMint?: (id: string) => void;
}

export default function BadgeModal(props: Props) {
  const { item, disclosure, onToggleDisplay, onClaim, onMint } = props;
  const [loading, setLoading] = useState(false);
  const [displayLoading, setDisplayLoading] = useState(false);

  const { series, display, image_url: displayImageUrl, icon_url: displayIconUrl, lv: displayLv } = item || {};
  const { claimed_time, obtained_time, lv: bagLv, image_url: bagImageUrl, icon_url: bagIconUrl } = series?.[0] || {};

  const claimed = !!display || !!claimed_time;
  const achieved = !!display || !!obtained_time;
  const image_url = displayImageUrl || bagImageUrl;
  const icon_url = displayIconUrl || bagIconUrl;
  const lv = displayLv || bagLv;

  const onToggleDisplayClick = throttle(async () => {
    if (!item?.badge_id || !onToggleDisplay) return;

    setDisplayLoading(true);
    await onToggleDisplay(item.badge_id, !display);
    setDisplayLoading(false);
    disclosure.onClose();
  }, 500);

  async function onClaimClick() {
    if (!onClaim || !item?.badge_id) return;

    setLoading(true);
    try {
      await onClaim(item.badge_id);
    } catch (error) {
      console.log('Badge Claim Error:', error);
    } finally {
      setLoading(false);
    }
  }

  async function onMintClick() {
    if (!onMint || !item?.badge_id) return;

    setLoading(true);
    try {
      await onMint(item.badge_id);
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
                  className={cn(['w-60 h-60 object-contain', achieved || 'grayscale opacity-50'])}
                  src={image_url || helpIcon}
                  alt=""
                  width={300}
                  height={300}
                />

                <div className="font-semakin text-3xl mt-5">
                  <span className="relative bg-[linear-gradient(300deg,#EDE0B9_0%,#CAA67E_100%)] bg-clip-text text-transparent">
                    {item?.name || '--'}

                    {item?.display && (
                      <div className="absolute -right-[0.1875rem] top-[0.125rem] -translate-y-full translate-x-full font-poppins text-sm leading-none text-black bg-[linear-gradient(120deg,#D9A970,#EFEBC5)] rounded-base rounded-bl-none p-[0.375rem]">
                        Displayed
                      </div>
                    )}

                    {item?.has_series && (
                      <div className="font-semakin bg-[linear-gradient(300deg,#EDE0B9_0%,#CAA67E_100%)] bg-clip-text text-transparent absolute -right-[0.1875rem] bottom-0 translate-x-full text-base leading-none border-1 border-basic-gray px-1 py-[0.1875rem] rounded-[0.3125rem]">
                        LV.{lv || '--'}
                      </div>
                    )}
                  </span>
                </div>

                <p className="text-base text-[#666] mt-5 px-8 [&+.btns]:mt-9">{item?.description || '--'}</p>

                {achieved && !claimed && (
                  <LGButton
                    label="Claim"
                    actived
                    className="!bg-[linear-gradient(270deg,#CC6AFF,#258FFB)] w-full !text-white uppercase mt-9"
                    loading={loading}
                    onClick={onClaimClick}
                  />
                )}

                {claimed && item?.mintable && !item?.minted && (
                  <LGButton
                    label={item.minting ? 'SBT Minting' : 'Mint SBT'}
                    actived
                    className={cn([
                      'w-full !text-white uppercase mt-9',
                      item.minting ||
                        'bg-[linear-gradient(270deg,#CC6AFF,#258FFB)] hover:bg-[linear-gradient(270deg,#CC6AFF,#258FFB)]',
                    ])}
                    loading={loading}
                    disabled={item.minting}
                    onClick={onMintClick}
                  />
                )}

                <div className="flex justify-between gap-2 mt-6 w-full btns">
                  <LGButton
                    className="flex-1 uppercase"
                    label={item?.display ? 'Remove' : 'Display'}
                    loading={displayLoading}
                    disabled={!claimed}
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
