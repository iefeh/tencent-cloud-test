import Image from 'next/image';
import fogImg from 'img/bushwhack/fog/fog.jpg';
import sceneImg from 'img/bushwhack/fog/scene.jpg';
import hintImg from 'img/bushwhack/fog/hint.png';
import { useEffect, useRef, useState } from 'react';
import { Modal, ModalBody, ModalContent, ModalFooter, cn, useDisclosure } from '@nextui-org/react';
import ModelView3D from '@/pages/components/common/model/ModelView3D';
import BasicButton from '@/pages/components/common/BasicButton';
import { debounce } from 'lodash';

interface MaskItem {
  name: string;
  x: number;
  y: number;
  w: number;
  h: number;
  visible: boolean;
  mask: ModelInfo;
}

function getBaseMasks(): MaskItem[] {
  return [
    // thief
    {
      name: 'Thief',
      x: 373,
      y: 507,
      w: 70,
      h: 94,
      visible: false,
      mask: {
        source: '/models/chaowan_mianju.fbx',
        texture: '/models/textures/chaowan.tga',
        isTrackballControlls: false,
        offsetPower: {
          x: -0.5,
          y: -5,
          z: 0,
        },
        zoom: 6,
      },
    },
    // doctor
    {
      name: 'Lewis',
      x: 778,
      y: 823,
      w: 88,
      h: 100,
      visible: false,
      mask: {
        source: '/models/lewis_mask.fbx',
        texture: '/models/textures/Lewis.tga',
        isTrackballControlls: false,
        rotate: {
          x: Math.PI / 4,
          y: -Math.PI / 6,
          z: Math.PI / 6,
        },
        offsetPower: {
          y: -0.5,
        },
        zoom: 6,
      },
    },
    // rhea
    {
      name: 'Rhea',
      x: 1362,
      y: 628,
      w: 81,
      h: 94,
      visible: false,
      mask: {
        source: '/models/rhea_mask.fbx',
        texture: '/models/textures/T_Rhea.tga',
        isTrackballControlls: false,
        rotate: {
          x: Math.PI / 4,
          y: -Math.PI / 6,
          z: Math.PI / 6,
        },
        offsetPower: {
          y: -0.5,
        },
        zoom: 6,
      },
    },
  ];
}

