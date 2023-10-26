import { createPortal } from 'react-dom';
import Link from 'next/link';
import Image from 'next/image';
import goldenLogo from 'img/logo_golden.png';
import btnTwitter from 'img/login/btn_twitter.png';
import btnGoogle from 'img/login/btn_google.png';
import GoogleLogin from './GoogleLogin';
import TwitterLogin from './TwitterLogin';
import { useState } from 'react';
import EmailLogin from './EmailLogin';

interface Props {
  visible?: boolean;
  onClose?: () => void;
}

export default function LoginDialog({ visible, onClose }: Props) {
  const [emailLoginVisible, setEmailLoginVisible] = useState(false);

  const handleLoginSuccess = (profile: any, idToken: string) => {
    // 处理登录成功后的操作，可以将profile和idToken发送到服务器进行验证
    console.log('Login success', profile, idToken);
  };

  const handleLoginFailure = (error: any) => {
    // 处理登录失败后的操作
    console.error('Login failed', error);
  };

  const onCloseClick = () => {
    onClose?.();
    setEmailLoginVisible(false);
  };

  const LoginButtons = () => (
    <>
      <Image className="w-[8.625rem] h-[5.125rem] mt-20 mb-[2rem]" src={goldenLogo} alt="" />

      <div className="inline-flex items-center cursor-pointer w-[18.875rem] justify-center py-2 bg-basic-gray rounded-[3.5rem] hover:bg-deep-yellow">
        <Image className="w-9 h-9" src={btnGoogle} alt="" />
        <div>Continue With Google</div>
        {/* <GoogleLogin onSuccess={handleLoginSuccess} onFailure={handleLoginFailure} /> */}
      </div>

      <div className="inline-flex items-center cursor-pointer w-[18.875rem] justify-center py-2 bg-basic-gray rounded-[3.5rem] hover:bg-deep-yellow mt-5">
        <Image className="w-9 h-9" src={btnTwitter} alt="" />
        <TwitterLogin />
      </div>

      <div
        className="inline-flex items-center cursor-pointer w-[18.875rem] justify-center py-2 bg-basic-gray rounded-[3.5rem] hover:bg-deep-yellow mt-5"
        onClick={() => setEmailLoginVisible(true)}
      >
        <div className="leading-9">Continue With Email</div>
      </div>
    </>
  );

  return createPortal(
    visible ? (
      <div className="login-dialog fixed left-0 top-0 w-full h-screen z-50 font-poppins-medium">
        <div className="mask w-full h-full bg-transparent" onClick={onCloseClick}></div>

        <div className="content absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[28.5rem] h-[27.56rem] bg-black rounded-[1.25rem] z-10 border-2 border-solid border-[#1F1B17] flex flex-col items-center overflow-hidden text-sm px-6">
          {emailLoginVisible ? <EmailLogin onClose={() => setEmailLoginVisible(false)} onLogin={onCloseClick} /> : <LoginButtons />}
        </div>
      </div>
    ) : null,
    document.body,
  );
}
