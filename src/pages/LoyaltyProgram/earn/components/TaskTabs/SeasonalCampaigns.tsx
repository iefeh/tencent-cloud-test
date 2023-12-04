import Image, { StaticImageData } from 'next/image';
import mbImg from 'img/loyalty/earn/mb.png';
import LGButton from '@/pages/components/common/LGButton';
import { Pagination } from '@nextui-org/react';
import PaginationRenderItem from './components/PaginationRenderItem';

const enum TaskRewardType {
  /** Moonveil Beams */
  MB,
  /** Badge */
  BADGE,
}

interface TaskReward {
  amount: string;
  type: TaskRewardType;
}

const enum TaskStatus {
  COMING_SOON,
  IN_PROGRESS,
  COMPLETED,
}

interface TaskItem {
  title: string;
  desc: string;
  rewards: TaskReward[];
  status: TaskStatus;
  cover: string | StaticImageData;
  connectButtonText?: string;
  showConnectButton?: boolean;
  verifyButtonText?: string;
  showVerifyButton?: boolean;
  onConnectClick?: (item: TaskItem) => void;
  onVerifyClick?: (item: TaskItem) => void;
}

const TASK_STATUS_DICT = {
  [TaskStatus.COMING_SOON]: {
    label: 'Coming Soon',
    class: 'text-[#4FDCFF]',
  },
  [TaskStatus.IN_PROGRESS]: {
    label: 'In Progress',
    class: 'text-basic-yellow',
  },
  [TaskStatus.COMPLETED]: {
    label: 'Completed',
    class: 'text-white',
  },
};

