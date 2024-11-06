import useWallet from '@/hooks/useWallet';
import LGButton from '@/pages/components/common/buttons/LGButton';
import { copyText, formatWallectAddress } from '@/utils/common';
import { observer } from 'mobx-react-lite';
import Image from 'next/image';
import { FC } from 'react';

const ConnectContent: FC = () => {
  const { connectLabel, address, connected, onConnect } = useWallet();

  return connected ? (
    <div className="relative w-[14.8125rem] h-9 flex justify-between items-center flex-nowrap pl-9 pr-2">
      <Image
        className="object-contain"
        src="https://d3dhz6pjw7pz9d.cloudfront.net/pledge/bg_card_address.png"
        alt=""
        fill
        unoptimized
      />

      <div className="relative z-0 flex-1 overflow-hidden text-ellipsis whitespace-nowrap mr-2">
        {formatWallectAddress(address || '--')}
      </div>

      <Image
        className="relative z-0 w-[1.1875rem] h-[1.375rem] cursor-pointer"
        src="https://d3dhz6pjw7pz9d.cloudfront.net/pledge/icons/icon_copy.png"
        alt=""
        width={19}
        height={22}
        unoptimized
        onClick={() => copyText(address as string)}
      />
    </div>
  ) : (
    <LGButton className="uppercase" label={connectLabel} actived onClick={onConnect} />
  );
};

export default observer(ConnectContent);
