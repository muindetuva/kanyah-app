import { deflateSync } from 'node:zlib'
import { mkdirSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const appRoot = path.resolve(__dirname, '..')
const publicDir = path.join(appRoot, 'public')

const palette = {
  blue: [38, 113, 184, 255],
  charcoal: [39, 40, 39, 255],
  indigo: [57, 32, 91, 255],
  magenta: [214, 53, 117, 255],
  marigold: [239, 158, 35, 255],
  offWhite: [240, 239, 239, 255],
  orange: [241, 96, 34, 255],
}

const manifestTargets = [
  {
    backgroundColor: '#F0EFEF',
    description: 'Mobile-first storytelling for children, set up and guided by parents.',
    iconPrefix: 'pwa-prod-icon',
    manifestFile: 'manifest-prod.json',
    name: 'Kanyah',
    shortName: 'Kanyah',
    themeColor: '#39205B',
    variant: 'prod',
  },
  {
    backgroundColor: '#272827',
    description: 'Development build of Kanyah.',
    iconPrefix: 'pwa-dev-icon',
    manifestFile: 'manifest-dev.json',
    name: 'Kanyah Dev',
    shortName: 'Kanyah Dev',
    themeColor: '#F16022',
    variant: 'dev',
  },
]

mkdirSync(publicDir, { recursive: true })

for (const target of manifestTargets) {
  for (const size of [192, 512]) {
    const image = target.variant === 'prod' ? createProdIcon(size) : createDevIcon(size)
    writePng(image, size, size, path.join(publicDir, `${target.iconPrefix}-${size}.png`))
  }

  writeManifest(target, target.manifestFile)
}

console.log('Wrote PWA manifests and install icons.')

function writeManifest(target, manifestFile) {
  writeFileSync(
    path.join(publicDir, manifestFile),
    `${JSON.stringify(
      {
        background_color: target.backgroundColor,
        description: target.description,
        display: 'standalone',
        icons: [
          {
            purpose: 'any maskable',
            sizes: '192x192',
            src: `/${target.iconPrefix}-192.png`,
            type: 'image/png',
          },
          {
            purpose: 'any maskable',
            sizes: '512x512',
            src: `/${target.iconPrefix}-512.png`,
            type: 'image/png',
          },
        ],
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

function createCanvas(width, height, color) {
  const data = Buffer.alloc(width * height * 4)

  for (let index = 0; index < width * height; index += 1) {
    data[index * 4] = color[0]
    data[index * 4 + 1] = color[1]
    data[index * 4 + 2] = color[2]
    data[index * 4 + 3] = color[3]
  }

  return {
    data,
    height,
    width,
  }
}

function createProdIcon(size) {
  const canvas = createCanvas(size, size, palette.offWhite)
  const scale = size / 1024

  roundedRect(canvas, 70 * scale, 70 * scale, 884 * scale, 884 * scale, 190 * scale, palette.indigo)
  roundedRect(canvas, 112 * scale, 112 * scale, 800 * scale, 800 * scale, 152 * scale, palette.offWhite)
  circle(canvas, 800 * scale, 220 * scale, 72 * scale, palette.marigold)
  circle(canvas, 208 * scale, 792 * scale, 58 * scale, palette.magenta)
  circle(canvas, 806 * scale, 798 * scale, 44 * scale, palette.blue)
  drawK(canvas, 250 * scale, 252 * scale, scale, {
    bottom: palette.magenta,
    main: palette.indigo,
    top: palette.marigold,
  })

  return canvas
}

function createDevIcon(size) {
  const canvas = createCanvas(size, size, palette.indigo)
  const scale = size / 1024

  roundedRect(canvas, 70 * scale, 70 * scale, 884 * scale, 884 * scale, 190 * scale, palette.offWhite)
  roundedRect(canvas, 112 * scale, 112 * scale, 800 * scale, 800 * scale, 152 * scale, palette.charcoal)
  circle(canvas, 820 * scale, 206 * scale, 86 * scale, palette.orange)
  circle(canvas, 206 * scale, 820 * scale, 58 * scale, palette.blue)
  drawK(canvas, 238 * scale, 220 * scale, scale, {
    bottom: palette.magenta,
    main: palette.offWhite,
    top: palette.marigold,
  })
  roundedRect(canvas, 236 * scale, 730 * scale, 552 * scale, 132 * scale, 48 * scale, palette.orange)
  drawDev(canvas, 337 * scale, 747 * scale, scale, palette.charcoal)

  return canvas
}

function drawK(canvas, x, y, scale, colors) {
  rect(canvas, x, y, 118 * scale, 520 * scale, colors.main)
  polygon(
    canvas,
    [
      [x + 135 * scale, y + 250 * scale],
      [x + 430 * scale, y],
      [x + 560 * scale, y],
      [x + 260 * scale, y + 280 * scale],
    ],
    colors.top,
  )
  polygon(
    canvas,
    [
      [x + 145 * scale, y + 292 * scale],
      [x + 285 * scale, y + 236 * scale],
      [x + 575 * scale, y + 520 * scale],
      [x + 425 * scale, y + 520 * scale],
    ],
    colors.bottom,
  )
}

function drawDev(canvas, x, y, scale, color) {
  const thickness = 24 * scale
  const height = 98 * scale
  const width = 66 * scale
  const gap = 22 * scale

  rect(canvas, x, y, thickness, height, color)
  rect(canvas, x, y, width, thickness, color)
  rect(canvas, x, y + height - thickness, width, thickness, color)
  rect(canvas, x + width - thickness, y + thickness, thickness, height - 2 * thickness, color)

  x += width + gap
  rect(canvas, x, y, thickness, height, color)
  rect(canvas, x, y, width, thickness, color)
  rect(canvas, x, y + 37 * scale, width - 10 * scale, thickness, color)
  rect(canvas, x, y + height - thickness, width, thickness, color)

  x += width + gap
  polygon(
    canvas,
    [
      [x, y],
      [x + thickness, y],
      [x + width * 0.5, y + height],
      [x + width - thickness, y],
      [x + width, y],
      [x + width * 0.62, y + height],
      [x + width * 0.38, y + height],
    ],
    color,
  )
}

function roundedRect(canvas, x, y, width, height, radius, color) {
  rect(canvas, x + radius, y, width - 2 * radius, height, color)
  rect(canvas, x, y + radius, width, height - 2 * radius, color)
  circle(canvas, x + radius, y + radius, radius, color)
  circle(canvas, x + width - radius, y + radius, radius, color)
  circle(canvas, x + radius, y + height - radius, radius, color)
  circle(canvas, x + width - radius, y + height - radius, radius, color)
}

function rect(canvas, x, y, width, height, color) {
  const xStart = Math.max(0, Math.floor(x))
  const yStart = Math.max(0, Math.floor(y))
  const xEnd = Math.min(canvas.width, Math.ceil(x + width))
  const yEnd = Math.min(canvas.height, Math.ceil(y + height))

  for (let yy = yStart; yy < yEnd; yy += 1) {
    for (let xx = xStart; xx < xEnd; xx += 1) {
      setPixel(canvas, xx, yy, color)
    }
  }
}

function circle(canvas, cx, cy, radius, color) {
  const radiusSquared = radius * radius
  const xStart = Math.max(0, Math.floor(cx - radius))
  const yStart = Math.max(0, Math.floor(cy - radius))
  const xEnd = Math.min(canvas.width, Math.ceil(cx + radius))
  const yEnd = Math.min(canvas.height, Math.ceil(cy + radius))

  for (let yy = yStart; yy < yEnd; yy += 1) {
    for (let xx = xStart; xx < xEnd; xx += 1) {
      const dx = xx + 0.5 - cx
      const dy = yy + 0.5 - cy

      if (dx * dx + dy * dy <= radiusSquared) {
        setPixel(canvas, xx, yy, color)
      }
    }
  }
}

function polygon(canvas, points, color) {
  const minY = Math.max(0, Math.floor(Math.min(...points.map((point) => point[1]))))
  const maxY = Math.min(canvas.height - 1, Math.ceil(Math.max(...points.map((point) => point[1]))))

  for (let y = minY; y <= maxY; y += 1) {
    const intersections = []

    for (let index = 0, previous = points.length - 1; index < points.length; previous = index, index += 1) {
      const [x1, y1] = points[index]
      const [x2, y2] = points[previous]

      if ((y1 > y) !== (y2 > y)) {
        intersections.push(((x2 - x1) * (y - y1)) / (y2 - y1) + x1)
      }
    }

    intersections.sort((a, b) => a - b)

    for (let index = 0; index < intersections.length; index += 2) {
      const xStart = Math.max(0, Math.floor(intersections[index]))
      const xEnd = Math.min(canvas.width - 1, Math.ceil(intersections[index + 1]))

      for (let x = xStart; x <= xEnd; x += 1) {
        setPixel(canvas, x, y, color)
      }
    }
  }
}

function setPixel(canvas, x, y, color) {
  const index = (Math.floor(y) * canvas.width + Math.floor(x)) * 4

  canvas.data[index] = color[0]
  canvas.data[index + 1] = color[1]
  canvas.data[index + 2] = color[2]
  canvas.data[index + 3] = color[3]
}

function writePng(canvas, width, height, filename) {
  const raw = Buffer.alloc((width * 4 + 1) * height)

  for (let y = 0; y < height; y += 1) {
    raw[y * (width * 4 + 1)] = 0
    canvas.data.copy(raw, y * (width * 4 + 1) + 1, y * width * 4, (y + 1) * width * 4)
  }

  const header = Buffer.alloc(13)
  header.writeUInt32BE(width, 0)
  header.writeUInt32BE(height, 4)
  header[8] = 8
  header[9] = 6

  writeFileSync(
    filename,
    Buffer.concat([
      Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
      chunk('IHDR', header),
      chunk('IDAT', deflateSync(raw, { level: 9 })),
      chunk('IEND', Buffer.alloc(0)),
    ]),
  )
}

function chunk(type, payload) {
  const length = Buffer.alloc(4)
  length.writeUInt32BE(payload.length)

  const name = Buffer.from(type)
  const checksum = Buffer.alloc(4)
  checksum.writeUInt32BE(crc32(Buffer.concat([name, payload])) >>> 0)

  return Buffer.concat([length, name, payload, checksum])
}

function crc32(buffer) {
  let value = ~0

  for (let index = 0; index < buffer.length; index += 1) {
    value ^= buffer[index]

    for (let bit = 0; bit < 8; bit += 1) {
      value = value & 1 ? 0xedb88320 ^ (value >>> 1) : value >>> 1
    }
  }

  return ~value
}
