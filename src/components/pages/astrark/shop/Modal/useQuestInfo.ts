import { useState } from "react";
import type { AstrArk } from '@/types/astrark';
import { queryShopItemAPI } from "@/http/services/astrark";

const useQuestInfo = () => {
  const [questInfo, setQuestInfo] = useState<AstrArk.ProductItem>();


  const getQuestInfo = async (id: string | undefined) => {
    if (!id) return;
    const res = await queryShopItemAPI(id);
    setQuestInfo(res);
  }

  return {
    questInfo,
    getQuestInfo,
  }
}

export default useQuestInfo;