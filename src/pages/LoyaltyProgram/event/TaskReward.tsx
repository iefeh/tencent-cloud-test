import MyRanking from '@/pages/components/common/MyRanking';
import Countdown from './components/Countdown';
import Rewards from './components/Rewards';
import LGButton from '@/pages/components/common/buttons/LGButton';
import { FullEventItem } from '@/http/services/task';
import { useContext } from 'react';
import { MobxContext } from '@/pages/_app';
import { observer } from 'mobx-react-lite';
import Participants from './components/Participants';

interface Props {
  item?: FullEventItem;
}

function TaskReward(props: Props) {
  const { userInfo } = useContext(MobxContext);
  const { item } = props;

  return (
    <div className="w-[28.125rem]">
      <div className="font-semakin text-2xl">Rewards</div>

      <div className="overflow-hidden rounded-[0.625rem] border-1 border-basic-gray mt-7">
        <Countdown end={item?.end_time} />

        <div className="px-5 pt-[1.625rem] pb-10">
          <MyRanking points={userInfo?.moon_beam} className="rounded-[0.625rem]" />

          <Rewards />

          <LGButton className="w-full h-12 mt-[1.6875rem] text-xl font-poppins" label="Claim Rewards" />
        </div>
      </div>

      <Participants />
    </div>
  );
}

export default observer(TaskReward);
