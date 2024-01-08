import { cn } from '@nextui-org/react';
import { ControlledMenu, MenuItem, useHover, useMenuState } from '@szhsin/react-menu';
import { useRef } from 'react';
import { toast } from 'react-toastify';

interface Props {
  item: RouteMenu;
  isActive: boolean;
  onLinkClick?: (path?: string) => void;
}

export default function HeaderDropdownMenu(props: Props) {
  const { item, isActive, onLinkClick } = props;
  const menuRef = useRef(null);
  const [menuState, toggle] = useMenuState({ transition: true });
  const { anchorProps, hoverProps } = useHover(menuState.state, toggle);

  function onTextClick(item: RouteMenu) {
    if (!item.disabled) return;
    toast.info('Coming Soon');
    return;
  }

  return (
    <>
      <div
        ref={menuRef}
        {...anchorProps}
        className={`cursor-pointer m-2 transition-all duration-300 border-b-2 border-transparent hover:border-[#F6C799] hover:text-[#F6C799] ${
          isActive && 'text-[#F6C799] border-[#F6C799] border-b-2'
        } text-[22px] ml-8`}
      >
        {item.name}
      </div>
      <ControlledMenu
        className="pt-[1.4375rem] px-[2.625rem] pb-7"
        {...hoverProps}
        {...menuState}
        anchorRef={menuRef}
        theming="dark"
        onClose={() => toggle(false)}
      >
        {item.children!.map((child, ci) => (
          <MenuItem key={ci} disabled={child.disabled} onClick={() => onLinkClick?.(child.route)}>
            <span
              className={cn([
                'font-semakin uppercase text-lg',
                child.disabled ? 'text-[#666]' : 'hover:text-basic-yellow',
              ])}
              onClick={() => onTextClick(child)}
            >
              {child.name}
            </span>
          </MenuItem>
        ))}
      </ControlledMenu>
    </>
  );
}
