'use client';

import React, { useRef, useState, useMemo } from 'react';
import Image from 'next/image';
import logo from 'img/header/logo.png';
import Discord from 'img/header/discord.svg';
import Youtube from 'img/header/Youtube.svg';
import Medium from 'img/header/medium.svg';
import Telegram from 'img/header/telegram.svg';
import X from 'img/header/x.svg';
import List from 'svg/list.svg';
import Close from 'svg/close.svg';
import Sidebar from '../Sidebar';
import { useRouter } from 'next/router';
import HeaderDropdownMenu from './HeaderDropdownMenu';
import moreIconImg from 'img/header/more.png';
import moreIconActiveImg from 'img/header/more_active.png';
import { ControlledMenu, MenuItem, useHover, useMenuState } from '@szhsin/react-menu';
import { cn } from '@nextui-org/react';
import UserInfo from '@/pages/components/common/UserInfo';
import Link from '../link';
import Notification from './Notification';
import RedeemModal from '@/components/common/modal/RedeemModal';
import S3Image from '../common/medias/S3Image';
import { isMobile } from 'react-device-detect';
import LGButton from '@/pages/components/common/buttons/LGButton';
import { observer } from 'mobx-react-lite';
import useNavMenus from './useNavMenus';

const mediaIcon = [
  { img: X, link: 'https://twitter.com/Moonveil_Studio' },
  { img: Discord, link: 'https://discord.gg/moonveil' },
  { img: Telegram, link: 'https://t.me/+AeiqS8o2YmswYTgx' },
];

const MoreLinks = () => {
  const moreMedias = [
    { img: Medium, link: 'https://medium.com/@Moonveil_Studio' },
    { img: Youtube, link: 'https://www.youtube.com/channel/UCFtFhgsjtdSgXarKvSYpz3A' },
  ];

  const menuRef = useRef(null);
  const [menuState, toggle] = useMenuState({ transition: true });
  const { anchorProps, hoverProps } = useHover(menuState.state, toggle);

  return (
    <>
      <div ref={menuRef} {...anchorProps} className="mx-2 px-2 cursor-pointer relative">
        <Image className="w-1 h-[0.9375rem]" src={moreIconImg} alt="" />
        <Image
          className={cn([
            'active w-1 h-[0.9375rem transition-opacity absolute z-[1] left-1/2 top-0 -translate-x-1/2',
            menuState.state === 'closed' ? 'opacity-0' : 'opacity-100',
          ])}
          src={moreIconActiveImg}
          alt=""
        />
      </div>

      <ControlledMenu
        className="pt-[1.4375rem] px-[2.625rem] pb-7"
        {...hoverProps}
        {...menuState}
        anchorRef={menuRef}
        theming="dark"
        onClose={() => toggle(false)}
      >
        {moreMedias.map((child, ci) => {
          const Component = child.img;

          return (
            <MenuItem key={ci}>
              <Link className="link-menu [&+.link-menu]:ml-4" href={child.link} target="_blank">
                <Component className="hover:fill-basic-yellow hover:cursor-pointer fill-[rgba(255,255,255,.3)] transition-all w-7 h-7" />
              </Link>
            </MenuItem>
          );
        })}
      </ControlledMenu>
    </>
  );
};

const Header = () => {
  const [listOpen, setListOpen] = useState(false);
  const router = useRouter();
  const { menus } = useNavMenus();

  const DropMenu = useMemo(() => {
    return (
      <>
        {menus.map((value, index) => (
          <HeaderDropdownMenu item={value} key={index} isActive={!!isActiveRoute(value)} />
        ))}
      </>
    );
  }, []);

  function isActiveRoute(menu: RouteMenu) {
    const route = router.asPath || '/';
    return menu.route === route || menu.children?.some((item) => item.route === route);
  }

  return (
    <section className="header fixed left-0 top-0 w-full flex justify-between items-center z-50 pt-4 pl-9 pr-4">
      <div className="flex-[1]">
        <Link href="/">
          <Image className="w-[135px] h-[80px]" src={logo} alt="Logo" />
        </Link>
      </div>

      {/* <Entry2048 /> */}

      <div className="font-semakin flex items-center max-lg:hidden">{DropMenu}</div>

      <div className="flex items-center flex-1 justify-end">
        <Link
          className={cn([isMobile && 'absolute right-0 top-28 z-0', listOpen && 'hidden'])}
          href={process.env.NEXT_PUBLIC_URL_NODE_SALE!}
          target="_blank"
        >
          <LGButton
            className="flex items-center flex-nowrap mr-4 animate-breathShadow"
            label="Node Sale"
            actived
            prefix={<S3Image className="w-6 h-6 mr-2" src="/header/node_128x128.gif" />}
          />
        </Link>

        <div className="max-lg:hidden flex items-center mr-4">
          {mediaIcon.map((value, index) => {
            const Component = value.img;
            return (
              <Link
                className="link-menu [&+.link-menu]:ml-4 relative z-10"
                key={index}
                href={value.link}
                target="_blank"
              >
                <Component className="hover:fill-basic-yellow hover:cursor-pointer fill-white/30 transition-all w-7 h-7" />
              </Link>
            );
          })}

          <MoreLinks />
        </div>

        <Notification />

        <UserInfo />

        {listOpen ? (
          <Close onClick={() => setListOpen(false)} className="max-lg:block mr6 hidden w-[3rem] h-[3rem]" />
        ) : (
          <List onClick={() => setListOpen(true)} className="max-lg:block mr-6 hidden w-[3rem] h-[3rem]" />
        )}
      </div>

      <Sidebar visible={listOpen} onClose={() => setListOpen(false)} />

      <RedeemModal />
    </section>
  );
};

export default observer(Header);
