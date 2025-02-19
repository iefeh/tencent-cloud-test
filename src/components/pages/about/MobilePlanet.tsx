import S3Image from '@/components/common/medias/S3Image';
import { cn } from '@nextui-org/react';
import { FC } from 'react';

export interface PlanetProps extends ClassNameProps {
  isSrcText?: boolean;
  url?: string;
  src: string;
  label?: string;
  getLogo?: (fn: (val: number, base?: number) => string, className: string) => JSX.Element;
  left: number;
  top: number;
  width: number;
  height: number;
}

const BASE_WIDTH = 1920;
const BASE_HEIGHT = 1080;

const getWidthPer = (val: number, base = BASE_WIDTH) => `${(val * 100) / base}%`;
const getHeigthPer = (val: number, base = BASE_HEIGHT) => `${(val * 100) / base}%`;

const MobilePlanet: FC<PlanetProps> = ({ isSrcText, src, label, getLogo, left, top, width, height, className }) => {
  const logo = getLogo?.(
    getWidthPer,
    'absolute right-0 top-1/2 translate-x-full -translate-y-1/2 whitespace-nowrap text-center max-w-none',
  );

  return (
    <div
      className={cn(['z-0 select-none', className])}
      style={{
        width: '20%',
        aspectRatio: `${width}/${height}`,
        transformStyle: 'preserve-3d',
      }}
    >
      <div className="relative w-full h-full planet brightness-90 group transition-[filter] hover:brightness-105 hover:text-basic-yellow flex flex-nowrap">
        <S3Image
          className={cn([
            'relative z-10 object-contain transition-transform group-hover:scale-125 flex-shrink-0',
            isSrcText && 'invisible',
          ])}
          src={src}
          fill
        />

        {/* {isSrcText && (
          <div className="left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 whitespace-nowrap transition-transform group-hover:scale-125">
            {src}
          </div>
        )} */}

        <div className="transition-all pointer-events-none group-hover:scale-125 group-hover:[text-shadow:#f6c799_1px_0_8px]">
          {label ? (
            <div className="absolute right-0 top-1/2 translate-x-full -translate-y-1/2 whitespace-nowrap text-center w-max">
              {label}
            </div>
          ) : (
            logo
          )}
        </div>
      </div>
    </div>
  );
};

export default MobilePlanet;
