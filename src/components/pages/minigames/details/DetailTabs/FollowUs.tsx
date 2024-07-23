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
    <div>
      <div className="mt-14 mb-8 w-full flex justify-between items-center">
        <span className="text-3xl leading-none">Follow us</span>
      </div>

      <div className="w-full h-[19.375rem] pt-12 pb-[2.625rem] grid grid-cols-3 bg-[#F7E9CC] text-brown rounded-[1.25rem]">
        {medias.map((media, index) => (
          <div
            className="flex flex-col justify-between items-center border-dashed border-brown pt-3 pb-2 [&+div]:border-l-1"
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
              <Button
                className={cn([
                  'w-[10.875rem] h-[3.25rem] !bg-transparent bg-contain bg-no-repeat',
                  `bg-[url('https://moonveil-public.s3.ap-southeast-2.amazonaws.com/minigames/btn_${media.btnBg}.png')]`,
                ])}
              >
                {media.btn}
              </Button>
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FollowUs;
