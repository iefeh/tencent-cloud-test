import Image from 'next/image';
import fogImg from 'img/bushwhack/fog/fog.jpg';
import sceneImg from 'img/bushwhack/fog/scene.jpg';
import hintImg from 'img/bushwhack/fog/hint.png';
import { useEffect, useRef, useState } from 'react';
import { Modal, ModalBody, ModalContent, cn, useDisclosure } from '@nextui-org/react';
import ModelView3D from '@/pages/components/common/model/ModelView3D';

interface SourceInfo {
  source: string;
  texture?: string;
}

interface MaskItem {
  x: number;
  y: number;
  w: number;
  h: number;
  visible: boolean;
  mask: SourceInfo;
}

export default function FogScreen() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fogImgRef = useRef<HTMLImageElement>(null);
  const ctx = useRef<CanvasRenderingContext2D | null>(null);
  const [width, setWidth] = useState(1920);
  const [height, setHeight] = useState(1080);
  const [masks, setMasks] = useState<MaskItem[]>([
    // thief
    {
      x: 336,
      y: (419 / 1080) * 929,
      w: 70,
      h: 94,
      visible: false,
      mask: {
        source: '/models/chaowan_mianju.fbx',
        texture: '/models/textures/chaowan.tga',
      },
    },
    // doctor
    {
      x: 733,
      y: (770 / 1080) * 929,
      w: 88,
      h: 100,
      visible: false,
      mask: {
        source: '/models/lewis_mask.fbx',
        texture: '/models/textures/Lewis.tga',
      },
    },
    // rhea
    {
      x: 1318,
      y: (542 / 1080) * 929,
      w: 81,
      h: 94,
      visible: false,
      mask: {
        source: '/models/rhea_mask.fbx',
        texture: '/models/textures/T_Rhea.tga',
      },
    },
  ]);
  const maskVal = useRef<MaskItem[]>(masks);
  const [maskInfo, setMaskInfo] = useState<SourceInfo>({
    source: '/models/rhea_mask.fbx',
    texture: '/models/textures/T_Rhea.tga',
  });
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const isViewing = useRef(false);
  const [isStarting, setIsStarting] = useState(false);
  const isRunning = useRef(false);
  const [finished, setFinished] = useState(false);

  const RADIUS_MIN = 50;
  const RADIUS_MAX = 100;
  const DENSITY = 0.01;

  function init() {
    const { innerWidth, innerHeight } = window;
    setWidth(innerWidth);
    setHeight(innerHeight);

    setTimeout(() => {
      initCanvas();
    }, 100);

    window.addEventListener('resize', init);
  }

  function onFogMousemove(e: MouseEvent) {
    e.preventDefault();
    if (!ctx.current || isViewing.current || !isRunning.current) return;

    let { x: pX, y: pY } = e;

    // reveal wherever we drag
    const radGrd = ctx.current.createRadialGradient(pX, pY, RADIUS_MIN, pX, pY, RADIUS_MAX);
    radGrd.addColorStop(0, 'rgba(0, 0, 0, 1)');
    radGrd.addColorStop(DENSITY, 'rgba(0, 0, 0, 0.2)');
    radGrd.addColorStop(1, 'rgba(0, 0, 0, 0)');

    ctx.current.fillStyle = radGrd;
    ctx.current.fillRect(pX - RADIUS_MAX, pY - RADIUS_MAX, RADIUS_MAX * 2, RADIUS_MAX * 2);

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

  function initCanvas(w = width, h = height) {
    if (!canvasRef.current || !fogImgRef.current) return;

    const context = canvasRef.current.getContext('2d')!;
    ctx.current = context;

    const { width: fogWidth, height: fogHeight } = fogImgRef.current;
    context.drawImage(fogImgRef.current, 0, 0, fogWidth, fogHeight, 0, 0, width, height);

    setTimeout(() => {
      context.globalCompositeOperation = 'destination-out';
    }, 100);

    window.addEventListener('mousemove', onFogMousemove);
  }

  function onViewMask(item: MaskItem) {
    if (!item.visible) return;

    setMaskInfo(item.mask);
    onOpen();
    isViewing.current = true;
  }

  function onGameTitleMouseEnter() {
    setIsStarting(true);
    setTimeout(() => {
      isRunning.current = true;
    }, 1600);
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

      <Image className="object-contain" src={sceneImg} alt="" />

      <canvas
        ref={canvasRef}
        width={width}
        height={height}
        className={cn([
          'absolute w-full h-full left-0 top-0 z-10 transition-opacity !duration-[3000ms]',
          finished && 'opacity-0',
        ])}
      ></canvas>

      {masks.map((mask, index) => (
        <div
          key={index}
          className={cn(['flex flex-col items-center absolute z-20', mask.visible || 'hidden'])}
          style={{ left: `${mask.x / 16}rem`, top: `${mask.y / 16}rem` }}
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
          isStarting && 'opacity-0',
        ])}
        onMouseEnter={onGameTitleMouseEnter}
      >
        Hunt in the Mist
      </div>

      <Modal
        isOpen={isOpen}
        onOpenChange={onOpenChange}
        classNames={{
          base: 'bg-black max-w-[43.75rem] w-[43.75rem] h-[43.75rem] border-3 border-[#4051F4] rounded-[0.625rem] shadow-[0_0_24px_2px_#4051F4]',
        }}
        onClose={() => (isViewing.current = false)}
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalBody>
                <ModelView3D {...maskInfo} />
              </ModalBody>
              {/* <ModalFooter>
                <Button color="danger" variant="light" onPress={onReset}>
                  Reset
                </Button>
              </ModalFooter> */}
            </>
          )}
        </ModalContent>
      </Modal>
    </div>
  );
}
