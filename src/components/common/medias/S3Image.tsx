import Image, { type ImageProps } from 'next/image';
import { FC } from 'react';

type Props = Override<ImageProps, { src: string; alt?: string }>;

const S3Image: FC<Props> = ({ src, alt, unoptimized = true, width, height, fill, ...props }) => {
  return (
    <Image
      src={`https://moonveil-public.s3.ap-southeast-2.amazonaws.com/${src.replace(/^\/+/, '')}`}
      alt={alt || ''}
      unoptimized={unoptimized}
      width={fill ? undefined : width || 1}
      height={fill ? undefined : height || 1}
      fill={fill}
      {...props}
    />
  );
};

export default S3Image;
