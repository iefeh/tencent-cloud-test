import Image from 'next/image';
import inviteImg from 'img/loyalty/earn/invite.png';
import BasicButton from '@/pages/components/common/BasicButton';
import mbImg from 'img/loyalty/earn/mb.png';
import circleOutsideImg from 'img/loyalty/earn/circle_outside.png';
import { useContext } from 'react';
import { MobxContext } from '@/pages/_app';
import { observer } from 'mobx-react-lite';
import InviteCardModal from '@/pages/components/common/InviteCardModal';
import { useRouter } from 'next/router';
import { cn } from '@nextui-org/react';
import referralBgImg from 'img/loyalty/season/bg_referral.png';
import { isMobile } from 'react-device-detect';

interface Props extends ClassNameProps {
  inProfie?: boolean;
  isReferral?: boolean;
}

const Invite = function ({ className, inProfie, isReferral }: Props) {
  const { userInfo, toggleLoginModal } = useContext(MobxContext);
  const router = useRouter();

  function onInviteClick() {
    if (!userInfo) {
      toggleLoginModal(true);
    } else {
      router.push('/Profile/invite');
    }
  }

  return (
    <div
      className={cn([
        'relative overflow-hidden rounded-[0.625rem] border-1 border-basic-gray pt-[2rem] pr-[2rem] pb-[2.5rem] pl-[2.375rem] flex justify-between items-center hover:border-basic-yellow transition-[border-color] duration-500',
        isReferral ? 'h-[21.75rem]' : inProfie ? 'h-[13.75rem]' : 'h-[15rem]',
        isMobile ? 'w-full' : 'w-[35rem]',
        className,
      ])}
    >
      <Image
        className="object-cover"
        src={
          isReferral
            ? referralBgImg
            : 'https://moonveil-public.s3.ap-southeast-2.amazonaws.com/loyalty_program/bg_card_invite.png'
        }
        alt=""
        fill
        unoptimized
      />

      <div className="flex flex-col justify-between relative z-0 h-full">
        {isReferral ? (
          <div className="bg-[linear-gradient(300deg,#EFEBC5_0%,#D9A970_100%)] bg-clip-text text-transparent font-semakin text-2xl mt-4 leading-10">
            The
            <br />
            Referral
            <br />
            Program
          </div>
        ) : (
          <Image
            className="w-[11.125rem] h-[2.625rem] mt-[0.4375rem] ml-[0.3125rem] relative z-0"
            src={inviteImg}
            alt=""
          />
        )}

        <div className="flex items-center relative z-0">
          <BasicButton label="Invite Now" onClick={onInviteClick} />
        </div>
      </div>

      <div
        className={cn(['relative flex justify-center items-center shrink-0', isReferral ? 'w-48 h-48' : 'w-32 h-32'])}
      >
        <Image className="animate-spin5 object-contain" src={circleOutsideImg} alt="" fill />

        <Image className="relative z-0" src={mbImg} alt="" />
      </div>

      <InviteCardModal />
    </div>
  );
};

export default observer(Invite);
