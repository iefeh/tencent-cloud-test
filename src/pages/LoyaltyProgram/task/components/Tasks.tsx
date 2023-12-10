import LGButton from '@/pages/components/common/LGButton';
import Image from 'next/image';
import { useState } from 'react';

interface TaskItem {
  title: string;
  icon: string;
  connected?: boolean;
  verified?: boolean;
}

export default function Tasks() {
  const [taskList, setTaskList] = useState<TaskItem[]>([
    {
      title: 'Connect Your Discord',
      icon: '/img/loyalty/task/discord_colored.png',
    },
    {
      title: 'Connect to your Twitter Account',
      icon: '/img/loyalty/task/twitter_colored.png',
    },
    {
      title: 'Connect Your Steam',
      icon: '/img/loyalty/task/steam_colored.png',
    },
  ]);

  return (
    <div>
      <div className="flex justify-between items-center">
        <div className="font-semakin text-2xl">Tasks</div>

        <div className="font-poppins-medium text-sm text-[#666]">(0/3) Completed</div>
      </div>

      {taskList.map((task, index) => (
        <div
          key={index}
          className="flex justify-between items-center py-[1.375rem] pl-[1.5625rem] pr-[1.75rem] rounded-[0.625rem] border-1 border-basic-gray hover:border-[#666] bg-basic-gray [&:not(:first-child)]:mt-[0.625rem] transition-colors duration-300"
        >
          <div className="flex items-center">
            <Image className="w-9 h-9" src={task.icon} alt="" width={36} height={36} />
            <div className="font-poppins-medium text-lg ml-[0.875rem]">{task.title}</div>
          </div>

          <div className="flex items-center gap-2">
            <LGButton label="Connect" />
            <LGButton label="Verify" />
          </div>
        </div>
      ))}
    </div>
  );
}
