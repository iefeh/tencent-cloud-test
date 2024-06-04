import { updateUserInfoAPI } from '@/http/services/profile';
import { MobxContext } from '@/pages/_app';
import LGButton from '@/pages/components/common/buttons/LGButton';
import { Input, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, useDisclosure } from '@nextui-org/react';
import { throttle } from 'lodash';
import { observer } from 'mobx-react-lite';
import { useContext, useEffect, useState } from 'react';
import { toast } from 'react-toastify';

const ProfileEdit = function () {
  const { userInfo, getUserInfo } = useContext(MobxContext);
  const { avatar_url, username } = userInfo || {};
  const [avatarURL, setAvatarURL] = useState(avatar_url);
  const [name, setName] = useState(username);
  const [loading, setLoading] = useState(false);
  const [nameError, setNameError] = useState('');
  const { isOpen, onOpen, onClose, onOpenChange } = useDisclosure();

  function onValueChange(val: string) {
    setName(val.replace(/\s/g, ''));
    setNameError('');
  }

  function onSaveClick() {
    onOpen();
  }

  function onCancel() {
    setName(username);
    onClose();
  }

  const updateUserInfo = throttle(async () => {
    if (!name) {
      setNameError('Please enter your nickname.');
      return;
    }

    setLoading(true);

    try {
      await updateUserInfoAPI({ username: name, avatar_url: avatarURL });
      await getUserInfo();
      onClose();
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  });

  useEffect(() => {
    setName(userInfo?.username);
    setAvatarURL(userInfo?.avatar_url);
  }, [userInfo]);

  return (
    <div className="mt-[3.4375rem]">
      {/* <div className="flex items-center font-semibold mb-[3.4375rem]">
        <div className="w-[6.875rem] h-[6.875rem] relative overflow-hidden rounded-full">
          {avatar_url && <Image className="object-cover" src={avatar_url} alt="" fill sizes='100%' />}
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
            errorMessage={nameError}
            onValueChange={onValueChange}
          />

          <LGButton
            className="w-[7.5rem] h-full"
            label="Save"
            actived
            squared
            disabled={!userInfo || (avatar_url === avatarURL && username === name) || !name}
            onClick={onSaveClick}
          />
        </div>
      </div>

      <Modal
        backdrop="blur"
        placement="center"
        isOpen={isOpen}
        classNames={{
          base: 'bg-black max-w-[38rem]',
          header: 'p-0',
          closeButton: 'z-10',
          body: 'text-[#CCCCCC] font-poppins text-base leading-[1.875rem] pt-5 pb-8 px-10 max-h-[37.5rem] overflow-y-auto',
          footer: 'justify-center',
        }}
        onOpenChange={onOpenChange}
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader>
                <div className="relative w-full h-[6.25rem] bg-no-repeat bg-[url('/img/invite/bg_rule_head.png')] bg-contain flex items-center gap-3 px-6">
                  <div className="font-semakin text-basic-yellow text-2xl">Attention Here</div>
                </div>
              </ModalHeader>

              <ModalBody>
                <p>
                  Please note you can only change your user name{' '}
                  <span className="text-basic-yellow">ONCE every 72 hours</span>. Please{' '}
                  <span className="text-basic-yellow">double-check</span> your user name before confirming. If you are
                  joining the Puffy 2048 Community Leaderboard Challenge, please change your name to{' '}
                  <span className="text-basic-yellow">[Community Name + Your Nickname]</span> for identification.
                </p>
              </ModalBody>

              <ModalFooter>
                <LGButton label="Cancel" onClick={onCancel} />

                <LGButton label="Confirm" actived loading={loading} onClick={updateUserInfo} />
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </div>
  );
};

export default observer(ProfileEdit);
