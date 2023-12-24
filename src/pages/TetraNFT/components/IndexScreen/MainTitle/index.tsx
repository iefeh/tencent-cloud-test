import PageDesc from '@/pages/components/common/PageDesc';
import { CSSTransition } from 'react-transition-group';
import { useRef, useState, useEffect } from 'react';
import YellowCircle from '@/pages/components/common/YellowCircle';
import { throttle } from 'lodash';

export default function MainTitle() {
  const descRef = useRef<HTMLDivElement>(null);
  const descVisible = useRef(true);
  const [needAni, setNeedAni] = useState(true);
  const [isAniRunning, setIsAniRunning] = useState(false);

  const setDescAni = throttle(() => {
    const scrollTop = document.documentElement.scrollTop || document.body.scrollTop;
    const targetDescVisible = scrollTop <= 0;
    if (needAni) setNeedAni(false);
    if (descVisible.current !== targetDescVisible) {
      descVisible.current = targetDescVisible;
      setIsAniRunning(true);
    }
  }, 300);

  function onLuxyScroll() {
    setDescAni();
  }

  useEffect(() => {
    document.documentElement.style.overflow = isAniRunning ? 'hidden' : 'unset';
  }, [isAniRunning]);

  useEffect(() => {
    window.addEventListener('scroll', onLuxyScroll);
    return () => window.removeEventListener('scroll', onLuxyScroll);
  }, []);

  useEffect(() => {
    window.luxy.disable();
    document.documentElement.style.overflow = 'hidden';

    // PageDesc组件默认动画持续1200ms，为防止提前滚动，延迟1250ms后放开滚动
    setTimeout(() => {
      document.documentElement.style.overflow = 'unset';
      window.luxy.enable();
    }, 1250);
  }, []);

  return (
    <div
      className={
        'page-tetra-nft-main-title fixed left-0 top-0 z-10 w-full h-screen flex justify-center items-center ' +
        (descVisible.current || isAniRunning ? 'block' : 'hidden')
      }
    >
      <CSSTransition
        in={descVisible.current}
        nodeRef={descRef}
        classNames="desc"
        timeout={500}
        unmountOnExit
        onEntered={() => setIsAniRunning(false)}
        onExited={() => setIsAniRunning(false)}
      >
        <PageDesc
          ref={descRef}
          needAni={needAni}
          title={
            <div className="font-semakin text-center">
              <div className="text-4xl">Introducing The</div>
              <div className="text-[6.25rem]">TETRA NFT Series</div>
            </div>
          }
        />
      </CSSTransition>

      <YellowCircle
        className={
          'absolute right-[4.375rem] bottom-20 z-10 transition-opacity duration-500 ' +
          (descVisible.current ? 'opacity-100' : 'opacity-0')
        }
      />
    </div>
  );
}
