import Image from 'next/image';
import triangleImg from 'img/nft/breathBg/triangle.png';
import breathImg from 'img/nft/breathBg/breath.png';
import styles from './index.module.css';

export default function BreathBackground() {
  return (
    <div className="fixed w-screen h-screen left-0 top-0 z-0 flex justify-center items-center">
      <Image className="w-[44.875rem] h-[41.5rem]" src={triangleImg} alt="" />
      <Image className={"w-[120rem] absolute left-0 top-[61.5%] origin-center " + styles.breath} src={breathImg} alt="" />
    </div>
  );
}
