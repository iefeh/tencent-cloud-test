import { MobxContext } from '@/pages/_app';
import LGButton from '@/pages/components/common/buttons/LGButton';
import { Input } from '@nextui-org/react';
import { observer } from 'mobx-react-lite';
import Image from 'next/image';
import { useContext } from 'react';

const ProfileEdit = function () {
  const { userInfo } = useContext(MobxContext);
  const { avatar_url } = userInfo || {};

  return (
    <div>
      <div className="flex items-center font-semibold">
        <div className="w-[6.875rem] h-[6.875rem] relative overflow-hidden rounded-full">
          {avatar_url && <Image className="object-cover" src={avatar_url} alt="" fill />}
        </div>

        <div className="text-2xl">Change profile photo</div>
      </div>

      <div>
        <div className="text-2xl">User Name</div>

        <div className="flex gap-2 h-[3.75rem]">
          <Input
            classNames={{ base: 'w-[23.75rem]', inputWrapper: 'h-full bg-black !rounded-base border-[#252525]' }}
            type="text"
            variant="bordered"
            fullWidth={false}
            placeholder="Your name"
          />
          <LGButton className="w-[7.5rem] h-full" label="Save" actived squared disabled={!userInfo} />
        </div>
      </div>
    </div>
  );
};

export default observer(ProfileEdit);
