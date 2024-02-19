import Head from 'next/head';
import TaskDetails from './TaskDetails';
import TaskReward from './TaskReward';
import { useRouter } from 'next/router';
import { useContext, useEffect, useState } from 'react';
import { FullEventItem, queryEventDetailsAPI } from '@/http/services/task';
import { throttle } from 'lodash';
import { toast } from 'react-toastify';
import { MobxContext } from '@/pages/_app';
import { observer } from 'mobx-react-lite';
import CircularLoading from '@/pages/components/common/CircularLoading';
import { Divider } from '@nextui-org/react';

function LoyaltyEvent() {
  const { userInfo } = useContext(MobxContext);
  const router = useRouter();
  const [eventDetails, setEventDetails] = useState<FullEventItem | undefined>(undefined);
  const [loading, setLoading] = useState(false);

  const queryEventDetails = throttle(async (noLoading = false) => {
    const id = router.query.id as string;
    if (!id) return;

    if (!noLoading) setLoading(true);

    try {
      const res = await queryEventDetailsAPI(id);
      setEventDetails(res.campaign || undefined);
    } catch (error: any) {
      toast.error(error?.message || error);
    } finally {
      setLoading(false);
    }
  }, 500);

  function onBackClick() {
    router.push({ pathname: '/LoyaltyProgram/earn', query: { tabKey: 'Seasonal Campaigns' } });
  }

  useEffect(() => {
    queryEventDetails();
  }, [userInfo]);

  return (
    <section id="luxy" className="w-full flex flex-col px-[16.25rem] [&>div]:mx-auto">
      <Head>
        <title>TaskDetails | Moonveil Entertainment</title>
      </Head>

      <div className="text-base pt-[10.9375rem] !ml-0">
        <span className="text-[#666666] hover:text-white transition-colors cursor-pointer" onClick={onBackClick}>
          Earn Moon Beams &gt;{' '}
        </span>
        <span>Event Details</span>
      </div>

      <Divider className="mt-[1.1875rem] bg-[rgba(255,255,255,0.1)] mb-8" />

      <div className="flex gap-[3.125rem] pb-32 relative">
        <TaskDetails item={eventDetails} onRefresh={queryEventDetails} />

        <TaskReward item={eventDetails} onRefresh={queryEventDetails} />

        {loading && <CircularLoading />}
      </div>
    </section>
  );
}

export default observer(LoyaltyEvent);
