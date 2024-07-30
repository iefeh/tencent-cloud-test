import { createPortal } from 'react-dom';
import { useRouter } from 'next/router';
import MediaIconBar from '../../../../components/common/MediaIconBar';
import styles from './index.module.scss';
import { routeText } from '../Header'
import { cn } from '@nextui-org/react';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import { Accordion, AccordionItem } from '@nextui-org/react';

interface Props {
  visible?: boolean;
  onClose?: () => void;
}

export default function Sidebar({ visible, onClose }: Props) {
  const router = useRouter(); 

  const [curMenu, setCurMenu] = useState<string>('');

  useEffect(() => {
    if (visible) {
      setCurMenu('')
    }
  }, [visible])

  const menuSwitch = (name: string) => {
    if (curMenu === name) {
      setCurMenu('')
    } else {
      setCurMenu(name)
    }
  }

  function onLinkClick(value: RouteMenu, level: number = 1) {
    const { route, name } = value || {}
    // 一级菜单点击
    if (level === 1) menuSwitch(name) 

    if (!route) return;

    try {
      window.luxy.disable();
      router.push(route);
      window.luxy.wrapper.style.transform = 'translate3d(0, 0, 0)';
      window.luxy.enable();
      onClose && onClose();
    } catch (error) {
      console.log(error);
    }
  }

  if (!visible) return null;

  const renderIcon = (path: string | undefined) => {
    if (!path) return null;
    return (
      <Image  
        className={cn([
          'object-contain',
          styles.menuIcon
        ])} 
        src={path}
        alt=''
      ></Image>
    )
  }

  const renderHeader = (value: RouteMenu) => (
    <div 
      className={cn([
        styles.sidebarHeader,
        curMenu === value.name && 'text-[#F6C799]'
      ])} 
      onClick={() => onLinkClick(value)}
    >
      {value.name}
    </div>
  )

  return createPortal(
    <div
      className="sidebar max-sm:pt-[80px] max-sm:justify-around max-lg:flex fixed left-0 top-0 w-full h-screen bg-black z-30 flex flex-col overflow-y-auto"
      onScroll={(e) => e.stopPropagation()}
    >
      <Accordion className={cn([
        styles.sidebarWrapper,
        "content flex-1 flex flex-col font-semakin padding"
      ])}>

        {routeText.map((value, index) => (
          <AccordionItem
            hideIndicator={!(value.children && value.children.length > 0)}
            key={index}
            classNames={{
              base: '!p-0 !bg-transparent',
              heading: cn([
                curMenu === value.name && 'border-b-2 border-[#EBDDB6]'
              ]),
              title: 'py-[1rem]',
              indicator: cn(['text-4xl', 'rotate-180', curMenu === value.name && 'text-[#EBDDB6]']) ,
              content: 'py-0',
            }}
            title={renderHeader(value)}
          >
            {/* 二三级菜单展示 */}
            {
              <div>
                {value.children?.map((child, ci) => {
                  return (
                    <div 
                      key={ci}
                      className={styles.sidebarSubMenu}
                      onClick={() => onLinkClick(child, 2)}
                    >
                      {renderIcon(child.icon)}
                      {child.name}

                      { 
                        child.children && child.children.length > 0 && 
                        <div className={styles.sidebarThreeLevel}>
                          {
                            child.children?.map((item, i) => {
                              return (
                                <div 
                                  key={i} 
                                  onClick={() => onLinkClick(child, 3)}
                                >
                                  {renderIcon(item.icon)}
                                  {item.name}
                                </div>
                              )
                            }) 
                          }
                        </div>
                      }
                      
                      <div className={styles.spaceBar}></div>
                    </div>
                  )
                })}
              </div>
            }
          </AccordionItem>
        ))}
      </Accordion>

      <MediaIconBar className={'max-sm:h-48 h-60 flex justify-center items-center ' + styles.sidebarMediaIcons} />
    </div>,
    document.body,
  );
}
