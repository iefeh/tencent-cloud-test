import Image from 'next/image';
import fogImg from 'img/bushwhack/fog/fog.jpg';
import FogMainContent from './components/FogMainContent';

interface Props {
  touched?: boolean;
}

export default function FogScreen(props: Props) {
  const { touched } = props;

  return (
    <div className="w-screen h-screen relative select-none justify-center items-center bg-no-repeat bg-center bg-[length:100%_100%] bg-[url('/img/bushwhack/fog/fog.jpg')] overflow-hidden hidden lg:flex">
      {touched ? <FogMainContent /> : <Image className="pointer-events-none z-20" src={fogImg} alt="" fill />}

      {touched || <div className="absolute inset-0 z-50"></div>}
    </div>
  );
}
