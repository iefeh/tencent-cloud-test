import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';
import hintImg from 'img/bushwhack/fog/hint.png';
import { Modal, ModalBody, ModalContent, ModalFooter, cn, useDisclosure } from '@nextui-org/react';
import ModelView3D from '@/pages/components/common/model/ModelView3D';
import { BASE_CLIENT_HEIGHT, BASE_CLIENT_WIDTH } from '@/constant/common';

interface Props {
  checkMousemove?: () => boolean;
  onViewChange?: (isViewing: boolean) => void;
}

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
        texture: '/models/textures/chaowan.png',
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
        texture: '/models/textures/Lewis.png',
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
        texture: '/models/textures/T_Rhea.png',
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

export default function FogMasks(props: Props) {
  const { checkMousemove, onViewChange } = props;
  const [masks, setMasks] = useState<MaskItem[]>(getBaseMasks());
  const maskVal = useRef<MaskItem[]>(masks);
  const [maskInfo, setMaskInfo] = useState<MaskItem | null>(null);
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const isViewing = useRef(false);

  // 初始化计算面具坐标
  function initMasks() {
    const { innerWidth: w, innerHeight: h } = window;
    const ratio = Math.min(w / BASE_CLIENT_WIDTH, h / BASE_CLIENT_HEIGHT);

    const newMasks = getBaseMasks();
    newMasks.forEach((m) => {
      m.x = w / 2 - (BASE_CLIENT_WIDTH / 2 - m.x) * ratio;
      m.y = h / 2 - (BASE_CLIENT_HEIGHT / 2 - m.y) * ratio;
    });
    setMasks((maskVal.current = newMasks));
  }

  function onViewMask(item: MaskItem) {
    if (!item.visible) return;

    setMaskInfo(item);
    onOpen();
    isViewing.current = true;
    onViewChange?.(true);
  }

  function onMousemove(e: MouseEvent) {
    e.preventDefault();
    if (isViewing.current) return;
    if (checkMousemove) {
      const res = checkMousemove();
      if (!res) return;
    }

    const { x: pX, y: pY } = e;
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
  }

  useEffect(() => {
    window.addEventListener('mousemove', onMousemove);
    window.addEventListener('resize', initMasks);
    initMasks();

    return () => {
      window.removeEventListener('mousemove', onMousemove);
      window.removeEventListener('resize', initMasks);
    };
  }, []);

  return (
    <>
      {masks.map((mask, index) => (
        <div
          key={index}
          className={cn([
            'flex flex-col items-center absolute z-10 -translate-x-1/2 -translate-y-1/2',
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

      <Modal
        isOpen={isOpen}
        onOpenChange={onOpenChange}
        classNames={{
          wrapper: 'items-center',
          base: 'bg-black max-w-[43.75rem] w-[43.75rem] h-[43.75rem] border-3 border-[#4051F4] rounded-[0.625rem] shadow-[0_0_24px_2px_#4051F4] max-[960px]:max-w-[20rem] max-[960px]:max-h-[20rem]',
          footer: 'justify-center',
          closeButton: 'text-[#4051F4] text-[1.75rem]',
        }}
        onClose={() => {
          isViewing.current = false;
          onViewChange?.(false);
        }}
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
    </>
  );
}
