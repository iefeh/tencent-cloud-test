import bgImg from 'img/loyalty/earn/bg_rank.jpg';
import Image from 'next/image';

export default function Rank() {
  return (
    <div className="w-[28.125rem] h-[37.5rem] overflow-hidden rounded-[0.625rem] relative">
      <Image src={bgImg} alt="" fill />
    </div>
  );
}
