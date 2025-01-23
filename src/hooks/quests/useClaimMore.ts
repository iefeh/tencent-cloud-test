import { TaskListItem } from '@/http/services/task';
import useTransaction from '../wallet/useTransaction';
import gamePaymentABI from '@/http/abi/gamePayment.json';
import { QuestType } from '@/constant/task';

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

    return res?.blockHash || '';
  };

  return { canClaimMore, onGetFreeTicket };
}
