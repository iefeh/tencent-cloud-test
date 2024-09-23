import React, { useState, FC, useMemo, useEffect } from "react";
import { Modal, ModalContent, ModalHeader, ModalBody, cn } from "@nextui-org/react";
import S3Image from "@/components/common/medias/S3Image";
import PayButton, { type ButtonStatusUnion } from "../Buttons";
import useWalletInfo from "./useWalletInfo";
import { useWeb3ModalProvider } from '@web3modal/ethers/react';
import useBuyTicket from "./useBuyTicket"
import { observer } from 'mobx-react-lite';
import type { AstrArk } from '@/types/astrark';
import Web3 from "web3";
import { isHexZero } from "@/utils/common";

interface ModalProps {
  disclosure: Disclosure;
  itemInfo: AstrArk.PriceToken | undefined;
}

const WalletModal: FC<ModalProps> = (props) => {
  const { disclosure, itemInfo } = props;
  const contractAddress = itemInfo?.address || "";
  const { walletProvider } = useWeb3ModalProvider();

  const { isOpen, onClose } = disclosure || {};
  const [btnStsList, setBtnStsList] = useState<ButtonStatusUnion[]>([undefined, "wait"]);

  const isOrigin = useMemo(() => isHexZero(contractAddress), [contractAddress])

  const { onButtonClick, errorMessage, loading, beReadyForBuyTicket } = useBuyTicket()
  const { walletInfo } = useWalletInfo({
    provider: walletProvider,
    contractAddress: contractAddress,
    open: isOpen,
  });

  const balance = useMemo(() => {
    if (walletInfo.balance === undefined) return null;

    return Number(Web3.utils.fromWei(walletInfo?.balance || '', 'ether')).toFixed(5)
  }, [walletInfo?.balance])

  const isAvailable = useMemo(() => {
    if (itemInfo === undefined) return false;
    // 表示未获取到钱包余额，开放 approve 重新拉取钱包
    if (balance === null) return true;

    return Number(balance) >= itemInfo?.product_usdc_price_with_discount;
  }, [walletInfo?.balance, itemInfo?.product_usdc_price_with_discount])

  useEffect(() => {
    if (isAvailable) {
      isOrigin
        ? setBtnStsList(['disabled', undefined])
        : setBtnStsList([undefined, "wait"])
    } else {
      setBtnStsList(["disabled", "wait"])
    }
  }, [isAvailable, balance])

  // 关闭清空状态为禁用
  useEffect(() => {
    if (!isOpen) {
      setBtnStsList(["disabled", "wait"])
    }
  }, [isOpen])

  const toApprove = async () => {
    if (!isAvailable) return;
    const { chain_id } = itemInfo?.network || {};
    if (!chain_id) return

    await beReadyForBuyTicket(chain_id)
    setBtnStsList(["disabled", undefined])
  }

  const toPurchase = async () => {
    const { token_id, product_id } = itemInfo || {};
    if (!token_id || !product_id) return

    await onButtonClick({
      token_id,
      product_id,
    })
  }

  const formatString = (str: string | undefined, startLength: number = 6, endLength: number = 4) => {
    if (str === undefined) return "";

    if (str.length <= startLength + endLength) {
      return str;
    }
    const startPart = str.slice(0, startLength);
    const endPart = str.slice(-endLength);
    return `${startPart}...${endPart}`;
  }

  return (
    <Modal
      {...disclosure}
      isDismissable={false}
      hideCloseButton
      isOpen={isOpen}
      onClose={onClose}
      style={{
        overflow: "initial"
      }}
      classNames={{
        base: "rounded-none bg-[url('https://moonveil-public.s3.ap-southeast-2.amazonaws.com/astrark/shop/bg_modal.png')] bg-no-repeat bg-contain !max-w-[49.125rem] !w-[49.125rem] aspect-[57.25/30]"
      }}
    >
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader className="flex justify-between relative" >
              <S3Image onClick={onClose} src="/astrark/shop/btn_close.png" className="absolute top-[-1.3rem] right-[-1.625rem] w-[6.9375rem] h-[4.75rem] object-contain"></S3Image>
            </ModalHeader>
            <ModalBody className="px-20 py-10">
              <div className="px-3 flex flex-col gap-3 text-xl">
                <div>
                  Connected Wallet：
                  <span className="text-[#a6c5ed] ml-1">{formatString(walletInfo?.walletAddress)}</span>
                </div>
                <div>
                  Network：
                  <span className="text-[#a6c5ed] ml-1">{itemInfo?.network?.name}</span>
                </div>
                <div>
                  Availiable Balance：
                  <span className="text-[#a6c5ed] ml-1">
                    {balance === null
                      ? '—'
                      : `${balance} ${itemInfo?.symbol}`
                    }
                  </span>
                </div>
                <div>
                  Payment Amount：
                  <span className="text-[#f33f3f] ml-1">{itemInfo?.product_token_price_with_discount} {itemInfo?.symbol}</span>
                </div>
              </div>

              <div className="mt-8 mb-1 py-2 px-3 bg-[rgba(0,0,0,.4)] text-sm">
                {errorMessage
                  ? <span className="text-[#f33f3f]">{errorMessage}</span>
                  : isAvailable
                    ? 'Please approve and continue your transaction in your wallet extension'
                    : 'Insufficient balance. Please top up or switch wallets in your extension'
                }
              </div>

              <div className="flex">
                {!isOrigin && (
                  <>
                    <PayButton
                      btnStatus={btnStsList[0]}
                      index={1}
                      onClick={toApprove}
                    >
                      Approve
                    </PayButton>
                    <div className="h-[2px] w-[3.625rem] bg-[#686868] mt-[1.8125rem] z-[-1] ml-[-1rem] mr-[-0.3rem]"></div>
                  </>
                )}
                <PayButton
                  className={cn([
                    btnStsList[1] === undefined && "ml-[-0.5rem]"
                  ])}
                  btnStatus={btnStsList[1]}
                  index={isOrigin ? 1 : 2}
                  onClick={toPurchase}
                  isLoading={loading}
                >
                  Purchase
                </PayButton>
              </div>
            </ModalBody>
          </>
        )}
      </ModalContent>
    </Modal >
  )
}

export default observer(WalletModal);