import BadgeModal from '@/components/profile/badges/components/BadgeModal';
import { reqClaimBadge } from '@/hooks/pages/profile/badges/hooks/useMyBadges';
import { queryMintPermitAPI, type BadgeItem } from '@/http/services/badges';
import { useMGDContext } from '@/store/MiniGameDetails';
import { cn, useDisclosure } from '@nextui-org/react';
import { throttle } from 'lodash';
import { FC, useState } from 'react';
import MiniGameBadge from './MiniGameBadge';
import useBScroll from '@/hooks/useBScroll';
import useSbtMint from '@/hooks/useSbtMint';
import MintSuccessModal from '@/components/profile/assets/MintSuccessModal';
import { isMobile } from 'react-device-detect';

const BadgesTabPanel: FC = () => {
  const { data, queryDetails } = useMGDContext();
  const { badge: badges } = data || {};
  const [currentItem, setCurrentItem] = useState<BadgeItem | null>(null);
  const { scrollRef } = useBScroll({ scrollX: !isMobile, scrollY: isMobile });
  const modalDisclosure = useDisclosure();
  const mintDisclosure = useDisclosure();
  const { onButtonClick } = useSbtMint();

  function onView(item?: BadgeItem | null) {
    setCurrentItem(item || null);
    if (!item) return;

    modalDisclosure.onOpen();
  }

  async function onClaim(item: BadgeItem) {
    const res = await reqClaimBadge(item);
    if (res) await queryDetails();
  }

  const mintBadge = throttle(async (id: string) => {
    let result = false;
    const res = await queryMintPermitAPI({ mint_id: id });
    if (res && res.chain_id && res.permit) {
      result = !!(await onButtonClick(res));
      await queryDetails();
    }

    return result;
  }, 500);

  async function onMint(id: string) {
    const res = await mintBadge(id);
    if (!res) return;

    setCurrentItem(null);
    modalDisclosure.onClose();
    mintDisclosure.onOpen();
  }

  return (
    <>
      <div ref={scrollRef} className={cn(['w-full overflow-hidden', isMobile && 'max-h-[30rem]'])}>
        <ul
          className={cn([
            'flex flex-col lg:flex-row items-center gap-x-[1.5625rem] gap-y-4 flex-nowrap',
            isMobile ? 'w-full' : 'w-max',
          ])}
        >
          {Array(2)
            .fill(badges || [])
            .flat()
            .map((badge, index) => (
              <MiniGameBadge key={index} item={badge} onView={onView} onClaim={onClaim} onMint={onMint} />
            ))}
        </ul>
      </div>

      <BadgeModal
        item={currentItem}
        disclosure={modalDisclosure}
        canDisplay={false}
        onClaim={onClaim}
        onMint={onMint}
      />

      <MintSuccessModal disclosure={mintDisclosure} />
    </>
  );
};

export default BadgesTabPanel;
