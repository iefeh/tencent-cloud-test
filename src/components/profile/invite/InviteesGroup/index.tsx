import type { Invitee } from '@/http/services/profile';
import { Tooltip, cn } from '@nextui-org/react';
import Image from 'next/image';
import { FC } from 'react';

interface Props {
  hideTitle?: boolean;
  title?: string;
  className?: string;
  items: Invitee[];
}

const InviteesGroup: FC<Props> = ({ hideTitle, title, className, items }) => {
  return (
    <div className={cn(['text-base text-white', className])}>
      {hideTitle || <div>{title}</div>}

      <div
        className={cn([
          'flex items-center gap-x-3 gap-y-4 min-h-[3.75rem]',
          items.length > 0 ? 'justify-between' : 'justify-center',
        ])}
      >
        {items.length > 0
          ? items.map((item, index) => (
              <Tooltip key={index} content={item.nickname}>
                <div className="relative w-[3.75rem] h-[3.75rem] border-1 border-basic-yellow">
                  <Image className="object-cover" src={item.avatar} alt="" fill sizes="100%" />
                </div>
              </Tooltip>
            ))
          : 'No data.'}
      </div>
    </div>
  );
};

export default InviteesGroup;
