import { ControlledMenu, MenuItem, useHover, useMenuState } from '@szhsin/react-menu';
import { useRef } from 'react';

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

  return (
    <>
      <div
        ref={menuRef}
        {...anchorProps}
        className={`cursor-pointer m-2 transition-all duration-300 hover:border-b-2 border-[#F6C799] hover:text-[#F6C799] ${
          isActive && 'text-[#F6C799] border-[#F6C799] border-b-2'
        } text-[22px] ml-8`}
      >
        Loyalty Program
      </div>
      <ControlledMenu className="pt-[1.4375rem] px-[2.625rem] pb-7" {...hoverProps} {...menuState} anchorRef={menuRef} theming="dark" onClose={() => toggle(false)}>
        {item.children!.map((child, ci) => (
          <MenuItem key={ci} onClick={() => onLinkClick?.(child.route)}>
            <span className="font-semakin uppercase text-lg hover:text-basic-yellow">{child.name}</span>
          </MenuItem>
        ))}
      </ControlledMenu>
    </>
  );
}
