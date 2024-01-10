import Image from 'next/image';
import roleImg from 'img/astrark/pre-register/index_role.png';

export default function IndexScreen() {
  return (
    <div className="w-full h-screen bg-[url('/img/astrark/pre-register/bg_index_screen.jpg')] bg-no-repeat bg-cover relative">
      <div className="absolute right-0 top-0 z-0 w-[54.125rem] h-[67.5rem]">
        <Image src={roleImg} alt="" fill />
      </div>

      <div className="relative w-full h-full z-10 flex flex-col justify-center items-center text-center">
        <div className="p-2 bg-clip-text bg-[linear-gradient(-50deg,_#DBAC73_0%,_#F1EEC9_33.203125%,_#F1EEC9_82.5927734375%,_#CFA36F_100%)]">
          <div className="font-semakin text-transparent text-6xl">
            Pre-Registration
            <br />
            Rewards
          </div>
        </div>
      </div>
    </div>
  );
}
