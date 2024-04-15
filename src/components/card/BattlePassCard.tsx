import { useBattlePassContext } from '@/store/BattlePass';
import { observer } from 'mobx-react-lite';
import { FC, useEffect } from 'react';
import Image from 'next/image';
import LGButton from '@/pages/components/common/buttons/LGButton';
import shortCardBgImg from 'img/common/battlepass/bg_card_short.png';
import longCardBgImg from 'img/common/battlepass/bg_card_long.png';
import highCardBgImg from 'img/common/battlepass/bg_card_high.png';
import ArrowRightSVG from 'svg/arrow_right.svg';
import { Progress, cn } from '@nextui-org/react';
import { throttle } from 'lodash';
import { useUserContext } from '@/store/User';
import { useRouter } from 'next/router';

interface Props {
  block?: boolean;
  /** 是否位于赛季前置页面 */
  noPass?: boolean;
}

const BattlePassCard: FC<Props> = ({ block, noPass }) => {
  const { userInfo, toggleLoginModal } = useUserContext();
  const { info, init, progressInfo, hasAcheivedFinalPass, createPass } = useBattlePassContext();
  const { max_lv, has_battle_pass } = info || {};
  const { periodProgress } = progressInfo || {};
  const router = useRouter();

  const onExplore = throttle(async () => {
    if (!userInfo) {
      toggleLoginModal(true);
      return;
    }

    if (!has_battle_pass) {
      await createPass();
    }

    router.push(noPass ? '/LoyaltyProgram/season' : '/LoyaltyProgram/season/foresight');
  }, 500);

  useEffect(() => {
    init();
  }, []);

  return (
    <div
      className={cn([
        'relative overflow-hidden rounded-[0.625rem] border-1 border-[#1D1D1D] flex flex-col justify-between pt-[2.375rem] pb-[3.25rem] pr-[10.5rem] pl-[2.1875rem] hover:border-basic-yellow transition-[border-color]',
        block ? 'w-full h-[18.75rem]' : 'w-[42.5rem] h-[13.75rem]',
        noPass && '!w-full !h-[32.5rem] !rounded-none !justify-center',
      ])}
    >
      <Image
        className="object-cover"
        src={noPass ? highCardBgImg : block ? longCardBgImg : shortCardBgImg}
        alt=""
        fill
      />

      <div className="relative z-0 font-semakin">
        <div className={cn([noPass ? 'text-2xl' : 'text-base'])}>Claim Your</div>
        <div className="text-2xl">
          <span
            className={cn([
              'from-[#CAA67E] to-[#EDE0B9] bg-clip-text text-transparent mr-2',
              noPass ? 'text-5xl bg-gradient-to-t inline-block mt-2' : 'bg-gradient-to-r',
            ])}
          >
            Rock’it to the Moon
          </span>
          {noPass && <br />}
          <span>Season Pass</span>
        </div>
      </div>

      <div className={cn(['flex gap-5 items-center relative z-0 w-[36.625rem]', noPass && 'mt-12'])}>
        <LGButton
          className="uppercase animate-breathShadow"
          label="Explore Now"
          actived
          suffix={noPass ? <ArrowRightSVG className="w-7 h-7" /> : undefined}
          onClick={onExplore}
        />

        {noPass || (
          <Progress
            size="sm"
            radius="sm"
            classNames={{
              base: 'max-w-md relative',
              track: 'drop-shadow-md border border-white/20 h-ten bg-transparent !rounded-none',
              indicator: '!bg-basic-yellow !rounded-none shadow-[-2rem_0_1rem_1rem_#F6C799]',
              labelWrapper: 'absolute w-full top-6 left-0 text-base',
              label: 'tracking-wider font-medium',
            }}
            label={`Lv.${max_lv || 0}${hasAcheivedFinalPass ? ' MAX' : ''}`}
            value={periodProgress * 100}
            valueLabel={hasAcheivedFinalPass ? ' ' : `Lv.${(max_lv || 0) + 1 || '--'}`}
            showValueLabel={true}
          />
        )}
      </div>
    </div>
  );
};

export default observer(BattlePassCard);
