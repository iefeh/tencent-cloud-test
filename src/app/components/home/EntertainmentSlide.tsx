import Image from "next/image";

export default function EntertainmentSlide() {
  return (
    <div className="bg-race w-full h-screen">
      <Image
        className="object-cover"
        src="/img/bg_home_swiper_entertainment.jpg"
        alt=""
        fill
      ></Image>
    </div>
  );
}
