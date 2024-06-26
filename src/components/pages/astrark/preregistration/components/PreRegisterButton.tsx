import { preRegisterAPI } from '@/http/services/astrark';
import { MobxContext } from '@/pages/_app';
import { Button, cn, useDisclosure } from '@nextui-org/react';
import { useContext, useState } from 'react';
import { observer } from 'mobx-react-lite';

interface Props {
  className?: string;
  onPreRegistered?: () => void;
}

function PreRegisterButton(props: Props) {
  const { className, onPreRegistered } = props;
  const { userInfo, toggleLoginModal } = useContext(MobxContext);
  const [preRegLoading, setPreRegLoading] = useState(false);

  async function onPreRegisterClick() {
    if (!userInfo) {
      toggleLoginModal(true);
      return;
    }

    setPreRegLoading(true);

    try {
      await preRegisterAPI();
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

export default observer(PreRegisterButton);
