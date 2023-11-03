import BasicButton from '@/pages/components/common/BasicButton';
import PageDesc from '@/pages/components/common/PageDesc';
import { useState } from 'react';
import activeCardImg1 from 'img/nft/trifle/trifle_card_1_active.png';
import activeCardImg2 from 'img/nft/trifle/trifle_card_2_active.png';
import inactiveCardImg2 from 'img/nft/trifle/trifle_card_2_inactive.png';
import activeCardImg3 from 'img/nft/trifle/trifle_card_3_active.png';
import inactiveCardImg3 from 'img/nft/trifle/trifle_card_3_inactive.png';
import topBgImg from 'img/nft/trifle/bg_top.png';
import triangleImg from 'img/nft/trifle/triangle.png';
import Image from 'next/image';
import PrivilegeList from '../PrivilegeList';

export default function PrivilegeScreen() {
  const [trifleCards, setTrifleCards] = useState([
    {
      activeImg: activeCardImg1,
      inactiveImg: activeCardImg1,
      rotateDeg: -10,
      isActive: true,
    },
    {
      activeImg: activeCardImg2,
      inactiveImg: inactiveCardImg2,
      rotateDeg: 8,
      isActive: true,
    },
    {
      activeImg: activeCardImg3,
      inactiveImg: inactiveCardImg3,
      isActive: true,
    },
  ]);

  return (
    <div className="w-full bg-black flex flex-col justify-center items-center pt-[16.25rem] relative">
      <div className="bg-box absolute left-0 top-0 w-full h-full">
        <div className="top-box absolute top-0 left-1/2 -translate-x-1/2">
          <Image className="w-[55rem] h-[55rem]" src={topBgImg} alt="" />

          <Image
            className="w-[4.5625rem] h-[4.125rem] absolute top-[14.5625rem] left-1/2 -translate-x-1/2"
            src={triangleImg}
            alt=""
          />
        </div>
      </div>

      <PageDesc
        title={
          <div className="font-semakin">
            <div className="text-3xl">Previleges of the</div>
            <div className="text-[6.25rem]">Tetra NFT Series</div>
          </div>
        }
        subtitle="We have customized special rewards and benefits for different levels of Tetra NFT owners."
      />

      <div className="privileges flex justify-center items-center mt-[16.25rem] h-[30.125rem]">
        <div className="cards relative w-[22.75rem] h-[27.75rem]">
          {trifleCards.map(({ isActive, activeImg, inactiveImg, rotateDeg }, index) => (
            <div
              key={index}
              className={`card-level-${index + 1} z-[${
                trifleCards.length - index
              }] w-full h-full absolute left-0 top-0 origin-center`}
              style={{ transform: `rotate(${rotateDeg || 0}deg)` }}
            >
              <Image src={isActive ? activeImg : inactiveImg} alt="" fill />
            </div>
          ))}
        </div>

        <div className="pl-[6.25rem] ml-[5.375rem] border-l border-[rgba(246,199,153,0.2)] h-full">
          <div className="title font-semakin text-3xl text-basic-yellow mb-[3.375rem]">Privileges of Destiny Tetra</div>

          <PrivilegeList />
        </div>
      </div>

      <div className="font-decima text-base w-[62.5rem] pt-6 pr-[2.375rem] pb-[2.1875rem] pl-[1.9375rem] border border-[#3E3123] rounded-[1.25rem] bg-[rgba(246,199,153,0.06)] text-justify mt-[7.25rem]">
        In the future, if you successfully obtain the upgraded Level Level II-Eternity Tetra NFT or Level III-Infinity
        Tetra NFT, you will receive exponentially increased benefits and unlock more diverse gameplay and rewards.
      </div>

      <div className="flex justify-center items-center gap-2 mt-[4.625rem]">
        <BasicButton label="View Full Previleges" active />
        <BasicButton label="Get Involved" link="/WhitelistTasks" />
      </div>
    </div>
  );
}
