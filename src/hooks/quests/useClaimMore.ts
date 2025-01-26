import { TaskListItem } from '@/http/services/task';
import useTransaction from '../wallet/useTransaction';
import gamePaymentABI from '@/http/abi/gamePayment.json';
import { QuestType } from '@/constant/task';
import { toast } from 'react-toastify';

export default function useClaimMore(task: TaskListItem) {
  const canClaimMore = task.type === QuestType.ClaimFreeTicket;
  const { onTransaction } = useTransaction({ abi: gamePaymentABI, method: 'claimFreeTicket' });

  const onGetFreeTicket = async () => {
    const res = await onTransaction({
      config: {
        chainId: task.properties.chain_id,
        contractAddress: task.properties.contract_address,
      },
      params: [task.quest_id_hash],
    });

    const hash = res?.blockHash || '';
    if (hash) {
      toast.success('The transaction has been successful. Please verify the task after 1 minute.');
    }
    return hash;
  };

  return { canClaimMore, onGetFreeTicket };
}
