import { Html, Head, Main, NextScript } from 'next/document'

export default function Document() {
  return (
    <Html lang="en">
      <Head title="Moonveil Entertainment">
        <meta name="description" content="Empowered by cutting-edge technologies , our mission is to craft top-notch gaming experiences that seamlessly combine casual flexibility with authentic fun depth." />
        <link rel="icon" href="img/favicon.png" type="image/x-icon"></link>
		    <link rel="shortcut icon" href="img/favicon.png" type="image/x-icon"></link>
        <script src="https://accounts.google.com/gsi/client" async defer></script>
        <script type="text/javascript" async src="https://platform.twitter.com/widgets.js"></script>
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  )
}
