import Link from "next/link";
import MediaIconBar from "../common/MediaIconBar";

export default function Footer() {
  return (
    <footer className="contact-info w-full h-[25rem] box-border px-[6.25rem] pt-28 flex">
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

        <div className="contact-us mb-7">
          <div className="base-info">contact us</div>
          <div className="email">contact@moonveil.studio</div>
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
