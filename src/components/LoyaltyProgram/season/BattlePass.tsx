import BasicButton from '@/pages/components/common/BasicButton';
import { useBattlePassContext } from '@/store/BattlePass';
import { Tooltip, cn } from '@nextui-org/react';
import { observer } from 'mobx-react-lite';
import { FC } from 'react';
import nftPassImg from 'img/loyalty/season/pass_nft.png';
import badgePassImg from 'img/loyalty/season/pass_badge.png';
import buyPassImg from 'img/loyalty/season/pass_buy.png';
import Image from 'next/image';
import lockedIcon from 'img/loyalty/season/icon_locked.png';
import activedIcon from 'img/loyalty/season/icon_claimed.png';
import Link from 'next/link';
import { URL_OPENSEA } from '@/constant/common';

interface Props {
  className?: string;
}

const BattlePass: FC<Props> = ({ className }) => {
  const { info } = useBattlePassContext();
  const { is_premium } = info || {};
  const passList = [
    {
      actived: false,
      img: nftPassImg,
    },
    {
      actived: false,
      img: badgePassImg,
    },
    {
      actived: false,
      img: buyPassImg,
    },
  ];

  return (
    <div className={cn(['flex flex-col items-center', className])}>
      <div className="flex items-center gap-ten">
        {passList.map((item, index) => {
          const passBody = (
            <div
              key={index}
              className={cn([
                'relative w-[3.125rem] h-[3.125rem] border-1 rounded-base',
                item.actived ? 'border-basic-yellow' : 'border-[#2C2C2C]',
              ])}
            >
              <Image className="object-contain" src={item.img} alt="" fill sizes="100%" />

              <Image
                className="object-contain w-4 h-4 absolute -top-[0.1875rem] -right-[0.1875rem]"
                src={item.actived ? activedIcon : lockedIcon}
                alt=""
              />
            </div>
          );

          if (index !== 0) return passBody;

          return (
            <Tooltip
              key={index}
              content={
                <div className="max-w-[31.25rem] py-4 px-7">
                  TETRA Holder: TETRA NFT holders are eligible to claim the Premium Pass{' '}
                  <span className="text-basic-yellow">during the holding period</span>.{' '}
                  <Link className="underline text-basic-yellow" href={URL_OPENSEA} target="_blank">
                    Get TETRA Now
                  </Link>
                </div>
              }
            >
              {passBody}
            </Tooltip>
          );
        })}
      </div>

      <div className="font-semakin text-3xl text-basic-yellow uppercase w-max mt-3">Premium Pass</div>

      <BasicButton
        className="uppercase w-max mt-3"
        label={is_premium ? 'Premium Pass Activated' : 'Upgrade to Premium Pass'}
        disabled={!!is_premium}
      />
    </div>
  );
};

export default observer(BattlePass);
