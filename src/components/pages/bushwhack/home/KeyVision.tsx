import Image from 'next/image';
import bgImg from 'img/bushwhack/kv/bg.jpg';

export default function KeyVisionScreen() {
  return (
    <div className="w-screen h-screen relative">
      <Image className="object-cover" src={bgImg} alt="" fill />
    </div>
  );
}
