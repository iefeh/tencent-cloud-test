import Image from "next/image";
import BasicButton from "./BasicButton";
import Belt from "./Belt";
import whiteLogo from "img/logo_white.png";
import goldenLogo from "img/logo_golden.png";

interface Props {
  whiteLogo?: boolean;
  goldenLogo?: boolean;
  hasBelt?: boolean;
  title?: string;
  subtitle?: string;
  buttonLabel?: string;
  buttonLink?: string;
}

export default function PageDesc(props: Props) {
  return (
    <div className="page-desc text-center z-10 flex flex-col items-center">
      {props.whiteLogo && (
        <Image
          className="w-[13.125rem] h-[12.5625rem] mb-12"
          src={whiteLogo}
          alt=""
        />
      )}

      {props.goldenLogo && (
        <Image
          className="w-[16.875rem] h-40 mb-12"
          src={goldenLogo}
          alt=""
        />
      )}

      {props.hasBelt && <Belt />}

      {props.title && (
        <div
          className="title text-5xl uppercase font-semakin mb-4"
          dangerouslySetInnerHTML={{ __html: props.title }}
        ></div>
      )}

      {props.subtitle && (
        <div
          className="title text-xs font-decima mb-10"
          dangerouslySetInnerHTML={{ __html: props.subtitle }}
        ></div>
      )}

      {props.buttonLabel && (
        <BasicButton label={props.buttonLabel} link={props.buttonLink} />
      )}
    </div>
  );
}
