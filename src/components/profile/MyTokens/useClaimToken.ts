import useTransaction from '@/hooks/wallet/useTransaction';
import { queryTokenPermitAPI, postTokenTxAPI, type MyTokensRecord } from '@/http/services/token';
import tokenRewardABI from '@/http/abi/tokenReward.json';
import { useState } from 'react';
import { ethers } from 'ethers';

interface ClaimTokenParams {
  updateList: () => void;
}

export default function useClaimToken(pramas: ClaimTokenParams) {
  const { updateList } = pramas;
  const [loading, setLoading] = useState(false);
  const { loading: transactionLoading, onTransaction } = useTransaction({ abi: tokenRewardABI, method: 'claimTokens' });

  async function onClaim(item: MyTokensRecord) {
    setLoading(true);
    try {
      const permitRes = await queryTokenPermitAPI({ reward_ids: item.reward_id });
      if (!permitRes) {
        setLoading(false);
        return;
      }
      const { contract_address, chain_id, permits } = permitRes || {};

      const res = await onTransaction(permits, {}, { contractAddress: contract_address, chainId: chain_id });
      console.log('claim result:', res);

      const { hash } = res || {};

      if (hash) {
        await postTokenTxAPI({ tx_hash: hash, chain_id: chain_id });
      }

      await updateList();
    } catch (error) {
      console.dir('[claimTokens error]: ', error);
    }

    setLoading(false);
  }

  return { loading, transactionLoading, onClaim };
}
