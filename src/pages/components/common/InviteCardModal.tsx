import { MobxContext } from '@/pages/_app';
import { Modal, ModalBody, ModalContent } from '@nextui-org/react';
import { useContext, useEffect, useRef, useState } from 'react';
import LGButton from './buttons/LGButton';
import { observer } from 'mobx-react-lite';
import Image from 'next/image';
import logoImg from 'img/invite/logo.png';
import copyIconImg from 'img/invite/icon_copy.png';
import qrImg from 'img/invite/icon_qr.png';
import contentImg from 'img/invite/bg_content.png';
import linkIconImg from 'img/invite/icon_link.png';
import arrowRightIconImg from 'img/invite/icon_arrow_right.png';
import downloadIconImg from 'img/invite/icon_download.png';
import helpIconImg from 'img/invite/icon_help.png';
import UserProfile from './UserProfile';
import { throttle } from 'lodash';
import { queryInviteCodeAPI } from '@/http/services/task';
import { toast } from 'react-toastify';
import html2canvas from 'html2canvas';
import qrcode from 'qrcode';

function downloadFile(url: string, filename?: string) {
  const eleLink = document.createElement('a');
  eleLink.download = filename || 'file';
  eleLink.style.display = 'none';
  eleLink.href = url;
  document.body.appendChild(eleLink);
  eleLink.click();
  document.body.removeChild(eleLink);
}

const InviteCardModal = function () {
  const { userInfo, inviteModalVisible, toggleInviteModal, toggleLoginModal } = useContext(MobxContext);
  const [inviteCode, setInviteCode] = useState('');
  const contentRef = useRef<HTMLDivElement>(null);
  const [qrURL, setQrURL] = useState('');

  function getShareLink() {
    return `${location.origin}?invite_code=${inviteCode}`;
  }

  async function onShareLink() {
    const url = getShareLink();

    try {
      await navigator.clipboard.writeText(url || '');
      toast.success('Copied!');
    } catch (error: any) {
      toast.error(error?.message || error);
    }
  }

  function onJoinClick() {
    toggleInviteModal(false);
    toggleLoginModal(true);
  }

  async function onDownloadClick() {
    if (!contentRef.current) return;

    const canvas = await html2canvas(contentRef.current);
    const url = canvas.toDataURL();
    downloadFile(url);
  }

  async function generateQrCode() {
    const link = getShareLink();
    try {
      const url = await qrcode.toDataURL(link, { margin: 2, width: 120 });
      setQrURL(url);
    } catch (error: any) {
      toast.error(error.message);
    }
  }

  const queryInviteCode = throttle(async function () {
    try {
      const res = await queryInviteCodeAPI();
      setInviteCode(res?.invite_code || '');
    } catch (error) {
      console.log(error);
    }
  }, 500);

  useEffect(() => {
    if (!userInfo || inviteCode) return;
    queryInviteCode();
  }, [userInfo]);

  useEffect(() => {
    if (inviteCode) generateQrCode();
  }, [inviteCode]);

  return (
    <>
      <Modal
        placement="center"
        backdrop="blur"
        isOpen={inviteModalVisible}
        onOpenChange={toggleInviteModal}
        isDismissable={false}
        classNames={{
          base: 'w-[26.25rem] bg-black border-1 border-basic-gray',
          body: 'p-0 gap-0 pb-[2.6875rem]',
          closeButton: 'z-10',
        }}
      >
        <ModalContent>
          {() => (
            <ModalBody>
              <div ref={contentRef} className="pb-[1.8125rem] bg-black">
                <div className="relative w-full py-[1.625rem] bg-no-repeat bg-[url('/img/invite/bg_head.png')] bg-contain flex justify-between items-center gap-4 px-6">
                  <Image className="w-[5.625rem] h-[3.3125rem] inline-block" src={logoImg} alt="" />
                  <div className="font-semakin text-basic-yellow text-2xl max-w-60 leading-none">
                    Invite friends to join Moonveil
                  </div>
                </div>

                {userInfo && (
                  <div className="flex justify-between items-center mt-7 ml-[2.375rem] mr-7">
                    <UserProfile
                      avatarClassName="w-[3.75rem] h-[3.75rem] inline-block"
                      usernameClassName="text-xl leading-none overflow-visible !whitespace-normal !break-words flex-1"
                      walletClassName="text-[#999] mt-2"
                      desc={`Invite Code: ${inviteCode || '--'}`}
                      copyText={inviteCode}
                      copyIcon={copyIconImg}
                    />

                    {qrURL && <Image className="w-[3.75rem] h-[3.75rem]" src={qrURL} alt="" width={120} height={120} />}
                  </div>
                )}

                <div className="w-[23.125rem] h-[24.4375rem] mx-auto border-1 border-basic-gray rounded-[1.1875rem] mt-5 overflow-hidden relative">
                  <Image className="object-cover" src={contentImg} alt="" fill />

                  <div className="absolute left-1/2 -translate-x-1/2 top-[2.625rem] font-poppins text-base text-basic-yellow w-[18.5rem] text-center">
                    Own Your Destiny——
                    <br />
                    Join Moonveil to claim your limited on-chain and in-game rewards now!
                  </div>
                </div>
              </div>

              {userInfo ? (
                <>
                  <LGButton
                    className="uppercase w-[20.375rem] h-9 mx-auto"
                    label="Share My Link"
                    actived
                    prefix={<Image className="w-4 h-4" src={linkIconImg} alt="" />}
                    onClick={onShareLink}
                  />
                  <div
                    className="mx-auto mt-[1.375rem] cursor-pointer font-poppins text-base"
                    onClick={onDownloadClick}
                  >
                    <Image className="w-4 h-4 inline mr-[0.625rem]" src={downloadIconImg} alt="" />
                    SAVE IMAGE
                  </div>
                </>
              ) : (
                <>
                  <LGButton
                    className="uppercase w-[20.375rem] h-9 mx-auto"
                    label="Join Now"
                    actived
                    suffix={<Image className="w-4 h-4" src={arrowRightIconImg} alt="" />}
                    onClick={onJoinClick}
                  />
                  <div className="mx-auto mt-[1.375rem] cursor-pointer font-poppins text-base">
                    Check Rules
                    <Image className="w-4 h-4 inline ml-[0.625rem]" src={helpIconImg} alt="" />
                  </div>
                </>
              )}
            </ModalBody>
          )}
        </ModalContent>
      </Modal>
    </>
  );
};

export default observer(InviteCardModal);
