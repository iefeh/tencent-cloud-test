import { preRegisterAPI } from '@/http/services/astrark';
import { MobxContext } from '@/pages/_app';
import { Button, Modal, ModalBody, ModalContent, useDisclosure } from '@nextui-org/react';
import Image from 'next/image';
import { useContext, useState } from 'react';
import shardImg from 'img/astrark/pre-register/shard.png';
import { observer } from 'mobx-react-lite';

interface Props {
  onPreRegistered?: () => void;
}

function PreRegisterButton(props: Props) {
  const { onPreRegistered } = props;
  const { userInfo, toggleLoginModal } = useContext(MobxContext);
  const [preRegLoading, setPreRegLoading] = useState(false);
  const { isOpen, onOpen, onOpenChange } = useDisclosure();

  async function onPreRegisterClick() {
    if (!userInfo) {
      toggleLoginModal(true);
      return;
    }

    setPreRegLoading(true);

    try {
      await preRegisterAPI();
      onOpen();
      onPreRegistered?.();
    } catch (error) {
      console.log(error);
    } finally {
      setPreRegLoading(false);
    }
  }

  return (
    <>
      <Button
        className="w-[19.6875rem] h-[4.375rem] bg-[url('/img/astrark/pre-register/bg_btn_colored.png')] bg-cover bg-no-repeat !bg-transparent font-semakin text-black text-2xl"
        disableRipple
        isLoading={preRegLoading}
        onPress={onPreRegisterClick}
      >
        Pre-Registration
      </Button>

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
                  Hello Commander, thanks for pre-registering! Your exclusive in-game reward will be delivered upon the
                  official launch of AstrArk. Excited to embark on this adventure together!
                </p>

                <Image className="w-[8.625rem] h-[5.125rem]" src={shardImg} alt="" />
              </ModalBody>
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  );
}

export default observer(PreRegisterButton);
