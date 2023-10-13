import PageDesc from '@/pages/components/common/PageDesc';
import Image from 'next/image';
import bgImg from 'img/astrark/school/bg.jpg';
import SchoolIcons from './SchoolIcons';
import Mystery from './Mystery';

export default function AstrArkSchool() {
  return (
    <section className="w-full h-screen flex flex-col justify-center items-center relative">
      <div className="luxy-el w-full h-full" data-speed-x="5" data-offset="-50">
        <Image className="object-cover" src={bgImg} alt="" fill sizes="100%"></Image>

        <PageDesc
          title="Emergence of 4<br>Schools of Thoughts"
          subtitle="Now that it's back and time has rewound, 4 schools of thoughts emerged. each<br>with its own belief of the true approach to harnessing the infinite power."
        />

        <SchoolIcons />

        <Mystery />
      </div>
    </section>
  );
}
