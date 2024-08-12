import useTransaction from '@/hooks/wallet/useTransaction';
import { queryTokenPermitAPI, type MyTokensRecord } from '@/http/services/token';
import tokenRewardABI from '@/http/abi/tokenReward.json';
import { useState } from 'react';

export default function useClaimToken() {
  const [loading, setLoading] = useState(false);
  const { loading: transactionLoading, onTransaction } = useTransaction({ abi: tokenRewardABI, method: 'ClaimToken' });

  async function onClaim(item: MyTokensRecord) {
    setLoading(true);
    const permitRes = await queryTokenPermitAPI({ reward_ids: item.reward_id });
    if (!permitRes) {
      setLoading(false);
      return;
    }

    const { contract_address, chain_id, permits } = permitRes;
    const res = await onTransaction(permits[0], { contractAddress: contract_address, chainId: chain_id });
    console.log('claim result:', res);
    setLoading(false);
  }

  return { loading, transactionLoading, onClaim };
}
