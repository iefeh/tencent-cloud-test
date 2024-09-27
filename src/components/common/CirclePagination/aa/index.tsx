import { Pagination } from '@nextui-org/react';
import type { PaginationProps } from '@nextui-org/react';
import { FC } from 'react';
import PaginationRenderItem from './PaginationRenderItem';

const AACirclePagination: FC<PaginationProps> = ({ className, ...props }) => {
  return (
    <Pagination
      {...props}
      showControls
      initialPage={1}
      renderItem={PaginationRenderItem}
      classNames={{
        base: className,
        wrapper: 'gap-3',
        item: 'w-12 h-12 text-base text-white',
      }}
      disableCursorAnimation
      radius="full"
      variant="light"
    />
  );
};

export default AACirclePagination;
