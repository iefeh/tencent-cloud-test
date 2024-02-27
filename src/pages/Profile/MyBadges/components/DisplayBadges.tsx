import { BadgeItem } from '@/http/services/badges';
import BasicBadge from '@/pages/components/common/badges/BasicBadge';

interface Props {
  badges?: (BadgeItem | null)[];
  onView?: (item?: BadgeItem | null) => void;
}

export default function DisplayBadges(props: Props) {
  const { badges, onView } = props;

  return (
    <div className="mt-12">
      <div className="font-semakin text-basic-yellow text-2xl">Display Badges</div>

      <div className="w-full flex justify-start items-center relative z-0 gap-[1.125rem] mt-10">
        {badges?.map((item, index) => (
          <BasicBadge key={index} item={item} forDisplay onView={onView} />
        ))}
      </div>
    </div>
  );
}
