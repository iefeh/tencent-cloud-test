import { BadgeItem } from '@/http/services/badges';
import BasicBadge from '@/pages/components/common/badges/BasicBadge';
import useSort from '../hooks/useSort';

interface Props {
  badges?: (BadgeItem | null)[];
  onView?: (item?: BadgeItem | null) => void;
  onSort?: (newIndex: number, oldIndex: number) => void;
}

export default function DisplayBadges(props: Props) {
  const { badges, onView, onSort } = props;
  const { containerElRef } = useSort({
    onChange: (evt) => {
      const { newIndex, oldIndex } = evt;
      onSort?.(newIndex!, oldIndex!);
    },
  });

  return (
    <div className="mt-12">
      <div className="font-semakin text-basic-yellow text-2xl">Display Badges</div>

      <ul ref={containerElRef} className="w-full flex justify-start items-center relative z-0 gap-[1.125rem] mt-10">
        {badges?.map((item, index) => (
          <BasicBadge key={item ? `id_${item.id}` : `index_${index}`} item={item} forDisplay onView={onView} />
        ))}
      </ul>
    </div>
  );
}
