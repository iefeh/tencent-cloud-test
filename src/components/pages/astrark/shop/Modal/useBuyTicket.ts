import useTransaction from '@/hooks/wallet/useTransaction';
import payTicketABI from '@/http/abi/shop_abi.json';
import erc20ABI from '@/http/abi/erc20.json';
import { toast } from 'react-toastify';
import type { AstrArk } from '@/types/astrark';
import { useState } from 'react';
import { buyTicketPermitAPI } from '@/http/services/astrark';
import { toWei } from '@/utils/wallet/calc';
import { useWeb3ModalAccount } from '@web3modal/ethers/react';
import BN from 'bignumber.js';

export async function queryPermit(permitProp: AstrArk.PermitProps) {
  const { product_id = '', token_id } = permitProp;
  const res = await buyTicketPermitAPI({ product_id, token_id });
  if (!res?.chain_id && !res?.reach_purchase_limit) return null;

  return res;
}

const useBuyTicket = (
  permitData?: AstrArk.PermitRespose | null,
  expireCallback?: () => Promise<AstrArk.PermitRespose | null>,
) => {
  const { loading, onTransaction, beReady } = useTransaction({
    abi: payTicketABI,
    method: 'buyProduct',
  });
  const { loading: approveLoading, onTransaction: onApproveTransaction } = useTransaction({
    abi: erc20ABI,
    method: 'approve',
  });
  const { loading: allowanceLoading, onTransaction: onAllowanceTransaction } = useTransaction({
    abi: erc20ABI,
    method: 'allowance',
  });
  const [errorMessage, setErrorMessage] = useState('');
  const { address } = useWeb3ModalAccount();

  async function onApprove(itemInfo: AstrArk.PriceToken, data: AstrArk.PermitRespose) {
    const permitContractAddress = permitData?.contract_address || '';

    const {
      address: contractAddress,
      network: { chain_id },
      product_token_price_with_discount,
    } = itemInfo;

    const allowanceRes = await onAllowanceTransaction({
      passLogin: true,
      noWait: true,
      params: [address, permitContractAddress],
      config: { chainId: chain_id, contractAddress },
    });

    console.log('approve allowance:', allowanceRes, data.permit.tokenAmount);
    if (
      allowanceRes !== undefined &&
      allowanceRes !== null &&
      BN(allowanceRes.toString()).gte(BN(data.permit.tokenAmount))
    ) {
      return true;
    }

    const result = await onApproveTransaction({
      passLogin: true,
      params: [
        permitContractAddress,
        toWei(Math.ceil(product_token_price_with_discount) * 2, itemInfo.decimal).toString(),
      ],
      config: { chainId: chain_id, contractAddress },
    });

    return !!result;
  }

  async function onButtonClick(isOriginal: boolean, permitProp: AstrArk.PermitProps, data = permitData) {
    const { contract_address, chain_id, permit } = data || {};
    let nextRes: any = null;
    const result = await onTransaction({
      passLogin: true,
      params: permit,
      config: { chainId: chain_id, contractAddress: contract_address },
      options: isOriginal ? { value: permit?.tokenAmount } : {},
      onError: async (code, message = '') => {
        if (message && message.indexOf('unexpected message sender') > -1) {
          toast.error(
            'Please make sure to connect to a wallet that corresponds to the address associated with the currently logged-in account.',
          );

          setErrorMessage(
            'Please make sure to connect to a wallet that corresponds to the address associated with the currently logged-in account.',
          );
          return true;
        }
        if (message && message.indexOf('duplicate product permit') > -1) {
          toast.error('Your last purchase transaction is still confirming, please try again later.');

          setErrorMessage('Your last purchase transaction is still confirming, please try again later.');
          return true;
        }
        if (message && message.indexOf('insufficient allowance') > -1) {
          toast.error(
            'You haven’t granted sufficient token allowance for this purchase. Please update your allowance and try again.',
          );

          setErrorMessage(
            'You haven’t granted sufficient token allowance for this purchase. Please update your allowance and try again.',
          );
          return true;
        }
        if (message && message.indexOf('permit expired') > -1) {
          // permit过期后自动请求刷新，继续purchase流程
          const nextPermit = await expireCallback?.();
          if (!nextPermit) return true;

          nextRes = await onButtonClick(isOriginal, permitProp, nextPermit);
          return true;
        }
      },
    });

    return !!result || !!nextRes;
  }

  return {
    approveLoading: approveLoading || allowanceLoading,
    loading,
    errorMessage,
    onApprove,
    onButtonClick,
    beReadyForBuyTicket: beReady,
  };
};

export default useBuyTicket;
