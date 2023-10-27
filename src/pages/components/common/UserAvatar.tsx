import { useRef, useContext } from 'react';
import Image from 'next/image';
import { ControlledMenu, MenuItem, useMenuState, useHover } from '@szhsin/react-menu';
import '@szhsin/react-menu/dist/index.css';
import '@szhsin/react-menu/dist/theme-dark.css';
import '@szhsin/react-menu/dist/transitions/slide.css';
import { MobxContext } from '@/pages/_app';
import { observer } from 'mobx-react-lite';
import logoutImg from 'img/logout.png';

const UserAvatar = () => {
  const { userInfo, logout } = useContext(MobxContext);
  const ref = useRef(null);
  const [menuState, toggle] = useMenuState({ transition: true });
  const { anchorProps, hoverProps } = useHover(menuState.state, toggle);
  if (!userInfo) return null;

  return (
    <>
      <div ref={ref} {...anchorProps} className="user-info relative cursor-pointer">
        <Image
          className="rounded-full overflow-hidden object-cover"
          width={48}
          height={48}
          src={userInfo.avatar_url}
          alt=""
        />
      </div>

      <ControlledMenu
        {...hoverProps}
        {...menuState}
        anchorRef={ref}
        theming="dark"
        onClose={() => toggle(false)}
      >
        <MenuItem onClick={() => logout()}>
          <Image width={24} height={24} src={logoutImg} alt="" />
          <span className="font-poppins-medium uppercase text-[14px]">Log Out</span>
        </MenuItem>
      </ControlledMenu>
    </>
  );
};

export default observer(UserAvatar);
