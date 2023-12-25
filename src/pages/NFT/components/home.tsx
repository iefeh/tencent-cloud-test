import React from 'react';
import PageDesc from '../../components/common/PageDesc';
import Image from 'next/image';

import halo1 from 'img/nft/home/halo1.png';
import halo2 from 'img/nft/home/halo2.png';

import meteor from 'img/nft/home/meteor.png';
import planet1 from 'img/nft/home/planet1.png';
import planet2 from 'img/nft/home/planet2.png';
import planet3 from 'img/nft/home/planet3.png';
import stars1 from 'img/nft/home/stars1.png';
import stars2 from 'img/nft/home/stars2.png';
import stars3 from 'img/nft/home/stars3.png';
import BasicButton from '@/pages/components/common/BasicButton';

const NftHome: React.FC = () => {
  return (
    <div className="w-full h-screen relative flex justify-center items-center overflow-hidden">
      <PageDesc
        hasBelt
        needAni
        baseAniTY
        title="A DYNAMIC NFT ECOSYSTEM"
        subtitle={
          <div className="max-w-[32rem] font-decima">
            At Moonveil, we put player experience at the heart of everything we do. We aim to build a dynamic NFT ecosystem that keeps players actively engaged with our games and provides them with ongoing rewards and returns in the future.
          </div>
        }
        button={
          <div className="flex gap-2 mt-[7rem]">
            <BasicButton label="TETRA NFT Series" link="/TetraNFT" />
            <BasicButton label="Get Involved" />
            <BasicButton label="Coming Soon" />
          </div>
        }
      />

      {/* 大光晕 */}
      <Image loading="lazy" className="big-halo" src={halo1} alt=""></Image>

      {/* 小光晕 */}
      <Image className="small-halo" src={halo2} alt=""></Image>

      {/* 陨石 */}
      <Image className="meteor" src={meteor} alt=""></Image>

      <div className="track1 pause">
        {/* 行星 - 小 */}
        <Image className="planet1" src={planet1} alt=""></Image>
      </div>

      <div className="track1">
        {/* 行星 - 中 */}
        <Image className="planet2" src={planet2} alt=""></Image>
      </div>

      <div className="track2 pause">
        {/* 行星 - 小 */}
        <Image className="planet1" src={planet1} alt=""></Image>
      </div>

      <div className="track2">
        {/* 行星 - 大 */}
        <Image className="planet3" src={planet3} alt=""></Image>
      </div>

      {/* 星星1 */}
      <Image className="stars1" src={stars1} alt=""></Image>

      {/* 星星2 */}
      <Image className="stars2" src={stars2} alt=""></Image>

      {/* 星星3 */}
      <Image className="stars3" src={stars3} alt=""></Image>
    </div>
  );
};

export default NftHome;
