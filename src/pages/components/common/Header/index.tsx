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
import Sidebar from '../Sidebar';
import { useRouter } from 'next/router';
import HeaderDropdownMenu from './HeaderDropdownMenu';
import moreIconImg from 'img/header/more.png';
import moreIconActiveImg from 'img/header/more_active.png';
import { ControlledMenu, MenuItem, useHover, useMenuState } from '@szhsin/react-menu';
import { cn } from '@nextui-org/react';
import UserInfo from '../UserInfo';
import Link from 'next/link';
import Notification from './Notification';
import RedeemModal from '@/components/common/modal/RedeemModal';
import { isMobile } from 'react-device-detect';
import Entry2048 from '@/components/pages/header/Entry2048';
import Game2048Icon from "img/header/2048.png";
import AstrarkIcon from "img/header/astrark.png";
import BushwhackIcon from "img/header/bushwhack.png";
import FlamingPetsIcon from "img/header/flaming_pets.png";

export const routeText: RouteMenu[] = [
  { name: 'Home', route: '/' },
  {
    name: 'Loyalty Program',
    children: [
      {
        name: 'Introduction',
        route: '/LoyaltyProgram/intro',
      },
      {
        name: 'My Season Pass',
        route: '/LoyaltyProgram/season',
        children: [
          {
            name: 'Introduction',
            route: '/LoyaltyProgram/season/foresight',
          },
          {
            name: 'Season Events',
            route: 'LoyaltyProgram/earn?tabKey=Events',
          },
          {
            name: 'Task-Join Our Community',
            route: '/LoyaltyProgram/earn/group/41434473-a1e9-42ac-a570-8114ec78c96b',
          },
          {
            name: 'Task-Community Engagement',
            route: '/LoyaltyProgram/earn/group/8a320647-85a5-4c84-863a-8904bb98fe2f',
          },
          {
            name: 'Task-The Referral Program',
            route: '/LoyaltyProgram/earn/group/517d8ea3-0997-48ca-8e6e-4efa3bc17644',
          },
          {
            name: 'Task-Digital Assets Verification',
            route: '/LoyaltyProgram/earn/group/85d11267-5502-41d1-bfff-9a88d20547a4',
          },
          {
            name: 'More Tasks',
            route: '/LoyaltyProgram/earn/group/c8af9477-fd48-4265-90d7-20bc4a200ff3',
          },
        ]
      },
      {
        name: 'Referral Program',
        route: '/Profile/invite',
      },
      {
        name: 'More & $MORE Lottery',
        route: '/lottery',
      },
    ]
  },
  {
    name: 'Games',
    children: [
      {
        name: 'AstrArk',
        icon: AstrarkIcon,
        children: [
          {
            name: 'Game Download',
            route: '/AstrArk/Download',
          },
          {
            name: 'Pre-Registration',
            route: '/AstrArk/PreRegistration',
          },
          {
            name: 'Game Lore',
            route: '/AstrArk',
          },
        ],
      },
      {
        name: 'Bushwhack',
        route: '/Bushwhack',
        icon: BushwhackIcon,
      },
      {
        name: 'Gyoza',
        route: '',
        icon: FlamingPetsIcon,
      },
      {
        name: 'Mini Games',
        route: '',
        children: [
          {
            name: '2048',
            icon: Game2048Icon,
            route: '',
          },
          {
            name: '黄金矿工',
            route: '',
          },
          {
            name: 'TG小火箭',
            route: '',
          }
        ]
      }
    ]
  },
  {
    name: 'About',
    children: [
      {
        name: 'Moonveil Ecosystem- 3 layers',
        route: '',
      },
      {
        name: 'Our Team',
        route: '',
      },
      {
        name: 'Investors',
        route: '',
      },
      {
        name: 'News',
        route: '',
      },
      {
        name: 'Whitepaper',
        route: '',
      }
    ]
  },
  {
    name: 'My Assets',
    children: [
      {
        name: 'TETRA NFTs',
        children: [
          {
            name: 'Overview',
            route: '/NFT',
          },
          {
            name: 'TETRA Series Intro',
            route: '/TetraNFT',
          },
          {
            name: 'Lv2 TETRA Merge',
            route: '/NFT/Merge',
          },
        ]
      },
      {
        name: 'Node Sales',
        route: '',
      },
      {
        name: 'Staking',
        route: '',
      },
    ]
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
                <Component className="hover:fill-[#F6C799] hover:cursor-pointer fill-[rgba(255,255,255,.3)] transition-all w-7 h-7" />
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

  function isActiveRoute(menu: RouteMenu) {
    const route = router.asPath || '/';
    return menu.route === route || menu.children?.some((item) => item.route === route);
  }

  let mobileRoute: RouteMenu[] = routeText;
  if (isMobile) {
    for (let item of mobileRoute) {
      if (item.name === 'Rock’it to the Moon') {
        item.children = item.children?.filter((item) => item.name !== 'Loyalty Program');
      }
    }
  }
  return (
    <section className="header fixed left-0 top-0 w-full flex justify-between items-center z-50 pt-4 pl-9 pr-4">
      <div className="flex-[1]">
        <Link href="/">
          <Image className="w-[135px] h-[80px]" src={logo} alt="Logo" />
        </Link>
      </div>

      {/* <Entry2048 /> */}

      <div className="font-semakin flex items-center max-lg:hidden">
        {mobileRoute.map((value, index) => (
          <HeaderDropdownMenu item={value} key={index} isActive={!!isActiveRoute(value)} />
        ))}
      </div>

      <div className="flex items-center flex-[1] justify-end">
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

          <Notification />
        </div>

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

export default Header;
