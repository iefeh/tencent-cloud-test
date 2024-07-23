import BadgeModal from '@/components/profile/badges/components/BadgeModal';
import MyBadges from '@/components/profile/badges/components/MyBadges';
import useMyBadges from '@/hooks/pages/profile/badges/hooks/useMyBadges';
import { type BadgeItem } from '@/http/services/badges';
import { useDisclosure } from '@nextui-org/react';
import { throttle } from 'lodash';
import { FC, useState } from 'react';

const BadgesTabPanel: FC = () => {
  const [currentItem, setCurrentItem] = useState<BadgeItem | null>(null);
  const modalDisclosure = useDisclosure();
  const { total, badges, claimBadge, loading: fullQueryLoading } = useMyBadges();
  function onView(item?: BadgeItem | null) {
    setCurrentItem(item || null);
    if (!item) return;

    modalDisclosure.onOpen();
  }

  const onClaimBadge = throttle(async (item: BadgeItem) => {
    await claimBadge(item);
  }, 500);

  return (
    <div>
      <MyBadges total={total} badges={badges} loading={fullQueryLoading} onClaim={onClaimBadge} onView={onView} />

      <BadgeModal item={currentItem} disclosure={modalDisclosure} canDisplay={false} onClaim={onClaimBadge} />
    </div>
  );
};

export default BadgesTabPanel;
