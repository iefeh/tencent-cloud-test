import { useContext } from 'react';
import { MobxContext } from '@/pages/_app';
import UserAvatar from './UserAvatar';
import BasicButton from './BasicButton';
import LoginModal from './LoginModal';

export default function UserInfo() {
  const { userInfo, toggleLoginModal } = useContext(MobxContext);

  return (
    <>
      {userInfo ? (
        <UserAvatar />
      ) : (
        <BasicButton
          className="text-[14px] leading-[20px] px-[18px] rounded-[24px] mr-8"
          label="login"
          onClick={toggleLoginModal}
        />
      )}

      <LoginModal />
    </>
  );
}
