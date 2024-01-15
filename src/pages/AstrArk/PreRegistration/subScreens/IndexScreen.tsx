import Image from 'next/image';
import roleImg from 'img/astrark/pre-register/index_role.png';
import arrowLRImg from 'img/astrark/pre-register/arrow_lr.png';
import RewardSwiper from '../components/RewardSwiper';
import { Button, Modal, ModalBody, ModalContent, useDisclosure } from '@nextui-org/react';
import { useRouter } from 'next/router';
import arrowIconImg from 'img/astrark/icon_arrow.png';
import shardImg from 'img/astrark/pre-register/shard.png';
import { PreRegisterInfoDTO, preRegisterAPI, queryPreRegisterInfoAPI } from '@/http/services/astrark';
import { useContext, useEffect, useState } from 'react';
import { MobxContext } from '@/pages/_app';
import { observer } from 'mobx-react-lite';
import ShareButton from '../components/ShareButton';
import { throttle } from 'lodash';

function IndexScreen() {
  const router = useRouter();
  const { userInfo, toggleLoginModal } = useContext(MobxContext);
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const [preRegLoading, setPreRegLoading] = useState(false);
  const [preInfo, setPreInfo] = useState<PreRegisterInfoDTO | null>(null);

  const queryPreRegisterInfo = throttle(async () => {
    try {
      const res = await queryPreRegisterInfoAPI();
      setPreInfo(res || null);
    } catch (error) {
      console.log(error);
    }
  }, 500);

  function onFloatClick() {
    router.push('/AstrArk/Download');
  }

  async function onPreRegisterClick() {
    if (!userInfo) {
      toggleLoginModal(true);
      return;
    }

    setPreRegLoading(true);

    try {
      await preRegisterAPI();
      onOpen();
      queryPreRegisterInfo();
    } catch (error) {
      console.log(error);
    } finally {
      setPreRegLoading(false);
    }
  }

  useEffect(() => {
    queryPreRegisterInfo();
  }, [userInfo]);

  return (
    <div className="w-screen h-screen 4xl:h-[67.5rem] bg-[url('/img/astrark/pre-register/bg_index_screen.jpg')] bg-no-repeat bg-cover relative px-16 lg:px-0">
      <div className="absolute right-0 top-0 z-0 w-[54.125rem] h-[67.5rem]">
        <Image className="object-cover" src={roleImg} alt="" fill />
      </div>

      <div className="relative w-full h-full z-10 flex flex-col justify-center items-center text-center">
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

        <RewardSwiper />

        <Image className="mt-6 w-9 h-9 object-cover select-none" src={arrowLRImg} alt="" />

        <div className="mt-8 flex items-center">
          {preInfo?.preregistered ? (
            <ShareButton />
          ) : (
            <Button
              className="w-[19.6875rem] h-[4.375rem] bg-[url('/img/astrark/pre-register/bg_btn_colored.png')] bg-cover bg-no-repeat !bg-transparent font-semakin text-black text-2xl"
              disableRipple
              isLoading={preRegLoading}
              onPress={onPreRegisterClick}
            >
              Pre-Registration
            </Button>
          )}
        </div>
      </div>

      <Button
        className="w-[17.75rem] h-[10.25rem] bg-[url('/img/astrark/pre-register/bg_view_game_lore.png')] bg-cover bg-no-repeat bg-transparent absolute left-[4.875rem] bottom-[4.875rem] z-20 font-semakin text-[1.75rem] text-left"
        disableRipple
        onPress={onFloatClick}
      >
        {/* <span>
          View
          <Image
            className="inline-block w-[1.25rem] h-[1.25rem] align-middle relative -top-1 ml-3"
            src={arrowIconImg}
            alt=""
          />
          <br />
          Game Lore
        </span> */}
        Alpha Test
        <br />
        Download
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
    </div>
  );
}

export default observer(IndexScreen);
