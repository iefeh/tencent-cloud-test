import Image from "next/image";

export default function RaceSlide() {
  return (
    <div className="bg-race w-full h-screen">
      <Image
        className="object-cover"
        src="/img/bg_home_swiper_race.png"
        alt=""
        fill
      ></Image>
    </div>
  );
}
