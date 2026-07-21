import { writeFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const publicDir = path.resolve(__dirname, '..', 'public')

const manifestTargets = [
  {
    backgroundColor: '#F7F3EA',
    description: 'Mobile-first storytelling for children, set up and guided by parents.',
    iconPrefix: 'pwa-prod-icon',
    manifestFile: 'manifest-prod.json',
    name: 'Kanyah',
    shortName: 'Kanyah',
    themeColor: '#39205B',
  },
  {
    backgroundColor: '#272827',
    description: 'Development build of Kanyah.',
    iconPrefix: 'pwa-dev-icon',
    manifestFile: 'manifest-dev.json',
    name: 'Kanyah Dev',
    shortName: 'Kanyah Dev',
    themeColor: '#F16022',
  },
]

for (const target of manifestTargets) {
  writeManifest(target)
}

console.log('Wrote PWA manifests.')

function writeManifest(target) {
  writeFileSync(
    path.join(publicDir, target.manifestFile),
    `${JSON.stringify(
      {
        background_color: target.backgroundColor,
        description: target.description,
        display: 'standalone',
        icons: [192, 512].map((size) => ({
          purpose: 'any maskable',
          sizes: `${size}x${size}`,
          src: `/${target.iconPrefix}-${size}.png`,
          type: 'image/png',
        })),
        name: target.name,
        short_name: target.shortName,
        start_url: '/',
        theme_color: target.themeColor,
      },
      null,
      2,
    )}\n`,
  )
}
