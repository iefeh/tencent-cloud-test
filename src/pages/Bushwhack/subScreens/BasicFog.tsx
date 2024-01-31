import Image from 'next/image';
import fogImg from 'img/bushwhack/fog/fog.jpg';
import sceneImg from 'img/bushwhack/fog/scene.jpg';
import hintImg from 'img/bushwhack/fog/hint.png';
import { useEffect, useRef, useState } from 'react';
import { Modal, ModalBody, ModalContent, ModalFooter, cn, useDisclosure } from '@nextui-org/react';
import ModelView3D from '@/pages/components/common/model/ModelView3D';
import BasicButton from '@/pages/components/common/BasicButton';
import leftFogImg from 'img/bushwhack/content/fog_left.png';
import rightFogImg from 'img/bushwhack/content/fog_right.png';

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
  const orbitAngle = {
    minPolarAngle: Math.PI / 2,
    maxPolarAngle: Math.PI / 2,
    minAzimuthAngle: -Math.PI / 4,
    maxAzimuthAngle: Math.PI / 4,
  };

  return [
    // thief
    {
      name: 'Loki',
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
          y: -5.4,
          z: 0,
        },
        zoom: 6,
        orbitAngle,
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
          x: Math.PI / 2,
          //   y: -Math.PI / 6,
          //   z: Math.PI / 6,
        },
        offsetPower: {
          y: -0.5,
        },
        zoom: 6,
        orbitAngle,
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
          x: Math.PI / 2,
          // y: -Math.PI / 6,
          // z: Math.PI / 6,
        },
        offsetPower: {
          y: -0.5,
        },
        zoom: 6,
        orbitAngle,
      },
    },
  ];
}

export default function BasicFogScreen() {
  const BASE_WIDTH = 1920;
  const BASE_HEIGHT = 1080;
  const fogImgRef = useRef<HTMLImageElement>(null);
  const [masks, setMasks] = useState<MaskItem[]>(getBaseMasks());
  const maskVal = useRef<MaskItem[]>(masks);
  const [maskInfo, setMaskInfo] = useState<MaskItem | null>(null);
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const isViewing = useRef(false);
  const [isStarting, setIsStarting] = useState(false);
  const [finished, setFinished] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [shadowWidth, setShadowWidth] = useState(BASE_WIDTH);
  const [shadowHeight, setShadowHeight] = useState(BASE_HEIGHT);

  // 初始化计算面具坐标
  function initMasks() {
    const { innerWidth: w, innerHeight: h } = window;
    const ratio = Math.min(w / BASE_WIDTH, h / BASE_HEIGHT);

    const newMasks = getBaseMasks();
    newMasks.forEach((m) => {
      m.x = w / 2 - (BASE_WIDTH / 2 - m.x) * ratio;
      m.y = h / 2 - (BASE_HEIGHT / 2 - m.y) * ratio;
    });
    setMasks((maskVal.current = newMasks));
  }

  function init() {
    setIsResizing(true);
    const { innerWidth, innerHeight } = window;
    const ratio = Math.min(innerWidth / BASE_WIDTH, innerHeight / BASE_HEIGHT);
    setShadowWidth(innerWidth * ratio);
    setShadowHeight(innerHeight * ratio);
    if (innerWidth / BASE_WIDTH > innerHeight / BASE_HEIGHT) {
      setShadowWidth((innerHeight * BASE_WIDTH) / BASE_HEIGHT);
      setShadowHeight(innerHeight);
    } else {
      setShadowWidth(innerWidth);
      setShadowHeight((innerWidth * BASE_HEIGHT) / BASE_WIDTH);
    }

    initMasks();

    setIsResizing(false);
  }

  function onViewMask(item: MaskItem) {
    if (!item.visible) return;

    setMaskInfo(item);
    onOpen();
    isViewing.current = true;
  }

  function onGameTitleMouseEnter() {
    setIsStarting(true);
  }

  function onFogClick() {
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
    window.addEventListener('resize', init);

    return () => {
      window.removeEventListener('resize', init);
    };
  }, []);

  return (
    <div className="w-screen h-screen relative select-none flex justify-center items-center">
      <Image className={cn(['w-full h-full object-contain', isResizing && 'invisible'])} src={sceneImg} alt="" />

      <div
        className={cn([
          'absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-0 shadow-[inset_0_0_4rem_2rem_#000]',
          isResizing && 'invisible',
        ])}
        style={{ width: `${shadowWidth}px`, height: `${shadowHeight}px` }}
      ></div>

      <Image
        ref={fogImgRef}
        className={cn(['z-10 transition-opacity !duration-[3000ms]', finished && 'opacity-0'])}
        src={fogImg}
        alt=""
        fill
        onClick={onFogClick}
        onTouchEnd={onFogClick}
      />

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
        onTouchEnd={onGameTitleMouseEnter}
      >
        Hunt in the Mist
      </div>

      <div
        className="absolute top-0 left-0 -translate-y-full rotate-180 w-full h-24 z-30 overflow-hidden pointer-events-none"
        style={{ mask: 'linear-gradient(to bottom, #000 0, rgba(0,0,0,0.3) 50%, transparent 100%)' }}
      >
        <Image className="w-full h-auto" src={fogImg} alt="" />
      </div>

      <div
        className="absolute bottom-0 left-0 translate-y-full rotate-180 w-full h-24 z-30 overflow-hidden pointer-events-none"
        style={{ mask: 'linear-gradient(to top, rgba(0,0,0,0.9) 0, rgba(0,0,0,0.3) 50%, transparent 100%)' }}
      >
        <Image className="w-full h-auto relative bottom-0" src={fogImg} alt="" />
      </div>

      <Image
        className="w-[57.875rem] h-[50rem] object-cover absolute left-0 -top-[17rem] z-40 pointer-events-none"
        src={leftFogImg}
        alt=""
      />

      <Image
        className="w-[68.125rem] h-[50rem] object-cover absolute right-0 -top-[26.5625rem] z-40 pointer-events-none"
        src={rightFogImg}
        alt=""
      />

      <Image
        className="w-[57.875rem] h-[50rem] object-cover absolute left-0 -bottom-[33rem] z-40 pointer-events-none"
        src={leftFogImg}
        alt=""
      />
      <Image
        className="w-[68.125rem] h-[50rem] object-cover absolute right-0 -bottom-[23.4375rem] z-40 pointer-events-none"
        src={rightFogImg}
        alt=""
      />

      <Modal
        isOpen={isOpen}
        onOpenChange={onOpenChange}
        classNames={{
          wrapper: 'items-center',
          base: 'bg-black max-w-[43.75rem] w-[43.75rem] h-[43.75rem] border-3 border-[#4051F4] rounded-[0.625rem] shadow-[0_0_24px_2px_#4051F4] max-[960px]:max-w-[20rem] max-[960px]:max-h-[20rem]',
          footer: 'justify-center',
          closeButton: 'text-[#4051F4] text-[1.75rem]',
        }}
        onClose={() => (isViewing.current = false)}
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalBody>{maskInfo && <ModelView3D info={maskInfo.mask} />}</ModalBody>
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
