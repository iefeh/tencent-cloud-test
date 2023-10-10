import Image from "next/image";
import BasicButton from "./BasicButton";
import Belt from "./Belt";
import whiteLogo from "img/logo_white.png";
import goldenLogo from "img/logo_golden.png";
import { ReactNode } from "react";

interface Props {
  needAni?: boolean;
  whiteLogo?: boolean;
  goldenLogo?: boolean;
  hasBelt?: boolean;
  title?: string;
  subtitle?: string;
  buttonLabel?: string;
  buttonLink?: string;
  className?: string;
  button?: ReactNode;
}

export default function PageDesc(props: Props) {
  return (
    <div
      className={
        "page-desc z-10 flex flex-col " +
        [
          props.className || "items-center text-center",
          props.needAni ? "ani-up" : "",
        ].join(" ")
      }
    >
      {props.whiteLogo && (
        <Image
          className="w-[13.125rem] h-[12.5625rem] mb-12"
          src={whiteLogo}
          alt=""
        />
      )}

      {props.goldenLogo && (
        <Image className="w-[16.875rem] h-40 mb-12" src={goldenLogo} alt="" />
      )}

      {props.hasBelt && <Belt />}

      {props.title && (
        <div
          className="title text-6xl uppercase font-semakin mb-4"
          dangerouslySetInnerHTML={{ __html: props.title }}
        ></div>
      )}

      {props.subtitle && (
        <div
          className="title text-lg font-decima mb-10 tracking-tighter"
          dangerouslySetInnerHTML={{ __html: props.subtitle }}
        ></div>
      )}

      {props.buttonLabel && (
        <BasicButton label={props.buttonLabel} link={props.buttonLink} />
      )}

      {props.button}
    </div>
  );
}
