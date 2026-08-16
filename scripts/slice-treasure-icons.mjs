/**
 * 从法宝图鉴 atlas 切片（4 行 × 8 列，共 32 件）。
 */
import fs from 'fs'
import path from 'path'
import sharp from 'sharp'

const ROOT = 'd:/project/text-based-cultivation'
const ATLAS = path.join(ROOT, 'src/assets/treasures/atlas.png')
const OUT_DIR = path.join(ROOT, 'src/assets/treasures/icons')
const MAP_FILE = path.join(ROOT, 'src/constants/treasure-icons.ts')

/** 4×8 网格中心点，按从左到右、从上到下 */
const CELLS = [
  // row 1
  { name: '青竹剑', x: 64, y: 90, half: 50 },
  { name: '聚灵葫', x: 192, y: 90, half: 50 },
  { name: '镇魂铃', x: 318, y: 95, half: 50 },
  { name: '紫云剑', x: 442, y: 95, half: 50 },
  { name: '九转灵珠', x: 570, y: 100, half: 50 },
  { name: '山河印', x: 700, y: 100, half: 50 },
  { name: '金乌羽', x: 825, y: 95, half: 50 },
  { name: '太阴镜', x: 955, y: 95, half: 50 },
  // row 2
  { name: '五行轮', x: 64, y: 320, half: 50 },
  { name: '通天剑匣', x: 190, y: 325, half: 50 },
  { name: '九龙神火罩', x: 318, y: 335, half: 50 },
  { name: '玄冥珠', x: 445, y: 335, half: 50 },
  { name: '斩仙飞刀', x: 570, y: 335, half: 50 },
  { name: '太虚神舟', x: 700, y: 340, half: 50 },
  { name: '万魂幡', x: 825, y: 330, half: 50 },
  { name: '虚空镜', x: 955, y: 335, half: 50 },
  // row 3
  { name: '时砂', x: 64, y: 580, half: 50 },
  { name: '因果笔', x: 190, y: 570, half: 50 },
  { name: '阴阳天盘', x: 318, y: 570, half: 50 },
  { name: '混沌钟', x: 445, y: 570, half: 50 },
  { name: '诛仙剑阵', x: 570, y: 580, half: 50 },
  { name: '山河社稷图', x: 700, y: 570, half: 50 },
  { name: '六道轮回盘', x: 825, y: 575, half: 50 },
  { name: '天机榜', x: 955, y: 565, half: 50 },
  // row 4
  { name: '九天雷印', x: 70, y: 840, half: 50 },
  { name: '逆命剑', x: 195, y: 845, half: 50 },
  { name: '天劫伞', x: 320, y: 835, half: 50 },
  { name: '鸿蒙珠', x: 445, y: 830, half: 50 },
  { name: '天道书', x: 575, y: 845, half: 50 },
  { name: '无名道碑', x: 700, y: 830, half: 50 },
  { name: '无极道碑', x: 825, y: 830, half: 50 },
  { name: '太初神剑', x: 955, y: 825, half: 50 }
]

const ALIASES = {
  青竹剑器: '青竹剑',
  聚灵葫芦: '聚灵葫',
  山河社稷图卷: '山河社稷图'
}

/** 品阶缺图时的回退图标（自定义打造名） */
const GRADE_FALLBACK = {
  下品法器: '青竹剑',
  中品法器: '紫云剑',
  上品法器: '山河印',
  法器: '青竹剑',
  灵器: '金乌羽',
  极品灵器: '通天剑匣',
  仙器: '斩仙飞刀',
  道器: '阴阳天盘',
  镇界神器: '山河社稷图',
  先天至宝: '鸿蒙珠'
}

fs.mkdirSync(OUT_DIR, { recursive: true })

// 统一转成真 PNG，避免 jpeg 伪装扩展名
await sharp(ATLAS).png().toFile(path.join(ROOT, 'src/assets/treasures/_atlas_tmp.png'))
fs.renameSync(path.join(ROOT, 'src/assets/treasures/_atlas_tmp.png'), ATLAS)

const meta = await sharp(ATLAS).metadata()
const w = meta.width || 1024
const h = meta.height || 1024

const nameToFile = {}
let index = 0

for (const cell of CELLS) {
  const half = cell.half
  const left = Math.max(0, Math.round(cell.x - half))
  const top = Math.max(0, Math.round(cell.y - half))
  const size = half * 2
  const file = `treasure-${String(index + 1).padStart(3, '0')}.png`
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
lines.push('/** 法宝图标：由 scripts/slice-treasure-icons.mjs 自图鉴切片生成 */')
lines.push('')
lines.push('/** 图鉴切片名 → 文件名 */')
lines.push('export const TREASURE_ICON_FILES: Record<string, string> = {')
for (const [name, file] of Object.entries(nameToFile)) {
  lines.push(`  '${name}': '${file}',`)
}
lines.push('}')
lines.push('')
lines.push('export const TREASURE_ICON_ALIASES: Record<string, string> = {')
for (const [a, b] of Object.entries(ALIASES)) {
  lines.push(`  '${a}': '${b}',`)
}
lines.push('}')
lines.push('')
lines.push('export const TREASURE_GRADE_ICON_FALLBACK: Record<string, string> = {')
for (const [a, b] of Object.entries(GRADE_FALLBACK)) {
  lines.push(`  '${a}': '${b}',`)
}
lines.push('}')
lines.push('')
lines.push('export function resolveTreasureIconName(name: string, grade?: string): string | null {')
lines.push('  if (TREASURE_ICON_FILES[name]) return name')
lines.push('  const alias = TREASURE_ICON_ALIASES[name]')
lines.push('  if (alias && TREASURE_ICON_FILES[alias]) return alias')
lines.push('  if (grade) {')
lines.push('    const fb = TREASURE_GRADE_ICON_FALLBACK[grade]')
lines.push('    if (fb && TREASURE_ICON_FILES[fb]) return fb')
lines.push('  }')
lines.push('  return null')
lines.push('}')
lines.push('')

fs.writeFileSync(MAP_FILE, lines.join('\n'), 'utf8')
console.log(`sliced ${index} icons → ${OUT_DIR}`)

const catalog = fs.readFileSync(path.join(ROOT, 'src/constants/treasure-catalog.ts'), 'utf8')
const names = [...catalog.matchAll(/name: '([^']+)'/g)].map((m) => m[1])
const miss = names.filter((n) => !nameToFile[n] && !nameToFile[ALIASES[n]])
console.log('catalog', names.length, 'missing', miss)
