import { Button, Input, Modal, ModalBody, ModalContent, useDisclosure } from '@nextui-org/react';
import Image from 'next/image';
import shareIconImg from 'img/astrark/pre-register/icon_share.png';
import iosImg from 'img/astrark/pre-register/card/ios.png';
import googlePlayImg from 'img/astrark/pre-register/card/google_play.png';
import tiktokImg from 'img/astrark/pre-register/card/tiktok.png';
import { useRef } from 'react';
import UserProfile from '@/pages/components/common/UserProfile';
import LGButton from '@/pages/components/common/buttons/LGButton';
import linkIconImg from 'img/icon/icon_link.png';
import downloadIconImg from 'img/icon/icon_download.png';
import html2canvas from 'html2canvas';
import { downloadFile } from '@/hooks/utils';
import { toast } from 'react-toastify';

export default function ShareButton() {
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const contentRef = useRef<HTMLDivElement>(null);

  async function onShareLink() {
    const url = location.origin;

    try {
      await navigator.clipboard.writeText(url || '');
      toast.success('Copied!');
    } catch (error: any) {
      toast.error(error?.message || error);
    }
  }

  async function onDownloadClick() {
    if (!contentRef.current) return;

    const canvas = await html2canvas(contentRef.current, {
      ignoreElements: (el) => el.classList.contains('content-display'),
    });
    const url = canvas.toDataURL();
    downloadFile(url);
  }

  return (
    <>
      <Button
        className="ml-[0.875rem] w-[12.0625rem] h-[4.375rem] bg-[url('/img/astrark/pre-register/bg_btn_bordered.png')] bg-cover bg-no-repeat !bg-transparent font-semakin text-black text-2xl"
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
          base: 'max-w-[48.25rem] bg-black border-1 border-basic-gray',
          body: 'p-0 gap-0',
          closeButton: 'z-10',
        }}
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

                <div className="w-full flex py-[1.75rem] gap-[2.875rem] pl-[1.1875rem] pr-10">
                  <div className="relative w-[19.0625rem] h-[26.875rem] flex justify-center items-center">
                    <Image src="/img/astrark/pre-register/card/bg.png" alt="" fill />

                    <div className="relative z-0 w-[17.5rem] h-[24.8125rem]">
                      <Image src="/img/astrark/pre-register/card/hero.png" alt="" fill />

                      <div className="absolute left-0 bottom-0 z-0 w-full flex flex-col items-end">
                        <Image
                          className="w-[5.1875rem] h-[5.1875rem] mb-1 mr-1"
                          src="/img/astrark/pre-register/card/role.png"
                          alt=""
                          width={83}
                          height={83}
                        />

                        <div className="w-full h-[3.3125rem] flex items-center bg-no-repeat bg-cover bg-[url('/img/astrark/pre-register/card/mask.png')]">
                          <Image
                            className="ml-3 w-[2.4375rem] h-8"
                            src="/img/astrark/pre-register/card/role_flag.png"
                            alt=""
                            width={39}
                            height={32}
                          />

                          <div className="flex-1 text-center">Role Name</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="relative font-poppins flex-1">
                    <div className="flex items-center bg-black">
                      <UserProfile
                        className="w-full mt-[2.375rem]"
                        avatarClassName="w-12 h-12"
                        usernameClassName="font-poppins text-xl"
                        walletClassName="hidden"
                      />

                      <div>
                        <div className="font-semakin text-lg w-full mt-[2.125rem]">Register</div>

                        <div className="font-semakin text-3xl text-basic-yellow w-full mt-1">N0.9999</div>
                      </div>
                    </div>

                    <div className="w-full mt-[2.625rem]">
                      Showcase your hero now and claim your exclusive in-game reward!
                    </div>

                    <div className="flex justify-between items-center">
                      <Button>Moonveil</Button>
                      <Button>@AstrArk_World</Button>
                    </div>

                    <div className="flex justify-between items-center">
                      <Image src={iosImg} alt="" />
                      <Image src={googlePlayImg} alt="" />
                      <Image src={tiktokImg} alt="" />
                    </div>

                    <Input defaultValue="AstrArk" readOnly />

                    <div className="content-display w-full h-full absolute left-0 top-0 z-10 flex flex-col items-center bg-black">
                      <UserProfile
                        className="w-full mt-[2.375rem]"
                        avatarClassName="w-12 h-12"
                        usernameClassName="font-poppins text-xl"
                        walletClassName="hidden"
                      />

                      <div className="font-semakin text-lg w-full mt-[2.125rem]">Register</div>

                      <div className="font-semakin text-3xl text-basic-yellow w-full mt-1">N0.9999</div>

                      <div className="w-full mt-[2.625rem]">
                        Showcase your hero now and claim your exclusive in-game reward!
                      </div>

                      <LGButton
                        className="uppercase w-full h-9 mt-12"
                        actived
                        label="Share my link"
                        prefix={<Image className="w-4 h-4" src={linkIconImg} alt="" />}
                        onClick={onShareLink}
                      />

                      <div
                        className="mx-auto mt-[1.625rem] cursor-pointer font-poppins text-base"
                        onClick={onDownloadClick}
                      >
                        <Image className="w-4 h-4 inline mr-[0.625rem]" src={downloadIconImg} alt="" />
                        SAVE IMAGE
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </ModalBody>
          )}
        </ModalContent>
      </Modal>
    </>
  );
}
