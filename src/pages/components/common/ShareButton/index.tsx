import { Card, CardBody } from '@nextui-org/react';
import Image from 'next/image';
import shareImg from 'img/icon/share.png';
import { useRef } from 'react';
import { ControlledMenu, MenuItem, useHover, useMenuState } from '@szhsin/react-menu';

export default function ShareButton() {
  const anchorRef = useRef(null);
  const [menuState, toggle] = useMenuState({ transition: true });
  const { anchorProps, hoverProps } = useHover(menuState.state, toggle);

  const menus = [
    {
      label: 'Twitter',
      icon: '/img/loyalty/task/twitter.png',
      activeIcon: '/img/loyalty/task/twitter_active.png',
    },
    {
      label: 'Copy Link',
      icon: '/img/loyalty/task/link.png',
      activeIcon: '/img/loyalty/task/link_active.png',
    },
  ];

  return (
    <>
      <Card ref={anchorRef} {...anchorProps} className="basic-card">
        <CardBody className="flex-row items-center font-poppins-medium text-sm px-4">
          <Image className="w-[0.9375rem] h-[0.9375rem]" src={shareImg} alt="" />
          <p className="ml-[0.9375rem]">Share</p>
        </CardBody>
      </Card>

      <ControlledMenu
        {...hoverProps}
        {...menuState}
        anchorRef={anchorRef}
        menuClassName="translate-y-[0.9375rem]"
        menuStyle={{ backgroundColor: '#1A1917', borderRadius: '0.5rem' }}
        theming="dark"
        align='center'
        onClose={() => toggle(false)}
      >
        {menus.map((menu, index) => (
          <MenuItem key={index} className="hover:!bg-[#1A1917] hover:text-basic-yellow">
            <Image className="w-4 h-4" width={16} height={16} src={menu.icon} alt="" />
            <span className="font-poppins-medium text-[14px] ml-[0.9375rem]">{menu.label}</span>
          </MenuItem>
        ))}
      </ControlledMenu>
    </>
  );
}
