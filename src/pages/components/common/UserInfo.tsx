import { useContext } from 'react';
import { MobxContext } from '@/pages/_app';
import UserAvatar from './UserAvatar';
import BasicButton from './BasicButton';
import LoginModal from './LoginModal';
import { cn, useDisclosure } from '@nextui-org/react';

export default function UserInfo() {
  const { userInfo } = useContext(MobxContext);
  const { isOpen, onOpen, onOpenChange } = useDisclosure();

  return (
    <>
      {userInfo ? (
        <UserAvatar />
      ) : (
        <BasicButton
          className="text-[14px] leading-[20px] px-[18px] rounded-[24px] mr-8"
          label="login"
          onClick={onOpen}
        />
      )}

      <LoginModal isOpen={isOpen} onOpenChange={onOpenChange} />
    </>
  );
}
