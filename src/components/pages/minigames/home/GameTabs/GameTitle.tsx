import { cn } from '@nextui-org/react';
import { FC, CSSProperties, useEffect, useRef } from 'react';
import { isMobile } from 'react-device-detect';
import S3Image from '@/components/common/medias/S3Image';
import { useState } from 'react';
import CloudItemComp, { CloudItemPosition } from './CloudItemAni';

import Image from 'next/image';

interface Props {
  swiperIndex: number | null;
  animation: boolean;
}

const getUrl = (name: string): string => {
  return `/minigames/home/${name}.png`;
};

const cloudUrls: {
  url: string,
  classNames: string,
  position: CloudItemPosition,
}[] = [
    {
      url: getUrl('cloud_0'),
      classNames: 'right-[16rem] top-[10rem] w-[48rem] aspect-[1532/570]',
      position: 'rt',
    },
    {
      url: getUrl('cloud_1'),
      classNames: 'right-[4rem] top-[-1rem] w-[56rem] aspect-[1532/570]',
      position: 'rt',
    },
    {
      url: getUrl('cloud_2'),
      classNames: 'right-[18rem] top-[-3rem] w-[38rem] aspect-[1532/570]',
      position: 'rt',
    },
    {
      url: getUrl('cloud_3'),
      classNames: 'left-0 top-[-3rem] w-[38rem] aspect-[1532/570]',
      position: 'lt',
    },
    {
      url: getUrl('cloud_4'),
      classNames: 'left-0 top-[20rem] w-[38rem] aspect-[1532/570]',
      position: 'lt',
    },
    {
      url: getUrl('cloud_5'),
      classNames: 'left-[34%] top-[13rem] w-[14rem] aspect-[1532/570]',
      position: 'lt',
    },
    {
      url: getUrl('cloud_6'),
      classNames: 'left-[46%] top-[10.5rem] w-[14rem] aspect-[1532/570]',
      position: 'rt',
    },
    {
      url: getUrl('cloud_7'),
      classNames: 'left-[10rem] top-[15rem] w-[30rem] aspect-[1532/570]',
      position: 'lt',
    },
    {
      url: getUrl('cloud_8'),
      classNames: 'left-[30rem] top-[38rem] w-[18rem] aspect-[520/234]',
      position: 'lb',
    },
    {
      url: getUrl('cloud_9'),
      classNames: 'left-[12rem] top-[10rem] w-[30rem] aspect-[1076/1496]',
      position: 'lb',
    },
    {
      url: getUrl('cloud_10'),
      classNames: 'left-0 bottom-[11rem] w-[55rem] aspect-[1784/1450] z-40',
      position: 'lb',
    },
    {
      url: getUrl('cloud_11'),
      classNames: 'left-0 top-[1.5rem] w-[20rem] aspect-[652/953]',
      position: 'lt',
    },
    {
      url: getUrl('cloud_12'),
      classNames: 'left-[44%] top-[43%] w-[16rem] aspect-[738/196]',
      position: 'lb',
    },
    {
      url: getUrl('cloud_13'),
      classNames: 'right-0 top-[8rem] w-[28rem] aspect-[1784/1450]',
      position: 'rt',
    },
    {
      url: getUrl('cloud_14'),
      classNames: 'right-[13rem] bottom-[20rem] w-[56rem] aspect-[1970/928] z-40',
      position: 'rb',
    },
    {
      url: getUrl('cloud_15'),
      classNames: 'right-0 bottom-[14rem] w-[35rem] aspect-[1136/1490] z-[45]',
      position: 'rb',
    },
  ];

const meteorUrls = [
  {
    url: getUrl('meteor_512'),
    classNames: 'left-[31rem] top-[29rem] w-[14rem] h-[14rem]',
  },
  {
    url: getUrl('meteor_brick_1'),
    classNames: 'left-[14rem] bottom-[24rem] w-[14rem] h-[14rem]',
  },
  {
    url: getUrl('meteor_brick_2'),
    classNames: 'right-[18rem] top-[26rem] w-[14rem] h-[14rem]',
  },
  {
    url: getUrl('meteor_cat'),
    classNames: 'right-[32rem] top-[18rem] w-[14rem] h-[28rem]',
  },
  {
    url: getUrl('meteor_giraffe'),
    classNames: 'left-[18rem] top-[21rem] w-[12rem] h-[3rem]',
  },
  {
    url: getUrl('2048'),
    classNames: 'left-[50%] top-[27%] translate-x-[-68%] translate-y-[25%] w-[15.5rem] h-[15.5rem]',
  },
];

const bgBaseUrls = [
  {
    url: getUrl('banner_mask'),
    classNames: 'top-0 right-0 w-full aspect-[3840/742]',
  },
  {
    url: getUrl('cat'),
    classNames: 'left-[18rem] top-[12.25rem] w-[30rem] h-[30rem]',
  },
  {
    url: getUrl('box'),
    classNames: 'left-[50%] bottom-[16rem] translate-x-[-50%] w-[34rem] aspect-[1066/554] z-1',
  },
  {
    url: getUrl('title'),
    classNames: 'left-[46rem] top-[12rem] w-[55rem] h-[10rem]',
  },
  {
    url: getUrl('subtitle'),
    classNames: 'left-[38.4rem] top-[23rem] w-[58rem] h-[6rem]',
  },
];

const titleIndex = 0;

const GameTitle: FC<Props> = (props) => {
  const [inAni, setInAni] = useState<null | boolean>(null);

  useEffect(() => {
    if (isMobile) return;

    const index = props.swiperIndex;

    if (index === null) {
      setInAni(null);
      return;
    }

    if (index === 0) {
      setInAni(false);
    } else {
      Math.abs(index - titleIndex) === 1 && setInAni(true);
    }
  }, [props.swiperIndex]);

  if (isMobile) {
    return (
      <div className={cn(['stroke-content relative text-5xl text-center z-10 w-full text-white', ''])}>
        <Image
          className="object-contain w-full"
          src="https://moonveil-public.s3.ap-southeast-2.amazonaws.com/minigames/home/bg_banner.png"
          alt=""
          width={3840}
          height={2426}
          unoptimized
          priority
        />
      </div>
    );
  }

  return (
    <div
      className="pt-[73.1875rem] pb-[1.5rem] relative text-center z-10 w-full. bg-[length:100%_auto] "
      style={
        {
          backgroundImage:
            "url('https://moonveil-public.s3.ap-southeast-2.amazonaws.com/minigames/home/bg_banner_base.png'), url('https://moonveil-public.s3.ap-southeast-2.amazonaws.com/minigames/home/bg_base.png')",
          backgroundRepeat: 'no-repeat, repeat',
        } as CSSProperties
      }
    >
      {/* 背景基本要素 */}
      {bgBaseUrls.map((bg, index) => (
        <S3Image key={index} src={bg.url} className={cn(['z-20 absolute object-contain', bg.classNames])} />
      ))}
      {/* 陨石 */}
      {meteorUrls.map((bg, index) => (
        <S3Image key={index} src={bg.url} className={cn(['z-50 absolute object-contain', bg.classNames])} />
      ))}

      {/* 云 */}
      {cloudUrls.map((bg, index) => (
        <CloudItemComp item={bg} key={index} inAni={inAni}></CloudItemComp>
      ))}
    </div>
  );
};

export default GameTitle;
