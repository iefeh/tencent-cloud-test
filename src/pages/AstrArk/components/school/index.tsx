import PageDesc from '@/pages/components/common/PageDesc';
import Image from 'next/image';
import bgImg from 'img/astrark/school/bg.jpg';
import SchoolIcons from './SchoolIcons';
import Mystery from './Mystery';

export default function AstrArkSchool() {
  const Content = (
    <>
      <Image className="object-cover" src={bgImg} alt="" fill />

      <PageDesc
        className="items-center text-center -mt-[12.5rem]"
        title="Emergence of 4<br>Schools of Thoughts"
        subtitle="Now that it's back and time has rewound, 4 schools of thoughts emerged. each<br>with its own belief of the true approach to harnessing the infinite power."
      />

      <SchoolIcons />
    </>
  );

  return (
    <section className="w-full h-screen relative overflow-hidden">
      <div
        className="luxy-el w-full h-[calc(100vh_+_400px)] flex flex-col justify-center items-center max-md:hidden"
        data-speed-y="8"
        data-offset="-640"
      >
        {Content}
      </div>

      <div
        className="luxy-el w-full h-[calc(100vh_+_400px)] flex-col justify-center items-center max-md:flex hidden relative max-md:top-[20vh]"
        data-speed-y="4"
        data-offset="-440"
      >
        {Content}
      </div>

      <Mystery className="absolute left-[4.75rem] bottom-[4.4375rem] max-md:hidden" />
    </section>
  );
}
