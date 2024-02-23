import BasicBadge from '@/pages/components/common/badges/BasicBadge';

export default function DisplayBadges() {
  return (
    <div className="mt-12">
      <div className="font-semakin text-basic-yellow text-2xl">Display Badges</div>

      <div className="w-full flex justify-start items-center relative z-0 gap-[1.125rem] mt-10">
        <BasicBadge />
        <BasicBadge />
        <BasicBadge />
        <BasicBadge />
        <BasicBadge />
      </div>
    </div>
  );
}
