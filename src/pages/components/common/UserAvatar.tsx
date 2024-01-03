import { useRef, useContext } from 'react';
import Image from 'next/image';
import { ControlledMenu, MenuItem, useMenuState, useHover, MenuDivider } from '@szhsin/react-menu';
import '@szhsin/react-menu/dist/index.css';
import '@szhsin/react-menu/dist/theme-dark.css';
import '@szhsin/react-menu/dist/transitions/slide.css';
import { MobxContext } from '@/pages/_app';
import { observer } from 'mobx-react-lite';
import logoutImg from 'img/logout.png';
import { useRouter } from 'next/router';
import UserProfile from './UserProfile';

const UserAvatar = () => {
  const router = useRouter();
  const { userInfo, logout } = useContext(MobxContext);
  const ref = useRef(null);
  const [menuState, toggle] = useMenuState({ transition: true });
  const { anchorProps, hoverProps } = useHover(menuState.state, toggle);
  if (!userInfo) return null;

  function onAvatarClick() {
    // router.push('/Profile');
  }

  return (
    <>
      <div ref={ref} {...anchorProps} className="user-info relative cursor-pointer mr-8">
        <div className="avatar rounded-full overflow-hidden w-7 h-7 relative" onClick={onAvatarClick}>
          <Image className="object-cover" src={userInfo.avatar_url} alt="" fill />
        </div>
      </div>

      <ControlledMenu {...hoverProps} {...menuState} anchorRef={ref} theming="dark" onClose={() => toggle(false)}>
        {/* <MenuItem>
          <UserProfile avatarClassName="w-12 h-12" usernameClassName="text-lg" walletClassName="text-[#666] mt-2" hideCopy />
        </MenuItem>
        <MenuDivider /> */}
        <MenuItem onClick={() => logout()}>
          <Image width={24} height={24} src={logoutImg} alt="" />
          <span className="font-poppins-medium uppercase text-[14px]">Log Out</span>
        </MenuItem>
      </ControlledMenu>
    </>
  );
};

export default observer(UserAvatar);
