import { PaginationItemRenderProps, PaginationItemType, cn } from '@nextui-org/react';
import { ChevronIcon } from './ChevronIcon';

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
        className={cn(className, activePage === total && 'text-basic-gray border-basic-gray')}
        onClick={onNext}
      >
        <ChevronIcon className="rotate-180" />
      </button>
    );
  }

  if (value === PaginationItemType.PREV) {
    return (
      <button key={key} className={cn(className, isActive && 'border-white text-white')} onClick={onPrevious}>
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
      className={cn(
        className,
        '!bg-basic-gray active:text-basic-yellow data-[active=true]:text-basic-yellow',
        isActive && 'border-1 border-basic-yellow !bg-transparent !text-basic-yellow',
      )}
      onClick={() => setPage(value)}
    >
      {value}
    </button>
  );
}
