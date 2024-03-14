import Head from 'next/head';
import AutoBreadcrumbs from '@/pages/components/common/AutoBreadcrumbs';
import DisplayBadges from '../components/DisplayBadges';
import MyBadges from './components/MyBadges';
import useMyBadges from './hooks/useMyBadges';
import useDisplayBadges from './hooks/useDisplayBadges';
import { throttle } from 'lodash';
import { useDisclosure } from '@nextui-org/react';
import BadgeModal from './components/BadgeModal';
import { useEffect, useState } from 'react';
import { BadgeItem, toggleBadgeDisplayAPI } from '@/http/services/badges';
import { observer } from 'mobx-react-lite';
import { MAX_DISPLAY_COUNT } from '@/constant/badge';

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

  const updateBadges = throttle(async () => {
    await Promise.all([queryDisplayBadges(), queryMyBadges()]);
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

  useEffect(() => {
    if (!currentItem) return;

    const item = badges.find((item) => item?.badge_id === currentItem.badge_id);
    if (!item) return;

    setCurrentItem(item);
  }, [badges]);

  return (
    <section
      id="luxy"
      className="w-full flex flex-col px-8 md:px-32 lg:px-[16.25rem] pt-[9.125rem] pb-[13.5rem] mx-auto min-h-screen bg-[url('/img/profile/bg.png')] bg-[length:100%_auto] bg-no-repeat"
    >
      <Head>
        <title>My Badges | Moonveil Entertainment</title>
      </Head>

      <AutoBreadcrumbs hrefs={['/Profile']} />

      <div className="mt-12">
        <div className="font-semakin text-basic-yellow text-2xl">Display Badges</div>

        <DisplayBadges
          className="w-min justify-start mt-10"
          items={displayBadges}
          badges={badges}
          loading={displayLoaidng}
          onView={onView}
          onSort={sortBadges}
          onDisplayed={updateBadges}
        />
      </div>

      <MyBadges
        total={total}
        badges={badges}
        loading={fullQueryLoading}
        onClaim={claimBadge}
        onMint={mintBadge}
        onView={onView}
      />

      <BadgeModal
        item={currentItem}
        disclosure={modalDisclosure}
        canDisplay={validCount < MAX_DISPLAY_COUNT}
        onToggleDisplay={onToggleDisplay}
        onClaim={claimBadge}
        onMint={mintBadge}
      />
    </section>
  );
}

export default observer(MyBadgesPage);
