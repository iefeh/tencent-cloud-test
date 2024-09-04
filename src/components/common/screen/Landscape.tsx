import { cn } from '@nextui-org/react';
import { type FC, type PropsWithChildren, useEffect, useState } from 'react';

const Landscape: FC<PropsWithChildren & ClassNameProps> = ({ children, className }) => {
  const [isHorizontal, setIsHorizontal] = useState(false);

  function onResize() {
    const { innerWidth, innerHeight } = window;
    setIsHorizontal(innerWidth > innerHeight);
  }

  useEffect(() => {
    window.addEventListener('resize', onResize);
    onResize();

    return () => window.removeEventListener('resize', onResize);
  }, []);

  if (isHorizontal) return children;

  return (
    <div className={cn(['w-screen h-screen flex justify-center items-center', className])}>
      <span className="text-2xl">Please view this page in landscape mode.</span>
    </div>
  );
};

export default Landscape;
