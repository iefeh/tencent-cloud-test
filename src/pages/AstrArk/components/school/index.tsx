import PageDesc from '@/pages/components/common/PageDesc';
import SchoolIcons from './SchoolIcons';
import Mystery from './Mystery';

export default function AstrArkSchool() {
  const Content = (
    <>
      <video
        className="absolute inset-0 object-cover"
        autoPlay
        playsInline
        muted
        loop
        preload="auto"
        poster="/img/astrark/school/bg.jpg"
      >
        <source src="https://moonveil-public.s3.ap-southeast-2.amazonaws.com/astrark/background/bg1.mp4" />
      </video>

      <PageDesc
        className="items-center text-center -mt-[12.5rem] min-[2400px]:-mt-[28rem]"
        title="Emergence of 4<br>Schools of Thoughts"
        subtitle="Now that it's back and time has rewound, 4 schools of thoughts emerged. each<br>with its own belief of the true approach to harnessing the infinite power."
      />

      <SchoolIcons />
    </>
  );

  return (
    <section className="w-full h-screen relative overflow-hidden">
      <div
        className="luxy-el w-full h-[calc(100vh_+_600px)] flex-col justify-center items-center min-[2400px]:flex hidden"
        data-speed-y="8"
        data-offset="-960"
      >
        {Content}
      </div>

      <div
        className="luxy-el w-full h-[calc(100vh_+_540px)] flex-col justify-center items-center min-[768px]:max-[2399px]:flex hidden relative top-[20vh]"
        data-speed-y="4"
        data-offset="-480"
      >
        {Content}
      </div>

      <div
        className="luxy-el w-full h-[calc(100vh_+_400px)] flex-col justify-center items-center max-[767px]:flex hidden"
        data-speed-y="8"
        data-offset="-640"
      >
        {Content}
      </div>

      <Mystery className="absolute left-[4.75rem] bottom-[4.4375rem] max-md:hidden" />
    </section>
  );
}
