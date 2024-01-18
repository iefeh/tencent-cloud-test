import Image, { StaticImageData } from 'next/image';

interface Props {
  width?: number;
  height?: number;
  icon: string | StaticImageData;
  label?: string;
  onClick?: () => void;
}

export default function IconLink(props: Props) {
  const { icon, label, width, height, onClick } = props;

  return (
    <span
      className="icon-link inline-flex items-center font-poppins text-lg leading-none [&+.icon-link]:ml-10 cursor-pointer"
      onClick={onClick}
    >
      <Image className="w-[1.125rem] h-[1.125rem]" src={icon} alt="" width={width} height={height} />

      {label && <span className="ml-[0.4375rem]">{label}</span>}
    </span>
  );
}
