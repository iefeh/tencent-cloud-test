import { MobxContext } from '@/pages/_app';
import Image from 'next/image';
import { useContext } from 'react';

export default function ProfileEdit() {
  const { userInfo } = useContext(MobxContext);
  const { avatar_url } = userInfo!;

  return (
    <div className="flex items-center font-semibold">
      <div className="w-[6.875rem] h-[6.875rem] relative overflow-hidden rounded-full">
        <Image className="object-cover" src={avatar_url} alt="" fill />
      </div>

      <div className="text-2xl">Change profile photo</div>
    </div>
  );
}
