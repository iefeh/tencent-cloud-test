import { Popover, PopoverContent, PopoverTrigger, Tooltip, cn } from '@nextui-org/react';
import { FC, useRef } from 'react';
import nftPassImg from 'img/loyalty/season/pass_nft.png';
import badgePassImg from 'img/loyalty/season/pass_badge.png';
import Image, { StaticImageData } from 'next/image';
import lockedIcon from 'img/loyalty/season/icon_locked.png';
import activedIcon from 'img/loyalty/season/icon_claimed.png';
import { CSSTransition } from 'react-transition-group';
import { Lottery } from '@/types/lottery';
import { LotteryRequirementType } from '@/constant/lottery';

interface Props {
  className?: string;
  float?: boolean;
  visible?: boolean;
  onRuleClick?: () => void;
}

const REQUIREMENT_ICONS: Dict<StaticImageData | string> = {
  [LotteryRequirementType.NFT]: nftPassImg,
  [LotteryRequirementType.BADGE]: badgePassImg,
  [LotteryRequirementType.WHITELIST]:
    'https://moonveil-public.s3.ap-southeast-2.amazonaws.com/pass/qualification/whitelist.png',
  [LotteryRequirementType.MB]:
    'https://moonveil-public.s3.ap-southeast-2.amazonaws.com/campaign/reward/moonbeam/small-bg.png',
};

const BattlePass: FC<Props & ItemProps<Lottery.Pool>> = ({ className, item, float, visible, onRuleClick }) => {
  const { user_meet_requirement = false, user_meet_requirement_type, requirement_description } = item || {};
  const nodeRef = useRef<HTMLDivElement>(null);
  const passList: { actived: boolean; img: StaticImageData | string }[] = [];

  const icon = REQUIREMENT_ICONS[user_meet_requirement_type || ''];
  if (icon) {
    passList.push({
      actived: !!user_meet_requirement,
      img: icon,
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
              <Image className="object-contain rounded-base" src={item.img} alt="" fill sizes="100%" unoptimized />

              <Image
                className="object-contain w-4 h-4 absolute -top-[0.1875rem] -right-[0.1875rem]"
                src={item.actived ? activedIcon : lockedIcon}
                alt=""
                unoptimized
              />
            </div>
          );

          if (item.actived) return passBody;

          return (
            <Popover key={index} placement="top">
              <PopoverTrigger>{passBody}</PopoverTrigger>

              <PopoverContent>
                <div>
                  <div className="text-lg">You need to meet the following condition:</div>
                  <div className="indent-6 mt-2">· {requirement_description || '--'}</div>
                </div>
              </PopoverContent>
            </Popover>
          );
        })}
      </div>
    </div>
  );

  if (!float) return content;

  return (
    <CSSTransition in={visible} classNames="transition-fade-left" nodeRef={nodeRef} timeout={800}>
      {content}
    </CSSTransition>
  );
};

export default BattlePass;
