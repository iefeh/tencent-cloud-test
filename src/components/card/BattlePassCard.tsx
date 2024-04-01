import { useBattlePassContext } from '@/store/BattlePass';
import { observer } from 'mobx-react-lite';
import { FC, useEffect } from 'react';
import Image from 'next/image';
import LGButton from '@/pages/components/common/buttons/LGButton';
import shortCardBgImg from 'img/common/battlepass/bg_card_short.png';
import longCardBgImg from 'img/common/battlepass/bg_card_long.png';
import { Progress, cn } from '@nextui-org/react';

interface Props {
  block?: boolean;
}

const BattlePassCard: FC<Props> = ({ block }) => {
  const { init } = useBattlePassContext();

  useEffect(() => {
    init();
  }, []);

  return (
    <div
      className={cn([
        'relative overflow-hidden rounded-[0.625rem] border-1 border-[#1D1D1D] flex flex-col justify-between pt-[2.375rem] pb-[3.25rem] pr-[10.5rem] pl-[2.1875rem] hover:border-basic-yellow transition-[border-color] duration-500',
        block ? 'w-full h-[18.75rem]' : 'w-[42.5rem] h-[13.75rem]',
      ])}
    >
      <Image className="object-cover" src={block ? longCardBgImg : shortCardBgImg} alt="" fill />

      <div className="relative z-0 font-semakin">
        <div className="text-base">Claim Your</div>
        <div className="text-2xl">
          <span className="bg-gradient-to-r from-[#CAA67E] to-[#EDE0B9] bg-clip-text text-transparent">
            Rock’it to the Moon
          </span>
          <span className="ml-2">Season Pass</span>
        </div>
      </div>

      <div className="flex gap-5 items-center relative z-0 w-[36.625rem]">
        <LGButton className="uppercase" label="Explore Now" link="/LoyaltyProgram/earn" actived />

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
          label="Lv.1"
          value={65}
          valueLabel="LV.2"
          showValueLabel={true}
        />
      </div>
    </div>
  );
};

export default observer(BattlePassCard);
