import { useState } from "react";
import { useDisclosure } from '@nextui-org/react';
import type { AstrArk } from '@/types/astrark';

export default function useModalDataHook() {
  const [cardData, setCardData] = useState<AstrArk.Product>();
  const payModalDisclosure = useDisclosure();

  const openModal = (item: AstrArk.Product) => {
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