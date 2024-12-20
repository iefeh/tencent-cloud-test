import Link from 'next/link';
import MediaIconBar from '@/components/common/MediaIconBar';

interface Props {
  onWheel?: (e: WheelEvent) => void;
  onTouchStart?: (e: TouchEvent) => void;
  onTouchMove?: (e: TouchEvent) => void;
}

export default function Footer(props: Props) {
  const year = new Date().getFullYear();

  return (
    <footer
      className="contact-info w-full box-border px-[6.25rem] pt-28 pb-[6.5rem] flex max-lg:flex-col bg-black min-lg:flex-row max-lg:items-start"
      onWheel={(e) => props.onWheel?.(e as any)}
      onTouchStart={(e) => props.onTouchStart?.(e as any)}
      onTouchMove={(e) => props.onTouchMove?.(e as any)}
    >
      <MediaIconBar className="max-lg:mb-8" type="yellow" gutter="lg" />

      <div className="contact-info uppercase ml-[26.6vw] max-lg:ml-0 font-poppins text-sm">
        <div className="page-links text-lg w-[12.5rem] flex justify-between items-center mt-[0.625rem] mb-16">
          <Link className="hover:text-basic-yellow" href="/">
            Home
          </Link>
          <Link className="hover:text-basic-yellow" href="/About">
            About
          </Link>
          <Link className="hover:text-basic-yellow" href="/NFT">
            NFT
          </Link>
        </div>

        <div className="contact-us h-5 mb-7 relative">
          <div className="base-info absolute left-0 top-0 text-[#4d4d4d]">contact us</div>
          <div className="lowercase email absolute left-0 top-0">contact@moonveil.studio</div>
        </div>

        <div className="copyright mb-5">Copyright © {year} Moonveil Entertainment All rights reserved.</div>

        <div className="bottom w-[15.25rem] flex justify-between items-center text-[#4d4d4d]">
          <Link className="hover:text-white transition-all duration-200 ease-in whitespace-nowrap" href="/PrivacyPolicy">
            Privacy Policy
          </Link>
          <Link className="hover:text-white ml-4 transition-all duration-200 ease-in whitespace-nowrap" href="/CookiesPolicy">
            Cookies Policy
          </Link>
          <Link className="hover:text-white ml-4 transition-all duration-200 ease-in whitespace-nowrap" href="/policy/GeneralTermsOfService">
            General Terms of Service
          </Link>
        </div>
      </div>
    </footer>
  );
}
