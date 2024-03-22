import useScrollLoad from '@/hooks/useScrollLoad';
import { BadgeItem, queryCanDisplayBadgesAPI, toggleBadgeDisplayAPI } from '@/http/services/badges';
import BasicBadge from '@/pages/components/common/badges/BasicBadge';
import { Popover, PopoverContent, PopoverTrigger, cn } from '@nextui-org/react';
import { debounce, throttle } from 'lodash';
import { observer } from 'mobx-react-lite';
import {
  ForwardRefRenderFunction,
  RefObject,
  forwardRef,
  useEffect,
  useImperativeHandle,
  useMemo,
  useState,
} from 'react';
import useSort from '../MyBadges/hooks/useSort';
import CircularLoading from '@/pages/components/common/CircularLoading';

interface Props {
  ref?: RefObject<DisplayBadgesRef>;
  className?: string;
  loading?: boolean;
  items?: (BadgeItem | null)[];
  onSort?: (newIndex: number, oldIndex: number) => void;
  onView?: (item?: BadgeItem | null) => void;
  onDisplayed?: () => void;
}

export interface DisplayBadgesRef {
  update: () => void;
}

const DisplayBadgesPopover: ForwardRefRenderFunction<DisplayBadgesRef, Props> = (
  { className, items, onView, onDisplayed, onSort },
  ref,
) => {
  const { data, scrollRef, queryData, loading } = useScrollLoad<BadgeItem>({
    minCount: 10,
    pageSize: 20,
    watchAuth: true,
    queryKey: 'data',
    queryFn: queryCanDisplayBadgesAPI,
  });
  const { containerElRef } = useSort({
    onChange: debounce(async (evt) => {
      const { newIndex, oldIndex } = evt;
      await onSort?.(newIndex!, oldIndex!);
    }, 500),
  });
  const [toggleLoading, setToggleLoading] = useState(false);

  const onDisplay = throttle(async (item: BadgeItem | null) => {
    if (!item) return;

    setToggleLoading(true);
    await toggleBadgeDisplayAPI(item.badge_id, !item.display);
    await queryData(true);
    await onDisplayed?.();
    setToggleLoading(false);
  }, 500);

  useEffect(() => {
    queryData(true);
  }, [items]);

  useImperativeHandle(ref, () => ({ update: queryData }));

  const SinglePopover = ({ item }: { item: BadgeItem | null }) => {
    const [isOpen, setIsOpen] = useState(false);

    function onOpen() {
      setIsOpen(true);
    }

    return (
      <Popover placement="bottom" isOpen={isOpen} onOpenChange={(open) => setIsOpen(open)}>
        <PopoverTrigger>{<BasicBadge item={item || null} forDisplay onView={item ? onView : onOpen} />}</PopoverTrigger>

        <PopoverContent>
          <div className="flex flex-col px-2 py-4">
            <p className="text-lg font-poppins text-white">Please select the badge you&apos;d like to display.</p>

            <div ref={scrollRef} className="h-[15rem] mt-4 overflow-hidden">
              <div className="w-full min-h-full grid grid-cols-5 gap-3">
                {data.map((item, index) => (
                  <BasicBadge
                    key={item ? `id_${item.badge_id}` : `index_${index}`}
                    item={item}
                    forDisplay
                    onView={() => onDisplay(item)}
                  />
                ))}
              </div>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    );
  };

  const Pops = useMemo(
    () => (
      <>{items && items.length > 0 ? items.map((item, index) => <SinglePopover key={index} item={item} />) : null}</>
    ),
    [items, data],
  );

  return (
    <ul ref={containerElRef} className={cn(['flex items-center relative z-0 gap-[1.125rem]', className])}>
      {Pops}

      {(loading || toggleLoading) && <CircularLoading cirleClassName="!w-24 !h-24 !leading-[6rem]" />}
    </ul>
  );
};

export default observer(forwardRef(DisplayBadgesPopover));
