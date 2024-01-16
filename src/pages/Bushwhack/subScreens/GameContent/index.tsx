import PageDesc from '@/pages/components/common/PageDesc';

export default function GameContent() {
  return (
    <div className="max-w-[75rem] m-auto flex flex-col pt-[26.625rem]">
      <PageDesc
        hasBelt
        className="items-start text-left"
        title={
          <div className="font-semakin text-6xl" style={{ textShadow: '0 0 2rem #3C6EFF' }}>
            BUSHWHACK
            <br />
            ——STEALTH BATTLE ROYALE
          </div>
        }
        subtitle="Step into our mysterious, mist-covered battlefield! Players engage in a fierce battle, and only the last one standing emerges victorious. Survival demands mastering the art of stealth – hide in the mist, waiting for the perfect moment to ambush opponents. Collect resources, upgrade gear, and be ready to escape danger circles tightening the battlefield. BUSHWHACK will also collaborate with renowned brands or NFTs in future events. Stay tuned for more updates"
      />
    </div>
  );
}
