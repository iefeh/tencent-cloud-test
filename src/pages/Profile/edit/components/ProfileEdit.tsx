import { updateUserInfoAPI } from '@/http/services/profile';
import { MobxContext } from '@/pages/_app';
import LGButton from '@/pages/components/common/buttons/LGButton';
import { Input } from '@nextui-org/react';
import { throttle } from 'lodash';
import { observer } from 'mobx-react-lite';
import Image from 'next/image';
import { useContext, useState } from 'react';

const ProfileEdit = function () {
  const { userInfo, getUserInfo } = useContext(MobxContext);
  const { avatar_url, username } = userInfo || {};
  const [avatarURL, setAvatarURL] = useState(avatar_url);
  const [name, setName] = useState(username);
  const [loading, setLoading] = useState(false);

  function onValueChange(val: string) {
    setName(val.replace(/\s/g, ''));
  }

  const updateUserInfo = throttle(async () => {
    setLoading(true);

    try {
      await updateUserInfoAPI({ username: name, avatar_url: avatarURL });
      await getUserInfo();
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  });

  return (
    <div className="mt-[3.4375rem]">
      {/* <div className="flex items-center font-semibold mb-[3.4375rem]">
        <div className="w-[6.875rem] h-[6.875rem] relative overflow-hidden rounded-full">
          {avatar_url && <Image className="object-cover" src={avatar_url} alt="" fill />}
        </div>

        <div className="text-2xl ml-5">Change profile photo</div>
      </div> */}

      <div>
        <div className="text-2xl">User Name</div>

        <div className="flex gap-2 h-[3.75rem] mt-[1.4375rem]">
          <Input
            classNames={{ base: 'w-[23.75rem]', inputWrapper: 'h-full bg-black !rounded-base border-[#252525]' }}
            type="text"
            maxLength={16}
            variant="bordered"
            fullWidth={false}
            placeholder="Your name"
            defaultValue={username}
            value={name}
            onValueChange={onValueChange}
          />

          <LGButton
            className="w-[7.5rem] h-full"
            label="Save"
            actived
            squared
            loading={loading}
            disabled={!userInfo || (avatar_url === avatarURL && username === name)}
            onClick={updateUserInfo}
          />
        </div>
      </div>
    </div>
  );
};

export default observer(ProfileEdit);
