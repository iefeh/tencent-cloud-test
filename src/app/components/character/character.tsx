import React from "react";
import Image from "next/image";
import bgOne from 'img/character/bg_one.jpg'
import bgTwo from 'img/character/bg_two.jpg'
import bgThree from 'img/character/bg_three.jpg'
import bgFour from 'img/character/bg_four.jpg'
import "./character.scss";

const heroMap = [
  { heroUrl: '/img/character/char_one.png',  imgUrl: bgOne, name: '' },
  { heroUrl : '/img/character/char_two.png',  imgUrl: bgTwo, name: '' },
  { heroUrl: '/img/character/char_three.png',  imgUrl: bgThree, name: '' },
  { heroUrl: '/img/character/char_four.png',  imgUrl: bgFour, name: '' },
]

const skewDeg = '22deg'

const Character: React.FC = () => {

  const renderHero = () => {

    return (
      <div className="w-full flex">
        { heroMap.map((item, index) => (
          <div key={index} className='character-warp' style={{backgroundImage: `url(${item.imgUrl.src})`}}>
              <Image
                className="character-img"
                src={item.heroUrl}
                alt=""
                fill
              ></Image>
          </div>
        ))}
      </div>
    )
  }

  return (
    <>
    {renderHero()}
    </>
  )
}

export default Character