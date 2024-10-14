import Image from 'next/image';
import { FC, useEffect, useRef, useState } from 'react';
import MBInfo from '../MBInfo';
import TicketsInfo from '../TicketsInfo';
import TimeoutInfo from '../TimeoutInfo';
import DrawLimitsInfo from '../DrawLimitsInfo';
import DrawScreenMainContent from '../DrawScreenMainContent';
import DrawFooter from '../DrawFooter';
import PlanetAni from '../PlanetAni';
import { useDisclosure } from '@nextui-org/react';
import RewardsModal from '../modals/RewardsModal';
import { Lottery } from '@/types/lottery';
import PrizePoolModal from '../modals/PrizePoolModal';
import DrawModal from '../modals/DrawModal';
import DrawHistoryModal, { type DrawHisoryModalRef } from '../modals/DrawHistoryModal';
import DrawAni from '../DrawAni';
import S1TicketModal from '../modals/S1TicketModal';
import { sleep } from '@/utils/common';
import EndedModal from '../modals/EndedModal';

interface Props {
  ended: boolean;
  onUpdate?: () => void;
}

const DrawScreen: FC<Props & BasePage & ItemProps<Lottery.Pool>> = ({ ended, item: poolInfo, onUpdate }) => {
  const [currentReward, setCurrentReward] = useState<Lottery.RewardResDTO | null>(null);
  const drawDisclosure = useDisclosure();
  const rewardsDisclosure = useDisclosure();
  const historyDisclosure = useDisclosure();
  const prizePoolDisclosure = useDisclosure();
  const s1TicketDisclosure = useDisclosure();
  const endedDisclosure = useDisclosure();
  const [endedModalContainer, setEndedModalContainer] = useState<HTMLElement>();
  const [drawTimes, setDrawTimes] = useState(1);
  const [drawAniVisible, setDrawAniVisible] = useState(false);
  const drawHistoryModalRef = useRef<DrawHisoryModalRef>(null);

  function onShowPrizePool() {
    prizePoolDisclosure.onOpen();
  }

  function onDraw(times: number) {
    if (poolInfo?.can_claim_premium_benifits) {
      s1TicketDisclosure.onOpen();
      return;
    }

    setDrawTimes(times);
    setTimeout(() => {
      drawDisclosure.onOpen();
    }, 0);
  }

  async function onDrawed(data: Lottery.RewardResDTO) {
    setCurrentReward(data);
    drawDisclosure.onClose();

    await sleep();
    setDrawAniVisible(true);
    onUpdate?.();
  }

  async function onDrawAniFinished() {
    if (!drawAniVisible) return;

    await sleep(200);
    setDrawAniVisible(false);
    rewardsDisclosure.onOpen();
  }

  async function onClaimed(needClose?: boolean) {
    const [_, list] = await Promise.all([onUpdate?.(), drawHistoryModalRef.current?.update()]);
    const newCur = (list || []).find((item) => item.draw_id === currentReward?.draw_id);
    if (newCur) setCurrentReward(newCur);

    if (needClose) rewardsDisclosure.onClose();
  }

  function onShowHistory() {
    historyDisclosure.onOpen();
  }

  function onRecordClick(data: Lottery.DrawHistoryDTO) {
    setCurrentReward(data);
    rewardsDisclosure.onOpen();
  }

  useEffect(() => {
    if (!ended) return;
    endedDisclosure.onOpen();
  }, [ended]);

  useEffect(() => {
    setEndedModalContainer(document.getElementById('lottery-draw-screen') || undefined);
  }, []);

  return (
    <div id="lottery-draw-screen" className="relative w-screen h-[160vh] lg:h-screen">
      {/* 背景层 */}
      <div className="absolute inset-0 z-0">
        <div className="w-[106.3125rem] h-[31.6875rem] absolute bottom-0 left-1/2 -translate-x-1/2">
          <Image
            src="https://moonveil-public.s3.ap-southeast-2.amazonaws.com/lottery/draw_bottom_planet.png"
            alt=""
            fill
            sizes="100%"
            unoptimized
          />
        </div>
      </div>

      {/* 动画层 */}
      <div className="absolute inset-0 z-10">
        <PlanetAni item={poolInfo} />

        <DrawAni visible={drawAniVisible} onFinished={onDrawAniFinished} />
      </div>

      {/* 操作层 */}
      <div className="absolute inset-0 z-20 flex justify-center items-center">
        {poolInfo?.name && (
          <div className="absolute left-4 -top-1 lg:left-16 lg:top-36 text-basic-yellow font-semakin text-3xl">
            {poolInfo.name}
          </div>
        )}

        <MBInfo
          className="!absolute left-4 top-9 lg:left-16 lg:top-48"
          onShowHistory={onShowHistory}
          item={poolInfo}
        />

        <TicketsInfo className="!absolute left-4 lg:left-16 top-[19.375rem] lg:top-[20.5625rem]" item={poolInfo} />

        <TimeoutInfo
          className="!absolute left-4 lg:left-[unset] lg:right-16 top-44 lg:top-48"
          key={poolInfo?.end_time}
          item={poolInfo}
        />

        <DrawLimitsInfo
          className="!absolute top-[24.75rem] left-4 lg:left-[unset] lg:right-16 lg:top-[21.125rem]"
          item={poolInfo}
        />

        <DrawFooter className="!absolute bottom-[5.75rem] left-1/2 -translate-x-1/2" item={poolInfo} onDraw={onDraw} />

        <DrawScreenMainContent item={poolInfo} onShowPrizePool={onShowPrizePool} />
      </div>

      {drawDisclosure.isOpen && (
        <DrawModal item={poolInfo} times={drawTimes} disclosure={drawDisclosure} onDrawed={onDrawed} />
      )}

      <RewardsModal
        key={`${currentReward?.draw_id}_${currentReward?.available_draw_time}_${currentReward?.draw_time}`}
        item={currentReward}
        poolInfo={poolInfo}
        disclosure={rewardsDisclosure}
        onClaimed={onClaimed}
      />

      <PrizePoolModal disclosure={prizePoolDisclosure} item={poolInfo} />

      <DrawHistoryModal
        ref={drawHistoryModalRef}
        disclosure={historyDisclosure}
        item={poolInfo}
        onRecordClick={onRecordClick}
      />

      <S1TicketModal disclosure={s1TicketDisclosure} item={poolInfo} onUpdate={onUpdate} />

      <EndedModal container={endedModalContainer} disclosure={endedDisclosure} />
    </div>
  );
};

export default DrawScreen;
