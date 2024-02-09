import Head from 'next/head';
import TaskDetails from './TaskDetails';
import TaskReward from './TaskReward';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { FullEventItem, queryEventDetailsAPI } from '@/http/services/task';
import { throttle } from 'lodash';
import { toast } from 'react-toastify';

export default function LoyaltyTask() {
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
  }, []);

  return (
    <section id="luxy" className="w-full flex flex-col px-[16.25rem] [&>div]:mx-auto">
      <Head>
        <title>TaskDetails | Moonveil Entertainment</title>
      </Head>

      <div className="flex gap-[3.125rem] pt-[10.9375rem]">
        <TaskDetails item={eventDetails} />

        <TaskReward item={eventDetails} />
      </div>
    </section>
  );
}
