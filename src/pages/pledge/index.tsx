import PageDesc from '@/components/common/PageDesc';
import ConnectContent from '@/components/pages/pledge/ConnectContent';
import PoolTabs from '@/components/pages/pledge/PoolTabs';
import ValueItems from '@/components/pages/pledge/ValueItems';
import Head from 'next/head';

export default function PledgePage() {
  return (
    <section className="pb-24 bg-[url('https://moonveil-public.s3.ap-southeast-2.amazonaws.com/pledge/bg_page.png')] bg-contain bg-top bg-no-repeat">
      <Head>
        <title>Moonveil Entertainment</title>
      </Head>

      <div className="w-[87.5rem] mx-auto">
        <PageDesc
          title={
            <div className="mt-[10.75rem] font-semakin from-[#DBAC74] to-[#E7D4A9] bg-clip-text text-transparent text-6xl bg-gradient-to-r">
              Stake & Earn $MORE NOW!
            </div>
          }
          subtitle={
            <div className="max-w-[52.5rem] font-decima text-lg mt-6">
              Stake your assets and enjoy abundant rewards,
              <br />
              including a free $MORE token airdrop and exclusive in-game privileges.
              <br />
              Now supporting three separate staking pools: ETH, USDT, and USDC.
            </div>
          }
        />

        <div className="flex justify-center items-center mt-5">
          <ConnectContent />
        </div>

        <ValueItems />

        <PoolTabs />
      </div>
    </section>
  );
}
