import useTransaction from '@/hooks/wallet/useTransaction';
import payTicketABI from '@/http/abi/shop_abi.json'
import { buyTicketPermitAPI } from '@/http/services/astrark';
import { toast } from 'react-toastify';
import type { AstrArk } from '@/types/astrark';


const useBuyTicket = () => {
  const { loading, onTransaction } = useTransaction({ abi: payTicketABI, method: 'buyProduct' });

  async function onButtonClick(data: AstrArk.BuyTicketProps) {
    const { product_id, token_id } = data

    const res = await buyTicketPermitAPI({ product_id, token_id })

    console.log('res', res);
    
    // const { contract_address, chain_id, permit } = res;

    const result = await onTransaction({
      passLogin: true,
      params: data.permit,
      config: { chainId: data.chain_id, contractAddress: data.contract_address },
      // onError: (code, message = '') => {
      //   if (message.indexOf('permit already used') > -1) {
      //     toast.error('You have already minted SBT. Please wait for data confirmation patiently.');
      //     return true;
      //   }
      // },
    });

    return !!result;
  }

  return { loading, onButtonClick };
}

export default useBuyTicket;