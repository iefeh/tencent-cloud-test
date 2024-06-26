import { useRef, useEffect, useState } from 'react';
import PageDesc from '@/components/common/PageDesc';

export default function WorldView() {
  const descRef = useRef<HTMLDivElement>(null);
  const [scrolling, setScrolling] = useState(false);
  const [visible, setVisible] = useState(false);
  const scrollY = useRef(0);
  let timer = 0;

  function onLuxyScroll() {
    const scrollTop = document.documentElement.scrollTop || document.body.scrollTop;
    let scrolled = false;
    if (scrollTop !== scrollY.current) {
      scrollY.current = scrollTop;
      setScrolling(true);
      scrolled = true;
    }

    if (scrolled || scrolling) {
      if (timer) clearTimeout(timer);
      timer = window.setTimeout(() => setScrolling(false), 500);
    }
  }

  useEffect(() => {
    if (scrolling || !descRef.current) return;
    const top = descRef.current.getBoundingClientRect().top || 0;
    if (top >= document.documentElement.clientHeight) return;
    setVisible(top > -descRef.current.clientHeight);
  }, [scrolling]);

  useEffect(() => {
    window.addEventListener('scroll', onLuxyScroll);
    return () => window.removeEventListener('scroll', onLuxyScroll);
  }, []);

  const Subtitle = () => (
    <div className="title text-lg font-decima mb-10 tracking-tighter text-justify">
      <p>
        AstrArk: Stage ONE is an exciting mobile tower defense game that&apos;s all about fun and strategy. Dive into
        thrilling PvP and PvE battles with your friends.
      </p>
      <p className="mt-4">
        In AstrArk, you get to choose your own commander, assemble your dream team, and build your squad with tactical
        formations. Whether you&apos;re up for a quick brawl or a challenging showdown, there are various battle modes
        to keep you entertained.
      </p>
    </div>
  );

  return (
    <div className="second-desc h-screen relative bg-black shadow-[0_-300px_300px_100px_#000]">
      <div className="w-full h-full flex justify-center items-center px-8 lg:p-48">
        <PageDesc
          ref={descRef}
          needAni={visible}
          baseAniTY
          hasBelt
          className="items-start text-left relative -top-12"
          title="An immersive<br>tower defense strategy game"
          subtitle={<Subtitle />}
        />
      </div>
    </div>
  );
}
