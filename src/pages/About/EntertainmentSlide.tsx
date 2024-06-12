import Image from 'next/image';

export default function EntertainmentSlide() {
  return (
    <div className="bg-entertainment w-full h-screen relative flex justify-center items-center p-12">
      <Image className="object-cover" src="/img/bg_about.png" alt="" fill sizes="100%"></Image>
    </div>
  );
}
