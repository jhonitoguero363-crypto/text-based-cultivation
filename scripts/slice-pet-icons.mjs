/**
 * 从修仙灵宠图鉴 atlas 切片。前九境每行 4 格，飞升行 5 格。
 * 裁切后按发光内容重心裁成正方形，避免横条偏移。
 */
import fs from 'fs'
import path from 'path'
import sharp from 'sharp'

const ROOT = 'd:/project/text-based-cultivation'
const ATLAS = path.join(ROOT, 'src/assets/pets/atlas.png')
const OUT_DIR = path.join(ROOT, 'src/assets/pets/icons')
const MAP_FILE = path.join(ROOT, 'src/constants/pet-icons.ts')

const CONTENT_LEFT = 88
const CONTENT_RIGHT = 930

function makeCols(n) {
  const span = CONTENT_RIGHT - CONTENT_LEFT
  const cell = span / n
  const gap = 6
  const cols = []
  for (let i = 0; i < n; i++) {
    const a = Math.round(CONTENT_LEFT + i * cell + gap / 2)
    const b = Math.round(CONTENT_LEFT + (i + 1) * cell - gap / 2)
    cols.push([a, b])
  }
  return cols
}

const COLS4 = makeCols(4)
const COLS5 = makeCols(5)

const ROWS = [
  [77, 167],
  [179, 261],
  [269, 357],
  [358, 445],
  [453, 537],
  [538, 622],
  [643, 724],
  [733, 819],
  [827, 912],
  [921, 1004]
]

const GRID = [
  ['青灵狐', '赤焰兔', '金羽雀', '月影猫'],
  ['紫电貂', '玄甲龟', '碧水蛇', '赤炎狼'],
  ['金翅鹰', '寒月狐', '炎麟兽', '九尾灵猫'],
  ['青木龙', '玄冰蛟', '雷霆虎', '九幽狼'],
  ['赤焰真龙', '太阴玉兔', '九天鹏', '幽冥凤凰'],
  ['虚空兽', '星辰龙', '轮回蝶', '太虚鲲'],
  ['混沌麒麟', '阴阳神凰', '九天应龙', '万灵树妖'],
  ['鸿蒙祖龙', '造化神蝶', '九尾天狐', '太初玄龟'],
  ['九天雷龙', '轮回神凰', '天命麒麟', '虚无神鲲'],
  ['鸿蒙神龙', '混沌凤凰', '无极天狐', '世界树灵', '太初麒麟']
]

const ALIASES = {
  碧水蛇王: '碧水蛇',
  赤炎狼王: '赤炎狼',
  金翅妖鹰: '金翅鹰',
  寒月狐王: '寒月狐',
  炎鳞兽: '炎麟兽',
  雷霆虎王: '雷霆虎',
  九幽狼王: '九幽狼',
  九天鹏王: '九天鹏',
  空空兽: '虚空兽',
  阴阳神凤: '阴阳神凰'
}

const REALM_FALLBACK = {
  炼气: '青灵狐',
  筑基: '紫电貂',
  金丹: '金翅鹰',
  元婴: '青木龙',
  化神: '赤焰真龙',
  炼虚: '虚空兽',
  合体: '混沌麒麟',
  大乘: '鸿蒙祖龙',
  渡劫: '九天雷龙',
  飞升: '鸿蒙神龙'
}

