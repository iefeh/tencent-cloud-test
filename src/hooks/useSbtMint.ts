import { MintPermitResDTO } from '@/http/services/badges';
import sbtContractABI from '@/http/sbt_abi.json';
import useTransaction from './wallet/useTransaction';

export default function useSbtMint() {
  const { loading, onTransaction } = useTransaction({ abi: sbtContractABI, method: 'mint' });

  async function onButtonClick(data: MintPermitResDTO) {
    const result = await onTransaction(data.permit, { chainId: data.chain_id, contractAddress: data.contract_address });

    return !!result;
  }

  return { loading, onButtonClick };
}
