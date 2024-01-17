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
        {/* <meta name="twitter:card" content="summary_large_image"></meta>
        <meta name="twitter:title" content="Moonveil Entertainment"></meta>
        <meta name="twitter:description" content="Moonveil Entertainment Official Website."></meta>
        <meta name="twitter:site" content="@Moonveil_Studio"></meta>
        <meta
          name="twitter:image"
          content="https://moonveil.gg/_next/image?url=%2F_next%2Fstatic%2Fmedia%2Fbg.5abd36fe.jpg&w=3840&q=75"
        ></meta> */}
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
