import StrokeButton from '@/components/common/buttons/StrokeButton';
import { MediaLinks } from '@/constant/common';
import { Button, cn } from '@nextui-org/react';
import Image from 'next/image';
import Link from 'next/link';
import React, { FC } from 'react';

interface MediaProps {
  name: string;
  label: string;
  btn: string;
  btnBg?: string;
  link: string;
  renderBtn?: (props: any) => React.ReactNode;
}
interface FollowUsProps {
  className?: string;
  medias?: MediaProps[];
}


const getImgUrl = (name: string): string => {
  return `/minigames/icons/icon_${name}.png`
}

const defaultMedias: MediaProps[] = [
  {
    name: getImgUrl('x'),
    label: 'Twitter Follow @Moonveil_Studio',
    btn: 'Follow us',
    btnBg: 'yellow',
    link: MediaLinks.TWITTER,
  },
  {
    name: getImgUrl('discord'),
    label: 'Join Moonveil’s Discord',
    btn: 'Join us',
    btnBg: 'blue',
    link: MediaLinks.DISCORD,
  },
  {
    name: getImgUrl('tele'),
    label: 'Telegram',
    btn: 'Follow us',
    btnBg: 'yellow',
    link: MediaLinks.TELEGRAM,
  },
];


const FollowUs: FC<FollowUsProps> = (props) => {
  const { medias = defaultMedias, className } = props

  return (
    <div className='px-6 md:px-0'>
      <div className="mt-14 mb-8 w-full flex justify-between items-center">
        <span className="text-3xl leading-none">Follow us</span>
      </div>

      <div
        className={cn([
          "w-full pt-12 pb-[2.625rem] grid lg:grid-cols-3 md:grid-cols-2 grid-cols-1 bg-[#F7E9CC] text-brown rounded-[1.25rem]",
          className
        ])}
      >
        {medias.map((media, index) => (
          <div
            className="flex flex-col justify-between items-center border-dashed border-brown pt-3 pb-2 [&+div]:border-t-1 [&+div]:border-l-0 lg:[&+div]:border-t-0 lg:[&+div]:border-l-1 h-[13.75rem]"
            key={index}
          >
            <Image
              className="w-20 h-20 object-contain"
              src={`https://d3dhz6pjw7pz9d.cloudfront.net${media.name}`}
              alt=""
              width={160}
              height={160}
              unoptimized
              priority
            />

            <p>{media.label}</p>

            <Link href={media.link} target="_blank">
              {media?.renderBtn
                ? media.renderBtn(media.btn)
                : <StrokeButton strokeText={media.btn} strokeType={media.btnBg as any} />
              }
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FollowUs;
