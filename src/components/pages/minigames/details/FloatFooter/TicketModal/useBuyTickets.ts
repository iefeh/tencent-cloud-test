import { useState } from 'react';
import mgTickets from '@/http/abi/mgTickets.json';
import { buyTicketsCallbackAPI, getBuyTicketsPermitAPI } from '@/http/services/minigames';
import { MiniGames } from '@/types/minigames';
import { toast } from 'react-toastify';
import useRPCTransaction from '@/hooks/wallet/useTransaction';

export default function useBuyTickets() {
  const [loading, setLoading] = useState(false);
  const { onTransaction } = useRPCTransaction({ abi: mgTickets, method: 'buyTicket' });

  async function onBuyTickets(item: MiniGames.GameDetailDTO, amount: number) {
    setLoading(true);

    const res = await getBuyTicketsPermitAPI({ game_id: item.client_id, amount });
    if (!res) {
      setLoading(false);
      return false;
    }

    const { contract_address, chain_id, permit } = res;
    const txRes = await onTransaction(
      permit,
      { value: permit.tokenAmount },
      { contractAddress: contract_address, chainId: chain_id },
    );
    if (!txRes?.hash) {
      setLoading(false);
      return false;
    }

    const cbRes = await buyTicketsCallbackAPI({ gameId: item.client_id, txHash: txRes.hash });
    if (!cbRes) {
      setLoading(false);
      return false;
    }

    toast.success(`You have successfully purchased ${amount} ticket(s).`);
    setLoading(false);
    return true;
  }

  return { loading, onBuyTickets };
}
