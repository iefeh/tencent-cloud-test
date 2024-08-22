import Image, { ImageProps } from "next/image";
import { cn } from "@nextui-org/react";

interface ImageCompProps extends Omit<ImageProps, 'alt' | 'height' | 'width'> {
  alt?: string;
  classNames?: string;
  style?: React.CSSProperties;
  refEl?: React.RefObject<HTMLDivElement>;
}

const BgImageComp = (props: ImageCompProps) => {
  const { classNames, refEl, style = {}, ...rest } = props;

  return (
    <div ref={refEl} style={style} className={cn(['absolute', classNames])}>
      <Image
        className="object-contain"
        sizes="100%"
        {...rest}
        alt=""
        fill
        unoptimized
      ></Image>
    </div>
  )
}

export default BgImageComp;