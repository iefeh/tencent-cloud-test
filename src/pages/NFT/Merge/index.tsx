import LGButton from '@/pages/components/common/buttons/LGButton';
import NFT from '@/pages/components/common/nft/NFT';
import Head from 'next/head';
import Link from 'next/link';
import { useState } from 'react';

export default function Page({
  params,
  searchParams,
}: {
  params: { slug: string };
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const [nfts, setNFTs] = useState([]);

  return (
    <section id="luxy">
      <Head>
        <title>Merge NFT | Moonveil Entertainment</title>
      </Head>

      <div className="w-full pl-[6.875rem] pr-20 flex flex-col items-center md:flex-row md:items-start gap-[4.375rem] mt-[10.25rem]">
        <div className="w-[50rem] h-[50rem] flex flex-col bg-[url('/img/nft/merge/bg_content.png')] bg-contain">
          <div className="flex-1 flex flex-col justify-center items-center">
            <>
              <p>Please log in to check your NFT</p>
              <LGButton className="mt-11" label="Merge Now" disabled linearDisabled />
            </>
          </div>

          <div className="shrink-0">
            <>
              <p className="text-[#999] mb-8">
                <span className="text-white">Kind reminder: </span>Lv2 Eternity TETRA will be minted on the Ethereum
                network. To ensure a smooth experience for you, we will cover all the ETH Gas Fees required for minting
                on Ethereum.
              </p>
            </>
          </div>
        </div>

        <div className="flex-1 h-[50rem]">
          <div className="flex justify-between items-center shrink-0">
            <div className="font-semakin text-3xl bg-clip-text bg-[linear-gradient(0deg,#EDE0B9_0%,#CAA67E_100%)] text-transparent">
              My Assets( 9 )
            </div>

            <Link className="text-basic-yellow" href="">
              More Assets &gt;&gt;
            </Link>
          </div>

          <div className="w-full grid grid-cols-3 gap-3 flex-1 overflow-y-auto">
            {nfts.map((item, index) => (
              <NFT key={index} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
