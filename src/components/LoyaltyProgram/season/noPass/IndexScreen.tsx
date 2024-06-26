import Image from 'next/image';
import { FC } from 'react';
import ScrollDownArrow from '@/pages/components/common/ScrollDownArrow';
import PageDesc from '@/components/common/PageDesc';

const IndexScreen: FC = () => {
  return (
    <div className="w-full h-screen relative z-10 flex justify-center items-center">
      <PageDesc
        hasBelt
        baseAniTY
        needAni
        title={
          <div className="max-w-[66.75rem] font-semakin text-[4.5rem] bg-clip-text text-transparent bg-gradient-to-b from-[#EFEBC5] to-[#D9A970]">
            Moonveil Season System Launched
          </div>
        }
        subtitle={
          <div className="max-w-[40rem] text-lg tracking-tighter font-decima">
            Moonveil&apos;s season system is a brand-new upgrade to our loyalty program; from now on, Moonwalkers can
            unlock more rewards continuously through our season system. The first season, themed &apos;Rock’it to the
            Moon,&apos; is now live! This season, let&apos;s strive for the upcoming $Moonrise Token airdrop.
          </div>
        }
      />

      <ScrollDownArrow />
    </div>
  );
};

export default IndexScreen;
