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
      <section id="luxy">
        <Head>
          <title>NFT | Moonveil</title>
        </Head>

        <NftHome></NftHome>
      </section>
    )
  }