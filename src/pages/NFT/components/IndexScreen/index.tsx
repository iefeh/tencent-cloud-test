import YellowCircle from '@/pages/components/common/YellowCircle';

export default function IndexScreen() {
  return (
    <div className="w-full">
      <div className="w-full h-screen relative flex justify-center items-center">
        1
        <YellowCircle className="absolute right-[4.375rem] bottom-20 z-10" />
      </div>

      <div className="w-full h-screen flex justify-center items-center">2</div>
    </div>
  );
}
