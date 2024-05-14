import Image, { StaticImageData } from 'next/image';
import { FC } from 'react';
import copyImg from 'img/profile/copy.png';
import { cn } from '@nextui-org/react';
import { toast } from 'react-toastify';

interface Props extends ClassNameProps {
  icon?: StaticImageData | string;
  text?: string;
}

const CopyIcon: FC<Props> = ({ className, icon, text }) => {
  async function onCopy() {
    try {
      await window.navigator.clipboard.writeText(text || '');
      toast.success('Copied!');
    } catch (error: any) {
      toast.error(error?.message || error);
    }
  }

  return (
    <Image
      className={cn(['w-4 h-4 cursor-pointer', className])}
      src={icon || copyImg}
      alt=""
      unoptimized
      onClick={onCopy}
    />
  );
};

export default CopyIcon;
