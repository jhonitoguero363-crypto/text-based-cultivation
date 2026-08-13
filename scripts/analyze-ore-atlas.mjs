import sharp from 'sharp'
import fs from 'fs'

const src = 'd:/project/text-based-cultivation/src/assets/ores/atlas.png'
const { data, info } = await sharp(src).ensureAlpha().raw().toBuffer({ resolveWithObject: true })
const { width, height, channels } = info
console.log({ width, height, channels })

function lum(x, y) {
  const i = (y * width + x) * channels
  return 0.2126 * data[i] + 0.7152 * data[i + 1] + 0.0722 * data[i + 2]
}

// horizontal / vertical energy of bright pixels (icons glow)
const colScore = new Array(width).fill(0)
const rowScore = new Array(height).fill(0)
for (let y = 0; y < height; y++) {
  for (let x = 0; x < width; x++) {
    const L = lum(x, y)
    if (L > 40) {
      colScore[x] += L
      rowScore[y] += L
    }
  }
}

function findBands(scores, minGap = 4, minWidth = 20) {
  const thr = Math.max(...scores) * 0.12
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
  // merge close bands
  const merged = []
  for (const b of bands) {
    if (!merged.length || b[0] - merged[merged.length - 1][1] > minGap) merged.push(b)
    else merged[merged.length - 1][1] = b[1]
  }
  return merged
}

const cols = findBands(colScore, 2, 18)
const rows = findBands(rowScore, 2, 18)
console.log('cols', cols.length, cols.slice(0, 16))
console.log('rows', rows.length, rows)

// save debug projection
const maxC = Math.max(...colScore)
const maxR = Math.max(...rowScore)
fs.writeFileSync(
  'd:/project/text-based-cultivation/src/assets/ores/_proj.json',
  JSON.stringify(
    {
      cols: cols.map(([a, b]) => ({ a, b, w: b - a + 1 })),
      rows: rows.map(([a, b]) => ({ a, b, h: b - a + 1 })),
      colThrSample: colScore.filter((_, i) => i % 20 === 0).map((v, i) => [i * 20, Math.round(v)])
    },
    null,
    2
  )
)
console.log('wrote _proj.json')
