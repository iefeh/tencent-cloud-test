import React, { FC } from "react";
import BgImage from '@/components/common/BgImage'

const imgUrls = [
  { url: '', classNames: 'w-[37.3125rem] h-[27.5rem] top-[8.0625rem] right-0' },
  { url: '', classNames: 'w-[34.625rem] h-[15.375rem] top-[16.125rem] right-[50%] translate-x-1/2' },
  { url: '', classNames: 'w-[54rem] h-[10.9375rem] top-[33.1875rem] right-[50%] translate-x-1/2' },
  { url: '', classNames: 'w-[867px] h-[40.625rem] bottom-0 left-0' },
]

const FlamingHome: FC = () => {
  return (
    <div>
      {imgUrls.map((img, index) => {
        return (
          <BgImage key={index} src={img.url} classNames={img.classNames + ' bg-[pink]'} />
        )
      })}
    </div>
  )
}

export default FlamingHome;