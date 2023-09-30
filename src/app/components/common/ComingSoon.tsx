import Image from "next/image";

export default function ComingSoon() {
  return (
    <div className="bg-coming-soon w-full h-screen">
      <Image
        className="object-cover"
        src="/img/bg_coming_soon.jpg"
        alt=""
        fill
        sizes="100%"
      ></Image>
    </div>
  );
}
