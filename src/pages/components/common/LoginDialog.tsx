import { createPortal } from "react-dom";
import Link from "next/link";
import Image from "next/image";
import goldenLogo from "img/logo_golden.png";
import btnTwitter from "img/login/btn_twitter.png";
import btnGoogle from "img/login/btn_google.png";
import GoogleLogin from "./GoogleLogin";
import TwitterLogin from "./TwitterLogin";

interface Props {
  visible?: boolean;
  onClose?: () => void;
}

export default function LoginDialog({ visible, onClose }: Props) {
  if (!visible) return null;

  const handleLoginSuccess = (profile: any, idToken: string) => {
    // 处理登录成功后的操作，可以将profile和idToken发送到服务器进行验证
    console.log('Login success', profile, idToken);
  };

  const handleLoginFailure = (error: any) => {
    // 处理登录失败后的操作
    console.error('Login failed', error);
  };

  return createPortal(
    <div className="login-dialog fixed left-0 top-0 w-full h-screen z-50">
      <div
        className="mask w-full h-full bg-transparent"
        onClick={onClose}
      ></div>

      <div className="content absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[28.5rem] h-[27.56rem] bg-black rounded-[1.25rem] z-10 border-2 border-solid border-[#1F1B17] flex flex-col items-center overflow-hidden font-poppins-medium text-sm">
        <Image
          className="w-[8.625rem] h-[5.125rem] mt-20 mb-[3.75rem]"
          src={goldenLogo}
          alt=""
        />

        <Link
          className="inline-flex items-center px-14 py-2 bg-basic-gray rounded-[3.5rem] hover:bg-deep-yellow"
          href="#"
        >
          <Image className="w-9 h-9" src={btnGoogle} alt="" />
          <GoogleLogin onSuccess={handleLoginSuccess} onFailure={handleLoginFailure} />
        </Link>

        <Link
          className="inline-flex items-center px-14 py-2 bg-basic-gray rounded-[3.5rem] hover:bg-deep-yellow mt-5"
          href="#"
        >
          <Image className="w-9 h-9" src={btnTwitter} alt="" />
          <TwitterLogin />
        </Link>
      </div>
    </div>,
    document.body
  );
}
