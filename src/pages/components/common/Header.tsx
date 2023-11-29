'use client';

import React, { useContext, useState } from 'react';
import Image from 'next/image';
import BasicButton from './BasicButton';
import logo from 'img/header/logo.png';
import Discord from 'img/header/discord.svg';
import Youtube from 'img/header/Youtube.svg';
import Medium from 'img/header/medium.svg';
import Telegram from 'img/header/telegram.svg';
import X from 'img/header/x.svg';
import List from 'svg/list.svg';
import Close from 'svg/close.svg';
import LoginDialog from './LoginDialog';
import Sidebar from './Sidebar';
import { useRouter } from 'next/router';
import { MobxContext } from '@/pages/_app';
import { observer } from 'mobx-react-lite';
import UserAvatar from './UserAvatar';
import { Dropdown, DropdownTrigger, DropdownMenu, DropdownItem, Button } from '@nextui-org/react';

interface RouteMenu {
  name: string;
  route?: string;
  children?: RouteMenu[];
}

const routeText: RouteMenu[] = [
  { name: 'Home', route: '/' },
  { name: 'AstrArk', route: '/AstrArk' },
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
      },
      {
        name: 'MB=MVP',
        route: '/LoyaltyProgram/Exchange',
      },
    ],
  },
];

const mediaIcon = [
  { img: X, link: 'https://twitter.com/Moonveil_Studio' },
  { img: Discord, link: 'https://discord.com/invite/NyECfU5XFX' },
  { img: Telegram, link: 'https://t.me/+AeiqS8o2YmswYTgx' },
  { img: Medium, link: 'https://medium.com/@Moonveil_Studio' },
  { img: Youtube, link: 'https://www.youtube.com/channel/UCFtFhgsjtdSgXarKvSYpz3A' },
];

const Header = () => {
  const { userInfo } = useContext(MobxContext);
  const [loginVisible, setLoginVisible] = useState(false);
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
            <Dropdown key={index}>
              <DropdownTrigger>
                <div
                  className={`cursor-pointer m-2 transition-all duration-300 hover:border-b-2 border-[#F6C799] hover:text-[#F6C799] ${
                    isActiveRoute(value) && 'text-[#F6C799] border-[#F6C799] border-b-2'
                  } text-[22px] ml-8`}
                >
                  Loyalty Program
                </div>
              </DropdownTrigger>
              <DropdownMenu
                aria-label="Loyalty Program Actions"
                className="text-center"
                onAction={(key) => onLinkClick(key.toString())}
              >
                {value.children.map((item) => (
                  <DropdownItem className="uppercase font-semakin text-lg" key={item.route}>
                    {item.name}
                  </DropdownItem>
                ))}
              </DropdownMenu>
            </Dropdown>
          ) : (
            <div
              className={`cursor-pointer m-2 transition-all duration-300 hover:border-b-2 border-[#F6C799] hover:text-[#F6C799] ${
                isActiveRoute(value) && 'text-[#F6C799] border-[#F6C799] border-b-2'
              } text-[22px] ml-8`}
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
              <div key={index} onClick={() => window.open(value.link)}>
                <Component className="hover:fill-[#F6C799] hover:cursor-pointer fill-[rgba(255,255,255,.3)] transition-all w-[28px] h-[28px] mr-4" />
              </div>
            );
          })}
        </div>

        {userInfo ? (
          <UserAvatar />
        ) : (
          <BasicButton
            className={'text-[14px] leading-[20px] px-[18px] rounded-[24px] mr-8 ' + (listOpen ? 'hidden' : '')}
            label="login"
            onClick={() => setLoginVisible(true)}
          />
        )}

        {listOpen ? (
          <Close onClick={() => setListOpen(false)} className="max-lg:block mr6 hidden w-[3rem] h-[3rem]" />
        ) : (
          <List onClick={() => setListOpen(true)} className="max-lg:block mr-6 hidden w-[3rem] h-[3rem]" />
        )}
      </div>

      <LoginDialog visible={loginVisible} onClose={() => setLoginVisible(false)} />

      <Sidebar visible={listOpen} onClose={() => setListOpen(false)} />
    </section>
  );
};

export default observer(Header);
