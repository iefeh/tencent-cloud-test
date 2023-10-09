import { Html, Head, Main, NextScript } from 'next/document'

export default function Document() {
  return (
    <Html lang="en">
      <Head title="Moonveil">
        <meta name="description" content="Moonveil Official Website" />
        <meta name="viewport" content="width=device-width,initial-scale=1,minimum-scale=1,maximum-scale=1,user-scalable=no" />
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
