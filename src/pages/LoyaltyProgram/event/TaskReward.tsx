import MyRanking from '@/pages/components/common/MyRanking';
import Countdown from './components/Countdown';
import Rewards from './components/Rewards';
import LGButton from '@/pages/components/common/buttons/LGButton';
import { FullEventItem } from '@/http/services/task';

interface Props {
  item?: FullEventItem;
}

export default function TaskReward(props: Props) {
  const { item } = props;

  return (
    <div className="w-[28.125rem]">
      <div className="font-semakin text-2xl">Rewards</div>

      <div className="overflow-hidden rounded-[0.625rem] border-1 border-basic-gray mt-7">
        <Countdown />

        <div className="px-5 pt-[1.625rem] pb-10">
          <MyRanking className="rounded-[0.625rem]" />

          <Rewards />

          <LGButton className="w-full h-12 mt-[1.6875rem] text-xl font-poppins" label="Claim Rewards" />
        </div>
      </div>
    </div>
  );
}
