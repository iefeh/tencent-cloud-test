import Image from "next/image";
import PageDesc from "../common/PageDesc";

export default function EntertainmentSlide() {
  return (
    <div className="bg-race w-full h-screen relative flex justify-center items-center">
      <Image
        className="object-cover"
        src="/img/bg_home_swiper_entertainment.jpg"
        alt=""
        fill
        sizes="100%"
      ></Image>

      <PageDesc
        goldenLogo
        hasBelt
        title="Moonveil Entertainment"
        subtitle="With the power of web 3, our mission is to craft top-<br>notch gaming experiences that seamlessly combine casual<br>flexibilitywithauthentic fun depth."
      />
    </div>
  );
}
