import { useRef } from 'react';
import PageDesc from '../../../components/common/PageDesc';
import { IntersectionObserverHook } from '@/hooks/intersectionObserverHook';

export default function WorldView() {
  const descRef = useRef<any>(null);
  const visible = IntersectionObserverHook({ currentRef: descRef, options: { threshold: 0.1 } });

  return (
    <div className="second-desc h-screen relative flex justify-center items-center bg-black">
      <PageDesc
        ref={descRef}
        needAni={visible}
        whiteLogo
        hasBelt
        className="items-start text-left"
        title="An immersive<br>tower defense strategy game"
        subtitle="AstrArk: Stage ONE is an exciting mobile tower defense game that's all about fun and strategy. Dive into thrilling PvP and PvE<br>battles with your friends.<br>In AstrArk, you get to choose your own commander, assemble your dream team, and build your squad with tactical<br>formations. Whether you're up for a quick brawl or a challenging showdown, there are various battle modes to keep you<br>entertained."
      />
    </div>
  );
}
