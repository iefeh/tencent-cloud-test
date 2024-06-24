import PageDesc from '@/components/common/PageDesc';
import PoolTabs from '@/components/pages/pledge/PoolTabs';
import ValueItem from '@/components/pages/pledge/ValueItem';
import Head from 'next/head';

export default function PledgePage() {
  return (
    <section className="max-w-[87.5rem] mx-auto">
      <Head>
        <title>Moonveil Entertainment</title>
      </Head>

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

      <div className="flex justify-center items-center">
        <ValueItem
          icon="https://moonveil-public.s3.ap-southeast-2.amazonaws.com/pledge/icon_staking_points.png"
          label="My Staking Points"
          value="5678"
        />

        <ValueItem
          icon="https://moonveil-public.s3.ap-southeast-2.amazonaws.com/pledge/icon_locked_value.png"
          label="Total Locked Value"
          value="5678"
        />
      </div>

      <PoolTabs />
    </section>
  );
}
