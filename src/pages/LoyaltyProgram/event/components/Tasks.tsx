import { TaskListItem } from '@/http/services/task';
import LGButton from '@/pages/components/common/buttons/LGButton';
import Image from 'next/image';
import { useState } from 'react';

interface Props {
  items: TaskListItem[];
}

export default function Tasks(props: Props) {
  const { items } = props;
  const finishedCount = items.reduce((p, c) => (p += c.verified ? 1 : 0), 0);

  return (
    <div>
      <div className="flex justify-between items-center">
        <div className="font-semakin text-2xl">Tasks</div>

        <div className="font-poppins-medium text-sm text-[#666]">
          ({finishedCount}/{items.length}) Completed
        </div>
      </div>

      {items.map((task, index) => (
        <div
          key={index}
          className="flex justify-between items-center py-[1.375rem] pl-[1.5625rem] pr-[1.75rem] rounded-[0.625rem] border-1 border-basic-gray hover:border-[#666] bg-basic-gray [&:not(:first-child)]:mt-[0.625rem] transition-colors duration-300"
        >
          <div className="flex items-center">
            <Image className="w-9 h-9" src="/img/loyalty/task/discord_colored.png" alt="" width={36} height={36} />
            <div className="font-poppins-medium text-lg ml-[0.875rem]">{task.name}</div>
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
