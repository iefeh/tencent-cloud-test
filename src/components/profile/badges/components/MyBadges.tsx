import { BadgeItem } from '@/http/services/badges';
import CircularLoading from '@/pages/components/common/CircularLoading';
import BasicBadge from '@/pages/components/common/badges/BasicBadge';
import { useEffect, useRef } from 'react';
import Sortable from 'sortablejs';

interface Props {
  total: number;
  badges: (BadgeItem | null)[];
  loading?: boolean;
  onView?: (item?: BadgeItem | null) => void;
  onClaim?: (item: BadgeItem) => void;
  onMint?: (id: string) => void;
}

export default function MyBadges(props: Props) {
  const { total, badges, loading, onView, onClaim, onMint } = props;

  return (
    <div className="mt-12">
      <div className="font-semakin text-basic-yellow text-2xl">My Badges ( {total} )</div>

      <ul className="w-full grid grid-cols-3 md:grid-cols-8 xl:grid-cols-9 relative z-0 gap-6 mt-10 border-1 border-basic-gray rounded-base p-14">
        {badges.map((badge, index) => (
          <BasicBadge key={index} item={badge} onView={onView} onClaim={onClaim} onMint={onMint} />
        ))}

        {loading && <CircularLoading />}
      </ul>
    </div>
  );
}
