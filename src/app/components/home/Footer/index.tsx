import Link from "next/link";
import MediaIconBar from "../../common/MediaIconBar";
import './index.scss';

interface Props {
  onWheel?: (e: WheelEvent) => void;
}

export default function Footer(props: Props) {
  return (
    <footer className="contact-info w-full h-[25rem] box-border px-[6.25rem] pt-28 flex bg-black" onWheel={e => props.onWheel?.(e as any)}>
      <MediaIconBar type="yellow" gutter="lg" />

      <div className="contact-info uppercase ml-[26.6vw] font-poppins text-sm">
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

        <div className="copyright mb-5">
          Copyright © 2023 Moonveil Entertainment All rights reserved.
        </div>

        <div className="bottom w-[15.25rem] flex justify-between items-center text-[#4d4d4d]">
          <Link
            className="hover:text-white transition-all duration-200 ease-in"
            href="/"
          >
            Privacy Policy
          </Link>
          <Link
            className="hover:text-white transition-all duration-200 ease-in"
            href="/"
          >
            Cookies Policy
          </Link>
        </div>
      </div>
    </footer>
  );
}
