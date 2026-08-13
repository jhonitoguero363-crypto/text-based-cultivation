import sharp from 'sharp'
import fs from 'fs'

const src = 'd:/project/text-based-cultivation/src/assets/ores/atlas.png'
const outDir = 'd:/project/text-based-cultivation/src/assets/ores/_preview'
fs.mkdirSync(outDir, { recursive: true })

const cols = [
  [73, 119],
  [149, 197],
  [225, 272],
  [303, 349],
  [380, 428],
  [456, 503],
  [534, 581],
  [613, 657],
  [688, 737],
  [766, 813],
  [840, 887],
  [914, 955]
]
const rows = [
  [61, 112],
  [141, 192],
  [221, 271],
  [296, 344],
  [371, 420],
  [445, 489],
  [513, 557],
  [579, 617],
  [641, 684],
  [706, 738],
  [764, 800],
  [825, 848],
  [873, 915]
]

// export first 3 rows x 4 cols + a couple later rows
const picks = []
for (let r = 0; r < Math.min(4, rows.length); r++) {
  for (let c = 0; c < 4; c++) picks.push([r, c])
}
picks.push([4, 0], [5, 0], [8, 0], [10, 0], [12, 0])

for (const [r, c] of picks) {
  const [x0, x1] = cols[c]
  const [y0, y1] = rows[r]
  const pad = 4
  const left = Math.max(0, x0 - pad)
  const top = Math.max(0, y0 - pad)
  const width = x1 - x0 + 1 + pad * 2
  const height = y1 - y0 + 1 + pad * 2
  await sharp(src)
    .extract({ left, top, width, height })
    .resize(128, 128, { fit: 'contain', background: { r: 14, g: 20, b: 36 } })
    .png()
    .toFile(`${outDir}/r${r}c${c}.png`)
}

// also full strip of row 0
await sharp(src)
  .extract({ left: 60, top: 55, width: 900, height: 65 })
  .png()
  .toFile(`${outDir}/row0.png`)

await sharp(src)
  .extract({ left: 60, top: 135, width: 900, height: 65 })
  .png()
  .toFile(`${outDir}/row1.png`)

console.log('preview written')
