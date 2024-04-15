import { useRef, useContext, useState } from 'react';
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
import { Modal, ModalBody, ModalContent, ModalFooter, useDisclosure } from '@nextui-org/react';
import LGButton from './buttons/LGButton';
import { isMobile } from 'react-device-detect';

interface HeaderMenuItem {
  title: string;
  icon: string | StaticImageData;
  onClick?: (item?: HeaderMenuItem) => void;
  path?: string;
}

const UserAvatar = () => {
  const router = useRouter();
  const { userInfo, logout, toggleRedeemModal } = useContext(MobxContext);
  const ref = useRef(null);
  const [menuState, toggle] = useMenuState({ transition: true });
  const { anchorProps, hoverProps } = useHover(menuState.state, toggle);
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const [logoutLoading, setLogoutLoading] = useState(false);
  if (!userInfo) return null;

  const menus: HeaderMenuItem[] = [
    {
      title: 'User Center',
      icon: profileImg,
      path: '/Profile',
    },
    {
      title: 'My Badges',
      icon: badgeImg,
      path: '/Profile/MyBadges',
    },
    // {
    //   title: 'Check-In',
    //   icon: checkinImg,
    // },
    {
     title: 'Invite New Users',
     icon: inviteImg,
     path: '/Profile/invite'
    },
    // {
    //   title: 'Settings',
    //   icon: settingsImg,
    // },
    {
      title: 'Redeem Code',
      icon: settingsImg,
      onClick: () => toggleRedeemModal(true),
    },
    {
      title: 'Log Out',
      icon: logoutImg,
      onClick: onOpen,
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

  async function onLogout() {
    setLogoutLoading(true);
    await logout();
    setLogoutLoading(false);
  }

  let mobileMenus: HeaderMenuItem[] = menus;
  if (isMobile) {
    mobileMenus = menus.filter((item) => item.title !== 'Invite New Users');
  }

  return (
    <>
      <div ref={ref} {...anchorProps} className="user-info relative cursor-pointer mr-8">
        <div className="avatar rounded-full overflow-hidden w-12 h-12 relative">
          <Image className="object-cover" src={userInfo.avatar_url} alt="" fill sizes="100%" />
        </div>
      </div>

      <ControlledMenu
        className="[&>.szh-menu]:-translate-x-12"
        {...hoverProps}
        {...menuState}
        anchorRef={ref}
        theming="dark"
        onClose={() => toggle(false)}
      >
        <MenuItem>
          <UserProfile
            avatarClassName="w-12 h-12"
            usernameClassName="text-lg"
            walletClassName="text-[#666] mt-2"
            hideCopy
          />
        </MenuItem>

        <MenuDivider className="!mx-[1.125rem] bg-[#1f1f1f]" />

        {mobileMenus.map((menu, index) => (
          <MenuItem key={index} onClick={() => onMenuClick(menu)}>
            {menu.icon && <Image width={24} height={24} src={menu.icon} alt="" />}
            <span className="ml-[0.875rem] font-poppins-medium uppercase text-[14px]">{menu.title}</span>
          </MenuItem>
        ))}
      </ControlledMenu>

      <Modal
        placement="center"
        backdrop="blur"
        isOpen={isOpen}
        onOpenChange={onOpenChange}
        classNames={{ base: 'bg-[#141414] !rounded-base max-w-[30rem]', body: 'px-8 pt-[3.625rem]' }}
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalBody>
                <p>Are you sure you want to log out?</p>
              </ModalBody>
              <ModalFooter>
                <LGButton loading={logoutLoading} className="uppercase" label="Yes" onClick={onLogout} />
                <LGButton className="uppercase" label="No" actived onClick={onClose} />
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  );
};

export default observer(UserAvatar);
