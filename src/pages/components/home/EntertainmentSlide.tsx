import Image from "next/image";
import PageDesc from "../common/PageDesc";

interface Props {
  needAni?: boolean;
}

export default function EntertainmentSlide(props: Props) {
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
        needAni={props.needAni}
        className="relative top-[5%] items-center text-center"
        subtitle="With the power of cutting-edge technologies, our mission is to<br>craft top-notch gaming experiences that seamlessly combine casual<br>flexibility with authentic fun depth."
      />
    </div>
  );
}
