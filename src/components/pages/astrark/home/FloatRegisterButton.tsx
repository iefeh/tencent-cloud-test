import { Button } from '@nextui-org/react';
import Image from 'next/image';
import { useRouter } from 'next/router';
import { createPortal } from 'react-dom';
import arrowIconImg from 'img/astrark/icon_arrow.png';

export default function FloatRegisterButton() {
  const router = useRouter();

  function onFloatClick() {
    router.push('/AstrArk/PreRegistration');
  }

  return createPortal(
    <Button
      className="w-[17.75rem] h-[10.25rem] bg-[url('/img/astrark/bg_register_now.png')] bg-cover bg-no-repeat bg-transparent fixed lg:left-[4.875rem] lg:bottom-[4.875rem] z-20 font-semakin text-[1.75rem] text-left left-6 bottom-8 scale-[0.6] origin-bottom-left lg:scale-100"
      disableRipple
      onPress={onFloatClick}
    >
      <span>
        Register
        <br />
        Now
        <Image
          className="inline-block w-[1.25rem] h-[1.25rem] align-middle relative -top-1 ml-3"
          src={arrowIconImg}
          alt=""
        />
      </span>
    </Button>,
    document.body,
  );
}
