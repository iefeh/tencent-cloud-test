import { PaginationItemRenderProps, PaginationItemType, cn } from '@nextui-org/react';
import S3Image from '../../medias/S3Image';

export default function PaginationRenderItem({
  ref,
  key,
  value,
  isActive,
  onNext,
  onPrevious,
  setPage,
  className,
  total,
  activePage,
}: PaginationItemRenderProps) {
  if (value === PaginationItemType.NEXT) {
    return (
      <button
        key={key}
        className={cn([className, activePage < total || 'cursor-not-allowed grayscale', 'w-14 h-14'])}
        disabled={activePage >= total}
        onClick={() => {
          onNext();
          console.log(1211111111111);
        }}
      >
        <S3Image className="object-contain w-full h-full" src="/astrark/shop/icons/next.png" />
      </button>
    );
  }

  if (value === PaginationItemType.PREV) {
    return (
      <button
        key={key}
        className={cn([className, activePage > 1 || 'cursor-not-allowed grayscale', 'w-14 h-14'])}
        disabled={activePage <= 1}
        onClick={onPrevious}
      >
        <S3Image className="object-contain w-full h-full" src="/astrark/shop/icons/prev.png" />
      </button>
    );
  }

  if (value === PaginationItemType.DOTS) {
    return (
      <button key={key} className={className}>
        ...
      </button>
    );
  }

  // cursor is the default item
  return (
    <button
      key={key}
      ref={ref}
      className={cn(className, isActive && '!text-basic-yellow')}
      onClick={() => setPage(value)}
    >
      {value}
    </button>
  );
}
