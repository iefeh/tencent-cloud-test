import { MobxContext } from '@/pages/_app';
import { Button, cn } from '@nextui-org/react';
import { useContext, useState } from 'react';
import { observer } from 'mobx-react-lite';

interface Props {
  className?: string;
  onClick?: () => void;
  onPreRegistered?: () => void;
}

function PreregisterButton({ className, onClick, onPreRegistered }: Props) {
  const { userInfo, toggleLoginModal } = useContext(MobxContext);
  const [preRegLoading, setPreRegLoading] = useState(false);

  async function onPreRegisterClick() {
    if (!userInfo) {
      toggleLoginModal(true);
      return;
    }

    setPreRegLoading(true);

    try {
      await onClick?.();
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
        className={cn([
          "w-[19.6875rem] h-[4.375rem] bg-[url('/img/astrark/pre-register/bg_btn_colored.png')] bg-cover bg-no-repeat !bg-transparent font-semakin text-black text-2xl",
          className,
        ])}
        disableRipple
        isLoading={preRegLoading}
        onPress={onPreRegisterClick}
      >
        Pre-Registration
      </Button>
    </>
  );
}

export default observer(PreregisterButton);
