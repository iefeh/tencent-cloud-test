import { Html, Head, Main, NextScript } from 'next/document'

export default function Document() {
  return (
    <Html lang="en">
      <Head title="Moonveil Entertainment">
        <meta name="description" content="Empowered by cutting-edge technologies , our mission is to craft top-notch gaming experiences that seamlessly combine casual flexibility with authentic fun depth." />
        <link rel="icon" href="img/favicon.png" type="image/x-icon"></link>
		    <link rel="shortcut icon" href="img/favicon.png" type="image/x-icon"></link>
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  )
}
