import { useMGDContext } from '@/store/MiniGameDetails';
import { useUserContext } from '@/store/User';
import { observer } from 'mobx-react-lite';
import Image from 'next/image';
import { useRouter } from 'next/router';
import { FC, useEffect } from 'react';

const TopBanner: FC = () => {
  const { userInfo } = useUserContext();
  const { data, queryDetails } = useMGDContext();
  const router = useRouter();

  useEffect(() => {
    queryDetails(router.query.id as string);
  }, [router.query.id, userInfo]);

  return (
    <div className="w-screen md:h-screen h-[50vh] relative flex flex-col justify-end">
      {data?.poster?.img_url && (
        <Image className="object-cover" src={data.poster.img_url} alt="" fill sizes="100%" unoptimized />
      )}

      <div className="relative z-0 lg:pl-[16.25rem] md:pl-40 pl-8 mb-9">
        <div className="text-5xl">{data?.name || '--'}</div>

        <div className="flex items-center gap-x-2 mt-[1.125rem]">
          {(data?.keywords || ['-']).map((kw, index) => (
            <div key={index} className="py-ten px-4 bg-white/20 rounded-five">
              {kw}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default observer(TopBanner);
