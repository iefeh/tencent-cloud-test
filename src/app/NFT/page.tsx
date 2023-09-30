import NftHome from './components/home'

export default function Page({
    params,
    searchParams,
  }: {
    params: { slug: string }
    searchParams: { [key: string]: string | string[] | undefined }
  }) {
    return (
      <section>
        <NftHome></NftHome>
      </section>
    )
  }