import Head from 'next/head';
import type { ReactNode } from 'react';

export default function AstrArkLayout(page: ReactNode) {
  const fonts = ['FZXinGHJW-DB.TTF', 'FZXinGHJW-SB.TTF'];

  return (
    <>
      <Head>
        {fonts.map((font, index) => (
          <link
            key={index}
            rel="preload"
            as="font"
            href={`https://moonveil-public.s3.ap-southeast-2.amazonaws.com/fonts/${font}`}
            crossOrigin="anonymous"
          ></link>
        ))}
      </Head>

      {page}
    </>
  );
}
