import { ForwardedRef, forwardRef } from 'react';
import schools from '../schools.json';
import { cn } from '@nextui-org/react';

interface Props {
  activeIndex: number;
}

export default forwardRef(function SchoolRenderer(props: Props, ref: ForwardedRef<HTMLDivElement>) {
  const { activeIndex } = props;

  return (
    <div className="w-full h-full relative">
      {schools.map((school, index) => (
        <video
          key={index}
          className={cn([index === activeIndex ? 'block' : 'hidden'])}
          autoPlay
          playsInline
          muted
          loop
          preload="auto"
        >
          <source src={school.video}></source>
        </video>
      ))}

      {/* <div ref={ref} className="absolute inset-0 w-full h-full"></div> */}
    </div>
  );
});
