import UserProfile from '@/pages/components/common/UserProfile';
import editImg from 'img/profile/edit.png';
import shareImg from 'img/profile/share.png';
import IconLink from '@/pages/components/common/buttons/IconLink';
import { useRouter } from 'next/router';
import { useRef } from 'react';
import { ControlledMenu, MenuItem, useHover, useMenuState } from '@szhsin/react-menu';
import profileIconImg from 'img/profile/icon_profile.png';
import linkIconImg from 'img/profile/icon_link.png';
import Image from 'next/image';

export default function ProfileHeader() {
  const router = useRouter();
  const menuRef = useRef(null);
  const [menuState, toggle] = useMenuState({ transition: true });
  const { anchorProps, hoverProps } = useHover(menuState.state, toggle);

  function onEditClick() {
    router.push('/Profile/edit');
  }

  return (
    <div className="w-full flex justify-between items-center">
      <UserProfile avatarClassName="w-[6.875rem] h-[6.875rem]" walletClassName="mt-4" />

      <span>
        <IconLink icon={editImg} label="Edit" onClick={onEditClick} />
        {/* <span ref={menuRef} {...anchorProps} className="ml-10">
          <IconLink icon={shareImg} label="Share" />

          <ControlledMenu
            className="pt-[1.4375rem] px-[2.625rem] pb-7"
            {...hoverProps}
            {...menuState}
            anchorRef={menuRef}
            theming="dark"
            onClose={() => toggle(false)}
          >
            <MenuItem>
              <Image width={24} height={24} src={profileIconImg} alt="" />
              <span className="ml-[0.875rem] font-poppins-medium uppercase text-[14px]">Share Profile</span>
            </MenuItem>

            <MenuItem>
              <Image width={24} height={24} src={profileIconImg} alt="" />
              <span className="ml-[0.875rem] font-poppins-medium uppercase text-[14px]">Copy Link</span>
            </MenuItem>
          </ControlledMenu>
        </span> */}
      </span>
    </div>
  );
}
