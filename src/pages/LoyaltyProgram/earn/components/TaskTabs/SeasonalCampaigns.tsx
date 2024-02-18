import Image from 'next/image';
import { Pagination, Select, SelectItem, cn } from '@nextui-org/react';
import PaginationRenderItem from './components/PaginationRenderItem';
import { useRouter } from 'next/router';
import { useEffect, useRef, useState } from 'react';
import { throttle } from 'lodash';
import { EventItem, EventPageQueryDTO, queryEventListAPI } from '@/http/services/task';
import { toast } from 'react-toastify';
import CircularLoading from '@/pages/components/common/CircularLoading';
import { EVENT_STATUS_CLASS_DICT, EVENT_STATUS_OPTIONS } from '@/constant/task';

export default function SeasonalCampaigns() {
  const router = useRouter();
  const pagi = useRef<EventPageQueryDTO>({
    page_num: 1,
    page_size: 9,
  });
  const [tasks, setTasks] = useState<EventItem[]>([]);
  const [total, setTotal] = useState(0);
  const [eventStatus, setEventStatus] = useState('all');
  const [loading, setLoading] = useState(false);

  function onTaskClick(task: EventItem) {
    router.push(`/LoyaltyProgram/event?id=${task.id}`);
  }

  const queryTasks = throttle(async (pagiParams: Partial<EventPageQueryDTO> = pagi.current, noLoading = false) => {
    if (!noLoading) setLoading(true);
    const params = Object.assign({}, pagi.current, pagiParams);

    try {
      const res = await queryEventListAPI(params);
      const { campaigns, total } = res;
      setTasks(campaigns || []);
      setTotal(total || 0);
    } catch (error: any) {
      toast.error(error?.message || error);
    } finally {
      setLoading(false);
    }
  }, 500);

  function onPagiChange(page: number) {
    if (page === pagi.current.page_num) return;
    queryTasks({ page_num: page });
  }

  function onStatusChange(keys: any) {
    const key = keys.currentKey;
    if (key === eventStatus) return;
    setEventStatus(key);
    queryTasks({ campaign_status: key === 'all' ? undefined : key });
  }

  useEffect(() => {
    queryTasks();
  }, []);

  return (
    <div className="mt-7 flex flex-col items-center relative">
      <div
        className={cn([
          'content flex flex-col lg:grid lg:grid-cols-3 gap-[1.5625rem] w-full font-poppins relative',
          tasks.length < 1 && 'h-[37.5rem]',
        ])}
      >
        {tasks.map((task, index) => {
          return (
            <div
              key={index}
              className="task-item col-span-1 overflow-hidden border-1 border-basic-gray rounded-[0.625rem] min-h-[17.5rem] pt-[1.6875rem] px-[1.5625rem] pb-[2.3125rem] flex flex-col cursor-pointer hover:border-basic-yellow transition-[border-color] duration-500"
              onClick={() => onTaskClick(task)}
            >
              <div className="w-auto h-[11.25rem] overflow-hidden rounded-[0.625rem] relative">
                <Image
                  className="object-cover hover:scale-125 transition-transform"
                  src={task.image_url}
                  alt=""
                  width={400}
                  height={180}
                />

                <div
                  className={cn([
                    'absolute left-0 top-[0.4375rem] w-[7.625rem] h-9 pt-[0.5625rem] bg-black/50 rounded-r-lg text-sm',
                    EVENT_STATUS_CLASS_DICT[task.status].class,
                  ])}
                >
                  {EVENT_STATUS_CLASS_DICT[task.status].label}
                </div>

                {!task.claimed && (
                  <div className="absolute bottom-0 left-0 w-full h-10 text-center !leading-10 font-semakin text-lg text-basic-yellow bg-black/70">
                    Claimed
                  </div>
                )}
              </div>

              <div className="flex flex-col justify-between flex-1">
                <div className="text-xl mt-8">{task.name}</div>

                <div className="mt-10 flex flex-wrap gap-[3.125rem]">
                  {task.rewards.map((reward, ri) => {
                    return (
                      <div key={ri} className="flex items-center">
                        <div className="w-8 h-8 relative">
                          <Image className="object-contain" src={reward.image_small} alt="" fill />
                        </div>
                        <span className="font-semakin text-base text-basic-yellow ml-[0.4375rem]">{reward.amount}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          );
        })}

        {loading && <CircularLoading />}
      </div>

      <Pagination
        className="mt-[4.6875rem] mb-[8.75rem]"
        showControls
        total={total}
        initialPage={1}
        renderItem={PaginationRenderItem}
        classNames={{
          wrapper: 'gap-3',
          item: 'w-12 h-12 font-poppins-medium text-base text-white',
        }}
        disableCursorAnimation
        radius="full"
        variant="light"
        onChange={onPagiChange}
      />

      <Select
        items={EVENT_STATUS_OPTIONS}
        className="max-w-[10rem] absolute right-0 -top-14 -translate-y-full"
        classNames={{ trigger: 'p-0 h-auto !bg-transparent' }}
        aria-label="event status"
        value={eventStatus}
        defaultSelectedKeys={['all']}
        onSelectionChange={onStatusChange}
      >
        {(item) => <SelectItem key={item.value}>{item.label}</SelectItem>}
      </Select>
    </div>
  );
}
