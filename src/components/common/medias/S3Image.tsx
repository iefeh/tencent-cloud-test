import Image, { type ImageProps } from 'next/image';
import { FC } from 'react';

interface Props extends ImageProps {
  src: string;
}

const S3Image: FC<Props> = ({ src, alt, unoptimized = true, width, height, ...props }) => {
  return (
    <Image
      src={`https://moonveil-public.s3.ap-southeast-2.amazonaws.com/${src.replace(/^\/+/, '')}`}
      alt={alt || ''}
      unoptimized={unoptimized}
      width={1}
      height={1}
      {...props}
    />
  );
};

export default S3Image;
