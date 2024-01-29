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
        <link rel="preload" as="font" href="/fonts/Semakin.woff2" crossOrigin="anonymous"></link>
        <link rel="preload" as="font" href="/fonts/Semakin.ttf" crossOrigin="anonymous"></link>
        <link rel="preload" as="font" href="/fonts/Decima-Mono-W01-Regular.woff2" crossOrigin="anonymous"></link>
        <link rel="preload" as="font" href="/fonts/Decima-Mono-W01-Regular.ttf" crossOrigin="anonymous"></link>
        <link rel="preload" as="font" href="/fonts/Poppins-Regular.woff2" crossOrigin="anonymous"></link>
        <link rel="preload" as="font" href="/fonts/Poppins-Regular.ttf" crossOrigin="anonymous"></link>
        <link rel="preload" as="font" href="/fonts/Poppins-Medium.woff2" crossOrigin="anonymous"></link>
        <link rel="preload" as="font" href="/fonts/Poppins-Medium.ttf" crossOrigin="anonymous"></link>
      </Head>
      <body className="dark">
        <Main />
        <NextScript />
        <SpeedInsights />
      </body>
    </Html>
  );
}
