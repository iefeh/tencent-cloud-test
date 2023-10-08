import { Html, Head, Main, NextScript } from 'next/document'

export default function Document() {
  return (
    <Html lang="en">
      <Head >
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
