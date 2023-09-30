import Image from "next/image";
import PageDesc from "../common/PageDesc";

export default function RaceSlide() {
  return (
    <div className="bg-race w-full h-screen relative flex justify-center items-center">
      <Image
        className="object-cover"
        src="/img/bg_home_swiper_race.png"
        alt=""
        fill
        sizes="100%"
      ></Image>

      <PageDesc
        whiteLogo
        hasBelt
        title="See You In Q4 2023"
        subtitle="A real time tower-defense PVP game"
      />
    </div>
  );
}
