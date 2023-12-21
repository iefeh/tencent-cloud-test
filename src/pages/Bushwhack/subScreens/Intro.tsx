import { ModelView3DModal } from '@/pages/components/common/model/ModelView3D';
import thiefImg from 'img/bushwhack/intro/thief.png';
import doctorImg from 'img/bushwhack/intro/doctor.png';
import rheaImg from 'img/bushwhack/intro/rhea.png';
import Image, { StaticImageData } from 'next/image';
import { Button, useDisclosure } from '@nextui-org/react';

interface Role {
  name: string;
  cover: StaticImageData;
  source: string;
  texture: string;
  mask: {
    source: string;
    texture: string;
  };
}

function RoleCell(props: Role) {
  const { cover, source, texture, mask } = props;
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const { isOpen: isOpenMask, onOpen: onOpenMask, onOpenChange: onOpenChangeMask } = useDisclosure();

  return (
    <div className="flex-1 flex flex-col items-center">
      <Image src={cover} alt="" onClick={onOpen} />
      <Button onPress={onOpenMask}>Mask</Button>

      <ModelView3DModal isOpen={isOpen} onOpenChange={onOpenChange} source={source} texture={texture} />

      <ModelView3DModal
        isOpen={isOpenMask}
        onOpenChange={onOpenChangeMask}
        source={mask.source}
        texture={mask.texture}
      />
    </div>
  );
}

export default function IntroScreen() {
  const roles = [
    {
      name: 'Doctor',
      cover: doctorImg,
      source: '/models/Lewis_H.fbx',
      texture: '/models/textures/Lewis.tga',
      mask: {
        source: '/models/lewis_mask.fbx',
        texture: '/models/textures/Lewis.tga',
      },
    },
    {
      name: 'Rhea',
      cover: rheaImg,
      source: '/models/Rhea_H.fbx',
      texture: '/models/textures/T_Rhea.tga',
      mask: {
        source: '/models/rhea_mask.fbx',
        texture: '/models/textures/T_Rhea.tga',
      },
    },
    {
      name: 'Thief',
      cover: thiefImg,
      source: '/models/Thief_H.fbx',
      texture: '/models/textures/chaowan.tga',
      mask: {
        source: '/models/chaowan_mianju.fbx',
        texture: '/models/textures/chaowan.tga',
      },
    },
  ];

  return (
    <div className="w-screen h-screen relative flex justify-between items-center">
      {/* <ModelView3D source="/models/Thief_H.fbx" texture="/models/textures/chaowan.tga" /> */}
      {roles.map((role, index) => (
        <RoleCell {...role} key={index} />
      ))}
    </div>
  );
}
