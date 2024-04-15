import { TaskCategory, queryTaskCategoriesAPI } from '@/http/services/battlepass';
import { cn } from '@nextui-org/react';
import { throttle } from 'lodash';
import Image from 'next/image';
import { FC, useContext, useEffect, useState } from 'react';
import { MobxContext } from '@/pages/_app';
import taskBgImg from 'img/loyalty/season/bg_reward_final.png';
import teamsImg from 'img/loyalty/task/teams.png';
import CircularLoading from '@/pages/components/common/CircularLoading';

interface Props extends ClassNameProps {
  onCategoryClick?: (item: TaskCategory) => void;
}

const RegularTaskCategories: FC<Props> = ({ className, onCategoryClick }) => {
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<TaskCategory[]>([]);
  const { userInfo } = useContext(MobxContext);

  const queryCategories = throttle(async () => {
    setLoading(true);
    if (userInfo)
    {
      const res = await queryTaskCategoriesAPI();
      setCategories(res?.result || []);
    }
    else
    {
      setCategories([]);
    }
    setLoading(false);
  }, 500);

  useEffect(() => {
    queryCategories();
  }, []);

  return (
    <div className={className}>
      <div className="flex flex-wrap justify-between gap-7 mt-9 w-full min-h-[20rem] relative">
        {categories.map((item, index) => {
          if (!item) return null;

          return (
            <div
              key={index}
              className={cn([
                'border-1 border-basic-gray rounded-base',
                item.quest_count > 0 &&
                  'cursor-pointer transition-colors hover:border-basic-yellow hover:text-basic-yellow',
                'w-[20.625rem] h-[23.75rem] pt-[3.625rem] px-4',
                'flex flex-col items-center relative',
              ])}
              onClick={() => onCategoryClick?.(item)}
            >
              <div className="relative w-44 h-44">
                <Image className="object-contain" src={taskBgImg} alt="" fill sizes="100%" />

                <div className="w-[7.5rem] h-[7.5rem] bg-[#160D04] absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full overflow-hidden border-1 border-[#A98968]">
                  <Image className="object-contain" src={item.image_url} alt="" fill sizes="100%" />
                </div>
              </div>

              <div className="mt-[3.125rem] text-xl text-ellipsis whitespace-nowrap overflow-hidden">{item.name}</div>

              <div className="mt-1">
                Tasks: {item.achieve_count || 0}/{item.quest_count || 0}
              </div>
            </div>
          );
        })}

        {categories.length < 1 && !loading && (
          <div className="absolute inset-0 backdrop-saturate-150 backdrop-blur-md bg-overlay/30 z-[999] flex flex-col justify-center items-center font-poppins text-2xl">
            <p><br/><br/><br/><br/><br/><br/><br/><br/>Please log in and claim your season pass first to unlock tasks & events.</p>
            <Image className="w-[54rem] h-auto" src={teamsImg} alt="" />
          </div>
        )}

        {loading && <CircularLoading />}
      </div>
    </div>
  );
};

export default RegularTaskCategories;
