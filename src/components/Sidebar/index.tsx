import { createPortal } from 'react-dom';
import { useRouter } from 'next/router';
import MediaIconBar from '@/components/common/MediaIconBar';
import styles from './index.module.scss';
import { routeText } from '../Header'
import { cn } from '@nextui-org/react';
import Image from 'next/image';
import React, { useEffect, useState } from 'react';
import { Accordion, AccordionItem } from '@nextui-org/react';

interface Props {
  visible?: boolean;
  onClose?: () => void;
}

export default function Sidebar({ visible, onClose }: Props) {
  const router = useRouter();

  function onLinkClick(value: RouteMenu) {
    const { route } = value || {}

    if (!route) return;

    if (route?.startsWith('http')) {
      window.open(route);
      onClose && onClose();
      return
    }

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
      key={value.name}
      className={cn([
        styles.sidebarHeader,
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
              base: cn([
                '!bg-transparent px-[4.5rem]',
                'data-[open=true]:bg-gradient-to-r from-[#342D27] to-[#141310] rounded-2xl'
              ]),
              heading: cn([
                "data-[open=true]:border-b-2 border-[#EBDDB6] !text-[#F6C799]"
              ]),
              title: 'py-[1rem] data-[open=true]:text-[#F6C799]',
              indicator: cn([
                'text-4xl', 'rotate-180',
                'data-[open=true]:text-[#EBDDB6]']),
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
                      key={child.name}
                      className={styles.sidebarSubMenu}
                    >
                      <div onClick={() => onLinkClick(child)}>
                        {renderIcon(child.icon)}
                        {child.name}
                      </div>

                      {
                        child.children && child.children.length > 0 &&
                        <div className={styles.sidebarThreeLevel}>
                          {
                            child.children?.map((item, i) => {
                              return (
                                <div
                                  key={i}
                                  onClick={() => onLinkClick(item)}
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

      <MediaIconBar className={'max-sm:h-48 h-60 flex flex-shrink-0 justify-center items-center ' + styles.sidebarMediaIcons} />
    </div>,
    document.body,
  );
}
