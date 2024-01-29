import { Button, Input, Modal, ModalBody, ModalContent, useDisclosure } from '@nextui-org/react';
import Image from 'next/image';
import shareIconImg from 'img/astrark/pre-register/icon_share.png';
import iosImg from 'img/astrark/pre-register/card/ios.png';
import googlePlayImg from 'img/astrark/pre-register/card/google_play.png';
import tiktokImg from 'img/astrark/pre-register/card/tiktok.png';
import { useContext, useRef } from 'react';
import UserProfile from '@/pages/components/common/UserProfile';
import LGButton from '@/pages/components/common/buttons/LGButton';
import linkIconImg from 'img/icon/icon_link.png';
import downloadIconImg from 'img/icon/icon_download.png';
import html2canvas from 'html2canvas';
import { downloadFile } from '@/hooks/utils';
import { toast } from 'react-toastify';
import { PreRegisterInfoDTO } from '@/http/services/astrark';
import discordImg from 'img/astrark/pre-register/card/discord .png';
import xImg from 'img/astrark/pre-register/card/x .png';
import searchImg from 'img/astrark/pre-register/card/search.png';
import { MobxContext } from '@/pages/_app';
import { observer } from 'mobx-react-lite';

function ShareButton({ preInfo }: { preInfo: PreRegisterInfoDTO }) {
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const contentRef = useRef<HTMLDivElement>(null);
  const warpperRef = useRef<HTMLDivElement>(null);
  const { userInfo } = useContext(MobxContext);

  async function onShareLink() {
    if (!userInfo) return;

    const url = `${location.origin}?invite_code=${userInfo?.invite_code}`;

    try {
      await navigator.clipboard.writeText(url || '');
      toast.success('Copied!');
    } catch (error: any) {
      toast.error(error?.message || error);
    }
  }

  function onShareOnTwitter() {
    if (!userInfo) return;

    const shareLink = `${location.origin}?invite_code=${userInfo?.invite_code}\n`;
    const text = "Join @AstrArk_World's Alpha Test for a chance to win a Destiny TETRA NFT whitelist!\nLog in now!";
    const hashtags = ['AstrArk'];
    const intentURL = `https://twitter.com/intent/tweet?url=${encodeURIComponent(shareLink)}&text=${encodeURIComponent(
      text,
    )}&hashtags=${hashtags.join(',')}`;
    window.open(intentURL, '_blank');
  }

  async function onDownloadClick() {
    if (!contentRef.current) return;

    try {
      const canvas = await html2canvas(contentRef.current, {
        logging: true,
        ignoreElements: (el) => el.classList.contains('content-display'),
      });
      const url = canvas.toDataURL();
      downloadFile(url);
    } catch (error) {
      console.log(error);
    }
  }

  return (
    <div ref={warpperRef}>
      <Button
        className="w-[12.0625rem] h-[4.375rem] bg-[url('/img/astrark/pre-register/bg_btn_bordered.png')] bg-cover bg-no-repeat !bg-transparent font-semakin text-black text-2xl"
        disableRipple
        endContent={<Image className="w-[1.375rem] h-[1.625rem] relative -top-[0.125rem]" src={shareIconImg} alt="" />}
        onPress={onOpen}
      >
        share
      </Button>

      <Modal
        placement="center"
        isOpen={isOpen}
        onOpenChange={onOpenChange}
        classNames={{
          base: 'max-w-[48.25rem] max-h-[80vh] overflow-y-auto bg-black border-1 border-basic-gray text-left',
          body: 'p-0 gap-0',
          closeButton: 'z-10',
        }}
        portalContainer={warpperRef.current!}
      >
        <ModalContent>
          {(onClose) => (
            <ModalBody>
              <div ref={contentRef} className="bg-black">
                <div className="relative w-full py-[1.625rem] bg-no-repeat bg-[url('/img/invite/bg_head.png')] bg-contain flex justify-between items-center gap-4 px-6">
                  <div className="font-semakin text-basic-yellow text-2xl leading-none">
                    AstrArk Pre-Registration Reward
                  </div>
                </div>

                <div className="w-full flex flex-col lg:flex-row items-center py-[1.75rem] gap-[2.875rem] pl-[1.1875rem] pr-10">
                  <div className="relative w-[19.0625rem] h-[26.875rem] flex justify-center items-end pb-6">
                    <Image className="object-contain" src={preInfo?.hero_url} alt="" fill />
                  </div>

                  <div className="relative font-poppins flex-1 pr-2">
                    <div className="flex items-center bg-black">
                      <UserProfile
                        className="w-full mt-[2.375rem]"
                        avatarClassName="w-12 h-12"
                        usernameClassName="font-poppins text-xl"
                        walletClassName="hidden"
                      />

                      <div>
                        <div className="font-semakin text-lg w-full mt-[2.125rem]">Register</div>

                        <div className="font-semakin text-3xl text-basic-yellow w-full mt-1">
                          N0.{preInfo?.total || 1}
                        </div>
                      </div>
                    </div>

                    <div className="w-full mt-8">Showcase your hero now and claim your exclusive in-game reward!</div>

                    <div className="flex justify-between items-center mt-9 gap-[0.5625rem] h-[2.875rem]">
                      <Button
                        className="bg-[#358FEA] flex-[3] h-full rounded-[0.3125rem]"
                        startContent={<Image className="w-[1.9375rem] h-6" src={discordImg} alt="" />}
                      >
                        Moonveil
                      </Button>
                      <Button
                        className="bg-[#358FEA] flex-[4] h-full rounded-[0.3125rem]"
                        startContent={<Image className="w-[1.625rem] h-[1.4375rem]" src={xImg} alt="" />}
                      >
                        @AstrArk_World
                      </Button>
                    </div>

                    <div className="flex justify-between items-center gap-6 mt-9">
                      <Image src={iosImg} alt="" />
                      <Image src={googlePlayImg} alt="" />
                      <Image src={tiktokImg} alt="" />
                    </div>

                    <Input
                      className="mt-6"
                      defaultValue="AstrArk"
                      readOnly
                      classNames={{
                        inputWrapper: 'bg-white h-[2.875rem] rounded-[0.3125rem]',
                        input: 'font-poppins text-2xl !text-black',
                      }}
                      endContent={<Image src={searchImg} alt="" />}
                    />

                    <div className="content-display w-full h-full absolute left-0 top-0 z-10 flex flex-col items-center bg-black">
                      <UserProfile
                        className="w-full mt-[2.375rem]"
                        avatarClassName="w-12 h-12"
                        usernameClassName="font-poppins text-xl"
                        walletClassName="hidden"
                      />

                      {/* <div className="font-semakin text-lg w-full mt-[2.125rem]">Register</div>

                      <div className="font-semakin text-3xl text-basic-yellow w-full mt-1">
                        N0.{preInfo?.total || 1}
                      </div> */}

                      <div className="font-semakin text-lg w-full mt-[2.125rem]">Invite Code</div>

                      <div className="font-semakin text-3xl text-basic-yellow w-full mt-1">
                        {userInfo?.invite_code || '--'}
                      </div>

                      <div className="w-full mt-[2.625rem]">
                        Showcase your hero now and claim your exclusive in-game reward!
                      </div>

                      <div className="flex items-center gap-4">
                        <LGButton
                          className="uppercase h-9 mt-12"
                          actived
                          label="Share my link"
                          prefix={<Image className="w-4 h-4" src={linkIconImg} alt="" />}
                          onClick={onShareLink}
                        />
                        <LGButton
                          className="uppercase h-9 mt-12"
                          actived
                          label="Share On Twitter"
                          prefix={<Image className="w-4 h-4" src={linkIconImg} alt="" />}
                          onClick={onShareOnTwitter}
                        />
                      </div>

                      {/* <div
                        className="mx-auto mt-[1.625rem] cursor-pointer font-poppins text-base hidden lg:block"
                        onClick={onDownloadClick}
                      >
                        <Image className="w-4 h-4 inline mr-[0.625rem]" src={downloadIconImg} alt="" />
                        SAVE IMAGE
                      </div> */}
                    </div>
                  </div>
                </div>
              </div>
            </ModalBody>
          )}
        </ModalContent>
      </Modal>
    </div>
  );
}

export default observer(ShareButton);
