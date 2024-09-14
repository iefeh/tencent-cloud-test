import React, { useState, FC, useMemo } from "react";
import { Modal, ModalContent, ModalHeader, ModalBody, Button } from "@nextui-org/react";
import S3Image from "@/components/common/medias/S3Image";
import PayButton, { type ButtonStatusUnion } from "../Buttons";
import useWalletInfo from "./useWalletInfo";
import { useWeb3ModalProvider } from '@web3modal/ethers/react';

interface ModalProps {
  disclosure: Disclosure;
  outModalClose: () => void;
  currentPrice: number;
}

const WalletModal: FC<ModalProps> = (props) => {
  const { disclosure, currentPrice, outModalClose } = props;
  const { walletProvider } = useWeb3ModalProvider();

  const { isOpen, onClose } = disclosure || {};
  const [btnStsList, setBtnStsList] = useState<ButtonStatusUnion[]>(["disabled", "wait"]);

  const { walletInfo } = useWalletInfo({
    provider: walletProvider
  });

  const isAvailable = useMemo(() => {
    return Number(walletInfo?.balance) >= currentPrice;
  }, [walletInfo?.balance, currentPrice])

  const toApprove = () => {
    // 
  }

  const toPurchase = () => {
    // 

    outModalClose()
  }

  return (
    <Modal
      {...disclosure}
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
                  Connected Wallet:
                  <span className="text-[#a6c5ed] ml-2">{walletInfo?.walletAddress}</span>
                </div>
                <div>
                  Network:
                  <span className="text-[#a6c5ed] ml-2">{walletInfo?.network}</span>
                </div>
                <div>
                  Availiable Balance:
                  <span className="text-[#a6c5ed] ml-2">{walletInfo?.balance}</span>
                </div>
                <div>
                  Current Price:
                  <span className="text-[#a6c5ed] ml-2">{currentPrice}</span>
                </div>
              </div>

              <div className="mt-8 mb-1 py-2 px-3 bg-[rgba(0,0,0,.4)] text-sm">
                {isAvailable
                  ? 'Please approve and continue your transaction in your wallet extension'
                  : 'Insufficient balance. Please top up or switch wallets in your extension'
                }
              </div>

              <div className="flex">
                <PayButton
                  className="mr-[-0.125rem]"
                  btnStatus={btnStsList[0]}
                  index={1}
                  onClick={toApprove}
                >
                  Approve
                </PayButton>
                <div className="h-[2px] w-[2.625rem] bg-[#686868] mt-[1.8125rem]"></div>
                <PayButton
                  className="ml-[-0.23rem]"
                  btnStatus={btnStsList[1]}
                  index={2}
                  onClick={toPurchase}
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

export default WalletModal;