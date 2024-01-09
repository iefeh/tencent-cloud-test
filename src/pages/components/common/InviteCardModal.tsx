import { MobxContext } from '@/pages/_app';
import { Modal, ModalBody, ModalContent } from '@nextui-org/react';
import { useContext, useEffect, useState } from 'react';
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

const InviteCardModal = function () {
  const { userInfo, inviteModalVisible, toggleInviteModal, toggleLoginModal } = useContext(MobxContext);
  const [inviteCode, setInviteCode] = useState('');

  async function onShareLink() {
    const url = `${location.origin}?invite_code=${inviteCode}`;

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

  const queryInviteCode = throttle(async function () {
    try {
      const res = await queryInviteCodeAPI();
      setInviteCode(res?.invite_code || '');
    } catch (error) {
      console.log(error);
    }
  }, 500);

  // useEffect(() => {
  //   if (!userInfo || inviteCode) return;
  //   queryInviteCode();
  // }, [userInfo])

  return (
    <>
      <Modal
        backdrop="blur"
        isOpen={inviteModalVisible}
        onOpenChange={toggleInviteModal}
        isDismissable={false}
        classNames={{ base: 'w-[26.25rem]', body: 'p-0 gap-0 pb-[2.6875rem]', closeButton: 'z-10' }}
      >
        <ModalContent>
          {() => (
            <ModalBody>
              <div className="pb-[1.8125rem]">
                <div className="relative w-full h-[6.625rem] bg-no-repeat bg-[url('/img/invite/bg_head.png')] bg-contain flex justify-between items-center gap-4 px-6">
                  <Image className="w-[5.625rem] h-[3.3125rem]" src={logoImg} alt="" />
                  <div className="font-semakin text-basic-yellow text-2xl max-w-60">
                    Invite friends to join Moonveil
                  </div>
                </div>

                <div className="flex justify-between items-center pt-7 pb-5 pl-[2.375rem] pr-7">
                  <UserProfile
                    avatarClassName="w-[3.75rem] h-[3.75rem]"
                    usernameClassName="text-xl"
                    walletClassName="text-[#999] mt-2"
                    desc={`Invite Code: ${inviteCode || '--'}`}
                    copyText={inviteCode}
                    copyIcon={copyIconImg}
                  />

                  <Image className="w-[3.75rem] h-[3.75rem]" src={qrImg} alt="" />
                </div>

                <Image
                  className="w-[23.125rem] h-[24.4375rem] mx-auto border-1 border-basic-gray rounded-[1.1875rem]"
                  src={contentImg}
                  alt=""
                />
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
                  <div className="mx-auto mt-[1.375rem] cursor-pointer font-poppins text-base">
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
