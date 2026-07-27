import { ScrollViewStyleReset } from 'expo-router/html'
import type { PropsWithChildren } from 'react'

export default function Root({ children }: PropsWithChildren) {
  const isDevelopment = process.env.APP_ENV === 'development'
  const manifestHref = isDevelopment ? '/manifest-dev.json' : '/manifest-prod.json'
  const themeColor = isDevelopment ? '#F16022' : '#39205B'
  const touchIconHref = isDevelopment ? '/pwa-dev-icon-192.png' : '/pwa-prod-icon-192.png'

  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta content="IE=edge" httpEquiv="X-UA-Compatible" />
        <meta content="width=device-width, initial-scale=1, shrink-to-fit=no" name="viewport" />
        <meta content={themeColor} name="theme-color" />
        <link href={manifestHref} rel="manifest" />
        <link href={touchIconHref} rel="apple-touch-icon" />
        <ScrollViewStyleReset />
      </head>
      <body>{children}</body>
    </html>
  )
}
