import S3Image from '@/components/common/medias/S3Image';
import { cn } from '@nextui-org/react';
import { FC } from 'react';

export interface PlanetProps extends ClassNameProps {
  isSrcText?: boolean;
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

const Planet: FC<PlanetProps> = ({ isSrcText, src, label, getLogo, left, top, width, height, className }) => {
  const logo = getLogo?.(
    getWidthPer,
    'absolute -top-1 -translate-y-full whitespace-nowrap text-center max-w-none ' +
      (isSrcText ? 'right-0' : 'left-1/2 -translate-x-1/2'),
  );

  return (
    <div
      className={cn(['absolute z-0 select-none', className])}
      style={{
        width: getWidthPer(width),
        aspectRatio: `${width}/${height}`,
        left: getWidthPer(left),
        top: getHeigthPer(top),
        transformStyle: 'preserve-3d',
      }}
    >
      <div className="relative w-full h-full planet brightness-90 group transition-[filter] hover:brightness-105 hover:text-basic-yellow">
        <S3Image
          className={cn([
            'relative z-10 object-contain transition-transform group-hover:scale-125',
            isSrcText && 'invisible',
          ])}
          src={src}
          fill
          sizes="100%"
        />

        {isSrcText && (
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 whitespace-nowrap transition-transform group-hover:scale-125">
            {src}
          </div>
        )}

        <div className="transition-all pointer-events-none group-hover:scale-125 group-hover:[text-shadow:#f6c799_1px_0_8px]">
          {label ? (
            <div className="absolute left-1/2 -top-1 -translate-x-1/2 -translate-y-full whitespace-nowrap text-center w-max">
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

export default Planet;
