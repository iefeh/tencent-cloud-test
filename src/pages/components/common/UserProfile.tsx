import { MobxContext } from '@/pages/_app';
import Image from 'next/image';
import { useContext } from 'react';
import copyImg from 'img/profile/copy.png';

export default function UserProfile() {
  const { userInfo } = useContext(MobxContext);
  if (!userInfo) return null;

  const { avatar_url } = userInfo!;

  return (
    <div className="inline-flex items-center">
      <div className="relative w-[6.875rem] h-[6.875rem] rounded-full overflow-hidden">
        <Image className="object-cover" src={avatar_url} alt="" fill />
      </div>

      <div className="ml-4 font-poppins">
        <div className="text-4xl leading-none">Panda</div>
        <div className="flex items-center text-base leading-none mt-4">
          <span>0xe7d560a9b52f9fd3</span>
          <Image className="w-[1.125rem] h-[1.125rem] ml-2 cursor-pointer" src={copyImg} alt="" />
        </div>
      </div>
    </div>
  );
}
