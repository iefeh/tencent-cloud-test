import Image from 'next/image';
import mbImg from 'img/loyalty/earn/mb.png';
import LGButton from '@/pages/components/common/LGButton';
import { Pagination } from '@nextui-org/react';
import PaginationRenderItem from './components/PaginationRenderItem';

const enum TaskRewardType {
  /** Moonveil Beams */
  MB,
}

interface TaskReward {
  amount: string;
  type: TaskRewardType;
}

const enum TaskStatus {
  NOT_STARTED,
  NOT_CONNECTED,
  CONNECTED,
  VERIFIED,
}

interface TaskItem {
  title: string;
  desc: string[];
  descExtended?: boolean;
  reward: TaskReward;
  status: TaskStatus;
  connectButtonText?: string;
  showConnectButton?: boolean;
  verifyButtonText?: string;
  showVerifyButton?: boolean;
  onConnectClick?: (item: TaskItem) => void;
  onVerifyClick?: (item: TaskItem) => void;
}

export default function RegularTasks() {
  const tasks: TaskItem[] = [
    {
      title: 'Connect Your Wallet',
      desc: [
        'Connect to your crypto wallet',
        'Be sure to use the most valuable wallet to connect. MBs will be rewarded based on the value of digital assets in your wallet. ',
      ],
      descExtended: false,
      reward: {
        amount: '3500 MBs Max',
        type: TaskRewardType.MB,
      },
      status: TaskStatus.NOT_CONNECTED,
    },
    {
      title: 'Connect Your Twitter',
      desc: ['Connet to your Twitter account'],
      descExtended: false,
      reward: {
        amount: '50 MBs',
        type: TaskRewardType.MB,
      },
      status: TaskStatus.NOT_CONNECTED,
    },
    {
      title: 'Connect Your Discord',
      desc: ['Connect to Discord and join our official channel'],
      descExtended: false,
      reward: {
        amount: '50 MBs',
        type: TaskRewardType.MB,
      },
      status: TaskStatus.NOT_CONNECTED,
    },
    {
      title: 'Connect Your Telegram',
      desc: ['Join our official telegram group'],
      descExtended: false,
      reward: {
        amount: '50 MBs',
        type: TaskRewardType.MB,
      },
      status: TaskStatus.NOT_CONNECTED,
    },
    {
      title: 'Twitter Follow @Moonveil_Studio',
      desc: ['Connect to Discord and join our official channel'],
      descExtended: false,
      reward: {
        amount: '50 MBs',
        type: TaskRewardType.MB,
      },
      status: TaskStatus.NOT_CONNECTED,
    },
    {
      title: 'Retweet Task',
      desc: ['Please retweet from @Moonveil_Studio'],
      descExtended: false,
      reward: {
        amount: 'Min 100 MBs',
        type: TaskRewardType.MB,
      },
      status: TaskStatus.NOT_CONNECTED,
    },
    {
      title: 'Connect Your Steam',
      desc: [
        'Sign in with your Steam',
        'Set your profile to “Public”',
        'In order to view your profile, please go to Privacy Settings and set all profile items to ”Public”.',
      ],
      descExtended: false,
      reward: {
        amount: '800 MBs Max',
        type: TaskRewardType.MB,
      },
      status: TaskStatus.NOT_CONNECTED,
    },
    {
      title: 'Verify Your Moonveil NFTs',
      desc: ['Connect your wallet and verify your Moonveil NFTs status'],
      descExtended: false,
      reward: {
        amount: '0',
        type: TaskRewardType.MB,
      },
      status: TaskStatus.NOT_CONNECTED,
    },
    {
      title: 'Creator Call to Action',
      desc: ['If you are a content creator, please submit your profile and join our creators’ team.'],
      descExtended: false,
      reward: {
        amount: '???',
        type: TaskRewardType.MB,
      },
      status: TaskStatus.NOT_CONNECTED,
    },
  ];

  return (
    <div className="mt-7 flex flex-col items-center">
      <div className="content grid grid-cols-3 gap-[1.5625rem] font-poppins">
        {tasks.map((task, index) => {
          return (
            <div
              key={index}
              className="task-item col-span-1 overflow-hidden border-1 border-basic-gray rounded-[0.625rem] min-h-[17.5rem] pt-[2.375rem] px-[2.375rem] pb-[2.5rem] flex flex-col justify-between"
            >
              <div>
                <div className="text-xl">{task.title}</div>

                {task.desc && task.desc.length > 0 && <div className="text-sm text-[#999]">{task.desc[0]}</div>}
              </div>

              <div className="footer">
                <div className="flex items-center">
                  {task.reward.type === TaskRewardType.MB && <Image className="w-8 h-8" src={mbImg} alt="" />}

                  <span className="font-semakin text-base text-basic-yellow ml-[0.4375rem]">{task.reward.amount}</span>
                </div>

                <div className="mt-5">
                  {task.showConnectButton !== false && <LGButton label={task.connectButtonText || 'Connect'} />}
                  {task.showVerifyButton !== false && (
                    <LGButton className="ml-2" label={task.verifyButtonText || 'Verify'} />
                  )}
                </div>
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
