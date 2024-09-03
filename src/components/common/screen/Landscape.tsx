import { type FC, type PropsWithChildren, useEffect, useState } from 'react';

const Landscape: FC<PropsWithChildren> = ({ children }) => {
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
    <div className="w-screen h-screen flex justify-center items-center">
      <span className="text-2xl">Please view this page in landscape mode.</span>
    </div>
  );
};

export default Landscape;
