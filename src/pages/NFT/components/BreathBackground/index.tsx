import Image from "next/image";
import triangleImg from 'img/nft/breathBg/triangle.png';

export default function BreathBackground() {
  return <div className="fixed w-screen h-screen left-0 top-0 z-0 flex justify-center items-center">
    <Image className="w-[44.875rem] h-[41.5rem]" src={triangleImg} alt="" />
  </div>;
}
