import sharp from 'sharp'
import fs from 'fs'

const src = 'd:/project/text-based-cultivation/src/assets/herbs/atlas.png'
const { data, info } = await sharp(src).ensureAlpha().raw().toBuffer({ resolveWithObject: true })
const { width, height, channels } = info
console.log({ width, height })

function lum(x, y) {
  const i = (y * width + x) * channels
  return 0.2126 * data[i] + 0.7152 * data[i + 1] + 0.0722 * data[i + 2]
}

const colScore = new Array(width).fill(0)
const rowScore = new Array(height).fill(0)
for (let y = 0; y < height; y++) {
  for (let x = 0; x < width; x++) {
    const L = lum(x, y)
    if (L > 45) {
      colScore[x] += L
      rowScore[y] += L
    }
  }
}

function findBands(scores, minGap = 2, minWidth = 14) {
  const thr = Math.max(...scores) * 0.1
  const bands = []
  let start = -1
  for (let i = 0; i < scores.length; i++) {
    if (scores[i] > thr) {
      if (start < 0) start = i
    } else if (start >= 0) {
      if (i - start >= minWidth) bands.push([start, i - 1])
      start = -1
    }
  }
  if (start >= 0 && scores.length - start >= minWidth) bands.push([start, scores.length - 1])
  const merged = []
  for (const b of bands) {
    if (!merged.length || b[0] - merged[merged.length - 1][1] > minGap) merged.push([...b])
    else merged[merged.length - 1][1] = b[1]
  }
  return merged
}

const cols = findBands(colScore, 2, 12)
const rows = findBands(rowScore, 2, 12)
console.log(
  'cols',
  cols.length,
  cols.map(([a, b]) => [a, b, b - a + 1])
)
console.log(
  'rows',
  rows.length,
  rows.map(([a, b]) => [a, b, b - a + 1])
)

fs.writeFileSync(
  'd:/project/text-based-cultivation/src/assets/herbs/_proj.json',
  JSON.stringify({ cols, rows }, null, 2)
)

const out = 'd:/project/text-based-cultivation/src/assets/herbs/_preview'
fs.mkdirSync(out, { recursive: true })
// export icon-ish rows (skip title): take rows with height ~30-60
const iconCols = cols.filter(([, , ,] = []) => true).slice(1) // drop left label if narrow
const narrow = cols[0] && cols[0][1] - cols[0][0] < 40
const useCols = narrow ? cols.slice(1) : cols
console.log('useCols', useCols.length, useCols)

for (let r = 0; r < Math.min(rows.length, 12); r++) {
  const [y0, y1] = rows[r]
  if (y1 - y0 < 20) continue
  await sharp(src)
    .extract({
      left: useCols[0][0] - 2,
      top: Math.max(0, y0 - 2),
      width: Math.min(width - (useCols[0][0] - 2), useCols[useCols.length - 1][1] - useCols[0][0] + 8),
      height: Math.min(height - y0, y1 - y0 + 4)
    })
    .png()
    .toFile(`${out}/row${r}.png`)
}
console.log('preview rows written')
