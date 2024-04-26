import { cn } from '@nextui-org/react';
import { ControlledMenu, MenuItem, useHover, useMenuState } from '@szhsin/react-menu';
import Link from 'next/link';
import { useRef } from 'react';
import { toast } from 'react-toastify';

interface Props {
  item: RouteMenu;
  isActive: boolean;
}

export default function HeaderDropdownMenu(props: Props) {
  const { item, isActive } = props;
  const menuRef = useRef(null);
  const [menuState, toggle] = useMenuState({ transition: true });
  const { anchorProps, hoverProps } = useHover(menuState.state, toggle);

  function onTextClick(item: RouteMenu) {
    if (!item.disabled) return;
    toast.info('Coming Soon');
  }

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

  return (
    <>
      {mainContent}

      <ControlledMenu
        className="pt-[1.4375rem] px-[2.625rem] pb-7"
        {...hoverProps}
        {...menuState}
        anchorRef={menuRef}
        theming="dark"
        onClose={() => toggle(false)}
      >
        {item.children!.map((child, ci) => (
          <MenuItem key={ci} disabled={child.disabled}>
            <Link
              className={cn([
                'font-semakin uppercase text-lg',
                child.disabled ? 'text-[#666]' : 'hover:text-basic-yellow',
              ])}
              href={(!child.disabled && child.route) || ''}
              onClick={() => onTextClick(child)}
            >
              {child.name}
            </Link>
          </MenuItem>
        ))}
      </ControlledMenu>
    </>
  );
}
