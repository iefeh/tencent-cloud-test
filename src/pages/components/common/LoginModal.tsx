import { Button, ButtonProps, Modal, ModalBody, ModalContent, ModalHeader, cn } from '@nextui-org/react';
import Image from 'next/image';
import logoImg from 'img/header/login/logo.png';

interface Props {
  isOpen?: boolean;
  onOpenChange: () => void;
}

export function LoginButton(props: ButtonProps) {
  return (
    <Button
      {...props}
      className={cn(['bg-transparent border-1 border-[#252525] rounded-base h-[3.125rem]', props.className])}
    />
  );
}

export default function LoginModal(props: Props) {
  const { isOpen, onOpenChange } = props;

  return (
    <Modal
      placement="center"
      backdrop="blur"
      classNames={{
        base: 'rounded-[0.625rem] bg-[#070707]',
        header: 'pt-7 pl-10 pr-[2.6875rem]',
        body: 'pl-10 pr-[2.6875rem]',
      }}
      isOpen={isOpen}
      onOpenChange={onOpenChange}
    >
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader className="flex flex-col gap-1">
              <Image className="w-[5.625rem] h-[3.3125rem]" src={logoImg} alt="" />
            </ModalHeader>
            <ModalBody>
              <h5 className="font-poppins text-3xl">Welcome to Moonveil</h5>

              <div>
                <LoginButton>Invite Code</LoginButton>
              </div>
            </ModalBody>
          </>
        )}
      </ModalContent>
    </Modal>
  );
}
