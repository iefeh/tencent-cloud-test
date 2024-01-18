import Image from 'next/image';
import roleImg from 'img/astrark/pre-register/index_role.png';
import arrowLRImg from 'img/astrark/pre-register/arrow_lr.png';
import RewardSwiper from '../components/RewardSwiper';
import { Button, Modal, ModalBody, ModalContent, cn, useDisclosure } from '@nextui-org/react';
import { useRouter } from 'next/router';
import arrowIconImg from 'img/astrark/icon_arrow.png';
import { PreRegisterInfoDTO } from '@/http/services/astrark';
import ShareButton from '../components/ShareButton';
import PreRegisterButton from '../components/PreRegisterButton';
import shardImg from 'img/astrark/pre-register/shard.png';
import { useContext } from 'react';
import { MobxContext } from '@/pages/_app';
import { observer } from 'mobx-react-lite';

function IndexScreen({
  preInfo,
  onPreRegistered,
}: {
  preInfo: PreRegisterInfoDTO | null;
  onPreRegistered?: () => void;
}) {
  const { userInfo } = useContext(MobxContext);
  const { isOpen, onOpen, onOpenChange } = useDisclosure();

  function onPreRegisterCallback() {
    onPreRegistered?.();
    onOpen();
  }

  return (
    <div className="w-screen min-h-screen bg-[url('/img/astrark/pre-register/bg_index_screen.jpg')] bg-no-repeat bg-cover relative px-16 lg:px-0 pt-[6rem] pb-[4rem]">
      <div className="absolute right-0 top-0 z-0 w-[54.125rem] h-[67.5rem]">
        <Image className="object-cover" src={roleImg} alt="" fill />
      </div>

      <div className="relative w-full h-full z-10 flex flex-col justify-center items-center text-center mt-4 lg:mt-0">
        <div className="p-2 bg-clip-text bg-[linear-gradient(-50deg,_#DBAC73_0%,_#F1EEC9_33.203125%,_#F1EEC9_82.5927734375%,_#CFA36F_100%)]">
          <div className="font-semakin text-transparent text-6xl">
            Pre-Registration
            <br />
            Rewards
          </div>
        </div>

        <div className="font-poppins text-lg mt-[1.375rem]">
          Join the adventure with{' '}
          <span className="font-semakin text-basic-yellow text-2xl">
            {preInfo ? preInfo.total.replace(/(\d)(?=(?:\d{3})+$)/g, '$1,') : '0'}
          </span>{' '}
          Commanders registered for AstrArk! Let&apos;s embark together!
        </div>

        <RewardSwiper preInfo={preInfo} />

        <Image className="mt-6 w-9 h-9 object-cover select-none hidden lg:block" src={arrowLRImg} alt="" />

        <div className="mt-2 lg:mt-8 flex items-center h-[4.375rem]">
          {(!userInfo || (preInfo && !preInfo.preregistered)) && (
            <PreRegisterButton onPreRegistered={onPreRegisterCallback} />
          )}
          {/* {preInfo && preInfo.preregistered && <ShareButton preInfo={preInfo} />} */}
        </div>

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
                    Hello Commander, thanks for pre-registering! Your exclusive in-game reward will be delivered upon
                    the official launch of AstrArk. Excited to embark on this adventure together!
                  </p>

                  <Image className="w-[8.625rem] h-[5.125rem]" src={shardImg} alt="" />
                </ModalBody>
              </>
            )}
          </ModalContent>
        </Modal>
      </div>
    </div>
  );
}

export default observer(IndexScreen);
