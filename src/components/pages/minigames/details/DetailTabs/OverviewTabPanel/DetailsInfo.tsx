import { observer } from 'mobx-react-lite';
import Image from 'next/image';
import { FC, useState } from 'react';

const DetailsInfo: FC = () => {
  const [keywords, setKeywords] = useState(['Strategy', 'Adventure']);

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
          <div className="text-xl leading-none">Puffy 2048</div>

          <div className="flex items-center mt-[0.6875rem]">
            <span className="uppercase text-sm leading-none mr-6">platform</span>

            {['mac', 'android', 'windows'].map((p, i) => (
              <Image
                key={i}
                className="w-6 h-6 object-contain mr-2"
                src={`https://moonveil-public.s3.ap-southeast-2.amazonaws.com/minigames/icons/icon_${p}.png`}
                alt=""
                width={48}
                height={48}
                unoptimized
                priority
              />
            ))}
          </div>
        </div>
      </div>

      <div className="w-full h-0 border-t-1 border-brown border-dashed my-7"></div>

      <p className="text-base leading-[1.875rem] font-jcyt4">
        A charming game series by Moonveil featuring Puffy the cat. With delightful cartoon graphics and simple,
        intuitive gameplay, it&apos;s perfect for players of all ages. Join our vibrant community and dive into the
        playful world of Moonveil Mini today!
      </p>

      <div className="w-full h-0 border-t-1 border-brown border-dashed my-8"></div>

      <div>
        <div className="text-xl leading-none">Details</div>

        <div className="flex items-center mt-5 font-jcyt4">
          {keywords.map((kw, index) => (
            <div key={index} className="px-4 py-ten bg-brown/20 rounded-five [&+div]:ml-ten">
              {kw}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default observer(DetailsInfo);
