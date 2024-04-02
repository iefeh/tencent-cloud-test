import Countdown from './components/Countdown';
import Rewards from './components/Rewards';
import LGButton from '@/pages/components/common/buttons/LGButton';
import { FullEventItem, claimEventRewardAPI } from '@/http/services/task';
import { useContext, useState } from 'react';
import { MobxContext } from '@/pages/_app';
import { observer } from 'mobx-react-lite';
import { throttle } from 'lodash';
import { toast } from 'react-toastify';
import { EventStatus } from '@/constant/task';

interface Props {
  item?: FullEventItem;
  onRefresh?: () => void;
}

function TaskReward(props: Props) {
  const { userInfo, toggleLoginModal } = useContext(MobxContext);
  const { item, onRefresh } = props;
  const [isClaiming, setIsClaiming] = useState(false);
  const isInProcessing = item?.status === EventStatus.ONGOING;

  const onClaim = throttle(async () => {
    if (!userInfo) {
      toggleLoginModal(true);
      return;
    }

    if (!item?.id) return;

    setIsClaiming(true);

    try {
      const res = await claimEventRewardAPI(item.id);
      if (res?.claimed) {
        toast.success(res?.tip || 'You have claimed rewards.');
        onRefresh?.();
        return;
      }

      if (res?.tip) {
        toast.error(res.tip);
      }
    } catch (error: any) {
      toast.error(error?.message || error);
    } finally {
      setIsClaiming(false);
    }
  }, 500);

  return (
    <div className="w-[28.125rem]">
      <div className="font-semakin text-2xl" aria-label="empty">
        &nbsp;
      </div>

      <div className="overflow-hidden rounded-[0.625rem] border-1 border-basic-gray mt-7">
        <Countdown end={item?.end_time} key={item?.end_time || 'end_time'} />

        <div className="px-5 pt-[1.625rem] pb-10">
          <Rewards item={item} />

          {isInProcessing && (
            <LGButton
              className="w-full h-12 mt-[1.6875rem] text-xl font-poppins"
              label={item?.claimed ? 'Claimed' : 'Claim Rewards'}
              actived={!item?.claimed && item?.claimable}
              loading={isClaiming}
              disabled={!item?.claimable}
              onClick={onClaim}
            />
          )}
        </div>
      </div>
    </div>
  );
}

export default observer(TaskReward);
