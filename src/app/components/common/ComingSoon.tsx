import Image from "next/image";
import PageDesc from "./PageDesc";

export default function ComingSoon() {
  return (
    <div className="bg-coming-soon w-full h-screen relative flex justify-center items-center">
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
      />
    </div>
  );
}
