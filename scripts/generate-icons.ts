import sharp from 'sharp'
import { writeFileSync, mkdirSync, existsSync } from 'fs'
import { join } from 'path'

const ICONS_DIR = join(process.cwd(), 'public', 'icons')

// Ensure icons directory exists
if (!existsSync(ICONS_DIR)) {
  mkdirSync(ICONS_DIR, { recursive: true })
}

// SVG icon with LocalSwap branding - a swap/exchange icon
const createSvgIcon = (size: number) => `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}" width="${size}" height="${size}">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#34945a"/>
      <stop offset="100%" style="stop-color:#2D7D46"/>
    </linearGradient>
  </defs>
  <!-- Background -->
  <rect width="${size}" height="${size}" rx="${size * 0.188}" fill="url(#bg)"/>

  <!-- Swap arrows icon -->
  <g transform="translate(${size * 0.15}, ${size * 0.15}) scale(${size / 512 * 0.7})">
    <!-- Left arrow (going up) -->
    <path d="M180 380 L180 180 L120 240"
          fill="none"
          stroke="white"
          stroke-width="40"
          stroke-linecap="round"
          stroke-linejoin="round"/>

    <!-- Right arrow (going down) -->
    <path d="M332 132 L332 332 L392 272"
          fill="none"
          stroke="white"
          stroke-width="40"
          stroke-linecap="round"
          stroke-linejoin="round"/>

    <!-- Connecting dots -->
    <circle cx="180" cy="380" r="24" fill="white"/>
    <circle cx="332" cy="132" r="24" fill="white"/>
  </g>
</svg>
`

async function generateIcons() {
  const sizes = [192, 512]

  for (const size of sizes) {
    const svg = createSvgIcon(size)
    const pngBuffer = await sharp(Buffer.from(svg))
      .png()
      .toBuffer()

    const filename = `icon-${size}.png`
    writeFileSync(join(ICONS_DIR, filename), pngBuffer)
    console.log(`Generated ${filename}`)
  }

  // Also generate apple-touch-icon (180x180)
  const appleSvg = createSvgIcon(180)
  const appleBuffer = await sharp(Buffer.from(appleSvg))
    .png()
    .toBuffer()
  writeFileSync(join(ICONS_DIR, 'apple-touch-icon.png'), appleBuffer)
  console.log('Generated apple-touch-icon.png')

  // Generate favicon (32x32)
  const faviconSvg = createSvgIcon(32)
  const faviconBuffer = await sharp(Buffer.from(faviconSvg))
    .png()
    .toBuffer()
  writeFileSync(join(ICONS_DIR, 'favicon-32x32.png'), faviconBuffer)
  console.log('Generated favicon-32x32.png')

  // Generate favicon.ico (16x16)
  const favicon16Svg = createSvgIcon(16)
  const favicon16Buffer = await sharp(Buffer.from(favicon16Svg))
    .png()
    .toBuffer()
  writeFileSync(join(ICONS_DIR, 'favicon-16x16.png'), favicon16Buffer)
  console.log('Generated favicon-16x16.png')

  console.log('\nAll icons generated successfully!')
}

generateIcons().catch(console.error)
