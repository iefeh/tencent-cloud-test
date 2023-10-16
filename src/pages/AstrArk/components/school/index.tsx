import PageDesc from '@/pages/components/common/PageDesc';
import Image from 'next/image';
import bgImg from 'img/astrark/school/bg.jpg';
import SchoolIcons from './SchoolIcons';
import Mystery from './Mystery';

export default function AstrArkSchool() {
  return (
    <section className="w-full h-screen relative overflow-hidden">
      <div className="luxy-el w-full h-[calc(100vh_+_400px)] flex flex-col justify-center items-center" data-speed-y="8" data-offset="-640">
        <Image className="object-cover" src={bgImg} alt="" fill />

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
