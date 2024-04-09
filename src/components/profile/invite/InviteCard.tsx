import Image from 'next/image';
import mbImg from 'img/loyalty/earn/mb.png';
import circleOutsideImg from 'img/loyalty/earn/circle_outside.png';
import { useContext } from 'react';
import { MobxContext } from '@/pages/_app';
import { observer } from 'mobx-react-lite';
import InviteCardModal from '@/pages/components/common/InviteCardModal';
import { cn } from '@nextui-org/react';
import copyIcon from 'img/profile/copy.png';
import linkIcon from 'img/profile/icon_link.png';
import { toast } from 'react-toastify';
import LGButton from '@/pages/components/common/buttons/LGButton';

const InviteCard = function () {
  const { userInfo, toggleInviteModal } = useContext(MobxContext);

  function onInviteClick() {
    if (!userInfo) return;
    toggleInviteModal();
  }

  async function onCopy(isLink = false) {
    const code = userInfo?.invite_code || '';
    const text = isLink ? `${location.origin}?invite_code=${code}` : code;

    try {
      await navigator.clipboard.writeText(text || '');
      toast.success('Copied!');
    } catch (error: any) {
      toast.error(error?.message || error);
    }
  }

  return (
    <div
      className={cn([
        'w-full h-[15rem] relative overflow-hidden  pt-[2rem] pr-44 pb-[2.5rem] pl-[2.375rem]',
        'hover:border-basic-yellow transition-[border-color] duration-500',
        'rounded-[0.625rem] border-1 border-basic-gray',
        'flex justify-between items-center',
        "bg-[url('/img/loyalty/earn/bg_earn_banner_invite.jpg')] bg-contain bg-right bg-no-repeat",
      ])}
    >
      <div className="flex flex-col justify-between relative z-0 h-full">
        <div>
          <div className="bg-[linear-gradient(300deg,#EFEBC5_0%,#D9A970_100%)] bg-clip-text text-transparent font-semakin text-2xl">
            Invite New Users to Join the Moonveil Ecosystem
          </div>

          <ul className="text-[#999] mt-[1.125rem]">
            <li>You will receive continuous MB rewards through the participant&apos;s engagement.</li>
            <li>Invitees will receive 15 bonus Moon Beams as a reward</li>
          </ul>
        </div>

        <div className="flex items-center relative z-0">
          <LGButton className="uppercase" label="Invite Now" actived onClick={onInviteClick} />

          <div className="text-sm ml-9">
            <span>My Invitation Code: </span>
            <span>{userInfo?.invite_code || '--'}</span>
            {userInfo?.invite_code && (
              <Image
                className="w-4 h-4 inline-block object-contain align-middle ml-[0.375rem] cursor-pointer"
                src={copyIcon}
                alt="Copy invite code"
                onClick={() => onCopy()}
              />
            )}
          </div>

          <div className="text-sm ml-9">
            <span>My Invitation Link</span>
            {userInfo?.invite_code && (
              <Image
                className="w-4 h-4 inline-block object-contain align-middle ml-[0.375rem] cursor-pointer"
                src={linkIcon}
                alt="Copy invite link"
                onClick={() => onCopy(true)}
              />
            )}
          </div>
        </div>
      </div>

      <div className="w-32 h-32 relative flex justify-center items-center shrink-0">
        <Image className="animate-spin5" src={circleOutsideImg} alt="" fill />

        <Image className="relative z-0" src={mbImg} alt="" />
      </div>

      <InviteCardModal />
    </div>
  );
};

export default observer(InviteCard);
