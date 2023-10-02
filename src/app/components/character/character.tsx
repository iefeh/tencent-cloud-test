import React from "react";
import Image from "next/image";
import bgOne from 'img/character/bg_one.jpg'
import bgTwo from 'img/character/bg_two.jpg'
import bgThree from 'img/character/bg_three.jpg'
import bgFour from 'img/character/bg_four.jpg'
import hero1 from 'img/character/char_one.png'
import hero2 from 'img/character/char_two.png'
import hero3 from 'img/character/char_three.png'
import hero4 from 'img/character/char_four.png'

import "./character.scss";

const heroMap = [
  { heroUrl: hero1,  imgUrl: bgOne, name: 'MECHANICAL TECHNICIAN' },
  { heroUrl : hero2,  imgUrl: bgTwo, name: 'GOD WHISPERER' },
  { heroUrl: hero3,  imgUrl: bgThree, name: 'SILENT NINJA' },
  { heroUrl: hero4,  imgUrl: bgFour, name: 'STRANGLER' },
]

const Character: React.FC = () => {

  const renderHero = () => {
    const calcWidth = (index: number) => {
      if ([0, heroMap.length - 1].includes(index) ) return { width: '37.3vw'}

      return {width: '29.3vw'}
    }

    const calcBg = (index: number) => {
      if (index === 0) return { left: '4vw'}
      return {}
    }

    const calcHero = (index: number) => {
      if (index === heroMap.length - 1) return 'character-img-last'
      return ''
    }

    const calcHeroName = (index: number) => {
      if (index === heroMap.length - 1) return 'hero-name-last'
      return ''
    }
    return (
      <div className="character">
        { heroMap.map((item, index) => (
          <div key={index} className='character-warp' style={calcWidth(index)}>
            <div className="character-bg-box" style={{backgroundImage: `url(${item.imgUrl.src})`, ...calcBg(index)}}></div>
            <Image
              className={`character-img ${calcHero(index)}`}
              src={item.heroUrl}
              alt=""
            ></Image>
            <span className={`hero-name ${calcHeroName(index)}`}>{item.name}</span>
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