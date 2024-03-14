'use client';

import { MobxContext } from '@/pages/_app';
import { observer } from 'mobx-react-lite';
import { useRouter } from 'next/navigation';
import { useContext } from 'react';

interface Props {
  prefix?: JSX.Element;
  label: string;
  link?: string;
  active?: boolean;
  disabled?: boolean;
  className?: string;
  needAuth?: boolean;
  onClick?: () => void;
}

function BasicButton(props: Props) {
  const { needAuth } = props;
  const { userInfo, toggleLoginModal } = useContext(MobxContext);
  const router = useRouter();
  const onLinkClick = () => {
    if (!props.link) return;
    if (needAuth && !userInfo) {
      toggleLoginModal(true);
      return;
    }

    if (/^http/.test(props.link)) {
      window.open(props.link);
    } else {
      router.push(props.link);
    }
  };

  return (
    <button
      className={[
        'basic-button uppercase text-sm px-6 py-1 border border-solid rounded-3xl transition-all duration-500 delay-75 font-poppins-medium',
        props.className,
        props.disabled
          ? 'text-[#666] border-[#666]'
          : props.active
          ? 'border-basic-yellow text-basic-yellow shadow-basic-yellow shadow-[0_0_0.375rem_#F6C799]'
          : 'text-white hover:border-basic-yellow hover:text-basic-yellow hover:shadow-basic-yellow hover:shadow-[0_0_0.375rem_#F6C799]',
      ].join(' ')}
      disabled={props.disabled}
      onClick={props.onClick || (props.link && onLinkClick) || undefined}
    >
      {props.prefix}
      {props.label}
    </button>
  );
}

export default observer(BasicButton);
