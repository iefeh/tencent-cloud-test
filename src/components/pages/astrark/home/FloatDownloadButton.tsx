import { Button } from '@nextui-org/react';
import { useRouter } from 'next/router';
import { createPortal } from 'react-dom';

export default function FloatDownloadButton() {
  const router = useRouter();

  function onFloatClick() {
    router.push('/AstrArk/Download');
  }

  return createPortal(
    <Button
      className="w-[17.75rem] h-[10.25rem] bg-[url('/img/astrark/pre-register/bg_view_game_lore.png')] bg-cover bg-no-repeat bg-transparent fixed lg:left-[4.875rem] lg:bottom-[4.875rem] z-20 font-semakin text-[1.5rem] text-left left-6 bottom-8 scale-[0.6] origin-bottom-left lg:scale-100"
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
      Marching Test
      <br />
      Download
    </Button>,
    document.body,
  );
}
