import { writeFile } from 'node:fs/promises'

const deploymentVersion =
  process.env.VERCEL_GIT_COMMIT_SHA ??
  process.env.VERCEL_DEPLOYMENT_ID ??
  `local-${Date.now()}`
const safeVersion = deploymentVersion.replace(/[^a-zA-Z0-9_-]/g, '-')
const outputUrl = new URL('../public/sw-version.js', import.meta.url)

await writeFile(outputUrl, `self.KANYAH_BUILD_VERSION = ${JSON.stringify(safeVersion)};\n`)

console.log(`Prepared Kanyah PWA version ${safeVersion}`)
