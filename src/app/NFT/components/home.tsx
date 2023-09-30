import React from "react";
import PageDesc from "../../components/common/PageDesc";
import Image from "next/image";
import "./home.scss";

const NftHome: React.FC = () => {
  return (
    <div className="bg-video w-full h-screen relative flex justify-center items-center">
      <PageDesc 
        hasBelt
        title="A DYNAMIC NFT ECOSYSTEM"
        subtitle="<div style='font-size: 3rem; font-family: semakin; margin-top: 30px'>Coming soon...</div>"
      />

      {/* 大光晕 */}
      <Image
        className="big-halo"
        src='/img/nft/home/halo1.png'
        alt=""
        fill
      ></Image>

      {/* 小光晕 */}
      <Image
        className="character-img"
        src='/img/nft/home/halo2.png'
        alt=""
        fill
      ></Image>

      {/* 陨石 */}
      <Image
        className="character-img"
        src='/img/nft/home/meteor.png'
        alt=""
        fill
      ></Image>

      {/* 行星 - 小 */}
      <Image
        className="character-img"
        src='/img/nft/home/planet1.png'
        alt=""
        fill
      ></Image>

      {/* 行星 - 中 */}
      <Image
        className="character-img"
        src='/img/nft/home/planet2.png'
        alt=""
        fill
      ></Image>

      {/* 行星 - 大 */}
      <Image
        className="character-img"
        src='/img/nft/home/planet3.png'
        alt=""
        fill
      ></Image>

      {/* 星星1 */}
      <Image
        className="character-img"
        src='/img/nft/home/stars1.png'
        alt=""
        fill
      ></Image>

      {/* 星星2 */}
      <Image
        className="character-img"
        src='/img/nft/home/stars2.png'
        alt=""
        fill
      ></Image>

      {/* 星星3 */}
      <Image
        className="character-img"
        src='/img/nft/home/stars3.png'
        alt=""
        fill
      ></Image>

    </div>
  )
}

export default NftHome