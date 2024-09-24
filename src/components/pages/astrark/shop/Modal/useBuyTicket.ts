import useTransaction from '@/hooks/wallet/useTransaction';
import payTicketABI from '@/http/abi/shop_abi.json';
import erc20ABI from '@/http/abi/erc20.json';
import { buyTicketPermitAPI } from '@/http/services/astrark';
import { toast } from 'react-toastify';
import type { AstrArk } from '@/types/astrark';
import { useState } from 'react';
import Web3 from 'web3';
import { useWeb3ModalAccount } from '@web3modal/ethers/react';

const useBuyTicket = () => {
  const { address } = useWeb3ModalAccount();
  const { loading, onTransaction, beReady } = useTransaction({
    abi: payTicketABI,
    method: 'buyProduct',
  });
  const { loading: approveLoading, onTransaction: onApproveTransaction } = useTransaction({
    abi: erc20ABI,
    method: 'approve',
  });
  const [errorMessage, setErrorMessage] = useState('');

  async function onApprove(itemInfo: AstrArk.PriceToken) {
    const {
      address: contractAddress,
      network: { chain_id },
      product_token_price_with_discount,
    } = itemInfo;
    const result = await onApproveTransaction({
      passLogin: true,
      params: [address, Web3.utils.toWei(product_token_price_with_discount, 'ether')],
      config: { chainId: chain_id, contractAddress },
    });

    return !!result;
  }

  async function onButtonClick(data: AstrArk.PermitProps) {
    const { product_id, token_id } = data;
    const res = await buyTicketPermitAPI({ product_id, token_id });
    if (!res) return false;

    const { contract_address, chain_id, permit } = res || {};
    const result = await onTransaction({
      passLogin: true,
      params: permit,
      config: { chainId: chain_id, contractAddress: contract_address },
      options: { value: permit.tokenAmount },
      onError: (code, message = '') => {
        if (message && message.indexOf('unexpected message sender') > -1) {
          toast.error(
            'Please make sure to connect to a wallet that corresponds to the address associated with the currently logged-in account.',
          );

          setErrorMessage(
            'Please make sure to connect to a wallet that corresponds to the address associated with the currently logged-in account.',
          );
          return true;
        }
        if (message && message.indexOf('duplicate product permit') > -1) {
          toast.error('Your last purchase transaction is still confirming, please try again later.');

          setErrorMessage('Your last purchase transaction is still confirming, please try again later.');
          return true;
        }
      },
    });

    return !!result;
  }

  return { approveLoading, loading, errorMessage, onApprove, onButtonClick, beReadyForBuyTicket: beReady };
};

export default useBuyTicket;
