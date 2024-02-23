import BasicBadge from '@/pages/components/common/badges/BasicBadge';
import { useState } from 'react';

export default function MyBadges() {
  const [total, setTotal] = useState(32);
  const [badges, setBadges] = useState(Array(36).fill(''));

  return (
    <div className="mt-12">
      <div className="font-semakin text-basic-yellow text-2xl">My Badges ( {total} )</div>

      <div className="w-full grid grid-cols-3 md:grid-cols-8 xl:grid-cols-9 relative z-0 gap-6 mt-10 border-1 border-basic-gray rounded-base p-14">
        {badges.map((badge, index) => (
          <BasicBadge key={index} />
        ))}
      </div>
    </div>
  );
}
