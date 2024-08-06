import Head from 'next/head';
import AutoBreadcrumbs from '@/pages/components/common/AutoBreadcrumbs';
import DisplayBadges, { type DisplayBadgesRef } from '../components/DisplayBadges';
import MyBadges from '../../../components/profile/badges/components/MyBadges';
import useMyBadges from '@/hooks/pages/profile/badges/hooks/useMyBadges';
import useDisplayBadges from '@/hooks/pages/profile/badges/hooks/useDisplayBadges';
import { throttle } from 'lodash';
import { cn, useDisclosure } from '@nextui-org/react';
import BadgeModal from '../../../components/profile/badges/components/BadgeModal';
import { useEffect, useRef, useState } from 'react';
import { BadgeItem, toggleBadgeDisplayAPI } from '@/http/services/badges';
import { observer } from 'mobx-react-lite';
import { MAX_DISPLAY_COUNT } from '@/constant/badge';
import { isMobile } from 'react-device-detect';
import BScroll from 'better-scroll';
import MintSuccessModal from '@/components/profile/assets/MintSuccessModal';

function MyBadgesPage() {
  const {
    badges: displayBadges,
    queryDisplayBadges,
    sortBadges,
    loading: displayLoaidng,
    validCount,
  } = useDisplayBadges();
  const { total, badges, queryMyBadges, claimBadge, mintBadge, loading: fullQueryLoading } = useMyBadges();
  const modalDisclosure = useDisclosure();
  const [currentItem, setCurrentItem] = useState<BadgeItem | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const bsRef = useRef<BScroll | null>(null);
  const dbRef = useRef<DisplayBadgesRef>(null);
  const mintDisclosure = useDisclosure();

  async function onMint(id: string) {
    const res = await mintBadge(id);
    if (!res) return;

    setCurrentItem(null);
    modalDisclosure.onClose();
    mintDisclosure.onOpen();
  }

  const updateBadges = throttle(async () => {
    await Promise.all([queryDisplayBadges(), queryMyBadges()]);
    setTimeout(() => {
      bsRef.current?.refresh();
    }, 100);
  }, 500);

  function onView(item?: BadgeItem | null) {
    setCurrentItem(item || null);
    if (!item) return;

    modalDisclosure.onOpen();
  }

  async function onToggleDisplay(id: string, display: boolean) {
    await toggleBadgeDisplayAPI(id, display);
    await updateBadges();
  }

  const onClaimBadge = throttle(async (item: BadgeItem) => {
    await claimBadge(item);
    await dbRef.current?.update();
  }, 500);

  useEffect(() => {
    if (!currentItem) return;

    const item = badges.find((item) => item?.badge_id === currentItem.badge_id);
    if (!item) return;

    setCurrentItem(item);
  }, [badges]);

  useEffect(() => {
    if (!scrollRef.current) return;

    bsRef.current = new BScroll(scrollRef.current, { scrollX: true, scrollbar: true, probeType: 3 });

    return () => {
      if (bsRef.current) bsRef.current.destroy();
    };
  }, []);

  return (
    <section
      id="luxy"
      className="w-full flex flex-col px-12 md:px-32 lg:px-[16.25rem] pt-[9.125rem] pb-[13.5rem] mx-auto min-h-screen bg-[url('/img/profile/bg.png')] bg-[length:100%_auto] bg-no-repeat"
    >
      <Head>
        <title>My Badges | Moonveil Entertainment</title>
      </Head>

      <AutoBreadcrumbs hrefs={['/Profile']} />

      <div className="mt-12">
        <div className="font-semakin text-basic-yellow text-2xl">Display Badges</div>

        <div ref={scrollRef} className="w-full overflow-hidden relative">
          <DisplayBadges
            ref={dbRef}
            className={cn(['justify-start mt-10', isMobile ? 'w-max' : 'w-min'])}
            items={displayBadges}
            loading={displayLoaidng}
            onView={onView}
            onSort={sortBadges}
            onDisplayed={updateBadges}
          />
        </div>
      </div>

      <MyBadges
        total={total}
        badges={badges}
        loading={fullQueryLoading}
        onClaim={onClaimBadge}
        onMint={onMint}
        onView={onView}
      />

      <BadgeModal
        item={currentItem}
        disclosure={modalDisclosure}
        canDisplay={validCount < MAX_DISPLAY_COUNT}
        onToggleDisplay={onToggleDisplay}
        onClaim={onClaimBadge}
        onMint={onMint}
      />

      <MintSuccessModal disclosure={mintDisclosure} />
    </section>
  );
}

export default observer(MyBadgesPage);
