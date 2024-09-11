import { useState } from "react";
import { useDisclosure } from '@nextui-org/react';
import type { AstrArk } from '@/types/astrark';

export default function useModalDataHook() {
  const [cardData, setCardData] = useState<AstrArk.ShopItem>();
  const payModalDisclosure = useDisclosure();

  const openModal = (item: AstrArk.ShopItem) => {
    setCardData(item)
    payModalDisclosure.onOpen()
  }

  return {
    modalData: {
      shopItemProps: {item: cardData}, 
      disclosure: payModalDisclosure,
    },
    openModal
  }
}