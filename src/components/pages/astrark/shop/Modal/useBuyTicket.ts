import useTransaction from '@/hooks/wallet/useTransaction';
import payTicketABI from '@/http/abi/shop_abi.json';
import erc20ABI from '@/http/abi/erc20.json';
import { toast } from 'react-toastify';
import type { AstrArk } from '@/types/astrark';
import { useState } from 'react';
import Web3 from 'web3';
import { buyTicketPermitAPI } from '@/http/services/astrark';

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
  const [errorMessage, setErrorMessage] = useState('');

  async function onApprove(itemInfo: AstrArk.PriceToken) {
    const permitContractAddress = permitData?.contract_address || '';

    const {
      address: contractAddress,
      network: { chain_id },
      product_token_price_with_discount,
    } = itemInfo;
    const result = await onApproveTransaction({
      passLogin: true,
      params: [permitContractAddress, Web3.utils.toWei(Math.ceil(product_token_price_with_discount) * 2, 'ether')],
      config: { chainId: chain_id, contractAddress },
    });

    return !!result;
  }

  async function onButtonClick(permitProp: AstrArk.PermitProps, data = permitData) {
    const { contract_address, chain_id, permit } = data || {};
    let nextRes: any = null;
    const result = await onTransaction({
      passLogin: true,
      params: permit,
      config: { chainId: chain_id, contractAddress: contract_address },
      options: { value: permit?.tokenAmount },
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

          nextRes = await onButtonClick(permitProp, nextPermit);
          return true;
        }
      },
    });

    return !!result || !!nextRes;
  }

  return { approveLoading, loading, errorMessage, onApprove, onButtonClick, beReadyForBuyTicket: beReady };
};

export default useBuyTicket;
