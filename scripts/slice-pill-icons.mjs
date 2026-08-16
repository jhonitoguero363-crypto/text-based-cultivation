/**
 * 从丹药图鉴 atlas 切片（5 行 × 8 列 + 末行 1 枚，共 41 件）。
 */
import fs from 'fs'
import path from 'path'
import sharp from 'sharp'

const ROOT = 'd:/project/text-based-cultivation'
const ATLAS = path.join(ROOT, 'src/assets/pills/atlas.png')
const OUT_DIR = path.join(ROOT, 'src/assets/pills/icons')
const MAP_FILE = path.join(ROOT, 'src/constants/pill-icons.ts')

/** 按图鉴从左到右、从上到下 */
const CELLS = [
  // row 1
  { name: '聚气丹', x: 71, y: 70, half: 46 },
  { name: '回灵丹', x: 196, y: 75, half: 46 },
  { name: '凝血丹', x: 310, y: 75, half: 46 },
  { name: '洗髓丹', x: 450, y: 70, half: 46 },
  { name: '筑基丹', x: 560, y: 75, half: 46 },
  { name: '养魂丹', x: 695, y: 70, half: 46 },
  { name: '紫灵丹', x: 810, y: 70, half: 46 },
  { name: '金刚丹', x: 955, y: 70, half: 46 },
  // row 2
  { name: '结金丹', x: 75, y: 255, half: 46 },
  { name: '赤阳丹', x: 190, y: 255, half: 46 },
  { name: '太阴丹', x: 310, y: 255, half: 46 },
  { name: '九转回元丹', x: 450, y: 255, half: 46 },
  { name: '婴灵丹', x: 575, y: 250, half: 46 },
  { name: '九窍养神丹', x: 695, y: 250, half: 46 },
  { name: '天魂丹', x: 825, y: 250, half: 46 },
  { name: '万灵丹', x: 955, y: 250, half: 46 },
  // row 3
  { name: '化神丹', x: 75, y: 420, half: 46 },
  { name: '天元丹', x: 195, y: 415, half: 46 },
  { name: '涅槃丹', x: 320, y: 415, half: 46 },
  { name: '九转玄丹', x: 440, y: 420, half: 46 },
  { name: '虚空丹', x: 575, y: 420, half: 46 },
  { name: '太虚悟道丹', x: 700, y: 415, half: 46 },
  { name: '逆命丹', x: 810, y: 420, half: 46 },
  { name: '九转轮回丹', x: 955, y: 420, half: 46 },
  // row 4
  { name: '合道丹', x: 65, y: 585, half: 46 },
  { name: '混元丹', x: 180, y: 585, half: 46 },
  { name: '阴阳造化丹', x: 320, y: 590, half: 46 },
  { name: '天命丹', x: 445, y: 585, half: 46 },
  { name: '大乘丹', x: 570, y: 585, half: 46 },
  { name: '万道丹', x: 695, y: 590, half: 46 },
  { name: '造化神丹', x: 830, y: 585, half: 46 },
  { name: '九天玄丹', x: 945, y: 595, half: 46 },
  // row 5
  { name: '渡劫丹', x: 70, y: 770, half: 46 },
  { name: '雷元丹', x: 185, y: 765, half: 46 },
  { name: '九死还魂丹', x: 320, y: 760, half: 46 },
  { name: '偷天丹', x: 440, y: 760, half: 46 },
  { name: '飞升丹', x: 575, y: 775, half: 46 },
  { name: '九转仙丹', x: 695, y: 775, half: 46 },
  { name: '鸿蒙悟道丹', x: 825, y: 765, half: 46 },
  { name: '太初神丹', x: 955, y: 775, half: 46 },
  // row 6
  { name: '无极道丹', x: 75, y: 930, half: 46 }
]

const ALIASES = {
  回元丹: '九转回元丹',
  九转丹: '九转回元丹'
}

fs.mkdirSync(OUT_DIR, { recursive: true })

await sharp(ATLAS).png().toFile(path.join(ROOT, 'src/assets/pills/_atlas_tmp.png'))
fs.renameSync(path.join(ROOT, 'src/assets/pills/_atlas_tmp.png'), ATLAS)

const meta = await sharp(ATLAS).metadata()
const w = meta.width || 1024
const h = meta.height || 1024

// 清空旧切片（旧图鉴可能多出 pill-042）
for (const file of fs.readdirSync(OUT_DIR)) {
  if (file.endsWith('.png')) fs.unlinkSync(path.join(OUT_DIR, file))
}

const nameToFile = {}
let index = 0

for (const cell of CELLS) {
  const half = cell.half
  const left = Math.max(0, Math.round(cell.x - half))
  const top = Math.max(0, Math.round(cell.y - half))
  const size = half * 2
  const file = `pill-${String(index + 1).padStart(3, '0')}.png`
  await sharp(ATLAS)
    .extract({
      left,
      top,
      width: Math.min(size, w - left),
      height: Math.min(size, h - top)
    })
    .resize(96, 96, {
      fit: 'contain',
      background: { r: 14, g: 20, b: 36, alpha: 1 }
    })
    .png()
    .toFile(path.join(OUT_DIR, file))
  nameToFile[cell.name] = file
  index += 1
}

const lines = []
lines.push('/** 丹药图标：由 scripts/slice-pill-icons.mjs 自图鉴切片生成 */')
lines.push('')
lines.push('/** 图鉴切片名 → 文件名 */')
lines.push('export const PILL_ICON_FILES: Record<string, string> = {')
for (const [name, file] of Object.entries(nameToFile)) {
  lines.push(`  '${name}': '${file}',`)
}
lines.push('}')
lines.push('')
lines.push('export const PILL_ICON_ALIASES: Record<string, string> = {')
for (const [a, b] of Object.entries(ALIASES)) {
  lines.push(`  '${a}': '${b}',`)
}
lines.push('}')
lines.push('')
lines.push('export function resolvePillIconName(name: string): string | null {')
lines.push('  if (PILL_ICON_FILES[name]) return name')
lines.push('  const alias = PILL_ICON_ALIASES[name]')
lines.push('  if (alias && PILL_ICON_FILES[alias]) return alias')
lines.push('  return null')
lines.push('}')
lines.push('')

fs.writeFileSync(MAP_FILE, lines.join('\n'), 'utf8')
console.log(`sliced ${index} icons → ${OUT_DIR}`)

const catalog = fs.readFileSync(path.join(ROOT, 'src/constants/pill-catalog.ts'), 'utf8')
const names = [...catalog.matchAll(/name: '([^']+丹[^']*)'/g)].map((m) => m[1])
const miss = names.filter((n) => !nameToFile[n] && !nameToFile[ALIASES[n]])
console.log('catalog pills', names.length, 'missing', miss)
