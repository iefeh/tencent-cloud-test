import { BadgeItem } from '@/http/services/badges';
import LGButton from '@/pages/components/common/buttons/LGButton';
import { Modal, ModalBody, ModalContent, cn } from '@nextui-org/react';
import { divide, throttle } from 'lodash';
import Image from 'next/image';
import { useState } from 'react';
import helpIcon from 'img/profile/badges/icon_help.png';
import arrowIcon from 'img/profile/badges/icon_arrow.png';

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
  canDisplay?: boolean;
  onToggleDisplay?: (id: string, display: boolean) => void;
  onClaim?: (item: BadgeItem) => void;
  onMint?: (id: string) => void;
}

export default function BadgeModal(props: Props) {
  const { item, disclosure, canDisplay, onToggleDisplay, onClaim, onMint } = props;
  const [loading, setLoading] = useState(false);
  const [displayLoading, setDisplayLoading] = useState(false);

  const { series, display, image_url: displayImageUrl, icon_url: displayIconUrl, lv: displayLv } = item || {};
  const validSerie = series?.[0] || series?.[1];
  const {
    name,
    description,
    claimed_time,
    obtained_time,
    lv: bagLv,
    image_url: bagImageUrl,
    icon_url: bagIconUrl,
  } = validSerie || {};

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
      await onClaim(item);
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

                <div className="font-semakin text-3xl mt-5 flex justify-center w-full">
                  <div className="relative bg-[linear-gradient(300deg,#EDE0B9_0%,#CAA67E_100%)] bg-clip-text text-transparent max-w-[calc(100%_-_4.25rem)] px-2">
                    {name || item?.name || '--'}

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
                  </div>
                </div>

                {item && item?.has_series && item.series && (
                  <div className="flex justify-center mt-10">
                    {item.series.map((serie, index) => {
                      if (!serie) return null;

                      return (
                        <>
                          {index > 0 && item.series?.[index - 1] && (
                            <Image
                              className="w-[0.875rem] h-4 mt-7 mx-1"
                              src={arrowIcon}
                              alt=""
                              width={28}
                              height={32}
                            />
                          )}

                          <div className={cn(['flex flex-col items-center', serie.obtained_time || 'grayscale'])}>
                            <Image
                              className={cn([
                                'w-[4.375rem] h-[4.375rem] object-contain',
                                serie.obtained_time && 'border-1 border-basic-yellow rounded-base',
                              ])}
                              src={serie.icon_url}
                              alt=""
                              width={70}
                              height={70}
                            />

                            <p
                              className={cn([
                                'font-semakin text-sm mt-3 px-1 py-[0.125rem] border-1 border-basic-gray rounded-md',
                                serie.obtained_time &&
                                  'bg-[linear-gradient(300deg,#EDE0B9_0%,#CAA67E_100%)] bg-clip-text text-transparent',
                              ])}
                            >
                              LV.{serie.lv || item.lv || '--'}
                            </p>
                          </div>
                        </>
                      );
                    })}
                  </div>
                )}

                <p className="text-base text-[#666] mt-5 px-8 [&+.btns]:mt-9">
                  {description || item?.description || '--'}
                </p>

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
                  {(!item?.display && !canDisplay) || (
                    <LGButton
                      className="flex-1 uppercase"
                      label={item?.display ? 'Remove' : 'Display'}
                      loading={displayLoading}
                      disabled={!claimed}
                      onClick={onToggleDisplayClick}
                    />
                  )}

                  <LGButton className="flex-1 uppercase" label="Coming Soon" actived disabled />
                </div>
              </ModalBody>
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  );
}
