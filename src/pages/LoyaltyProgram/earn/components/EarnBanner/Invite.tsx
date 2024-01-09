import Image from 'next/image';
import inviteBgImg from 'img/loyalty/earn/bg_earn_banner_invite.jpg';
import inviteImg from 'img/loyalty/earn/invite.png';
import BasicButton from '@/pages/components/common/BasicButton';
import mbImg from 'img/loyalty/earn/mb.png';
import circleOutsideImg from 'img/loyalty/earn/circle_outside.png';
import { useContext, useEffect, useState } from 'react';
import { MobxContext } from '@/pages/_app';
import { queryInviteCodeAPI } from '@/http/services/task';
import { observer } from 'mobx-react-lite';
import { throttle } from 'lodash';

const Invite = function () {
  const { userInfo } = useContext(MobxContext);
  const [inviteCode, setInviteCode] = useState('');

  const queryInviteCode = throttle(async function () {
    try {
      const res = await queryInviteCodeAPI();
      setInviteCode(res.invite_code || '');
    } catch (error) {
      console.log(error);
    }
  }, 500);

  function onInviteClick() {
    if (!inviteCode) return;
  }

  useEffect(() => {
    if (userInfo) queryInviteCode();
  }, [userInfo]);

  return (
    <div className="w-[42.5rem] h-[13.75rem] relative overflow-hidden rounded-[0.625rem] border-1 border-basic-gray pt-[2.75rem] pr-[4.375rem] pb-[3.0625rem] pl-[2.375rem] flex justify-between items-center hover:border-basic-yellow transition-[border-color] duration-500">
      <Image src={inviteBgImg} alt="" fill />

      <div className="flex flex-col justify-between relative z-0 h-full">
        <Image
          className="w-[11.125rem] h-[2.625rem] mt-[0.4375rem] ml-[0.3125rem] relative z-0"
          src={inviteImg}
          alt=""
        />

        <div className="flex items-center relative z-0">
          <BasicButton label="Invite Now" onClick={onInviteClick} />

          <span className="text-sm font-poppins ml-4">
            Successfully invited
            <span className="text-basic-yellow"> 3 </span>
            people.
          </span>
        </div>
      </div>

      <div className="w-32 h-32 relative flex justify-center items-center">
        <Image className="animate-spin5" src={circleOutsideImg} alt="" fill />

        <Image className="relative z-0" src={mbImg} alt="" />
      </div>
    </div>
  );
};

export default observer(Invite);
