import React from 'react';
import PageDesc from '../../../components/common/PageDesc';

const WorldView: React.FC = () => {
  const Content = (
    <>
      <video
        className="object-cover absolute left-0 top-0 w-full h-full z-0"
        autoPlay
        playsInline
        muted
        loop
        preload="auto"
        poster="/img/astrark/bg-world-view.jpg"
      >
        <source src="/video/meteorite.mp4" />
      </video>

      <div className="bg-black/30 absolute inset-0 z-0"></div>

      <PageDesc
        hasBelt
        title={<div className='title text-[6.25rem] uppercase font-semakin mb-4 max-md:text-6xl'>What happened...</div>}
        subtitle={
          <div className="title text-lg font-decima mb-10 tracking-tighter">
            <span className="max-md:inline-block hidden">
              A mysterious object offering infinite energy has reshaped our world. As humanity studies its enigmatic
              nature, humanity finds itself enslaved by the object while averting energy shortages. But when it
              vanished, chaos ensued. Nations crumbled, and it was called the &quot;End Times.&quot;
            </span>

            <span className="max-md:hidden">
              A mysterious object offering infinite energy has reshaped
              <br /> our world. As humanity studies its enigmatic nature,
              <br /> humanity finds itself enslaved by the object while
              <br /> averting energy shortages.
              <br />
              <br />
              But when it vanished, chaos ensued. Nations crumbled, and
              <br /> it was called the &quot;End Times.&quot;
            </span>
          </div>
        }
      />
    </>
  );

  return (
    <div className="worldView w-full h-screen relative flex justify-center items-center overflow-hidden">
      <div
        className="luxy-el w-full h-[calc(100vh_+_600px)] justify-center items-center hidden p-8 min-[2560px]:flex "
        data-speed-y="8"
        data-offset="-400"
      >
        {Content}
      </div>

      <div
        className="luxy-el w-full h-[calc(100vh_+_400px)] justify-center items-center min-[768px]:max-[2560px]:flex hidden p-8"
        data-speed-y="8"
        data-offset="-300"
      >
        {Content}
      </div>

      <div
        className="luxy-el w-full h-[calc(100vh_+_200px)] justify-center items-center max-[768px]:flex hidden p-8"
        data-speed-y="2"
        data-offset="-100"
      >
        {Content}
      </div>
    </div>
  );
};

export default WorldView;
