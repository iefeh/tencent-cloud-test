import { Input, Modal, ModalBody, ModalContent, ModalHeader, cn } from '@nextui-org/react';
import Image, { StaticImageData } from 'next/image';
import logoImg from 'img/header/login/logo.png';
import BasicButton from './BasicButton';
import emailIconImg from 'img/login/btn_email.png';
import googleIconImg from 'img/login/btn_google.png';
import appleIconImg from 'img/login/btn_apple.png';
import discordIconImg from 'img/login/btn_discord.png';
import xIconImg from 'img/login/btn_x.png';
import facebookIconImg from 'img/login/btn_facebook.png';
import metamaskIconImg from 'img/login/btn_metamask.png';
import LoginButton from './buttons/LoginButton';
import { MediaType } from '@/constant/task';
import { useContext, useEffect, useRef, useState } from 'react';
import backImg from 'img/login/icon_back.png';
import LGButton from './buttons/LGButton';
import { MobxContext } from '@/pages/_app';
import { KEY_EMAIL } from '@/constant/storage';
import { sendEmailCodeAPI } from '@/http/services/login';
import { observer } from 'mobx-react-lite';
import { toast } from 'react-toastify';

interface BtnGroup {
  title: string;
  btns: {
    label: string;
    type: MediaType;
    icon: string | StaticImageData;
    onClick?: () => void;
  }[];
}

export function useEmail() {
  const { loginByEmail, toggleLoginModal } = useContext(MobxContext);
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [codeBtnText, setCodeBtnText] = useState('Send');
  const MAX_LEFT_SECONDS = 60;
  const leftSeconds = useRef(0);
  const [isSendLoading, setIsSendLoading] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const timer = useRef(0);
  const [isCounting, setIsCounting] = useState(false);
  const [desc, setDesc] = useState('');

  function listenEmail() {
    localStorage.setItem(KEY_EMAIL, email);

    function closeDialog() {
      window.removeEventListener('storage', closeDialog);
    }

    window.addEventListener('storage', closeDialog);
  }

  async function onSendClick() {
    if (!email) {
      setDesc('Please input your email.');
      return;
    }
    if (!/^[a-zA-Z0-9_.-]+@[a-zA-Z0-9-]+(\.[a-zA-Z0-9-]+)*\.[a-zA-Z0-9]{2,6}$/.test(email)) {
      setDesc('Please enter a valid email address, then try again.');
      return;
    }
    
    setDesc('');
    if (isLoading || isCounting || (leftSeconds.current !== 0 && leftSeconds.current < MAX_LEFT_SECONDS)) return;

    setIsSendLoading(true);
    listenEmail();
    try {
      await sendEmailCodeAPI({ email });
    } catch (error: any) {
      toast.error(error?.message || error);
      return;
    } finally {
      setIsSendLoading(false);
    }

    leftSeconds.current = MAX_LEFT_SECONDS;
    setCodeBtnText(`${leftSeconds.current}s`);
    setIsCounting(true);
    toast.info('Verification code has been sent, please check your email.');

    timer.current = window.setInterval(() => {
      leftSeconds.current--;
      if (leftSeconds.current <= 0) {
        clearInterval(timer.current);
        setCodeBtnText('Resend');
        setIsCounting(false);
        return;
      }

      setCodeBtnText(`${leftSeconds.current}s`);
    }, 1000);
  }

  async function onVerify() {
    if (code.length < 6 || isLoading) return;

    setIsLoading(true);
    try {
      await loginByEmail?.({ email, captcha: code });
      toggleLoginModal();
    } catch (error: any) {
      toast.error(error?.message || error);
      console.log(error);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    return () => {
      if (timer.current > 0) clearInterval(timer.current);
    };
  }, []);

  return {
    email,
    setEmail,
    code,
    setCode,
    onSendClick,
    onVerify,
    codeBtnText,
    isSendLoading,
    isLoading,
    isCounting,
    desc,
  };
}

