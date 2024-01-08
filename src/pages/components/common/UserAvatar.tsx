import { useRef, useContext } from 'react';
import Image, { StaticImageData } from 'next/image';
import { ControlledMenu, MenuItem, useMenuState, useHover, MenuDivider } from '@szhsin/react-menu';
import '@szhsin/react-menu/dist/index.css';
import '@szhsin/react-menu/dist/theme-dark.css';
import '@szhsin/react-menu/dist/transitions/slide.css';
import { MobxContext } from '@/pages/_app';
import { observer } from 'mobx-react-lite';
import { useRouter } from 'next/router';
import UserProfile from './UserProfile';
import profileImg from 'img/header/icon_profile.png';
import badgeImg from 'img/header/icon_badge.png';
import checkinImg from 'img/header/icon_checkin.png';
import inviteImg from 'img/header/icon_invite.png';
import settingsImg from 'img/header/icon_settings.png';
import logoutImg from 'img/header/icon_logout.png';

interface HeaderMenuItem {
  title: string;
  icon: string | StaticImageData;
  onClick?: (item?: HeaderMenuItem) => void;
  path?: string;
}

const UserAvatar = () => {
  const router = useRouter();
  const { userInfo, logout } = useContext(MobxContext);
  const ref = useRef(null);
  const [menuState, toggle] = useMenuState({ transition: true });
  const { anchorProps, hoverProps } = useHover(menuState.state, toggle);
  if (!userInfo) return null;
  const menus: HeaderMenuItem[] = [
    {
      title: 'Personal Center',
      icon: profileImg,
      path: '/Profile',
    },
    // {
    //   title: 'My Badges',
    //   icon: badgeImg,
    // },
    // {
    //   title: 'Check-In',
    //   icon: checkinImg,
    // },
    // {
    //   title: 'Invite New Users',
    //   icon: inviteImg,
    // },
    // {
    //   title: 'Settings',
    //   icon: settingsImg,
    // },
    {
      title: 'Log Out',
      icon: logoutImg,
      onClick: () => logout(),
    },
  ];

  function onMenuClick(item: HeaderMenuItem) {
    if (item.onClick) {
      item.onClick(item);
      return;
    }

    if (!item.path) return;
    router.push(item.path);
  }

  return (
    <>
      <div ref={ref} {...anchorProps} className="user-info relative cursor-pointer mr-8">
        <div className="avatar rounded-full overflow-hidden w-7 h-7 relative">
          <Image className="object-cover" src={userInfo.avatar_url} alt="" fill />
        </div>
      </div>

      <ControlledMenu className="[&>.szh-menu]:-translate-x-12" {...hoverProps} {...menuState} anchorRef={ref} theming="dark" onClose={() => toggle(false)}>
        <MenuItem>
          <UserProfile
            avatarClassName="w-12 h-12"
            usernameClassName="text-lg"
            walletClassName="text-[#666] mt-2"
            hideCopy
          />
        </MenuItem>

        <MenuDivider className="!mx-[1.125rem] bg-[#1f1f1f]" />

        {menus.map((menu, index) => (
          <MenuItem key={index} onClick={() => onMenuClick(menu)}>
            {menu.icon && <Image width={24} height={24} src={menu.icon} alt="" />}
            <span className="ml-[0.875rem] font-poppins-medium uppercase text-[14px]">{menu.title}</span>
          </MenuItem>
        ))}
      </ControlledMenu>
    </>
  );
};

export default observer(UserAvatar);
