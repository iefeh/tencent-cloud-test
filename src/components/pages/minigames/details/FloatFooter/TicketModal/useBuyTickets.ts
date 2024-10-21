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
    const txRes = await onTransaction({
      params: permit,
      config: { contractAddress: contract_address, chainId: chain_id },
      options: { value: permit.tokenAmount },
      onError: (code, message) => {
        if (!message) return;
        if (message.indexOf('unexpected message sender') > -1) {
          toast.error(
            'Please make sure to connect to a wallet that corresponds to the address associated with the currently logged-in account.',
          );
          return true;
        } else if (message.indexOf('insufficient funds') > -1) {
          toast.error('Insufficient balance. Please top up or switch wallets in your extension');
          return true;
        }
      },
    });
    if (!txRes?.hash) {
      setLoading(false);
      return false;
    }

    const cbRes = await buyTicketsCallbackAPI({ gameId: item.client_id, txHash: txRes.hash });
    if (!cbRes) {
      setLoading(false);
      return false;
    }

    window.ta.track('buy_ticket');
    toast.success(`You have successfully purchased ${amount} ticket(s).`);
    setLoading(false);
    return true;
  }

  return { loading, onBuyTickets };
}
