import Head from 'next/head';

export default function Page({
  params,
  searchParams,
}: {
  params: { slug: string };
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  return (
    <section id="luxy">
      <Head>
        <title>My Assets | Moonveil Entertainment</title>
      </Head>
    </section>
  );
}