export default function FogScreen() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fogImgRef = useRef<HTMLImageElement>(null);
  const ctx = useRef<CanvasRenderingContext2D | null>(null);
  const [width, setWidth] = useState(1920);
  const [height, setHeight] = useState(1080);
  const [masks, setMasks] = useState<MaskItem[]>(getBaseMasks());
  const maskVal = useRef<MaskItem[]>(masks);
  const [maskInfo, setMaskInfo] = useState<MaskItem | null>(null);
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const isViewing = useRef(false);
  const [isStarting, setIsStarting] = useState(false);
  const isRunning = useRef(false);
  const [finished, setFinished] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const x = useRef(0);
  const y = useRef(0);

  const RADIUS_MIN = 20;
  const RADIUS_MAX = 100;
  const MAX_ERASE_TIMES = 20;
  const MAX_ERASE_FPS = 10;

  // 初始化计算面具坐标
  function initMasks() {
    const { innerWidth: w, innerHeight: h } = window;
    const ratio = Math.min(w / 1920, h / 1080);

    const newMasks = getBaseMasks();
    newMasks.forEach((m) => {
      m.x = w / 2 - (1920 / 2 - m.x) * ratio;
      m.y = h / 2 - (1080 / 2 - m.y) * ratio;
    });
    setMasks((maskVal.current = newMasks));
  }

  function init() {
    setIsResizing(true);
    const { innerWidth, innerHeight } = window;
    setWidth(innerWidth);
    setHeight(innerHeight);

    initMasks();

    setTimeout(() => {
      initCanvas(innerWidth, innerHeight);
    }, 100);

    window.addEventListener('resize', init);
  }

  function eraseFog(context: CanvasRenderingContext2D, pX: number, pY: number, times = MAX_ERASE_TIMES, fps = 0) {
    if (times <= 0) return;

    if (fps === 0) {
      const dx = pX + Math.random() * 50 - 100;
      const dy = pY + Math.random() * 50 - 100;
      const radGrd = context.createRadialGradient(dx, dy, RADIUS_MIN, dx, dy, RADIUS_MAX);
      radGrd.addColorStop(0, 'rgba(0, 0, 0, 0.05)');
      radGrd.addColorStop(0.9, 'rgba(0, 0, 0, 0)');
      radGrd.addColorStop(1, 'rgba(0, 0, 0, 0)');

      context.fillStyle = radGrd;
      context.fillRect(dx - RADIUS_MAX, dy - RADIUS_MAX, RADIUS_MAX * 2, RADIUS_MAX * 2);

      times--;
      fps = MAX_ERASE_FPS;
    }

    requestAnimationFrame(() => eraseFog(context, pX, pY, times, fps - 1));
  }

  function onFogMousemove(e: MouseEvent) {
    e.preventDefault();
    if (!ctx.current || isViewing.current || !isRunning.current) return;

    let { x: pX, y: pY } = e;
    x.current = pX;
    y.current = pY;
    eraseFog(ctx.current, pX, pY);

    const newMasks = structuredClone(maskVal.current);
    let visibleCount = 0;
    newMasks.forEach((mask) => {
      if (mask.visible) {
        visibleCount++;
        return;
      }
      const { x, y, w, h } = mask;

      if (pX > x && pX < x + w && pY > y && pY < y + h) {
        mask.visible = true;
      }
    });

    setMasks((maskVal.current = newMasks));
    if (visibleCount < newMasks.length) return;

    window.removeEventListener('mousemove', onFogMousemove);
    setTimeout(() => {
      setFinished(true);
    }, 500);
  }

  const initCanvas = debounce(function (w = width, h = height) {
    if (!canvasRef.current || !fogImgRef.current) return;

    const context = canvasRef.current.getContext('2d')!;
    ctx.current = context;

    const { width: fogWidth, height: fogHeight } = fogImgRef.current;
    context.drawImage(fogImgRef.current, 0, 0, fogWidth, fogHeight);

    setTimeout(() => {
      context.globalCompositeOperation = 'destination-out';
    }, 100);

    window.addEventListener('mousemove', onFogMousemove);

    setIsResizing(false);
  }, 300);

  function onViewMask(item: MaskItem) {
    if (!item.visible) return;

    setMaskInfo(item);
    onOpen();
    isViewing.current = true;
  }

  function onGameTitleMouseEnter() {
    setIsStarting(true);
    setTimeout(() => {
      isRunning.current = true;
    }, 1600);
  }

  function onFogClick() {
    if (!isRunning.current) return;
    setFinished(true);
    setTimeout(() => {
      const newMasks = structuredClone(maskVal.current);
      newMasks.forEach((mask) => {
        mask.visible = true;
      });
      setMasks((maskVal.current = newMasks));
    }, 2500);
  }

  useEffect(() => {
    init();

    return () => {
      window.removeEventListener('resize', init);
      window.removeEventListener('mousemove', onFogMousemove);
    };
  }, []);

  return (
    <div className="w-screen h-screen relative select-none overflow-hidden flex justify-center items-center">
      <Image ref={fogImgRef} className="invisible" src={fogImg} alt="" fill />

      <Image className={cn(['w-full h-full object-contain', isResizing && 'invisible'])} src={sceneImg} alt="" />

      <canvas
        ref={canvasRef}
        width={width}
        height={height}
        className={cn([
          'absolute w-full h-full left-0 top-0 z-10 transition-opacity !duration-[3000ms]',
          finished && 'opacity-0',
        ])}
        onClick={onFogClick}
      ></canvas>

      {masks.map((mask, index) => (
        <div
          key={index}
          className={cn([
            'flex flex-col items-center absolute z-20 -translate-x-1/2 -translate-y-1/2',
            mask.visible || 'hidden',
          ])}
          style={{ left: `${mask.x}px`, top: `${mask.y}px` }}
        >
          <Image className="w-[3.75rem] h-[3.75rem] animate-bounce" src={hintImg} alt="" />
          <div
            className="cursor-pointer"
            style={{ width: `${mask.w / 16}rem`, height: `${mask.h / 16}rem` }}
            onClick={() => onViewMask(mask)}
          ></div>
        </div>
      ))}

      <div
        className={cn([
          'absolute left-1/2 top-1/2 z-30 font-semakin text-[5.625rem] drop-shadow-[0_0_20px_rgba(0,0,0,0.4)] -translate-x-1/2 -translate-y-1/2 transition-opacity !duration-[1500ms]',
          isStarting && 'opacity-0 pointer-events-none',
        ])}
        onMouseEnter={onGameTitleMouseEnter}
        // onClick={onGameTitleMouseEnter}
      >
        Hunt in the Mist
      </div>

      <Modal
        isOpen={isOpen}
        onOpenChange={onOpenChange}
        classNames={{
          base: 'bg-black max-w-[43.75rem] w-[43.75rem] h-[43.75rem] border-3 border-[#4051F4] rounded-[0.625rem] shadow-[0_0_24px_2px_#4051F4]',
          footer: 'justify-center',
          closeButton: 'text-[#4051F4] text-[1.75rem]',
        }}
        onClose={() => (isViewing.current = false)}
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalBody>
                {maskInfo && <ModelView3D info={maskInfo.mask} />}
              </ModalBody>
              <ModalFooter>
                <span className="text-2xl font-poppins">{maskInfo?.name}</span>
                {/* <BasicButton label='Reset' onClick={onReset} /> */}
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </div>
  );
}
