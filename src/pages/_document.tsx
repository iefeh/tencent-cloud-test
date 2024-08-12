import { Html, Head, Main, NextScript } from 'next/document';
import { SpeedInsights } from '@vercel/speed-insights/next';

export default function Document() {
  return (
    <Html lang="en">
      <Head title="Moonveil Entertainment">
        <meta
          name="description"
          content="Empowered by cutting-edge technologies, our mission is to craft top-notch gaming experiences that seamlessly combine casual flexibility with authentic fun depth."
        />
        <link rel="icon" href="/img/favicon.png" type="image/x-icon"></link>
        <link rel="shortcut icon" href="/img/favicon.png" type="image/x-icon"></link>
        <link rel="preload" as="font" href="https://moonveil-public.s3.ap-southeast-2.amazonaws.com/fonts/Semakin.ttf" crossOrigin="anonymous"></link>
        <link rel="preload" as="font" href="https://moonveil-public.s3.ap-southeast-2.amazonaws.com/fonts/Decima-Mono-W01-Regular.ttf" crossOrigin="anonymous"></link>
        <link rel="preload" as="font" href="https://moonveil-public.s3.ap-southeast-2.amazonaws.com/fonts/Poppins-Regular.ttf" crossOrigin="anonymous"></link>
        <link rel="preload" as="font" href="https://moonveil-public.s3.ap-southeast-2.amazonaws.com/fonts/Poppins-Medium.ttf" crossOrigin="anonymous"></link>
      </Head>
      <body className="dark">
        <Main />
        <NextScript />
        <SpeedInsights />
      </body>
    </Html>
  );
}