export default function SeasonalCampaigns() {
  const tasks: TaskItem[] = [
    {
      title: 'AstrArk Character Voice Rally',
      desc: 'Our test server will open at 4:00 pm, Nov. 16th, Singapore time...',
      rewards: [
        {
          amount: '50 MBs',
          type: TaskRewardType.MB,
        },
        {
          amount: '1 badge',
          type: TaskRewardType.BADGE,
        },
      ],
      status: TaskStatus.IN_PROGRESS,
      cover: '/img/loyalty/earn/seasonal/23.jpg',
    },
    {
      title: 'AstrArk Character Voice Rally',
      desc: 'Our test server will open at 4:00 pm, Nov. 16th, Singapore time...',
      rewards: [
        {
          amount: '50 MBs',
          type: TaskRewardType.MB,
        },
        {
          amount: '1 badge',
          type: TaskRewardType.BADGE,
        },
        {
          amount: '1 badge',
          type: TaskRewardType.BADGE,
        },
      ],
      status: TaskStatus.IN_PROGRESS,
      cover: '/img/loyalty/earn/seasonal/24.jpg',
    },
    {
      title: 'AstrArk Character Voice Rally',
      desc: 'Our test server will open at 4:00 pm, Nov. 16th, Singapore time...',
      rewards: [
        {
          amount: '50 MBs',
          type: TaskRewardType.MB,
        },
      ],
      status: TaskStatus.IN_PROGRESS,
      cover: '/img/loyalty/earn/seasonal/25.jpg',
    },
    {
      title: 'AstrArk Character Voice Rally',
      desc: 'Our test server will open at 4:00 pm, Nov. 16th, Singapore time...',
      rewards: [
        {
          amount: '50 MBs',
          type: TaskRewardType.MB,
        },
      ],
      status: TaskStatus.IN_PROGRESS,
      cover: '/img/loyalty/earn/seasonal/26.jpg',
    },
    {
      title: 'AstrArk Character Voice Rally',
      desc: 'Our test server will open at 4:00 pm, Nov. 16th, Singapore time...',
      rewards: [
        {
          amount: '50 MBs',
          type: TaskRewardType.MB,
        },
      ],
      status: TaskStatus.COMING_SOON,
      cover: '/img/loyalty/earn/seasonal/27.jpg',
    },
    {
      title: 'AstrArk Character Voice Rally',
      desc: 'Our test server will open at 4:00 pm, Nov. 16th, Singapore time...',
      rewards: [
        {
          amount: '50 MBs',
          type: TaskRewardType.MB,
        },
      ],
      status: TaskStatus.IN_PROGRESS,
      cover: '/img/loyalty/earn/seasonal/28.jpg',
    },
    {
      title: 'AstrArk Character Voice Rally',
      desc: 'Our test server will open at 4:00 pm, Nov. 16th, Singapore time...',
      rewards: [
        {
          amount: '50 MBs',
          type: TaskRewardType.MB,
        },
      ],
      status: TaskStatus.COMPLETED,
      cover: '/img/loyalty/earn/seasonal/29.jpg',
    },
    {
      title: 'AstrArk Character Voice Rally',
      desc: 'Our test server will open at 4:00 pm, Nov. 16th, Singapore time...',
      rewards: [
        {
          amount: '50 MBs',
          type: TaskRewardType.MB,
        },
      ],
      status: TaskStatus.COMPLETED,
      cover: '/img/loyalty/earn/seasonal/30.jpg',
    },
    {
      title: 'AstrArk Character Voice Rally',
      desc: 'Our test server will open at 4:00 pm, Nov. 16th, Singapore time...',
      rewards: [
        {
          amount: '50 MBs',
          type: TaskRewardType.MB,
        },
      ],
      status: TaskStatus.COMPLETED,
      cover: '/img/loyalty/earn/seasonal/31.jpg',
    },
  ];

  return (
    <div className="mt-7 flex flex-col items-center">
      <div className="content grid grid-cols-3 gap-[1.5625rem] font-poppins">
        {tasks.map((task, index) => {
          return (
            <div
              key={index}
              className="task-item col-span-1 overflow-hidden border-1 border-basic-gray rounded-[0.625rem] min-h-[17.5rem] pt-[1.6875rem] px-[1.5625rem] pb-[2.3125rem] flex flex-col cursor-pointer hover:border-basic-yellow transition-[border-color] duration-500"
            >
              <div className="w-[25rem] h-[11.25rem] overflow-hidden rounded-[0.625rem] relative">
                <Image
                  className="object-cover hover:scale-125 transition-transform"
                  src={task.cover}
                  alt=""
                  width={400}
                  height={180}
                />

                <div
                  className={`absolute left-0 top-[0.4375rem] w-[7.625rem] h-9 pt-[0.5625rem] bg-black/50 rounded-r-lg text-sm ${
                    TASK_STATUS_DICT[task.status].class
                  } ${task.status === TaskStatus.COMING_SOON ? 'pl-[0.8125rem]' : 'pl-[1.1875rem]'}`}
                >
                  {TASK_STATUS_DICT[task.status].label}
                </div>
              </div>

              <div className="text-xl mt-8">{task.title}</div>

              <div className="text-[#999] text-sm mt-4">{task.desc}</div>

              <div className="mt-10 flex flex-wrap gap-[3.125rem]">
                {task.rewards.map((reward, ri) => {
                  return (
                    <div key={ri} className="flex items-center">
                      <Image className="w-8 h-8" src={mbImg} alt="" />
                      <span className="font-semakin text-base text-basic-yellow ml-[0.4375rem]">{reward.amount}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      <Pagination
        className="mt-[4.6875rem] mb-[8.75rem]"
        showControls
        total={10}
        initialPage={1}
        renderItem={PaginationRenderItem}
        classNames={{
          wrapper: 'gap-3',
          item: 'w-12 h-12 font-poppins-medium text-base text-white',
          prev: 'w-12 h-12 border-1 border-white bg-transparent',
          next: 'w-12 h-12 border-1 border-white bg-transparent',
        }}
        disableCursorAnimation
        radius="full"
        variant="light"
      />
    </div>
  );
}
