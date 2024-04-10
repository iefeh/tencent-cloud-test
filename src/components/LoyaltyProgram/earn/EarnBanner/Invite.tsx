import Image from 'next/image';
import inviteBgImg from 'img/loyalty/earn/bg_earn_banner_invite.jpg';
import inviteImg from 'img/loyalty/earn/invite.png';
import BasicButton from '@/pages/components/common/BasicButton';
import mbImg from 'img/loyalty/earn/mb.png';
import circleOutsideImg from 'img/loyalty/earn/circle_outside.png';
import { useContext } from 'react';
import { MobxContext } from '@/pages/_app';
import { observer } from 'mobx-react-lite';
import InviteCardModal from '@/pages/components/common/InviteCardModal';
import { cn } from '@nextui-org/react';

interface Props {
  inProfie?: boolean;
}

const Invite = function ({ inProfie }: Props) {
  const { userInfo, toggleInviteModal } = useContext(MobxContext);

  function onInviteClick() {
    if (!userInfo) return;
    toggleInviteModal();
  }

  return (
    <div
      className={cn([
        'w-[42.5rem] relative overflow-hidden rounded-[0.625rem] border-1 border-basic-gray pt-[2rem] pr-[2rem] pb-[2.5rem] pl-[2.375rem] flex justify-between items-center hover:border-basic-yellow transition-[border-color] duration-500',
        inProfie ? 'h-[13.75rem]' : 'h-[15rem]',
      ])}
    >
      <Image src={inviteBgImg} alt="" fill />

      <div className="flex flex-col justify-between relative z-0 h-full">
        <Image
          className="w-[11.125rem] h-[2.625rem] mt-[0.4375rem] ml-[0.3125rem] relative z-0"
          src={inviteImg}
          alt=""
        />

        <div className="flex items-center relative z-0">
          <BasicButton label="Invite Now" onClick={onInviteClick} />
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

export default observer(Invite);
