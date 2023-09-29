import Image from "next/image";
import turnImage from 'img/home/circle_words.png';
import circleIcon from 'img/home/yellow_circle.png';

interface Props {
  className?: string;
}

export default function YellowCircle(props: Props) {
  return (
    <div className={`yellow-circle flex justify-center items-center ${props.className || 'relative'}`}>
      <div className="turn relative w-[4.125rem] h-[4.125rem] animate-spin5">
        <Image className="object-contain" src={turnImage} alt="" fill />
      </div>
      <div className="circle-icon absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-5 h-[1.875rem] z-10">
        <Image className="object-contain" src={circleIcon} alt="" fill />
      </div>
    </div>
  );
}
