import { useBattlePassContext } from '@/store/BattlePass';
import { observer } from 'mobx-react-lite';
import { FC, useEffect } from 'react';
import LGButton from '@/pages/components/common/buttons/LGButton';
import ArrowRightSVG from 'svg/arrow_right.svg';
import { Progress, cn, useDisclosure } from '@nextui-org/react';
import { throttle } from 'lodash';
import { useUserContext } from '@/store/User';
import { useRouter } from 'next/router';
import Image from 'next/image';
import BattlePass from '../LoyaltyProgram/season/BattlePass';
import RuleButton from '../LoyaltyProgram/season/RuleButton';
import RuleModal from '../LoyaltyProgram/season/RuleModal';
import CircularLoading from '@/pages/components/common/CircularLoading';
import { isMobile } from 'react-device-detect';
import S3Image from '../common/medias/S3Image';

interface Props {}

const TaskPassCard: FC<Props> = ({}) => {
  const { userInfo } = useUserContext();
  const { info, init, progressInfo, hasAcheivedFinalPass, createPass } = useBattlePassContext();
  const { max_lv } = info || {};
  const { periodProgress } = progressInfo || {};
  const { isOpen, onOpen, onOpenChange } = useDisclosure();

  useEffect(() => {
    init();
  }, []);

  return (
    <div
      className={cn([
        'relative overflow-hidden flex items-center bg-black',
        'w-full h-[12.5rem] py-[3.125rem] pr-[10.5rem] pl-[2.8125rem]',
        'rounded-[0.625rem] border-1 border-[#1D1D1D] transition-[border-color] hover:border-basic-yellow',
        isMobile && 'flex-col h-auto !px-4',
      ])}
    >
      <div className="relative w-[6.25rem] h-[6.25rem] border-1 border-basic-yellow rounded-full overflow-hidden shrink-0">
        {userInfo?.avatar_url && <S3Image className="object-cover" src={userInfo.avatar_url} fill />}
      </div>

      <div className={cn(['flex flex-col gap-5 relative z-0 ml-6 -mt-7', isMobile ? 'w-full mt-8' : 'w-[36.625rem]'])}>
        <div className="text-2xl">{userInfo?.username || '--'}</div>

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
      </div>

      <BattlePass className={cn(['!items-start', isMobile ? 'mt-16 self-start' : 'ml-[9.75rem]'])} hideTitle />

      <RuleButton
        className={cn(['flex-row-reverse', isMobile ? 'mt-8 self-start' : 'ml-4 mb-1 self-end'])}
        visible
        onRuleClick={onOpen}
      />

      <RuleModal isOpen={isOpen} onOpenChange={onOpenChange} />

      {!info && <CircularLoading />}
    </div>
  );
};

export default observer(TaskPassCard);
