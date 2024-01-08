import Image, { StaticImageData } from 'next/image';
import BasicButton from '../BasicButton';
import { cn } from '@nextui-org/react';
import useConnect from '@/hooks/useConnect';
import useAuth from '@/hooks/useAuth';

interface Props {
  className?: string;
  type: string;
  label: string;
  icon?: string | StaticImageData;
  loading?: boolean;
  callback?: () => void;
  onClick?: () => void;
}

export default function LoginButton(props: Props) {
  const { type, className, label, icon, onClick, callback } = props;

  const { onConnect } = useAuth(type, callback);

  return (
    <BasicButton
      className={cn([
        'h-[3.125rem] rounded-base border-[#252525] hover:shadow-none font-poppins-medium normal-case',
        className,
      ])}
      label={label}
      prefix={icon ? <Image className="inline-block w-[1.625rem] h-[1.625rem] mr-2" src={icon} alt="" /> : undefined}
      onClick={onClick || onConnect}
    />
  );
}
