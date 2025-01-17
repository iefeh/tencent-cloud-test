import { useUserContext } from "@/store/User";
import { useState } from "react";

export default function useNavMenus() {
  const { hasNewPool } = useUserContext();
  const [menus, setMenus] = useState<RouteMenu[]>(getBaseMenu());

  function getBaseMenu() {
    const list: RouteMenu[] = [
      { name: 'Home', route: '/' },
      {
        name: 'Loyalty Program',
        isNew: hasNewPool,
        children: [
          {
            name: 'Introduction',
            route: '/LoyaltyProgram/intro',
            children: [
              {
                name: 'Moonveil Badge Introduction',
                route:
                  'https://medium.com/@Moonveil_Studio/unlock-achievements-reap-rewards-the-moonveil-badge-system-unveiled-26c94eca97b5',
              },
              {
                name: 'My Badges',
                route: '/Profile/MyBadges',
              },
            ],
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
                route: '/LoyaltyProgram/earn?tabKey=Events',
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
            ],
          },
          {
            name: 'Referral Program',
            route: '/Profile/invite',
          },
          {
            name: 'More & $MORE Draw',
            route: '/draw',
            actived: true,
            isNew: hasNewPool,
          },
        ],
      },
      {
        name: 'Games',
        children: [
          {
            name: 'AstrArk',
            icon: '/header/icons/astrark.png',
            route: '/AstrArk',
            children: [
              {
                name: 'Pre-Registration',
                route: '/AstrArk/PreRegistration',
              },
              {
                name: 'Game Lore',
                route: '/AstrArk',
              },
              {
                name: 'Marching Test Tasks',
                route: '/LoyaltyProgram/earn?id=c8af9477-fd48-4265-90d7-20bc4a200ff3&tabKey=AstrArk',
              },
              {
                name: 'Marching Test',
                route: '/AstrArk/Download',
              },
              {
                name: 'IAP Return Query',
                route: '/AstrArk/cbt-iap',
              },
            ],
          },
          {
            name: 'Bushwhack',
            route: '/Bushwhack',
            icon: '/header/icons/bushwhack.png',
          },
          // {
          //   name: 'Gyoza',
          //   route: '',
          //   icon: FlamingPetsIcon,
          // },
          {
            name: 'Mini Games',
            route: '/minigames',
            // disabled: true,
            children: [
              {
                name: '2048',
                icon: '/header/icons/2048.png',
                route: '/minigames/details/b3bde096-1ab6-4a5e-be03-eb08c0cb5856',
                // disabled: true,
              },
              {
                name: 'Puffy Miner',
                icon: '/minigames/icons/icon_miner.png',
                route: '/minigames/details/1bcb51aa-bab1-476d-b09a-f20d103d16d0',
              },
              // {
              //   name: 'TG小火箭',
              //   route: '',
              // }
              {
                name: 'Puffy Match',
                icon: '/game/bubble_pop/icon.png',
                route: '/minigames/details/732ec3be-4c6a-40f0-a5b0-63f81e3c073f',
              },
            ],
          },
        ],
      },
      {
        name: 'About',
        children: [
          {
            name: 'Moonveil Ecosystem',
            route: '/About',
          },
          {
            name: 'Our Team',
            route: '/About/OurTeam',
          },
          {
            name: 'Investors',
            route: '/About/Investors',
          },
          // {
          //   name: 'News',
          //   route: '',
          // },
          // {
          //   name: 'Whitepaper',
          //   route: '',
          // }
        ],
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
            ],
          },
          {
            name: 'Muse Node',
            route: process.env.NEXT_PUBLIC_URL_NODE_SALE,
          },
          // {
          //   name: 'Staking',
          //   route: '',
          // },
        ],
      },
    ];

    return list;
  }

  return { menus };
}
