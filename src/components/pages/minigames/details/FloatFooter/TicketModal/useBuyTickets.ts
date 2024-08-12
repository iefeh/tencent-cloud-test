import useTransaction from '@/hooks/wallet/useTransaction';
import { useState } from 'react';
import mgTickets from '@/http/abi/mgTickets.json';
import { buyTicketsCallbackAPI, getBuyTicketsPermitAPI } from '@/http/services/minigames';
import { MiniGames } from '@/types/minigames';
import { toast } from 'react-toastify';

export default function useBuyTickets() {
  const [loading, setLoading] = useState(false);
  const { onTransaction } = useTransaction({ abi: mgTickets, method: 'BuyTicket' });

  async function onBuyTickets(item: MiniGames.GameDetailDTO, amount: number) {
    setLoading(true);

    const res = await getBuyTicketsPermitAPI({ game_id: item.client_id, amount });
    if (!res) return setLoading(false);

    const { contract_address, chain_id, permit } = res;
    const txRes = await onTransaction(permit, { contractAddress: contract_address, chainId: chain_id });
    if (!txRes) return setLoading(false);

    const cbRes = await buyTicketsCallbackAPI({ game_id: item.client_id, txHash: txRes.transactionHash });
    if (!cbRes) return setLoading(false);

    toast.success(`You have successfully purchased ${amount} ticket(s).`);
    setLoading(false);
  }

  return { loading, onBuyTickets };
}
