'use client';

import React, { useRef, useState } from 'react';
import Image from 'next/image';
import logo from 'img/header/logo.png';
import Discord from 'img/header/discord.svg';
import Youtube from 'img/header/Youtube.svg';
import Medium from 'img/header/medium.svg';
import Telegram from 'img/header/telegram.svg';
import X from 'img/header/x.svg';
import List from 'svg/list.svg';
import Close from 'svg/close.svg';
import Sidebar from './Sidebar';
import { useRouter } from 'next/router';
import HeaderDropdownMenu from './HeaderDropdownMenu';
import moreIconImg from 'img/header/more.png';
import moreIconActiveImg from 'img/header/more_active.png';
import { ControlledMenu, MenuItem, useHover, useMenuState } from '@szhsin/react-menu';
import { cn } from '@nextui-org/react';
import UserInfo from './UserInfo';

const routeText: RouteMenu[] = [
  { name: 'Home', route: '/' },
  {
    name: 'AstrArk',
    children: [
      {
        name: 'Game Download',
        route: '/AstrArk/Download',
      },
      // {
      //   name: 'Pre-Registration',
      //   route: '/AstrArk/PreRegistration',
      // },
      {
        name: 'Game Lore',
        route: '/AstrArk',
      },
    ],
  },
  { name: 'Bushwhack', route: '/Bushwhack' },
  { name: 'About', route: '/About' },
  { name: 'NFT', route: '/NFT' },
  {
    name: 'Loyalty Program',
    children: [
      {
        name: 'Loyalty System',
        route: '/LoyaltyProgram/intro',
      },
      {
        name: 'Earn Moon Beams',
        route: '/LoyaltyProgram/earn',
        // disabled: true,
      },
      // {
      //   name: 'MB=MVP',
      //   route: '/LoyaltyProgram/Exchange',
      // },
    ],
  },
];

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
      <div ref={menuRef} {...anchorProps} className="ml-2 mr-[1.375rem] px-2 cursor-pointer relative">
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
              <div className="link-menu [&+.link-menu]:ml-4" onClick={() => window.open(child.link)}>
                <Component className="hover:fill-[#F6C799] hover:cursor-pointer fill-[rgba(255,255,255,.3)] transition-all w-[28px] h-[28px]" />
              </div>
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

  function isActiveRoute(menu: RouteMenu) {
    const route = router.route || '/';
    return menu.route === route || menu.children?.some((item) => item.route === route);
  }

  function onLinkClick(path?: string) {
    if (!path) return;

    router.push(path);
    try {
      window.luxy.disable();
      window.luxy.wrapper.style.transform = 'translate3d(0, 0, 0)';
      window.luxy.enable();
    } catch (error) {
      console.log(error);
    }
  }

  return (
    <section className="header fixed left-0 top-0 w-full flex justify-between items-center z-50 pt-4 pl-9 pr-4">
      <div className="flex-[1]">
        <div onClick={() => onLinkClick('/')}>
          <Image className="w-[135px] h-[80px]" src={logo} alt="Picture of the author" />
        </div>
      </div>

      <div className="font-semakin flex items-center max-lg:hidden">
        {routeText.map((value, index) =>
          value.children ? (
            <HeaderDropdownMenu item={value} key={index} isActive={!!isActiveRoute(value)} onLinkClick={onLinkClick} />
          ) : (
            <div
              className={`cursor-pointer m-2 transition-all duration-300 border-b-2 border-transparent hover:border-[#F6C799] hover:text-[#F6C799] ${
                isActiveRoute(value) && 'text-[#F6C799] border-[#F6C799]'
              } text-[22px] ml-8 relative z-10`}
              key={index}
              onClick={() => onLinkClick(value.route)}
            >
              {value.name}
            </div>
          ),
        )}
      </div>

      <div className="flex items-center flex-[1] justify-end">
        <div className="max-lg:hidden flex items-center">
          {mediaIcon.map((value, index) => {
            const Component = value.img;
            return (
              <div className="link-menu [&+.link-menu]:ml-4" key={index} onClick={() => window.open(value.link)}>
                <Component className="hover:fill-[#F6C799] hover:cursor-pointer fill-[rgba(255,255,255,.3)] transition-all w-[28px] h-[28px]" />
              </div>
            );
          })}

          <MoreLinks />
        </div>

        <UserInfo />

        {listOpen ? (
          <Close onClick={() => setListOpen(false)} className="max-lg:block mr6 hidden w-[3rem] h-[3rem]" />
        ) : (
          <List onClick={() => setListOpen(true)} className="max-lg:block mr-6 hidden w-[3rem] h-[3rem]" />
        )}
      </div>

      <Sidebar visible={listOpen} onClose={() => setListOpen(false)} />
    </section>
  );
};

export default Header;
