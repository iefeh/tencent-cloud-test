import { PaginationItemRenderProps, PaginationItemType, cn } from '@nextui-org/react';
import ChevronIcon from '../ChevronIcon';

export default function MiniPaginationRenderItem({
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
        className={cn([className, activePage < total || 'cursor-not-allowed grayscale'])}
        disabled={activePage >= total}
        onClick={onNext}
      >
        <ChevronIcon className="rotate-180" />
      </button>
    );
  }

  if (value === PaginationItemType.PREV) {
    return (
      <button
        key={key}
        className={cn([className, activePage > 1 || 'cursor-not-allowed grayscale'])}
        disabled={activePage <= 1}
        onClick={onPrevious}
      >
        <ChevronIcon />
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
      className={cn(className, '!bg-light-yellow-1', isActive && '!bg-gradient-to-t from-[#FFDB4E] to-[#FDBF03]')}
      onClick={() => setPage(value)}
    >
      {value}
    </button>
  );
}
