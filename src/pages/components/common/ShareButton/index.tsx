import { Card, CardBody } from '@nextui-org/react';
import Image from 'next/image';
import shareImg from 'img/icon/share.png';
import { useRef } from 'react';
import { ControlledMenu, MenuItem, useHover, useMenuState } from '@szhsin/react-menu';
import { toast } from 'react-toastify';

export default function ShareButton() {
  const anchorRef = useRef(null);
  const [menuState, toggle] = useMenuState({ transition: true });
  const { anchorProps, hoverProps } = useHover(menuState.state, toggle);

  const menus = [
    // {
    //   label: 'Twitter',
    //   value: 'twitter',
    //   icon: '/img/loyalty/task/twitter.png',
    //   activeIcon: '/img/loyalty/task/twitter_active.png',
    // },
    {
      label: 'Copy Link',
      value: 'copy',
      icon: '/img/loyalty/task/link.png',
      activeIcon: '/img/loyalty/task/link_active.png',
    },
  ];

  async function onMenuClick(e: any) {
    const url = location.href;

    switch (e.value) {
      case 'twitter':
        const text = "Join @AstrArk_World's Alpha Test for a chance to win a Destiny TETRA NFT whitelist!\nLog in now!";
        const hashtags = ['AstrArk'];
        const intentURL = `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(
          text,
        )}&hashtags=${hashtags.join(',')}`;
        window.open(intentURL, '_blank');
        break;
      case 'copy':
        try {
          await navigator.clipboard.writeText(url || '');
          toast.success('Copied!');
        } catch (error: any) {
          toast.error(error?.message || error);
        }
        break;
    }
  }

  return (
    <>
      <Card ref={anchorRef} {...anchorProps} className="basic-card">
        <CardBody className="flex-row items-center font-poppins-medium text-sm !px-3">
          <Image className="w-[0.9375rem] h-[0.9375rem]" src={shareImg} alt="" />
          <p className="ml-[0.9375rem]">Share</p>
        </CardBody>
      </Card>

      <ControlledMenu
        {...hoverProps}
        {...menuState}
        anchorRef={anchorRef}
        theming="dark"
        align="center"
        onItemClick={onMenuClick}
        onClose={() => toggle(false)}
      >
        {menus.map((menu, index) => (
          <MenuItem key={index} value={menu.value} className="hover:text-basic-yellow">
            <Image className="w-4 h-4" width={16} height={16} src={menu.icon} alt="" />
            <span className="font-poppins-medium text-[14px] ml-[0.9375rem]">{menu.label}</span>
          </MenuItem>
        ))}
      </ControlledMenu>
    </>
  );
}
