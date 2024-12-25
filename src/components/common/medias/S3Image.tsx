import Image, { StaticImageData, type ImageProps } from 'next/image';
import { forwardRef } from 'react';

type Props = Override<ImageProps, { src: string | StaticImageData; alt?: string }>;

const httpRE = /^https?:\/\//;
const localRE = /^local:/;

function calcSrc(url: string | StaticImageData) {
  if (typeof url !== 'string') return url;
  if (httpRE.test(url)) return url;
  if (localRE.test(url)) return url.replace(localRE, '');

  return `https://d3dhz6pjw7pz9d.cloudfront.net/${url.replace(/^\/+/, '')}`;
}

const S3Image = forwardRef<HTMLImageElement, Props>(function S3Image(
  { src, alt, unoptimized = typeof src === 'string', width, height, fill, sizes, priority, ...props },
  ref,
) {
  const url = calcSrc(src);

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
