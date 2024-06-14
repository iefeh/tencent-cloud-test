import Image from "next/image";
import PageDesc from "../../../components/common/PageDesc";

interface Props {
  needAni?: boolean;
}

export default function ComingSoon(props: Props) {
  return (
    <div className="bg-coming-soon w-full h-screen relative flex justify-center items-center bg-black">
      <Image
        className="object-cover"
        src="/img/bg_coming_soon.jpg"
        alt=""
        fill
        sizes="100%"
      ></Image>

      <PageDesc
        hasBelt
        title="Coming Soon..."
        subtitle="Expect more surprises for you."
        className="relative top-[15%] items-center text-center"
        needAni={props.needAni}
        baseAniTY
      />
    </div>
  );
}
