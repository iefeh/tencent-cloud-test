import Image from 'next/image';
import styles from './index.module.scss';

const sponsorArray = [
  '/img/about/1.png',
  'https://moonveil-public.s3.ap-southeast-2.amazonaws.com/about/investors/spartan.png',
  'https://moonveil-public.s3.ap-southeast-2.amazonaws.com/about/investors/animoca.png',
  '/img/about/3.png',
  'https://moonveil-public.s3.ap-southeast-2.amazonaws.com/about/investors/hashkey.png',
  '/img/about/4.png',
  '/img/about/5.png',
  '/img/about/6.png',
  '/img/about/8.png',
  '/img/about/2.png',
  '/img/about/7.png',
  '/img/about/9.png',
  '/img/about/10.png',
  // '/img/about/11.png',
  '/img/about/12.png',
  '/img/about/13.png',
  '/img/about/14.png',
  '/img/about/15.png',
  '/img/about/16.png',
  '/img/about/17.png',
  '/img/about/18.png',
  '/img/about/19.png',
  '/img/about/20.png',
  '/img/about/21.png',
  '/img/about/22.png',
  '/svg/investors/ventures.svg',
];

const InvestorPage = () => {
  return (
    <div className="w-full h-screen flex flex-col items-center justify-between">
      <div className="w-full h-full friendLink_wrap bg-black flex flex-col justify-center items-center bg-[url('/img/about/img_1.jpg')] bg-center">
        <div
          className={`friendLink_title uppercase max-sm:text-[2rem] text-[3.75rem] font-semakin leading-none mb-[4rem] translate-y-[16px] fill-mode-[both] ${styles.slideInAnim}`}
        >
          Investors & Partners
        </div>
        <div className={`friends translate-y-[16px] fill-mode-[both] ${styles.slideInAnim}`}>
          <ul className="max-md:gap-[1.5rem] gap-[2.38rem] grid grid-cols-5 max-md:grid-cols-2">
            {sponsorArray.map((value, index) => {
              return (
                <li key={index} className="max-sm:h-[3rem] w-[11.25rem] h-[5.53rem] relative">
                  <Image
                    className={value.endsWith('svg') ? 'object-contain' : 'object-cover'}
                    src={value}
                    alt=""
                    fill
                    sizes="100%"
                    priority
                    unoptimized
                  />
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default InvestorPage;
