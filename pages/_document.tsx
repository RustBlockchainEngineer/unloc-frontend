import { Html, Head, Main, NextScript } from 'next/document'

export default function Document() {
  return (
    <Html>
      <Head>
        <meta name='description' content='UNLOC your NFTs full potential' />
        <meta property='og:title' content='UNLOC' />
        <meta property='og:url' content='https://unloc.xyz' />
        <meta property='og:image' content='https://unloc.xyz/icons/apple-touch-icon.pngg' />
        <link rel='apple-touch-icon' sizes='180x180' href='/icons/apple-touch-icon.png' />
        <link rel='icon' type='image/png' sizes='16x16' href='/icons/favicon-16x16.png' />
        <link rel='icon' type='image/png' sizes='32x32' href='/icons/favicon-32x32.png' />
        <link rel='manifest' href='/site.webmanifest' />

        <meta name='msapplication.TileColor' content='#e00a7f' />
        <meta name='theme-color' content='#e00a7f' />
        <link
          href='https://fonts.googleapis.com/css2?family=Red+Hat+Display:wght@300;400;700&display=swap'
          rel='stylesheet'
        />

        <meta name='robots' content='all' />
        <meta name='google' content='nositelinksearchbox' />
        <meta name='google' content='notranslate' key='notranslate' />

        <meta property='og:type' content='website' />
        <meta name='twitter:card' content='summary_large_image' />

        <link
          href='https://fonts.googleapis.com/css2?family=Red+Hat+Display:wght@300;400;700&display=optional'
          rel='stylesheet'
        />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  )
}
