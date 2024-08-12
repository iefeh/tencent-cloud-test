import { Pagination } from '@nextui-org/react';
import type { PaginationProps } from '@nextui-org/react';
import { FC } from 'react';
import MiniPaginationRenderItem from './MiniPaginationRenderItem';
import useBScroll from '@/hooks/useBScroll';

const MiniCirclePagination: FC<PaginationProps> = ({ className, ...props }) => {
  const { scrollRef } = useBScroll();

  return (
    <Pagination
      ref={scrollRef}
      {...props}
      showControls
      initialPage={1}
      renderItem={MiniPaginationRenderItem}
      classNames={{
        base: className,
        wrapper: 'gap-3',
        item: 'w-12 h-12 text-base border-2 border-brown text-brown !bg-light-yellow-1',
      }}
      disableCursorAnimation
      radius="full"
      variant="light"
    />
  );
};

export default MiniCirclePagination;
