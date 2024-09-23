import { useState, useMemo, useEffect, useRef } from "react";
import type { AstrArk } from '@/types/astrark';
import { queryShopItemAPI } from "@/http/services/astrark";
import useLoopCountdown from '@/hooks/useLoopCountDown';
import dayjs from 'dayjs';

const sleepTime = 5000;

const useQuestInfo = ({ open }: {
  open: boolean;
}) => {

  const [questInfo, setQuestInfo] = useState<AstrArk.ProductItem>();
  const [cdText, setCdText] = useState<string>('00:00');
  const [ timeRemaining, setTimeRemaining ] = useState<number>(0);
  const [ loading, setLoading ] = useState<boolean>(false);

  const curIdRef = useRef<string>();
  const timerRef = useRef<NodeJS.Timeout>();

  const calcTimeRemaining = (startTime: number | undefined) => {
    if (!startTime) return 0
    const now = Date.now().valueOf()

    if (now - startTime > 10 * 60 * 1000) {
      return 0
    } else {
      return now - startTime
    }
  }

  useLoopCountdown(timeRemaining, 0, (leftTime) => {
    const du = dayjs.duration(leftTime);
    setCdText(du.format('mm:ss'));
  });

  const getQuestInfo = async (id: string | undefined) => {
    if (!id) return;
    curIdRef.current = id;
    let res = await queryShopItemAPI(id);
    
    setTimeRemaining(calcTimeRemaining(res.price_updated_at))
    setQuestInfo(res);
  }

  const queryLoop = async () => {
    setLoading(true)
    if (!curIdRef.current) return;
    timerRef.current = setTimeout(async() => {
      await getQuestInfo(curIdRef.current)
      setLoading(false)
    }, sleepTime)
  }

  const clearTimer = () => {
    if (!timerRef.current) return

    clearTimeout(timerRef.current)
    setLoading(false)
  }

  useEffect(() => {
    if (!open) {
      clearTimer()
      return
    }

    if ((timeRemaining === 0 || cdText === '00:00') && open) {
      if (loading) return
      queryLoop()
      return
    }
  }, [open, cdText, questInfo])

  return {
    questInfo,
    getQuestInfo,
    cdText
  }
}

export default useQuestInfo;