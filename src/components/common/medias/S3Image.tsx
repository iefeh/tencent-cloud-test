import Image, { StaticImageData, type ImageProps } from 'next/image';
import { forwardRef } from 'react';

type Props = Override<ImageProps, { src: string | StaticImageData; alt?: string }>;

const S3Image = forwardRef<HTMLImageElement, Props>(function S3Image(
  { src, alt, unoptimized = typeof src === 'string', width, height, fill, sizes, priority, ...props },
  ref,
) {
  const url =
    typeof src === 'string'
      ? src.startsWith('http')
        ? src
        : `https://d3dhz6pjw7pz9d.cloudfront.net/${src.replace(/^\/+/, '')}`
      : src;

  return (
    <Image
      ref={ref}
      src={url}
      alt={alt || ''}
      unoptimized={unoptimized}
      width={fill ? undefined : width || 1}
      height={fill ? undefined : height || 1}
      fill={fill}
      sizes={sizes || (fill ? '100%' : undefined)}
      priority={priority || undefined}
      {...props}
    />
  );
});

export default S3Image;
