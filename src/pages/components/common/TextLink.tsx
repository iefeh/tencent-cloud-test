import { cn } from '@nextui-org/react';
import { useRouter } from 'next/router';

interface Props {
  className?: string;
  label: string;
  to?: string;
  onClick?: () => void;
}

export default function TextLink(props: Props) {
  const { className, label, to, onClick } = props;
  const router = useRouter();

  function onLinkClick() {
    if (onClick) {
      onClick();
      return;
    }

    if (!to) return;
    router.push(to);
  }

  return (
    <a className={cn(['text-basic-yellow underline cursor-pointer', className])} onClick={onLinkClick}>
      {label}
    </a>
  );
}
