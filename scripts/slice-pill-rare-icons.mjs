/**
 * 从坊市稀有丹药图鉴 atlas-rare 切片（布局：
 * 行1：五行灵根 ×8；行2：悟性×5 + 修炼×5；行3：战斗×6）
 * 输出 pill-042 起，合并进 pill-icons.ts（不删原丹阁切片）。
 */
import fs from 'fs'
import path from 'path'
import sharp from 'sharp'

const ROOT = 'd:/project/text-based-cultivation'
const ATLAS = path.join(ROOT, 'src/assets/pills/atlas-rare.jpg')
const OUT_DIR = path.join(ROOT, 'src/assets/pills/icons')
const MAP_FILE = path.join(ROOT, 'src/constants/pill-icons.ts')

/** 中心点坐标（自亮度峰值 + 人工校验） */
const CELLS = [
  // 行1 · 五行灵根
  { name: '五行洗髓丹', x: 46, y: 95, half: 46 },
  { name: '青木灵根丹', x: 176, y: 95, half: 46 },
  { name: '赤炎灵根丹', x: 307, y: 95, half: 46 },
  { name: '厚土灵根丹', x: 437, y: 95, half: 46 },
  { name: '庚金灵根丹', x: 577, y: 95, half: 46 },
  { name: '寒水灵根丹', x: 694, y: 95, half: 46 },
  { name: '五行归元丹', x: 832, y: 95, half: 46 },
  { name: '五行圣灵丹', x: 958, y: 95, half: 46 },
  // 行2 左 · 悟性
  { name: '开悟丹', x: 50, y: 275, half: 42 },
  { name: '明心丹', x: 147, y: 275, half: 42 },
  { name: '悟道丹', x: 249, y: 275, half: 42 },
  { name: '天悟丹', x: 355, y: 275, half: 42 },
  { name: '太初悟道丹', x: 461, y: 275, half: 42 },
  // 行2 右 · 修炼速度
  { name: '聚灵丹', x: 582, y: 275, half: 42 },
  { name: '聚元丹', x: 681, y: 275, half: 42 },
  { name: '天灵丹', x: 778, y: 275, half: 42 },
  { name: '悟道灵丹', x: 874, y: 275, half: 42 },
  { name: '鸿蒙聚灵丹', x: 971, y: 275, half: 42 },
  // 行3 · 战斗（含图鉴「金刚丹」，与丹阁同名条目共用新图）
  { name: '暴血丹', x: 85, y: 515, half: 46 },
  { name: '金刚丹', x: 248, y: 515, half: 46 },
  { name: '狂灵丹', x: 409, y: 515, half: 46 },
  { name: '战神丹', x: 575, y: 515, half: 46 },
  { name: '九转战魂丹', x: 720, y: 515, half: 46 },
  { name: '仙魔战神丹', x: 911, y: 515, half: 46 }
]

fs.mkdirSync(OUT_DIR, { recursive: true })

const meta = await sharp(ATLAS).metadata()
const w = meta.width || 1024
const h = meta.height || 633

/** 读取现有映射，保留丹阁 pill-001～041 */
const existingSrc = fs.readFileSync(MAP_FILE, 'utf8')
const existing = {}
for (const m of existingSrc.matchAll(/'([^']+)':\s*'([^']+\.png)'/g)) {
  existing[m[1]] = m[2]
}

let nextIndex = 42
for (const file of Object.values(existing)) {
  const n = Number((file.match(/pill-(\d+)/) || [])[1] || 0)
  if (n >= nextIndex) nextIndex = n + 1
}

const rareMap = {}
for (const cell of CELLS) {
  const half = cell.half
  const left = Math.max(0, Math.round(cell.x - half))
  const top = Math.max(0, Math.round(cell.y - half))
  const size = half * 2
  const file = `pill-${String(nextIndex).padStart(3, '0')}.png`
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
  rareMap[cell.name] = file
  nextIndex += 1
}

const merged = { ...existing, ...rareMap }

const ALIASES = {
  回元丹: '九转回元丹',
  九转丹: '九转回元丹'
}

const lines = []
lines.push('/** 丹药图标：丹阁 atlas + 坊市稀有 atlas-rare 切片 */')
lines.push('')
lines.push('/** 图鉴切片名 → 文件名 */')
lines.push('export const PILL_ICON_FILES: Record<string, string> = {')
for (const [name, file] of Object.entries(merged)) {
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
console.log(`sliced ${CELLS.length} rare icons → ${OUT_DIR}`)
console.log('total mapped', Object.keys(merged).length)

const rareCatalog = fs.readFileSync(path.join(ROOT, 'src/constants/pill-market-rare.ts'), 'utf8')
const rareNames = [...rareCatalog.matchAll(/name:\s*'([^']+)'/g)].map((m) => m[1])
const miss = rareNames.filter((n) => !merged[n])
console.log('rare catalog missing icons', miss)
