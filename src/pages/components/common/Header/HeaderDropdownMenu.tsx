import { cn, menu } from '@nextui-org/react';
import { ControlledMenu, MenuItem, useClick, useMenuState, MenuState} from '@szhsin/react-menu';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { toast } from 'react-toastify';
import styles from './index.module.scss'
import Image from 'next/image';

interface Props {
  item: RouteMenu;
  isActive: boolean;
}

/** 渲染基础菜单基础 item 样式  */
export const menuItemComp = (child: RouteMenu, ci: number, level: number) => {
  const isHttpUrl = child.route?.startsWith('http');

  const url = isHttpUrl ? '' : child.route;
  function onTextClick(item: RouteMenu) {
    if (isHttpUrl) {
      window.open(item.route);
      return
    }
    if (!item.disabled) return;
    toast.info('Coming Soon');
  }

  return (
    <MenuItem key={child.name} disabled={child.disabled}>
      <Link
        className={cn([
          'font-poppins uppercase',
          child.disabled ? 'text-[#666]' : 'hover:text-basic-yellow',
        ])}
        href={(!child.disabled && url) || ''}
        onClick={() => onTextClick(child)}
      >
        { child.icon &&
          <Image
            className={cn([
              'object-contain',
              styles.itemIcon
            ])}
            src={child.icon}
            alt=""
          />
        }
        {child.name}
      </Link>
    </MenuItem>
  )
}

export default function HeaderDropdownMenu(props: Props) {
  const { item, isActive } = props;
  const menuRef = useRef(null);
  const [menuState, toggle] = useMenuState({ transition: true });
  const anchorProps= useClick(menuState.state, toggle);

  const mainContent = (
    <Link
      ref={menuRef}
      {...anchorProps}
      href={item.route || ''}
      className={cn([
        'cursor-pointer m-2 transition-all duration-300 border-b-2 border-transparent hover:border-[#F6C799] hover:text-[#F6C799] text-[22px] ml-8 relative z-10',
        isActive && 'text-[#F6C799] border-[#F6C799]',
      ])}
    >
      {item.name}
    </Link>
  );

  if (!item.children) return mainContent;


  const renderFlexibleIcon = () => {

  }


  return (
    <>
      {mainContent}

      <ControlledMenu
        className="pt-[1.4375rem] px-[2.625rem] pb-7"
        {...menuState}
        anchorRef={menuRef}
        theming="dark"
        onClose={() => toggle(false)}
        align="center"
      >
        <div className={styles.container}>
          {item.children!.map((child, ci) => (
            <div className={styles.itemWarpper} key={ci}>
              <div className={styles.secondLevelItem}>
                {menuItemComp(child, ci, 2)}
              </div>

              <div className={styles.threeLevelItem}>
                {(child.children || [])!.map(item => (
                  menuItemComp(item, ci, 3)
                ))}
              </div>
            </div>
          ))}
        </div>
      </ControlledMenu>
    </>
  );
}
