import ModelView3D from '@/pages/components/common/ModelView3D';

export default function IntroScreen() {
  return <div className="w-screen h-screen relative">
    <ModelView3D source="/models/Thief_H.fbx" texture="/models/textures/chaowan.tga" />
  </div>;
}
