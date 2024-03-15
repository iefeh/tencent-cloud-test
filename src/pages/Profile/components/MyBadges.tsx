import Image from 'next/image';
import myBadgesBgImg from 'img/profile/bg_my_badges.png';
import mbImg from 'img/loyalty/earn/mb.png';
import Link from 'next/link';
import useDisplayBadges from '../MyBadges/hooks/useDisplayBadges';
import DisplayBadges from '../components/DisplayBadges';
import BadgeModal from '../MyBadges/components/BadgeModal';
import { MAX_DISPLAY_COUNT } from '@/constant/badge';
import { useDisclosure } from '@nextui-org/react';
import { useMemo, useState } from 'react';
import { BadgeItem, toggleBadgeDisplayAPI } from '@/http/services/badges';
import { observer } from 'mobx-react-lite';

function MyBadges() {
  const {
    total,
    badges: displayBadges,
    queryDisplayBadges,
    sortBadges,
    loading: displayLoaidng,
    validCount,
  } = useDisplayBadges();
  const modalDisclosure = useDisclosure();
  const [currentItem, setCurrentItem] = useState<BadgeItem | null>(null);
  const MemoDisplayBadges = useMemo(
    () => (
      <DisplayBadges
        className="w-full justify-between"
        items={displayBadges}
        loading={displayLoaidng}
        onView={onView}
        onSort={sortBadges}
        onDisplayed={queryDisplayBadges}
      />
    ),
    [displayBadges],
  );

  async function onToggleDisplay(id: string, display: boolean) {
    await toggleBadgeDisplayAPI(id, display);
    await queryDisplayBadges();
  }

  function onView(item?: BadgeItem | null) {
    setCurrentItem(item || null);
    if (!item) return;

    modalDisclosure.onOpen();
  }

  return (
    <div className="w-[42.5rem] h-[15rem] relative overflow-hidden rounded-[0.625rem] border-1 border-[#1D1D1D] flex flex-col justify-between pt-[2.375rem] pb-[2rem] pr-[2.75rem] pl-[2.5625rem] hover:border-basic-yellow transition-[border-color] duration-500">
      <Image src={myBadgesBgImg} alt="" fill />

      <div className="flex justify-between items-center relative z-0 font-semakin text-basic-yellow">
        <div className="flex items-center">
          <Image className="w-[2.625rem] h-[2.625rem]" src={mbImg} alt="" />
          <span className="text-2xl ml-[0.625rem]">
            My Badges
            <span className="text-lg ml-[0.5625rem] hidden lg:inline">
              ( {total}
              {displayBadges.length} )
            </span>
          </span>
        </div>

        <div className="text-right">
          <Link href="/Profile/MyBadges">More Badges &gt;&gt;</Link>
        </div>
      </div>

      {MemoDisplayBadges}

      <BadgeModal
        item={currentItem}
        disclosure={modalDisclosure}
        canDisplay={validCount < MAX_DISPLAY_COUNT}
        onToggleDisplay={onToggleDisplay}
      />
    </div>
  );
}

export default observer(MyBadges);
