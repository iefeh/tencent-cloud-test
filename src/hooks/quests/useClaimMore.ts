import { TaskListItem } from '@/http/services/task';
import useTransaction from '../wallet/useTransaction';
import gamePaymentABI from '@/http/abi/gamePayment.json';
import { QuestType } from '@/constant/task';
import { toast } from 'react-toastify';
import Cookies from 'js-cookie';
import { useUserContext } from '@/store/User';

export default function useClaimMore(task: TaskListItem) {
  const canClaimMore = task.type === QuestType.ClaimFreeTicket;
  const { userInfo } = useUserContext();
  const { onTransaction, getTransaction } = useTransaction({ abi: gamePaymentABI, method: 'claimFreeTicket' });

  const onGetFreeTicket = async () => {
    if (!userInfo) return;

    const hashKey = `${userInfo.user_id}:${task.id}`;
    const hashValue = Cookies.get(hashKey);
    if (hashValue) {
      toast.error('You have already submitted the hash. Please wait for verification.');
      return null;
    }

    const res = await onTransaction({
      config: {
        chainId: task.properties.chain_id,
        contractAddress: task.properties.contract_address,
      },
      params: [task.quest_id_hash],
    });

    const hash = res?.hash || '';
    if (!hash) return null;

    try {
      const info = await getTransaction(hash);
      console.log('transaction info', info);
    } catch (error) {
      console.log('getTransaction error:', error);
      toast.error('Network error, please try again later.');
      return null;
    }

    Cookies.set(hashKey, hash, { expires: 300 / 86400 });

    return hash;
  };

  return { canClaimMore, onGetFreeTicket };
}
