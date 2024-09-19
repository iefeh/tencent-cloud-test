import useTransaction from '@/hooks/wallet/useTransaction';
import payTicketABI from '@/http/abi/shop_abi.json'
import { buyTicketPermitAPI } from '@/http/services/astrark';
import { toast } from 'react-toastify';
import type { AstrArk } from '@/types/astrark';
import { useState } from 'react';


const useBuyTicket = () => {
  const { loading, onTransaction, beReady } = useTransaction({ abi: payTicketABI, method: 'buyProduct' });
  const [transactionInfo, setTransactionInfo] = useState({
    contract_address: '',
    chain_id: '',
    permit: {}
  });

  const beReadyForBuyTicket = async (data: AstrArk.PermitProps) => {
    const { product_id, token_id } = data
    const res = await buyTicketPermitAPI({ product_id, token_id })
    setTransactionInfo(res)

    await beReady();
  }

  async function onButtonClick() {
    const { contract_address, chain_id, permit } = transactionInfo || {};
   
    const result = await onTransaction({
      passLogin: true,
      params: permit,
      config: { chainId: chain_id, contractAddress: contract_address },
      onError: (code, message = '') => {
        if (message && message.indexOf('unexpected message sender') > -1) {
          toast.error(
            'Please make sure to connect to a wallet that corresponds to the address associated with the currently logged-in account.',
          );
          return true;
        }
      },
    });

    return !!result;
  }

  return { loading, onButtonClick, beReadyForBuyTicket };
}

export default useBuyTicket;