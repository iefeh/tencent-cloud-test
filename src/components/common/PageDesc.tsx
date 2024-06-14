import Image from 'next/image';
import BasicButton from '../../pages/components/common/BasicButton';
import Belt from '../../pages/components/common/Belt';
import whiteLogo from 'img/logo_white.png';
import goldenLogo from 'img/logo_golden.png';
import { ReactNode, forwardRef } from 'react';
import { observer } from 'mobx-react-lite';

interface Props {
  baseAniTY?: boolean;
  needAni?: boolean;
  whiteLogo?: boolean;
  goldenLogo?: boolean;
  hasBelt?: boolean;
  title?: string | ReactNode;
  subtitle?: string | ReactNode;
  buttonLabel?: string;
  buttonLink?: string;
  className?: string;
  button?: ReactNode;
  needAuth?: boolean;
}

export default forwardRef<HTMLDivElement, Props>(function PageDesc(props: Props, ref) {
  const { needAuth } = props;

  return (
    <div
      ref={ref}
      className={[
        'page-desc z-10 flex flex-col',
        props.baseAniTY && 'translate-y-[10vh]',
        props.className || 'items-center text-center',
        props.needAni ? 'ani-up' : '',
      ].join(' ')}
    >
      {props.whiteLogo && <Image className="w-[13.125rem] h-[12.5625rem] mb-12" src={whiteLogo} alt="" />}

      {props.goldenLogo && <Image className="w-[16.875rem] h-40 mb-12" src={goldenLogo} alt="" />}

      {props.hasBelt && <Belt />}

      {props.title &&
        (typeof props.title === 'string' ? (
          <div
            className="title text-6xl uppercase font-semakin mb-4"
            dangerouslySetInnerHTML={{ __html: props.title }}
          ></div>
        ) : (
          props.title
        ))}

      {props.subtitle &&
        (typeof props.subtitle === 'string' ? (
          <div
            className="title text-lg font-decima mb-10 tracking-tighter"
            dangerouslySetInnerHTML={{ __html: props.subtitle }}
          ></div>
        ) : (
          props.subtitle
        ))}

      {props.buttonLabel && <BasicButton label={props.buttonLabel} link={props.buttonLink} needAuth={needAuth} />}

      {props.button}
    </div>
  );
});
