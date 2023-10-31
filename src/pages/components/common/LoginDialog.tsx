import { createPortal } from 'react-dom';
import Image from 'next/image';
import goldenLogo from 'img/logo_golden.png';
import btnTwitter from 'img/login/btn_twitter.png';
import btnGoogle from 'img/login/btn_google.png';
import { useRef, useState } from 'react';
import EmailLogin from './EmailLogin';
import { CSSTransition } from 'react-transition-group';
import { getGoogleAuthLinkAPI, getTwitterAuthLinkAPI } from '@/http/services/login';
import { toast } from 'react-toastify';
import { throttle } from 'lodash';
import { DEFAULT_TOAST_OPTIONS } from '@/constant/toast';
import useAuthDialog from '@/hooks/useAuthDialog';
// import XSvg from 'svg/x.svg';
import emailImg from 'img/icon/email.png';

interface Props {
  visible?: boolean;
  onClose?: () => void;
}

export default function LoginDialog({ visible, onClose }: Props) {
  const [emailLoginVisible, setEmailLoginVisible] = useState(false);
  const dialogRef = useRef<HTMLDivElement>(null);
  const dialogWindowRef = useRef<Window | null>(null);
  const isAuthing = useRef(false);

  useAuthDialog(dialogWindowRef, () => onCloseClick());

  function openAuthWindow(authURL: string) {
    const dialog = window.open(
      authURL,
      'Authrization',
      'width=800,height=600,menubar=no,toolbar=no,location=no,alwayRaised=yes,depended=yes,z-look=yes',
    );
    dialogWindowRef.current = dialog;
  }

  const onGoogleLoginClick = throttle(async () => {
    if (isAuthing.current) return;

    isAuthing.current = true;
    try {
      const res = await getGoogleAuthLinkAPI();
      if (!res?.authorization_url) throw new Error('Get authorization link failed!');
      openAuthWindow(res.authorization_url);
    } catch (error: any) {
      toast.error(error?.message || error, DEFAULT_TOAST_OPTIONS);
    } finally {
      isAuthing.current = false;
    }
  }, 500);

  const onTwitterLoginClick = throttle(async () => {
    if (isAuthing.current) return;

    isAuthing.current = true;
    try {
      const res = await getTwitterAuthLinkAPI();
      if (!res?.authorization_url) throw new Error('Get authorization link failed!');
      openAuthWindow(res.authorization_url);
    } catch (error: any) {
      toast.error(error?.message || error, DEFAULT_TOAST_OPTIONS);
    } finally {
      isAuthing.current = false;
    }
  }, 500);

  const onCloseClick = () => {
    onClose?.();
    setTimeout(() => setEmailLoginVisible(false), 800);
  };

  const LoginButtons = () => (
    <>
      <Image className="w-[8.625rem] h-[5.125rem] mt-20 mb-[2rem]" src={goldenLogo} alt="" />

      <div
        className="inline-flex items-center cursor-pointer w-[18.875rem] py-2 px-[3.5rem] bg-basic-gray rounded-[3.5rem] hover:bg-deep-yellow"
        onClick={onGoogleLoginClick}
      >
        <Image className="w-9 h-9" src={btnGoogle} alt="" />
        <div>Continue With Google</div>
      </div>

      <div
        className="inline-flex items-center cursor-pointer w-[18.875rem] py-2 px-[3.5rem] bg-basic-gray rounded-[3.5rem] hover:bg-deep-yellow mt-5"
        onClick={onTwitterLoginClick}
      >
        <Image className="w-9 h-9" src={btnTwitter} alt="" />
        {/* <XSvg className="w-9 h-9 text-white" /> */}
        <div>Continue With Twitter</div>
      </div>

      <div
        className="inline-flex items-center cursor-pointer w-[18.875rem] py-2 px-[3.5rem] bg-basic-gray rounded-[3.5rem] hover:bg-deep-yellow mt-5"
        onClick={() => setEmailLoginVisible(true)}
      >
        <Image className="w-9 h-9" src={emailImg} alt="" />
        <div className="leading-9">Continue With Email</div>
      </div>
    </>
  );

  return createPortal(
    <CSSTransition nodeRef={dialogRef} classNames="login-dialog" in={visible} timeout={800} unmountOnExit>
      <div ref={dialogRef} className="login-dialog fixed left-0 top-0 w-full h-screen z-50 font-poppins-medium">
        <div className="mask w-full h-full bg-transparent" onClick={onCloseClick}></div>

        <div className="content absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[28.5rem] h-[27.56rem] bg-black rounded-[1.25rem] z-10 border-2 border-solid border-[#1F1B17] flex flex-col items-center text-sm px-6 shadow-lg">
          {emailLoginVisible ? (
            <EmailLogin onClose={() => setEmailLoginVisible(false)} onLogin={onCloseClick} />
          ) : (
            <LoginButtons />
          )}
        </div>
      </div>
    </CSSTransition>,
    document.body,
  );
}
