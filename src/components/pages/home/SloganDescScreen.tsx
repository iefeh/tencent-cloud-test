import PageDesc from '@/components/common/PageDesc';

export default function SloganDescScreen() {
  return (
    <div className="w-full h-screen relative overflow-hidden">
      <div className="absolute left-[56.35%] top-[43.7%] max-md:left-[30%]">
        <PageDesc
          className="items-start text-left"
          hasBelt
          subtitle={
            <div className="max-w-[30rem] text-lg font-decima mb-10 tracking-tighter">
              With game excellence at our core, our vision is to craft the{' '}
              <span className="text-basic-yellow">authentic web3 game-centric experience</span> tailored for
              <span className="text-basic-yellow"> the next-gen gamers.</span>
            </div>
          }
          buttonLabel="about moonveil"
          buttonLink="/About"
        />
      </div>
    </div>
  );
}
