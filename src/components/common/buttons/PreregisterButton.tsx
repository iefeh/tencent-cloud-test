import { MobxContext } from '@/pages/_app';
import { Button, cn } from '@nextui-org/react';
import { useContext, useState } from 'react';
import { observer } from 'mobx-react-lite';
import LGButton from '@/pages/components/common/buttons/LGButton';

interface Props {
  className?: string;
  hasPreregistered?: boolean;
  onClick?: () => void;
  onPreRegistered?: () => void;
}

function PreregisterButton({ className, hasPreregistered, onClick, onPreRegistered }: Props) {
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
      <LGButton
        className={cn(['w-[19.6875rem] h-[4.375rem] rounded-[2.5rem] font-semakin text-2xl', className])}
        label={hasPreregistered ? 'Pre-Registered' : 'Pre-Registration'}
        loading={preRegLoading}
        actived
        disabled={hasPreregistered}
        onClick={onPreRegisterClick}
      />
    </>
  );
}

export default observer(PreregisterButton);
