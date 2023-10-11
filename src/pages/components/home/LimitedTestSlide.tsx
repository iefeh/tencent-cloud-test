import Image from "next/image";
import PageDesc from "../common/PageDesc";

interface Props {
  needAni?: boolean;
}

export default function LimitedTestSlide(props: Props) {
  return (
    <div className="bg-race w-full h-screen relative flex justify-center items-center">
      <Image
        className="object-cover"
        src="/img/bg_home_swiper_test.png"
        alt=""
        fill
        sizes="100%"
      ></Image>

      <PageDesc
        whiteLogo
        hasBelt
        title="Limited Pre-alpha Test"
        needAni={props.needAni}
        subtitle="Click to enter Moonveil Discord to sign up."
        buttonLabel="Sign Up"
        buttonLink="https://discord.com/invite/NyECfU5XFX"
      />
    </div>
  );
}
