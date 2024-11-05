import { Web3ModalProvider } from '@/store/Web3Modal';
import Head from 'next/head';

export default function AstrArkLayout(page: JSX.Element) {
  const fonts = ['FZXinGHJW-DB.TTF', 'FZXinGHJW-SB.TTF'];

  return (
    <>
      <Head>
        {fonts.map((font, index) => (
          <link
            key={index}
            rel="preload"
            as="font"
            href={`https://d3dhz6pjw7pz9d.cloudfront.net/fonts/${font}`}
            crossOrigin="anonymous"
          ></link>
        ))}
      </Head>

      <Web3ModalProvider>{page}</Web3ModalProvider>
    </>
  );
}
