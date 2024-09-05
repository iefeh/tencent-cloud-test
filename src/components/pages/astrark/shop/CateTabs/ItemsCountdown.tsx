import { FC, useState } from 'react';
import { CateTab } from '../model';
import S3Image from '@/components/common/medias/S3Image';
import useCountdown from '@/hooks/useCountdown';
import dayjs from 'dayjs';

const ItemsCountdown: FC<ItemProps<CateTab>> = ({ item }) => {
  const [timeoutText, setTimeoutText] = useState('-');
  useCountdown(item?.endTime || dayjs().valueOf(), dayjs().valueOf(), (left) => {
    const du = dayjs.duration(left);
    const hours = ~~du.asHours();
    const mins = du.minutes();
    const secs = du.seconds();

    const text = `${hours}hour(s) ${mins}minute(s) ${secs}seconds`;
    setTimeoutText(text);
  });

  return (
    item?.endTime && (
      <div className="flex items-center absolute right-0 top-3">
        <S3Image className="object-contain w-[1.125rem] aspect-square" src="/astrark/shop/icons/icon_timeout.png" />

        <span className="ml-[0.375rem]">{timeoutText}</span>
      </div>
    )
  );
};

export default ItemsCountdown;
