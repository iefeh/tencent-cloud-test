import Head from 'next/head'
import NftHome from './components/home'

export default function Page({
    params,
    searchParams,
  }: {
    params: { slug: string }
    searchParams: { [key: string]: string | string[] | undefined }
  }) {
    return (
      <section id="luxy" className="w-full flex flex-col z-10">
        <Head>
          <title>NFT | Moonveil</title>
        </Head>

        <NftHome></NftHome>
      </section>
    )
  }