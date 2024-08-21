import React, { FC } from 'react';
import Image, { ImageProps } from "next/image";
import { cn } from '@nextui-org/react';

interface Props {
  children: React.ReactNode;
}

type ImageCompProps = Omit<ImageProps, 'alt'>
  & {
    alt?: string;
  }

const getUrl = (name: string) => {
  return `https://moonveil-public.s3.ap-southeast-2.amazonaws.com/minigames/home/${name}.png`
}

const rockImgUrls = [
  {
    url: getUrl('gold_1'),
    classNames: 'right-[1.5rem] top-[2.5rem] h-[3rem] w-[3rem]',
  },
  {
    url: getUrl('gold_2'),
    classNames: 'left-[5rem] top-[5rem] h-[8rem] w-[8rem]',
  },
  {
    url: getUrl('rock_2'),
    classNames: 'bottom-[1.25rem] right-[12.5rem] w-[12rem] h-[12rem]',
  },
  {
    url: getUrl('rock_3'),
    classNames: 'top-[60%] left-[35%] w-[6rem] h-[6rem]',
  },
]

const ImageComp = (props: ImageCompProps) => {

  return (
    <Image
      className="object-contain"
      sizes="100%"
      {...props}
      alt=""
      fill
      unoptimized
    ></Image>
  )
}

const CollectionWarpper: FC<Props> = (props) => {
  const { children } = props;
  return (
    <div className="bg-[url('https://moonveil-public.s3.ap-southeast-2.amazonaws.com/minigames/home/bg_base.png')] bg-[length:100%_auto] w-full flex flex-col items-center -mt-12 pt-[4.875rem] pb-[10.25rem] relative">
      {rockImgUrls.map((img, index) => (
        <div key={index} className={cn([
          'absolute ani-rockFall',
          img.classNames
        ])}>
          <ImageComp src={img.url} />
        </div>

      ))}
      {children}
    </div>
  )
}

export default CollectionWarpper;