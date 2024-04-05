import { cn } from '@nextui-org/react';
import { FC } from 'react';
import styles from './index.module.css';
import Image from 'next/image';
import opMoonImg from 'img/loyalty/season/moon_op.png';
import FinalReward from '../../FinalReward';

const FinalScreen: FC = () => {
  return (
    <div className="oppo-box w-full h-screen relative z-10 flex flex-col justify-center items-center bg-[url('/img/loyalty/season/bg_moon.png')] bg-[length:69rem_53rem] bg-center bg-no-repeat">
      <div
        className={cn(['font-semakin text-[6.25rem] text-transparent leading-none', styles.strokeText])}
        data-text="Congratulations!"
      >
        Congratulations!
      </div>

      <div className="mt-12 font-decima text-lg max-w-[35rem] text-center">
        Congratulations on completing all the tasks and reaching the highest level this season! Thank you for your hard
        work and support. We will soon be releasing new content, so stay tuned!
      </div>

      <div className="relative">
        <Image className="w-[3.75rem] h-8 object-contain mt-[5.5rem]" src={opMoonImg} alt="" />

        <FinalReward className="!absolute left-1/2 bottom-0 -translate-x-1/2 translate-y-full" />
      </div>
    </div>
  );
};

export default FinalScreen;
