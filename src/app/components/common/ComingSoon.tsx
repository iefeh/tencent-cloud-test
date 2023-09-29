import Image from "next/image";

export default function ComingSoon() {
  return (
    <div className="bg-coming-soon w-full h-screen">
      <Image
        src="/img/bg_coming_soon.jpg"
        alt=""
        layout="fill"
        objectFit="cover"
      ></Image>
    </div>
  );
}
