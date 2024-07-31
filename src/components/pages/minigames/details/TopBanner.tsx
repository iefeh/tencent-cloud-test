import { useMGDContext } from '@/store/MiniGameDetails';
import { observer } from 'mobx-react-lite';
import Image from 'next/image';
import { useRouter } from 'next/router';
import { FC, useEffect } from 'react';

const TopBanner: FC = () => {
  const { data, queryDetails } = useMGDContext();
  const router = useRouter();

  useEffect(() => {
    queryDetails(router.query.id as string);
  }, [router.query.id]);

  return (
    <div className="w-screen h-screen relative flex flex-col justify-end">
      <Image
        className="object-cover"
        src="https://moonveil-public.s3.ap-southeast-2.amazonaws.com/minigames/bg_top_logo.png"
        alt=""
        fill
        sizes="100%"
        unoptimized
      />

      <div className="relative z-0 pl-[16.25rem] mb-9">
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
