import StrokeButton from '@/components/common/buttons/StrokeButton';
import { MediaLinks } from '@/constant/common';
import { Button, cn } from '@nextui-org/react';
import Image from 'next/image';
import Link from 'next/link';
import { FC } from 'react';

const FollowUs: FC = () => {
  const medias = [
    {
      name: 'x',
      label: 'Twitter Follow @Moonveil_Studio',
      btn: 'Follow us',
      btnBg: 'yellow',
      link: MediaLinks.TWITTER,
    },
    {
      name: 'discord',
      label: 'Join Moonveil’s Discord',
      btn: 'Join us',
      btnBg: 'blue',
      link: MediaLinks.DISCORD,
    },
    {
      name: 'tele',
      label: 'Telegram',
      btn: 'Follow us',
      btnBg: 'yellow',
      link: MediaLinks.TELEGRAM,
    },
  ];

  return (
    <div className='px-6 md:px-0'>
      <div className="mt-14 mb-8 w-full flex justify-between items-center">
        <span className="text-3xl leading-none">Follow us</span>
      </div>

      <div className="w-full pt-12 pb-[2.625rem] grid lg:grid-cols-3 md:grid-cols-2 grid-cols-1 bg-[#F7E9CC] text-brown rounded-[1.25rem]">
        {medias.map((media, index) => (
          <div
            className="flex flex-col justify-between items-center border-dashed border-brown pt-3 pb-2 [&+div]:border-t-1 [&+div]:border-l-0 lg:[&+div]:border-t-0 lg:[&+div]:border-l-1 h-[13.75rem]"
            key={index}
          >
            <Image
              className="w-20 h-20 object-contain"
              src={`https://moonveil-public.s3.ap-southeast-2.amazonaws.com/minigames/icons/icon_${media.name}.png`}
              alt=""
              width={160}
              height={160}
              unoptimized
              priority
            />

            <p>{media.label}</p>

            <Link href={media.link} target="_blank">
              <StrokeButton strokeText={media.btn} strokeType={media.btnBg as any} />
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FollowUs;
