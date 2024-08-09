import BadgeModal from '@/components/profile/badges/components/BadgeModal';
import { reqClaimBadge } from '@/hooks/pages/profile/badges/hooks/useMyBadges';
import { queryMintPermitAPI, type BadgeItem } from '@/http/services/badges';
import { useMGDContext } from '@/store/MiniGameDetails';
import { useDisclosure } from '@nextui-org/react';
import { throttle } from 'lodash';
import { FC, useState } from 'react';
import MiniGameBadge from './MiniGameBadge';
import useBScroll from '@/hooks/useBScroll';
import useSbtMint from '@/hooks/useSbtMint';
import MintSuccessModal from '@/components/profile/assets/MintSuccessModal';

const BadgesTabPanel: FC = () => {
  const { data, queryDetails } = useMGDContext();
  const { badge: badges } = data || {};
  const [currentItem, setCurrentItem] = useState<BadgeItem | null>(null);
  const { scrollRef } = useBScroll();
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
    <div>
      <div ref={scrollRef} className="w-full overflow-hidden">
        <ul className="flex items-center gap-x-[1.5625rem] flex-nowrap w-max">
          {(badges || []).map((badge, index) => (
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
    </div>
  );
};

export default BadgesTabPanel;
