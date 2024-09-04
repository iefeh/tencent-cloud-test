import BadgeModal from '@/components/profile/badges/components/BadgeModal';
import { reqClaimBadge } from '@/hooks/pages/profile/badges/hooks/useMyBadges';
import { queryMintPermitAPI, type BadgeItem } from '@/http/services/badges';
import { useMGDContext } from '@/store/MiniGameDetails';
import { cn, useDisclosure } from '@nextui-org/react';
import { throttle } from 'lodash';
import { FC, useEffect, useState } from 'react';
import MiniGameBadge from './BadgeItem';
import useBScroll from '@/hooks/useBScroll';
import useSbtMint from '@/hooks/useSbtMint';
import MintSuccessModal from '@/components/profile/assets/MintSuccessModal';
import { isMobile } from 'react-device-detect';
import { queryMiniGameBadgesAPI } from '@/http/services/minigames';
import CircularLoading from '@/pages/components/common/CircularLoading';
import EmptyContent from '@/components/common/EmptyContent';
import { observer } from 'mobx-react-lite';

const BadgesTabPanel: FC = () => {
  const { data, queryDetails } = useMGDContext();
  const [badges, setBadges] = useState<BadgeItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentItem, setCurrentItem] = useState<BadgeItem | null>(null);
  const { scrollRef } = useBScroll({ scrollX: !isMobile, scrollY: isMobile });
  const modalDisclosure = useDisclosure();
  const mintDisclosure = useDisclosure();
  const { onButtonClick } = useSbtMint();

  async function queryBadges() {
    if (!data?.client_id) {
      setBadges([]);
      return;
    }

    setLoading(true);
    const res = await queryMiniGameBadgesAPI({ client_id: data.client_id });
    setBadges(res?.badge || []);
    setLoading(false);
  }

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

  useEffect(() => {
    queryBadges();
  }, [data]);

  return (
    <div
      className={cn([
        'w-full min-h-[20rem] rounded-base overflow-hidden relative',
        !isMobile && badges.length < 1 && 'h-[36rem]',
      ])}
    >
      {loading ? (
        <CircularLoading />
      ) : badges.length < 1 ? (
        <EmptyContent />
      ) : (
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
      )}

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

export default observer(BadgesTabPanel);
