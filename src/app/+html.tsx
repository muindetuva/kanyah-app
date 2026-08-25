import { ScrollViewStyleReset } from 'expo-router/html'
import type { PropsWithChildren } from 'react'

export default function Root({ children }: PropsWithChildren) {
  const isDevelopment = process.env.APP_ENV === 'development'
  const appName = isDevelopment ? 'Kanyah Dev' : 'Kanyah'
  const manifestHref = isDevelopment ? '/manifest-dev.json' : '/manifest-prod.json'
  const themeColor = isDevelopment ? '#F16022' : '#39205B'
  const touchIconHref = isDevelopment ? '/pwa-dev-icon-192.png' : '/pwa-prod-icon-192.png'

  return (
    <html lang="en">
      <head>
        <title>{appName}</title>
        <meta charSet="utf-8" />
        <meta content="IE=edge" httpEquiv="X-UA-Compatible" />
        <meta content="width=device-width, initial-scale=1, shrink-to-fit=no" name="viewport" />
        <meta content={appName} name="application-name" />
        <meta content={appName} name="apple-mobile-web-app-title" />
        <meta content={themeColor} name="theme-color" />
        <link href={manifestHref} rel="manifest" />
        <link href={touchIconHref} rel="apple-touch-icon" />
        <script dangerouslySetInnerHTML={{ __html: serviceWorkerRegistration }} />
        <ScrollViewStyleReset />
      </head>
      <body>{children}</body>
    </html>
  )
}

const serviceWorkerRegistration = `
if ('serviceWorker' in navigator && !['localhost', '127.0.0.1'].includes(window.location.hostname)) {
  window.addEventListener('load', function () {
    navigator.serviceWorker.register('/sw.js').then(function (registration) {
      return navigator.serviceWorker.ready.then(function () {
        var resourceUrls = performance.getEntriesByType('resource')
          .map(function (entry) { return entry.name; })
          .filter(function (url) {
            try {
              return new URL(url).origin === window.location.origin;
            } catch (_error) {
              return false;
            }
          });
        var worker = registration.active || navigator.serviceWorker.controller;

        if (worker) {
          worker.postMessage({ type: 'CACHE_APP_SHELL', urls: resourceUrls });
        }
      });
    }).catch(function () {});
  });
}
`
