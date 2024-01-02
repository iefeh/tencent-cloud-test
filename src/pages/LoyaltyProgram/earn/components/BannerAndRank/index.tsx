import HotBanner from './HotBanner';
import Rank from './Rank';

export default function BannerAndRank() {
  return (
    <div className="flex justify-between gap-[1.5625rem] pt-[8.8125rem]">
      <HotBanner />

      <Rank />
    </div>
  );
}
