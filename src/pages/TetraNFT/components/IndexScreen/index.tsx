import PageDesc from '@/pages/components/common/PageDesc';
import YellowCircle from '@/pages/components/common/YellowCircle';

export default function IndexScreen() {
  return (
    <div className="w-full">
      <div className="w-full h-screen relative flex justify-center items-center">
        <PageDesc
          needAni
          title={
            <div className="font-semakin text-center">
              <div className="text-4xl">Introducing The</div>
              <div className="text-[6.25rem]">Tetra NFT Series</div>
            </div>
          }
        />

        <YellowCircle className="absolute right-[4.375rem] bottom-20 z-10" />
      </div>

      <div className="w-full h-screen flex justify-center items-center">
        <div className="w-[48.1875rem] font-decima text-lg text-justify">
          <div>
            Introducing the Tetra NFT Series, the groundbreaking and strategic ecosystem NFTs by Moonveil. The
            first-ever release promises to be the most valuable and sought-after NFT product in the future. Our unique
            collecting, synthesizing, and upgrading NFT gameplay will grant you exclusive ownership privileges and
            rewards.
          </div>
          <br />
          <div className="mt-5">
            As a Tetra NFT holder, you become a vital part of Moonveil&apos;s future ecosystem. We&apos;ve meticulously
            designed a comprehensive system of benefits across multiple in-game and platform products, ensuring you
            receive long-term, stable returns. Embrace this thrilling opportunity to shape the future of gaming and NFTs
            while enjoying lasting rewards with Moonveil&apos;s extraordinary Tetra NFTs.
          </div>
        </div>
      </div>
    </div>
  );
}
