import { WALLECT_NETWORKS } from '@/constant/mint';
import { TokenRewardStatus } from '@/constant/token';
import type { QuestTokensRecord } from '@/http/services/token';
import LGButton from '@/pages/components/common/buttons/LGButton';
import dayjs from 'dayjs';
import Link from 'next/link';
import { FC, useState } from 'react';

interface Props {
  item: QuestTokensRecord;
  onClaim?: (item: QuestTokensRecord) => Promise<void>;
}

const QuestTokenRow: FC<Props> = ({ item, onClaim }) => {
  const [loading, setLoading] = useState(false);
  const isClaimed = item.status === TokenRewardStatus.CLAIMED;
  const isClaiming = item.status === TokenRewardStatus.CLAIMING;
  const claimDisabled = isClaiming;
  const claimBtnText = isClaimed ? 'View' : isClaiming ? 'Claiming' : 'Claim';
  const statusText = isClaimed ? 'Claimed' : isClaiming ? 'Claiming' : 'Claim';

  function formatTime(time: number) {
    return dayjs(time).format('YYYY-MM-DD HH:mm:ss');
  }

  async function onClaimClick() {
    switch (claimBtnText) {
      case 'View':
        const url = new URL(WALLECT_NETWORKS[item.token.chain_id].blockExplorerUrls[0]);
        url.pathname = url.pathname.replace(/\/+$/, '') + '/tx/' + item.tx_hash;
        window.open(url.href, '_blank');
        return;
      case 'Claim':
        setLoading(true);
        await onClaim?.(item);
        setLoading(false);

        return;
      default:
        break;
    }
  }

  return (
    <ul className="text-base text-white transition-colors border-1 border-transparent rounded-base hover:border-basic-yellow">
      <li
        key={`${item.reward_id}_${item.created_time}`}
        className="flex justify-between items-center h-16 text-[#999] px-0 md:px-10 gap-4"
      >
        <div className="flex-[360] whitespace-nowrap text-ellipsis overflow-hidden">{item.token.symbol || '--'}</div>

        <div className="flex-[264] whitespace-nowrap text-ellipsis overflow-hidden">
          {item.token_amount_formatted || '--'}
        </div>

        <div className="flex-[224] whitespace-nowrap text-ellipsis overflow-hidden">{item.token.network || '--'}</div>

        <div className="flex-[156]">{statusText}</div>

        <div className="flex-[156] whitespace-normal">{item.claimed_time ? formatTime(item.claimed_time) : '--'}</div>

        <div className="w-16 md:w-40 shrink-0 flex justify-end">
          <LGButton
            className="w-4/5 min-w-[4rem]"
            label={claimBtnText}
            disabled={claimDisabled}
            loading={loading}
            onClick={onClaimClick}
          />
        </div>
      </li>
    </ul>
  );
};

export default QuestTokenRow;
