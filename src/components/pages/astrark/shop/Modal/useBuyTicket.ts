import useTransaction from '@/hooks/wallet/useTransaction';
import payTicketABI from '@/http/abi/shop_abi.json'
import { buyTicketPermitAPI } from '@/http/services/astrark';
import { toast } from 'react-toastify';
import type { AstrArk } from '@/types/astrark';
import { useState } from 'react';

const useBuyTicket = () => {
  const { loading, onTransaction, beReady, reqToCheckIsConnected } = useTransaction({ abi: payTicketABI, method: 'buyProduct' });
  const [errorMessage, setErrorMessage] = useState('');

  const beReadyForBuyTicket = async (chain_id: string | undefined) => {
    if (!chain_id) return
    const res = await beReady(chain_id);
    return res;
  }

  async function onButtonClick(data: AstrArk.PermitProps) {
    const { product_id, token_id } = data
    const res = await buyTicketPermitAPI({ product_id, token_id })
    if (!res) {
      return false;
    }

    const { contract_address, chain_id, permit } = res || {};
    const result = await onTransaction({
      passLogin: true,
      params: permit,
      config: { chainId: chain_id, contractAddress: contract_address },
      onError: (code, message = '') => {
        if (message && message.indexOf('unexpected message sender') > -1) {
          toast.error(
            'Please make sure to connect to a wallet that corresponds to the address associated with the currently logged-in account.',
          );

          setErrorMessage('Please make sure to connect to a wallet that corresponds to the address associated with the currently logged-in account.')
          return true;
        }
        if (message && message.indexOf('duplicate product permit') > -1) {
          toast.error('Your last purchase transaction is still confirming, please try again later.');
          
          setErrorMessage('Your last purchase transaction is still confirming, please try again later.')
          return true;
        }
      },
    });

    return !!result;
  }

  return { loading, errorMessage, onButtonClick, beReadyForBuyTicket, reqToCheckIsConnected };
}

export default useBuyTicket;