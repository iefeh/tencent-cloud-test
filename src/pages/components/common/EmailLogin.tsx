import Image from 'next/image';
import CodeInput from './CodeInput';
import goldenLogo from 'img/logo_golden.png';
import { useState, useEffect, useRef, useContext } from 'react';
import { sendEmailCodeAPI } from '@/http/services/login';
import { MobxContext } from '@/pages/_app';
import { observer } from 'mobx-react-lite';

interface Props {
  onClose?: () => void;
  onLogin?: () => void;
}

const EmailLogin = (props: Props) => {
  const { loginByEmail } = useContext(MobxContext);
  const { onClose, onLogin } = props;
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [codeBtnText, setCodeBtnText] = useState('Send Code');
  const MAX_LEFT_SECONDS = 60;
  const leftSeconds = useRef(0);
  const [isLoading, setIsLoading] = useState(false);
  const timer = useRef(0);
  const [isCounting, setIsCounting] = useState(false);
  const [desc, setDesc] = useState('Please type in your email to get the verification code.');

  async function onSendClick() {
    if (!email) {
      setDesc('Please input your email.');
      return;
    }
    if (!/^[a-zA-Z0-9_.-]+@[a-zA-Z0-9-]+(\.[a-zA-Z0-9-]+)*\.[a-zA-Z0-9]{2,6}$/.test(email)) {
      setDesc('Please enter a valid email address, then try again.');
      return;
    }
    if (isLoading || isCounting || (leftSeconds.current !== 0 && leftSeconds.current < MAX_LEFT_SECONDS)) return;

    setIsLoading(true);
    setDesc('Sending. . .');
    try {
      await sendEmailCodeAPI({ email });
    } catch (error: any) {
      setDesc(error?.message || error);
      return;
    } finally {
      setIsLoading(false);
    }

    leftSeconds.current = MAX_LEFT_SECONDS;
    setCodeBtnText(`${leftSeconds.current}s`);
    setIsCounting(true);
    setDesc('Verification code has been sent, please check your email.');

    timer.current = window.setInterval(() => {
      leftSeconds.current--;
      if (leftSeconds.current <= 0) {
        clearInterval(timer.current);
        setCodeBtnText('Re-sent');
        setIsCounting(false);
        return;
      }

      setCodeBtnText(`${leftSeconds.current}s`);
    }, 1000);
  }

  async function onVerify() {
    if (code.length < 6) return;

    setIsLoading(true);
    try {
      await loginByEmail?.({ email, captcha: code });
      onLogin?.();
    } catch (error: any) {
      setDesc(error?.message || error);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    return () => {
      if (timer.current > 0) clearInterval(timer.current);
    };
  }, []);

  useEffect(() => {
    setCodeBtnText('Send Code');
  }, [email]);

  return (
    <div className="email-login flex flex-col items-center w-[20rem]">
      <div className="row back w-full flex justify-between items-center mt-8">
        <Image className="w-[8.625rem] h-[5.125rem]" src={goldenLogo} alt="" />

        <div
          className="inline-flex items-center cursor-pointer px-10 py-2 justify-center rounded-[3.5rem] bg-deep-yellow mt-5"
          onClick={onClose}
        >
          <div className="leading-6">Back</div>
        </div>
      </div>

      <div className="row email w-full flex justify-between items-center mt-4">
        <input
          className="bg-basic-gray inline-block outline-none border-deep-yellow border-1 rounded text-center h-10"
          type="email"
          value={email}
          disabled={isCounting || isLoading}
          placeholder="Your Email"
          onInput={(e) => setEmail((e.target as HTMLInputElement).value)}
        />

        <div
          className={
            'inline-flex items-center px-6 py-2 justify-center bg-basic-gray rounded-[3.5rem] w-[7.875rem] ' +
            (isCounting || isLoading ? 'cursor-not-allowed' : 'hover:bg-deep-yellow cursor-pointer')
          }
          onClick={onSendClick}
        >
          <div className="leading-6">{codeBtnText}</div>
        </div>
      </div>

      <div className="row desc bg-basic-gray border-deep-yellow border-1 rounded px-4 py-4 mt-4 w-full h-[4.625rem]">
        {desc}
      </div>

      <div className="row code w-full mt-4">
        <CodeInput onChange={(res) => setCode(res)} />
      </div>

      <div className="row verify">
        <div
          className={
            'inline-flex items-center px-14 justify-center py-2 bg-basic-gray rounded-[3.5rem] mt-5 ' +
            (code.length < 6 || isCounting || isLoading ? 'cursor-not-allowed' : 'hover:bg-deep-yellow cursor-pointer')
          }
          onClick={onVerify}
        >
          <div className="leading-9">Verify</div>
        </div>
      </div>
    </div>
  );
};

export default observer(EmailLogin);
