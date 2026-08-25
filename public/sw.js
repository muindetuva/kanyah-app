const APP_SHELL_CACHE = 'kanyah-app-shell-v1'
const STORY_ASSET_CACHE = 'kanyah-story-assets-v1'

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(APP_SHELL_CACHE)
      .then((cache) => cache.add(new Request('/', { cache: 'reload' })))
      .then(() => self.skipWaiting()),
  )
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    Promise.all([
      caches
        .keys()
        .then((keys) =>
          Promise.all(
            keys
              .filter((key) => key.startsWith('kanyah-app-shell-') && key !== APP_SHELL_CACHE)
              .map((key) => caches.delete(key)),
          ),
        ),
      self.clients.claim(),
    ]),
  )
})

self.addEventListener('message', (event) => {
  if (event.data?.type !== 'CACHE_APP_SHELL' || !Array.isArray(event.data.urls)) {
    return
  }

  const urls = event.data.urls.filter((url) => {
    try {
      return new URL(url).origin === self.location.origin
    } catch {
      return false
    }
  })

  event.waitUntil(
    caches.open(APP_SHELL_CACHE).then((cache) =>
      Promise.allSettled(
        urls.map(async (url) => {
          const response = await fetch(new Request(url, { cache: 'reload' }))

          if (response.ok) {
            await cache.put(url, response)
          }
        }),
      ),
    ),
  )
})

async function networkFirstNavigation(request) {
  const cache = await caches.open(APP_SHELL_CACHE)

  try {
    const response = await fetch(request)

    if (response.ok) {
      await cache.put(request, response.clone())
    }

    return response
  } catch {
    return (await cache.match(request)) ?? (await cache.match('/')) ?? Response.error()
  }
}

async function staleWhileRevalidate(request) {
  const cache = await caches.open(APP_SHELL_CACHE)
  const cached = await cache.match(request)
  const network = fetch(request)
    .then(async (response) => {
      if (response.ok) {
        await cache.put(request, response.clone())
      }

      return response
    })
    .catch(() => null)

  return cached ?? (await network) ?? Response.error()
}

function rangedResponse(response, rangeHeader) {
  const match = /^bytes=(\d+)-(\d*)$/.exec(rangeHeader)

  if (!match || response.type === 'opaque') {
    return response
  }

  return response.arrayBuffer().then((buffer) => {
    const start = Number(match[1])
    const requestedEnd = match[2] ? Number(match[2]) : buffer.byteLength - 1
    const end = Math.min(requestedEnd, buffer.byteLength - 1)

    if (start > end) {
      return new Response(null, {
        status: 416,
        headers: { 'Content-Range': `bytes */${buffer.byteLength}` },
      })
    }

    const headers = new Headers(response.headers)
    headers.set('Accept-Ranges', 'bytes')
    headers.set('Content-Length', String(end - start + 1))
    headers.set('Content-Range', `bytes ${start}-${end}/${buffer.byteLength}`)

    return new Response(buffer.slice(start, end + 1), {
      status: 206,
      statusText: 'Partial Content',
      headers,
    })
  })
}

async function storyAssetResponse(request) {
  const cache = await caches.open(STORY_ASSET_CACHE)
  const cached = await cache.match(request.url)

  if (!cached) {
    return fetch(request)
  }

  const rangeHeader = request.headers.get('range')
  return rangeHeader ? rangedResponse(cached, rangeHeader) : cached
}

self.addEventListener('fetch', (event) => {
  const { request } = event

  if (request.method !== 'GET') {
    return
  }

  if (request.mode === 'navigate') {
    event.respondWith(networkFirstNavigation(request))
    return
  }

  const url = new URL(request.url)

  if (
    url.origin === self.location.origin &&
    ['font', 'image', 'script', 'style'].includes(request.destination)
  ) {
    event.respondWith(staleWhileRevalidate(request))
    return
  }

  if (
    url.origin !== self.location.origin ||
    request.destination === 'audio' ||
    request.destination === 'image'
  ) {
    event.respondWith(storyAssetResponse(request))
  }
})
