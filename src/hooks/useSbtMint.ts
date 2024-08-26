import { MintPermitResDTO } from '@/http/services/badges';
import sbtContractABI from '@/http/sbt_abi.json';
import useTransaction from './wallet/useTransaction';
import { toast } from 'react-toastify';

export default function useSbtMint() {
  const { loading, onTransaction } = useTransaction({ abi: sbtContractABI, method: 'mint' });

  async function onButtonClick(data: MintPermitResDTO) {
    const result = await onTransaction({
      params: data.permit,
      config: { chainId: data.chain_id, contractAddress: data.contract_address },
      onError: (code, message = '') => {
        if (message.indexOf('permit already used') > -1) {
          toast.error('You have already minted SBT. Please wait for data confirmation patiently.');
          return true;
        }
      },
    });

    return !!result;
  }

  return { loading, onButtonClick };
}
