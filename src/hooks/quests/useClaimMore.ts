import { TaskListItem } from '@/http/services/task';
import useTransaction from '../wallet/useTransaction';
import gamePaymentABI from '@/http/abi/gamePayment.json';
import { QuestType } from '@/constant/task';
import { toast } from 'react-toastify';

export default function useClaimMore(task: TaskListItem) {
  const canClaimMore = task.type === QuestType.ClaimFreeTicket;
  const { onTransaction, getTransaction } = useTransaction({ abi: gamePaymentABI, method: 'claimFreeTicket' });

  const onGetFreeTicket = async () => {
    const res = await onTransaction({
      config: {
        chainId: task.properties.chain_id,
        contractAddress: task.properties.contract_address,
      },
      params: [task.quest_id_hash],
    });

    const hash = res?.hash || '';

    try {
      const info = await getTransaction(hash);
      console.log('transaction info', info);
    } catch (error) {
      console.log('getTransaction error:', error);
      toast.error('Network error, please try again later.');
      return null;
    }

    return hash;
  };

  return { canClaimMore, onGetFreeTicket };
}
