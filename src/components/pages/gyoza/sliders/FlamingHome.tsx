import React, { FC } from "react";
import S3Image from '@/components/common/medias/S3Image';
import { cn } from "@nextui-org/react";

const getUrl = (name: string) => {
  return `/minigames/miner/${name}.png`
}

const imgUrls = [
  { url: getUrl('title'), classNames: 'w-[34.625rem] h-[15.375rem] top-[16.125rem] right-[50%] translate-x-1/2' },
  { url: getUrl('subtitle'), classNames: 'w-[54rem] h-[10.9375rem] top-[33.1875rem] right-[50%] translate-x-1/2' },
]

const videoUrls = [
  { url: '/video/boat.webm', poster: getUrl('cannon'), classNames: 'w-full h-full top-[-2rem] right-0' },
  { url: '/video/cat.webm', poster: getUrl('castle'), classNames: 'w-full h-full bottom-0 left-0' },
]

const FlamingHome: FC = () => {
  return (
    <div>
      {videoUrls.map((video, index) => (
        <video
          key={index}
          className={'absolute object-contain' + video.classNames}
          autoPlay
          playsInline
          muted
          loop
          preload="auto"
          poster={video.poster}
        >
          <source src={video.url} />
        </video>
      ))
      }

      <div>
        {imgUrls.map((img, index) => {
          return (
            <S3Image key={index} src={img.url} className={cn(['absolute object-contain', img.classNames])} />
          )
        })}
      </div>
    </div>

  )
}

export default FlamingHome;