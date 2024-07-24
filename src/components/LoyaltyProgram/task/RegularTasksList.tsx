import Image from 'next/image';
import { cn } from '@nextui-org/react';
import { observer } from 'mobx-react-lite';
import { TaskCategory } from '@/http/services/battlepass';
import arrowIcon from 'img/loyalty/task/icon_arrow.png';
import RegularTasksCollection from './RegularTasksCollection';

interface Props extends ClassNameProps {
  hideHeader?: boolean;
  categoryItem?: Partial<TaskCategory> | null;
  onBack?: () => void;
}

function RegularTasksList({ categoryItem, hideHeader, className, onBack }: Props) {
  return (
    <div className={cn(['mt-7 mb-[8.75rem] flex flex-col items-center relative', className])}>
      {hideHeader || (
        <div className="self-start mb-8">
          <div className="flex items-center cursor-pointer" onClick={onBack}>
            <Image className="w-[1.625rem] h-[1.375rem]" src={arrowIcon} alt="" width={26} height={22} />

            <span className="ml-3 text-2xl text-[#666666]">BACK</span>
          </div>

          {categoryItem?.name && <div className="text-2xl mt-6">{categoryItem?.name || '--'}</div>}
        </div>
      )}

      <RegularTasksCollection id={categoryItem?.id} />
    </div>
  );
}

export default observer(RegularTasksList);
