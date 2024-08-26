import { useMGDContext } from '@/store/MiniGameDetails';
import { observer } from 'mobx-react-lite';
import Image from 'next/image';
import Link from 'next/link';
import type { FC } from 'react';

const DetailsInfo: FC = () => {
  const { data } = useMGDContext();
  const { name, keywords, platform, description } = data || {};

  return (
    <div className="flex-1 bg-[#F7E9CC] p-[2.375rem] rounded-[1.25rem] text-brown">
      <div className="flex items-center">
        <div className="relative w-[5.75rem] h-[5.75rem]">
          <Image
            className="rounded-base object-cover border-2 border-[#BB683D]"
            src="https://moonveil-public.s3.ap-southeast-2.amazonaws.com/minigames/bg_banner_1.png"
            alt=""
            fill
            sizes="100%"
            unoptimized
            priority
          />
        </div>

        <div className="ml-[1.375rem] font-semibold">
          <div className="text-xl leading-none">{name || '--'}</div>

          <div className="flex items-center mt-[0.6875rem]">
            <span className="uppercase text-sm leading-none mr-6">platform</span>

            {(platform || []).map((p, i) => (
              <Link key={i} href={p.url || 'javascript:;'} target={p.url ? '_blank' : '_self'}>
                <Image
                  className="w-6 h-6 object-contain mr-2"
                  src={p.icon}
                  alt=""
                  width={48}
                  height={48}
                  unoptimized
                  priority
                />
              </Link>
            ))}
          </div>
        </div>
      </div>

      <div className="w-full h-0 border-t-1 border-brown border-dashed my-7"></div>

      <p className="text-base leading-[1.875rem] font-jcyt4">{description}</p>

      <div className="w-full h-0 border-t-1 border-brown border-dashed my-8"></div>

      <div>
        <div className="text-xl leading-none">Details</div>

        <div className="flex items-center mt-5 font-jcyt4">
          {(keywords || []).map((kw, index) => (
            <div key={index} className="px-4 py-ten bg-brown/20 rounded-five [&+div]:ml-ten whitespace-nowrap">
              {kw}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default observer(DetailsInfo);
