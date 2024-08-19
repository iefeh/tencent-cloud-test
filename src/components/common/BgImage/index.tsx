import Image, { ImageProps } from "next/image";
import { cn } from "@nextui-org/react";

interface ImageCompProps extends Omit<ImageProps, 'alt' | 'height' | 'width'> {
  alt?: string;
  classNames?: string;
  style?: React.CSSProperties;
}

const BgImageComp = (props: ImageCompProps) => {
  const { classNames, style = {}, ...rest } = props;

  return (
    <div style={style} className={cn(['absolute', classNames])}>
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