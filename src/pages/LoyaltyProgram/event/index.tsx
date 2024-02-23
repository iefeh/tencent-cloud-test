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
import AutoBreadcrumbs from '@/pages/components/common/AutoBreadcrumbs';

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

  useEffect(() => {
    queryEventDetails();
  }, [userInfo]);

  return (
    <section id="luxy" className="w-full flex flex-col px-8 lg:px-[16.25rem] [&>div]:mx-auto">
      <Head>
        <title>Event Details | Moonveil Entertainment</title>
      </Head>

      <AutoBreadcrumbs className="pt-[10.9375rem] !ml-0" hrefs={['/LoyaltyProgram/earn']} />

      <div className="flex flex-col lg:flex-row gap-[3.125rem] pb-32 relative max-w-full mt-8">
        <TaskDetails item={eventDetails} onRefresh={queryEventDetails} />

        <TaskReward item={eventDetails} onRefresh={queryEventDetails} />

        {loading && <CircularLoading />}
      </div>
    </section>
  );
}

export default observer(LoyaltyEvent);