async function contentSquareCrop(buf) {
  const { data, info } = await sharp(buf).ensureAlpha().raw().toBuffer({ resolveWithObject: true })
  const { width, height, channels } = info
  let sumX = 0
  let sumY = 0
  let n = 0
  let minX = width
  let maxX = 0
  let minY = height
  let maxY = 0
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const i = (y * width + x) * channels
      const L = 0.2126 * data[i] + 0.7152 * data[i + 1] + 0.0722 * data[i + 2]
      if (L > 42) {
        sumX += x
        sumY += y
        n += 1
        minX = Math.min(minX, x)
        maxX = Math.max(maxX, x)
        minY = Math.min(minY, y)
        maxY = Math.max(maxY, y)
      }
    }
  }
  if (!n) {
    const side = Math.min(width, height)
    return {
      left: Math.floor((width - side) / 2),
      top: Math.floor((height - side) / 2),
      width: side,
      height: side
    }
  }
  const cx = sumX / n
  const cy = sumY / n
  const bw = maxX - minX + 1
  const bh = maxY - minY + 1
  let side = Math.max(bw, bh)
  side = Math.min(Math.max(side + 8, Math.min(width, height) * 0.55), Math.min(width, height))
  let left = Math.round(cx - side / 2)
  let top = Math.round(cy - side / 2)
  left = Math.max(0, Math.min(left, width - side))
  top = Math.max(0, Math.min(top, height - side))
  return { left, top, width: Math.round(side), height: Math.round(side) }
}

fs.mkdirSync(OUT_DIR, { recursive: true })

const nameToFile = {}
let index = 0

for (let r = 0; r < GRID.length; r++) {
  const rowNames = GRID[r]
  const cols = rowNames.length === 5 ? COLS5 : COLS4
  const [y0, y1] = ROWS[r]
  for (let c = 0; c < rowNames.length; c++) {
    const name = rowNames[c]
    const [x0, x1] = cols[c]
    const file = `pet-${String(index + 1).padStart(3, '0')}.png`
    const pad = 2
    const left = x0 + pad
    const top = y0 + pad
    const width = x1 - x0 + 1 - pad * 2
    const height = y1 - y0 + 1 - pad * 2
    const cellBuf = await sharp(ATLAS)
      .extract({ left, top, width, height })
      .png()
      .toBuffer()
    const box = await contentSquareCrop(cellBuf)
    await sharp(cellBuf)
      .extract(box)
      .resize(96, 96, {
        fit: 'cover',
        position: 'centre',
        background: { r: 14, g: 20, b: 36, alpha: 1 }
      })
      .png()
      .toFile(path.join(OUT_DIR, file))
    nameToFile[name] = file
    index += 1
  }
}

const lines = []
lines.push('/** 灵宠图标：由 scripts/slice-pet-icons.mjs 自图鉴切片生成 */')
lines.push('')
lines.push('export const PET_ICON_FILES: Record<string, string> = {')
for (const [name, file] of Object.entries(nameToFile)) {
  lines.push(`  '${name}': '${file}',`)
}
lines.push('}')
lines.push('')
lines.push('export const PET_ICON_ALIASES: Record<string, string> = {')
for (const [a, b] of Object.entries(ALIASES)) {
  lines.push(`  '${a}': '${b}',`)
}
lines.push('}')
lines.push('')
lines.push('export const PET_REALM_ICON_FALLBACK: Record<string, string> = {')
for (const [a, b] of Object.entries(REALM_FALLBACK)) {
  lines.push(`  '${a}': '${b}',`)
}
lines.push('}')
lines.push('')
lines.push('export function resolvePetIconName(name: string, realm?: string): string | null {')
lines.push('  if (PET_ICON_FILES[name]) return name')
lines.push('  const alias = PET_ICON_ALIASES[name]')
lines.push('  if (alias && PET_ICON_FILES[alias]) return alias')
lines.push('  if (realm) {')
lines.push('    const fb = PET_REALM_ICON_FALLBACK[realm]')
lines.push('    if (fb && PET_ICON_FILES[fb]) return fb')
lines.push('  }')
lines.push('  return null')
lines.push('}')
lines.push('')

fs.writeFileSync(MAP_FILE, lines.join('\n'), 'utf8')
console.log(`sliced ${index} icons`)
const missing = []
const catalog = fs.readFileSync(path.join(ROOT, 'src/constants/pet-catalog.ts'), 'utf8')
const re = /"name": "([^"]+)"/g
let m
while ((m = re.exec(catalog))) {
  if (!nameToFile[m[1]]) missing.push(m[1])
}
console.log('missing', missing.length, missing.join(','))