const LoginModal = function () {
  const { loginModalVisible, toggleLoginModal } = useContext(MobxContext);
  const [emailLoginVisible, setEmailLoginVisible] = useState(false);
  const connectList: BtnGroup[] = [
    {
      title: 'Log in with social account',
      btns: [
        {
          label: 'Google',
          type: MediaType.GOOGLE,
          icon: googleIconImg,
        },
        // {
        //   label: 'Apple ID',
        //   type: MediaType.APPLE,
        //   icon: appleIconImg,
        // },
        {
          label: 'Discord',
          type: MediaType.DISCORD,
          icon: discordIconImg,
        },
        {
          label: 'Twitter',
          type: MediaType.TWITTER,
          icon: xIconImg,
        },
        // {
        //   label: 'Facebook',
        //   type: MediaType.FACEBOOK,
        //   icon: facebookIconImg,
        // },
      ],
    },
    {
      title: 'MetaMask',
      btns: [
        {
          label: 'MetaMask',
          type: MediaType.METAMASK,
          icon: metamaskIconImg,
        },
      ],
    },
  ];
  const {
    email,
    setEmail,
    code,
    setCode,
    onSendClick,
    onVerify,
    codeBtnText,
    isSendLoading,
    isLoading,
    isCounting,
    desc,
  } = useEmail();

  const baseLoginContent = (onClose: () => void) => (
    <>
      <ModalHeader className="flex flex-col gap-1">
        <Image className="w-[5.625rem] h-[3.3125rem]" src={logoImg} alt="" />
      </ModalHeader>
      <ModalBody>
        <h5 className="font-poppins text-3xl">Welcome to Moonveil</h5>

        <BasicButton
          className="h-[3.125rem] rounded-base border-[#252525] hover:shadow-none font-poppins-medium normal-case mt-6"
          label="Email"
          prefix={<Image className="inline-block w-[1.625rem] h-[1.625rem] mr-2" src={emailIconImg} alt="" />}
          onClick={() => setEmailLoginVisible(true)}
        />

        {connectList.map((item, index) => (
          <div key={index} className="mt-8">
            <div>{item.title}</div>

            <div className="mt-[0.875rem] grid grid-cols-2 gap-x-[0.8125rem] gap-y-4">
              {item.btns.map((btn, bi) => (
                <LoginButton
                  key={bi}
                  type={btn.type}
                  label={btn.label}
                  icon={btn.icon}
                  onClick={btn.onClick}
                  callback={onClose}
                />
              ))}
            </div>
          </div>
        ))}
      </ModalBody>
    </>
  );

  const emailLoginContent = (onClose: () => void) => (
    <>
      <ModalHeader className="flex gap-[0.6875rem] pt-11">
        <Image
          className="w-[1.875rem] h-[1.75rem] inline-block cursor-pointer"
          src={backImg}
          alt=""
          onClick={() => setEmailLoginVisible(false)}
        />
        <span className="font-poppins text-3xl">Welcome to Moonveil</span>
      </ModalHeader>
      <ModalBody className="font-poppins text-base">
        <div>Email Address</div>
        <div className="h-[3.125rem] flex justify-between gap-1">
          <Input
            isClearable
            type="email"
            placeholder="Your email"
            variant="bordered"
            classNames={{ inputWrapper: 'h-full !rounded-base' }}
            value={email}
            onValueChange={setEmail}
            errorMessage={desc}
          />
          <LGButton label={codeBtnText} squared loading={isSendLoading} disabled={isCounting} onClick={onSendClick} />
        </div>

        <div className="mt-5">Verification Code</div>
        <div className="h-[3.125rem] flex justify-between gap-1">
          <Input
            isClearable
            type="email"
            variant="bordered"
            classNames={{ inputWrapper: 'h-full !rounded-base' }}
            value={code}
            onValueChange={setCode}
          />
        </div>

        <div className="h-[3.125rem] flex justify-between">
          <div></div>

          <LGButton className="w-[13.125rem]" actived label="Login" loading={isLoading} squared onClick={onVerify} />
        </div>
      </ModalBody>
    </>
  );

  return (
    <Modal
      placement="center"
      backdrop="blur"
      classNames={{
        base: 'max-w-[32.25rem] rounded-[0.625rem] bg-[#070707]',
        header: 'pt-7 pl-10 pr-[2.6875rem]',
        body: 'pl-10 pr-[2.6875rem] pb-[3.125rem]',
      }}
      isOpen={loginModalVisible}
      onOpenChange={toggleLoginModal}
      isDismissable={false}
    >
      <ModalContent>{emailLoginVisible ? emailLoginContent : baseLoginContent}</ModalContent>
    </Modal>
  );
};

export default observer(LoginModal);
