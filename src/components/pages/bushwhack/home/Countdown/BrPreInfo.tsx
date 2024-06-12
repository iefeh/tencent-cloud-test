import PreRegisterButton from '@/components/common/buttons/PreregisterButton';
import { preRegisterAPI, queryPreRegisterInfoAPI } from '@/http/services/bushwhack';
import { useUserContext } from '@/store/User';
import { Modal, ModalBody, ModalContent, useDisclosure } from '@nextui-org/react';
import Image from 'next/image';
import { FC, useEffect, useState } from 'react';
import shardImg from 'img/astrark/pre-register/shard.png';
import { observer } from 'mobx-react-lite';

const BrPreInfo: FC = () => {
  const { userInfo, toggleLoginModal } = useUserContext();
  const [preCount, setPreCount] = useState(0);
  const [hasPreregistered, setHasPreregistered] = useState(false);
  const { isOpen, onOpen, onOpenChange } = useDisclosure();

  async function queryPreCount() {
    const res = await queryPreRegisterInfoAPI();
    setPreCount(+(res?.total || 0));
    setHasPreregistered(!!res?.preregistered);
  }

  async function preregister() {
    if (!userInfo) {
      toggleLoginModal();
      return;
    }

    const res = await preRegisterAPI();
    if (!res) {
      onOpen();
      await queryPreCount();
      return;
    }

    throw new Error('Bushwhack Pre-Registration.');
  }

  useEffect(() => {
    queryPreCount();
  }, [userInfo]);

  return (
    <div className="mt-8 flex items-center flex-col lg:flex-row gap-8">
      <div className="text-lg">
        <div className="font-semakin text-3xl text-basic-yellow">{preCount.toLocaleString('en-US')}</div>
        <div>Moonwalkers</div>
      </div>

      {hasPreregistered || <PreRegisterButton onClick={preregister} />}

      <Modal
        placement="center"
        backdrop="blur"
        isOpen={isOpen}
        onOpenChange={onOpenChange}
        classNames={{ base: 'bg-[#141414] !rounded-base max-w-[30rem]', body: 'px-8 pt-[3.625rem] items-center' }}
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalBody>
                <p className="font-poppins">
                  Hello Commander, thanks for pre-registering! Excited to embark on this adventure together!
                </p>

                <Image className="w-[8.625rem] h-[5.125rem]" src={shardImg} alt="" />
              </ModalBody>
            </>
          )}
        </ModalContent>
      </Modal>
    </div>
  );
};

export default observer(BrPreInfo);
