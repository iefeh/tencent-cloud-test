import BasicButton from '@/pages/components/common/BasicButton';
import { useBattlePassContext } from '@/store/BattlePass';
import { Tooltip, cn } from '@nextui-org/react';
import { observer } from 'mobx-react-lite';
import { FC, useRef } from 'react';
import nftPassImg from 'img/loyalty/season/pass_nft.png';
import badgePassImg from 'img/loyalty/season/pass_badge.png';
import buyPassImg from 'img/loyalty/season/pass_buy.png';
import Image, { StaticImageData } from 'next/image';
import lockedIcon from 'img/loyalty/season/icon_locked.png';
import activedIcon from 'img/loyalty/season/icon_claimed.png';
import Link from 'next/link';
import { URL_OPENSEA } from '@/constant/common';
import { CSSTransition } from 'react-transition-group';

interface Props {
  className?: string;
  float?: boolean;
  visible?: boolean;
  hideTitle?: boolean;
  onRuleClick?: () => void;
}

const BattlePass: FC<Props> = ({ className, float, visible, hideTitle, onRuleClick }) => {
  const { info } = useBattlePassContext();
  const { is_premium, premium_type, premium_source } = info || {};
  const nodeRef = useRef<HTMLDivElement>(null);
  const passList: { actived: boolean; img: StaticImageData | string }[] = [
    {
      actived: !!is_premium && info?.premium_type === 'nft',
      img: nftPassImg,
    },
    {
      actived: !!is_premium && info?.premium_type === 'badge',
      img: badgePassImg,
    },
    // {
    //   actived: info?.is_premium && info?.premium_type === 'whitelist',
    //   img: buyPassImg,
    // },
  ];

  if (is_premium && premium_type === 'whitelist') {
    passList.push({
      actived: true,
      img: 'https://moonveil-public.s3.ap-southeast-2.amazonaws.com/pass/qualification/whitelist.png',
    });
  }

  const content = (
    <div ref={nodeRef} className={cn(['flex flex-col items-center', className])}>
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
              <Image className="object-contain rounded-base" src={item.img} alt="" fill sizes="100%" />

              <Image
                className="object-contain w-4 h-4 absolute -top-[0.1875rem] -right-[0.1875rem]"
                src={item.actived ? activedIcon : lockedIcon}
                alt=""
              />
            </div>
          );

          let tooltipContent: JSX.Element | null = null;

          if (index === 0) {
            tooltipContent = (
              <div className="max-w-[31.25rem] py-4 px-7">
                TETRA Holder: TETRA NFT holders are eligible to claim the Premium Pass{' '}
                <span className="text-basic-yellow">during the holding period</span>.{' '}
                <Link className="underline text-basic-yellow" href={URL_OPENSEA} target="_blank">
                  Get TETRA Now
                </Link>
              </div>
            );
          } else if (index === 1) {
            tooltipContent = (
              <div className="max-w-[31.25rem] py-4 px-7">
                Your Premium Season Pass is unlocked because you are a holder of{' '}
                <span className="text-basic-yellow">{premium_source || '--'}</span>.
              </div>
            );
          } else if (index === 2) {
            tooltipContent = (
              <div className="max-w-[31.25rem] py-4 px-7">
                Your Premium Season Pass is unlocked because you are a holder of Moonveil Premium Pass whitelist.
              </div>
            );
          }

          return (
            <Tooltip key={index} content={tooltipContent}>
              {passBody}
            </Tooltip>
          );
        })}
      </div>

      <div className={cn(['font-semakin text-3xl text-basic-yellow uppercase w-max mt-3', hideTitle && 'hidden'])}>
        Premium Pass
      </div>

      {is_premium ? (
        <BasicButton className="uppercase w-max mt-3" label="Premium Pass Activated" disabled />
      ) : (
        <Tooltip
          classNames={{ content: 'bg-[#141414] p-7 rounded-base border-1 border-[#2A2A2A]' }}
          content={
            <div className="max-w-[31.25rem]">
              <p>If you meet any of the following conditions, you can claim the Premium Pass for free.</p>
              <p className="mt-2">
                - TETRA Holder: TETRA NFT holders are eligible to claim the Premium Pass{' '}
                <span className="text-basic-yellow">during the holding period</span>.{' '}
                <Link className="text-basic-yellow underline" href={URL_OPENSEA}>
                  Get TETRA Now
                </Link>
              </p>

              <p className="mt-2">
                - BADGE: Users holding selected high-level Badges can also claim the Premium Pass. Details can be found
                in the{' '}
                <span className="text-basic-yellow cursor-pointer underline" onClick={onRuleClick}>
                  Rules
                </span>
              </p>

              {/* <p>
                - Purchase: You can also purchase the Premium Battle Pass from{' '}
                <span className="text-basic-yellow cursor-pointer underline">here</span>
              </p> */}
            </div>
          }
        >
          <div>
            <BasicButton className="uppercase w-max mt-3" label="Upgrade to Premium Pass" />
          </div>
        </Tooltip>
      )}
    </div>
  );

  if (!float) return content;

  return (
    <CSSTransition in={visible} classNames="transition-fade-left" nodeRef={nodeRef} timeout={800}>
      {content}
    </CSSTransition>
  );
};

export default observer(BattlePass);
