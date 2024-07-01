import thiefImg from 'img/bushwhack/intro/thief.png';
import doctorImg from 'img/bushwhack/intro/doctor.png';
import rheaImg from 'img/bushwhack/intro/rhea.png';
import Image, { StaticImageData } from 'next/image';
import roleBgImg from 'img/bushwhack/content/bg_role.png';
import { Swiper, SwiperSlide, SwiperClass } from 'swiper/react';
import ModelView3D from '@/pages/components/common/model/ModelView3D';
import turnImg from 'img/bushwhack/intro/360.png';
import leftArrowImg from 'img/bushwhack/intro/arrow_left.png';
import rightArrowImg from 'img/bushwhack/intro/arrow_right.png';
import discordImg from 'img/bushwhack/intro/discord.png';
import { useRef, useState } from 'react';
import { Button } from '@nextui-org/react';
import * as THREE from 'three';

interface Role {
  name: string;
  cover: StaticImageData;
  model: ModelInfo;
}

export default function IntroScreen() {
  const navigationPrevRef = useRef(null);
  const navigationNextRef = useRef(null);
  const swiperRef = useRef<SwiperClass>();
  const [activeIndex, setActiveIndex] = useState(0);
  const orbitAngle = {
    minPolarAngle: Math.PI / 2,
    maxPolarAngle: Math.PI / 2,
  };

  const roles: Role[] = [
    {
      name: 'Lewis',
      cover: doctorImg,
      model: {
        source: 'https://moonveil-public.s3.ap-southeast-2.amazonaws.com/bushwhack/hero/lewis_walk.fbx',
        texture: '/models/textures/Lewis.png',
        offsetPower: {
          y: -0.9,
        },
        zoom: 2.2,
        orbitAngle,
        playAni: true,
        colorSpace: THREE.LinearSRGBColorSpace,
        toneMappingExposure: 10.0,
      },
    },
    {
      name: 'Rhea',
      cover: rheaImg,
      model: {
        source: 'https://moonveil-public.s3.ap-southeast-2.amazonaws.com/bushwhack/hero/rhea_walk.fbx',
        texture: '/models/textures/T_Rhea.png',
        offsetPower: {
          y: -0.9,
          z: 2,
        },
        zoom: 2.2,
        orbitAngle,
        playAni: true,
        exposure: 10,
        colorSpace: THREE.LinearSRGBColorSpace,
        toneMappingExposure: 10.0,
      },
    },
    {
      name: 'Loki',
      cover: thiefImg,
      model: {
        source: '/models/loki.glb',
        offsetPower: {
          y: -3,
        },
        cameraPosition: {
          y: 1,
          z: 2.4,
        },
        orbitAngle,
        playAni: true,
        // deltaRatio: 1 / 1000,
        exposure: null,
        ambientLightIntensity: 5.0,
      },
    },
    {
      name: 'Kaya',
      cover: thiefImg,
      model: {
        source: '/models/kaya.glb',
        offsetPower: {
          y: -3,
        },
        cameraPosition: {
          y: 1,
          z: 2.4,
        },
        orbitAngle,
        playAni: true,
        // deltaRatio: 1 / 1000,
        exposure: null,
        ambientLightIntensity: 5.0,
      },
    },
  ];

  function onJoinDC() {
    window.open('https://discord.gg/moonveil');
  }

  return (
    <div className="w-screen min-h-screen relative flex flex-col items-center pt-[11.8125rem] px-16 lg:px-0">
      <Image
        className="absolute left-1/2 top-12 -translate-x-1/2 max-w-[80%] w-[43.75rem] h-auto"
        src={roleBgImg}
        alt=""
      />

      <div
        className="font-semakin text-center text-5xl lg:text-6xl relative z-0"
        style={{ textShadow: '0 0 2rem #836527' }}
      >
        Role Introduction
      </div>

      <div className="w-[calc(100%_+_4rem)] lg:w-[100rem] pt-[6.25rem] pb-16 lg:pb-[13.1825rem] flex flex-col items-center">
        <div className="w-full h-[40.625rem] relative flex justify-center">
          <Swiper
            className="!absolute inset-0 z-0"
            slidesPerView={1}
            allowTouchMove={false}
            navigation={{
              prevEl: navigationPrevRef.current,
              nextEl: navigationNextRef.current,
            }}
            onInit={(swiper) => (swiperRef.current = swiper)}
            onActiveIndexChange={(swiper) => setActiveIndex(swiper.realIndex)}
          >
            {roles.map((role, index) => (
              <SwiperSlide key={index}>
                <div className="relative flex items-center text-center w-full h-full">
                  <div className="w-full font-semakin text-center text-[#736045] text-8xl lg:text-[18.75rem]">
                    {role.name}
                  </div>
                </div>
              </SwiperSlide>
            ))}

            {activeIndex > 0 && (
              <div
                ref={navigationPrevRef}
                className="absolute left-0 lg:left-2 top-1/2 -translate-y-1/2 flex items-center flex-nowrap z-10 cursor-pointer"
                onClick={() => swiperRef.current?.slidePrev()}
              >
                <div className="font-semakin text-2xl lg:text-3xl" style={{ textShadow: '0 0 2rem #3C6EFF' }}>
                  {roles[activeIndex - 1].name}
                </div>

                <Image className="w-[6.875rem] h-[3.75rem]" src={leftArrowImg} alt="" />
              </div>
            )}
            {activeIndex < roles.length - 1 && (
              <div
                ref={navigationNextRef}
                className="absolute right-0 lg:right-2 top-1/2 -translate-y-1/2 flex items-center flex-nowrap z-10 cursor-pointer"
                onClick={() => swiperRef.current?.slideNext()}
              >
                <Image className="w-[6.875rem] h-[3.75rem]" src={rightArrowImg} alt="" />
                <div className="font-semakin text-2xl lg:text-3xl" style={{ textShadow: '0 0 2rem #3C6EFF' }}>
                  {roles[activeIndex + 1].name}
                </div>
              </div>
            )}
          </Swiper>

          <div className="w-[calc(100%_-_360px)] min-w-[20rem] h-full relative z-10">
            <ModelView3D key={activeIndex} info={roles[activeIndex].model} />
          </div>
        </div>

        <div className="w-full">
          <Image className="w-[6.25rem] h-[4.5rem] mx-auto" src={turnImg} alt="" />
        </div>

        <Button
          className="w-[calc(100%_-_2rem)] bg-gradient-to-b from-black/80 via-[#1944FF] via-50% to-[#1944FF] h-[9.375rem] rounded-[1.875rem] font-poppins text-2xl mt-16 outline-none whitespace-normal"
          startContent={<Image className="w-[4.6875rem] h-auto mr-[1.375rem]" src={discordImg} alt="" />}
          onClick={onJoinDC}
        >
          JOIN OUR OFFICIAL DC TO ATTEND FUTURE TEST
        </Button>
      </div>
    </div>
  );
}
