import { BadgeItem } from '@/http/services/badges';
import BasicBadge from '@/pages/components/common/badges/BasicBadge';
import useSort from '../hooks/useSort';
import { Popover, PopoverContent, PopoverTrigger } from '@nextui-org/react';
import { useState } from 'react';
import { throttle } from 'lodash';

interface Props {
  badges?: (BadgeItem | null)[];
  displayedBadges?: (BadgeItem | null)[];
  onView?: (item?: BadgeItem | null) => void;
  onSort?: (newIndex: number, oldIndex: number) => void;
  onDisplay?: (id: string, index?: number) => void;
}

export default function DisplayBadges(props: Props) {
  const { badges, displayedBadges, onView, onSort, onDisplay } = props;
  const { containerElRef } = useSort({
    onChange: (evt) => {
      const { newIndex, oldIndex } = evt;
      onSort?.(newIndex!, oldIndex!);
    },
  });
  const fullBadges = (badges || []).slice().filter((item) => item?.claimed);
  if (fullBadges.length < 10) {
    fullBadges.push(...Array(10 - fullBadges.length).fill(null));
  }

  const EmptyBadge = ({ badgeIndex }: { badgeIndex: number }) => {
    const [isOpen, setIsOpen] = useState(false);

    const onChooseToDisplay = throttle(async (item: BadgeItem | null) => {
      if (!onDisplay || !item) return;

      await onDisplay(item.id, badgeIndex);
    }, 500);

    return (
      <Popover placement="bottom" isOpen={isOpen} onOpenChange={(open) => setIsOpen(open)}>
        <PopoverTrigger>
          <BasicBadge item={null} forDisplay onView={() => setIsOpen(true)} />
        </PopoverTrigger>

        <PopoverContent>
          <div className="flex flex-col px-2 py-4">
            <p className="text-lg font-poppins text-white">Please select the badge you&apos;d like to display.</p>

            <div className="grid grid-cols-5 gap-3 mt-4 max-h-[14rem] overflow-y-auto py-2">
              {fullBadges.map((item, index) => (
                <BasicBadge
                  key={item ? `id_${item.id}` : `index_${index}`}
                  item={item}
                  forDisplay
                  onView={() => onChooseToDisplay(item)}
                />
              ))}
            </div>
          </div>
        </PopoverContent>
      </Popover>
    );
  };

  return (
    <div className="mt-12">
      <div className="font-semakin text-basic-yellow text-2xl">Display Badges</div>

      <ul ref={containerElRef} className="w-full flex justify-start items-center relative z-0 gap-[1.125rem] mt-10">
        {displayedBadges?.map((item, index) =>
          item ? (
            <BasicBadge key={`id_${item.id}`} item={item} forDisplay onView={onView} />
          ) : (
            <EmptyBadge key={`index_${index}`} badgeIndex={index} />
          ),
        )}
      </ul>
    </div>
  );
}
