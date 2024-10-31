import useTransaction from '@/hooks/wallet/useTransaction';
import { queryTokenPermitAPI, postTokenTxAPI, type QuestTokensRecord } from '@/http/services/token';
import tokenRewardABI from '@/http/abi/tokenReward.json';
import { useState } from 'react';
import { toast } from 'react-toastify';

interface ClaimTokenParams {
  updateList: () => void;
}

export default function useClaimToken(pramas: ClaimTokenParams) {
  const { updateList } = pramas;
  const [loading, setLoading] = useState(false);
  const { loading: transactionLoading, onTransaction } = useTransaction({ abi: tokenRewardABI, method: 'claimTokens' });

  async function onClaim(item: QuestTokensRecord) {
    setLoading(true);
    try {
      const permitRes = await queryTokenPermitAPI({ reward_ids: item.reward_id });
      if (!permitRes) {
        setLoading(false);
        return;
      }
      const { contract_address, chain_id, permits } = permitRes || {};

      const res = await onTransaction({
        params: permits,
        noFlatParams: true,
        config: { contractAddress: contract_address, chainId: chain_id },
      });
      console.log('claim result:', res);

      const { hash } = res || {};

      if (hash) {
        const postRes = await postTokenTxAPI({ tx_hash: hash, chain_id: chain_id });
        if (!postRes) {
          toast.success('You have successfully claimed rewards!');
        }
      }

      await updateList();
    } catch (error) {
      console.dir('[claimTokens error]: ', error);
    }

    setLoading(false);
  }

  return { loading, transactionLoading, onClaim };
}
