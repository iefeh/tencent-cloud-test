import { createPortal } from 'react-dom';
import Link from 'next/link';
import { useRouter } from 'next/router';
import MediaIconBar from '../MediaIconBar';
import styles from './index.module.css';

interface Props {
  visible?: boolean;
  onClose?: () => void;
}

const routeText = [
  { name: 'Home', route: '/' },
  { name: 'AstrArk', route: '/AstrArk' },
  // { name: 'Bushwhack', route: '/Bushwhack' },
  { name: 'About', route: '/About' },
  { name: 'NFT', route: '/NFT' },
  { name: 'Loyalty Program', route: '/LoyaltyProgram/intro' },
];

export default function Sidebar({ visible, onClose }: Props) {
  const router = useRouter();
  if (!visible) return null;

  function LoginSegments() {
    let temp = router.route;
    return temp || '/';
  }

  function onLinkClick(path: string) {
    try {
      window.luxy.disable();
      router.push(path);
      window.luxy.wrapper.style.transform = 'translate3d(0, 0, 0)';
      window.luxy.enable();
    } catch (error) {
      console.log(error);
    }
  }

  return createPortal(
    <div
      onClick={onClose}
      className="sidebar max-sm:pt-[80px] max-sm:justify-around max-lg:flex fixed left-0 top-0 w-full h-screen bg-black z-30 flex flex-col"
      onScroll={(e) => e.stopPropagation()}
    >
      <div className="content flex-1 flex flex-col font-semakin text-center items-center justify-center">
        {routeText.map((value, index) => (
          <div
            className={`max-md:leading-[5.5rem] m-2 transition-all duration-300 hover:text-[#F6C799] text-4xl leading-[7.5rem] ${
              LoginSegments() === value.route && 'text-[#F6C799]'
            }`}
            key={index}
            onClick={() => onLinkClick(value.route)}
          >
            {value.name}
          </div>
        ))}
      </div>

      <MediaIconBar className={'max-sm:h-48 h-60 flex justify-center items-center ' + styles.sidebarMediaIcons} />
    </div>,
    document.body,
  );
}
