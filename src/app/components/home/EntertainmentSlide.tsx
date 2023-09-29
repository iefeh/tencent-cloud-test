import Image from "next/image";

export default function EntertainmentSlide() {
  return (
    <div className="bg-race w-full h-screen">
      <Image
        src="/img/bg_home_swiper_entertainment.jpg"
        alt=""
        layout="fill"
        objectFit="cover"
      ></Image>
    </div>
  );
}
