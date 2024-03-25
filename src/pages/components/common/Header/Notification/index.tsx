import useScrollLoad from '@/hooks/useScrollLoad';
import {
  NotificationItem,
  queryNotificationPageListAPI,
  readAllNotificationsAPI,
  readNotificationAPI,
} from '@/http/services/notification';
import { MobxContext } from '@/pages/_app';
import { Badge, Button, cn } from '@nextui-org/react';
import { ControlledMenu, useClick } from '@szhsin/react-menu';
import { observer } from 'mobx-react-lite';
import Image from 'next/image';
import { FC, useContext, useEffect, useRef, useState } from 'react';
import NotiSvg from 'svg/notify.svg';
import CheckSvg from 'svg/check.svg';
import closeIcon from 'img/icon/icon_close.png';
import styles from './index.module.css';
import LGButton from '../../buttons/LGButton';
import { throttle } from 'lodash';
import useLoopQuery from '@/hooks/useLoopQuery';

const Notification: FC = () => {
  const { userInfo } = useContext(MobxContext);
  const [hasUnread, setHasUnread] = useState(false);
  const [readLoading, setReadLoading] = useState(false);
  const { data, scrollRef, queryData, loading, refreshScroll } = useScrollLoad({
    watchAuth: true,
    queryKey: 'data',
    queryFn: async (params) => {
      const res = await queryNotificationPageListAPI(params);
      setHasUnread(!!res?.has_unread);
      return res;
    },
  });
  const anchorRef = useRef(null);
  const [isOpen, setOpen] = useState(false);
  const anchorProps = useClick(isOpen, setOpen);

  useLoopQuery(() => queryData(true), 60000);

  function onClose() {
    setOpen(false);
  }

  const onGo = throttle(async (item?: NotificationItem | null, isAll = false) => {
    if (!isAll && (!item || !item.notification_id)) return;

    if (item?.link) window.open(item.link, '_blank');
    const noti = isAll ? data[0] : item;
    const notification_id = noti?.notification_id || '';
    if (!notification_id) return;
    if (isAll) setReadLoading(true);
    const reqData = { notification_id };

    const api = isAll ? readAllNotificationsAPI : readNotificationAPI;
    const res = await api(reqData);
    if (res.success) {
      await queryData(true);
    }

    if (isAll) setReadLoading(false);
  }, 500);

  useEffect(() => {
    if (isOpen) refreshScroll();
  }, [isOpen]);

  const notiContent = (
    <div className="px-3">
      <div ref={scrollRef} className="h-[29.5rem] overflow-hidden relative">
        <ul className="py-6 pt-ten flex flex-col">
          {data.length > 0 ? (
            data.map((item) => (
              <li
                key={item!.notification_id}
                className={cn([
                  'noti-item px-6 pt-4 border-white/10 [&+.noti-item]:border-t-1 [&+.noti-item]:mt-4 text-sm leading-6 cursor-pointer relative',
                  item?.readed ? 'text-white/30' : 'text-white',
                ])}
                onClick={() => onGo(item)}
              >
                <div>{item?.content}</div>
                {item?.link && (
                  <LGButton
                    className={cn(['mt-4', item?.readed && 'border-white/30 text-white/30'])}
                    label="GO"
                    onClick={() => onGo(item)}
                  />
                )}

                {item?.readed || (
                  <div className="absolute w-[0.375rem] h-[0.375rem] rounded-full bg-[#FF3333] left-ten top-6"></div>
                )}
              </li>
            ))
          ) : (
            <li className="text-lg leading-[18.75rem] text-center">No notifications.</li>
          )}
        </ul>
      </div>
    </div>
  );

  if (!userInfo) return null;

  return (
    <>
      <div ref={anchorRef} className="inline-block" {...anchorProps}>
        <Badge
          isOneChar
          className={cn(['w-[0.375rem] h-[0.375rem] bg-[#FF3333]', hasUnread || 'hidden'])}
          content=""
          shape="circle"
          placement="top-right"
          showOutline={false}
          size="sm"
        >
          <NotiSvg className="hover:fill-basic-yellow hover:cursor-pointer fill-white/30 transition-all w-7 h-7" />
        </Badge>

        <ControlledMenu
          className={styles.notificationMenuContainer}
          theming="dark"
          state={isOpen ? 'open' : 'closed'}
          align="end"
          anchorRef={anchorRef}
          onClose={onClose}
        >
          <div className="flex justify-between items-center bg-[url('/img/profile/bg_notification.png')] bg-no-repeat bg-contain h-16 px-6 shrink-0">
            <span className="text-lg">Notification</span>

            <Image
              className="w-4 h-4 object-contain cursor-pointer"
              src={closeIcon}
              alt=""
              sizes="100%"
              onClick={onClose}
            />
          </div>

          {notiContent}

          <Button
            className="bg-[#141414] rounded-none h-16 text-light-gray"
            startContent={<CheckSvg className="w-5 h-5 fill-light-gray" />}
            disabled={!hasUnread || loading}
            isLoading={readLoading}
            onClick={() => onGo(null, true)}
          >
            Mark all as read
          </Button>
        </ControlledMenu>
      </div>
    </>
  );
};

export default observer(Notification);
