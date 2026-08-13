/**
 * 从修仙矿石图鉴 atlas 切片，生成单矿图标与名称映射。
 * 布局依据图鉴：左侧品阶条 + 每行最多 12 格，格内为图标，名称在行间暗区。
 */
import fs from 'fs'
import path from 'path'
import sharp from 'sharp'

const ROOT = 'd:/project/text-based-cultivation'
const ATLAS = path.join(ROOT, 'src/assets/ores/atlas.png')
const OUT_DIR = path.join(ROOT, 'src/assets/ores/icons')
const MAP_FILE = path.join(ROOT, 'src/constants/ore-icons.ts')

/** 图标列（不含左侧品阶文字） */
const COLS = [
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

/** 图标行（标题行 / 页脚书法行已排除） */
const ROWS = [
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

/**
 * 与图鉴从左到右、从上到下一致。
 * 部分图注与目录略有差异，见 ALIASES。
 */
const GRID = [
  // 灵矿
  ['青云铁', '青灵石', '寒铁矿', '聚灵石', '温玉矿', '灵晶砂', '青木灵石', '镇魂石', '玄钢矿', '幽冥砂', '月影石', '寒魄石'],
  // 高阶灵矿
  ['紫云铁', '天青石', '星纹铁', '紫灵晶', '九转灵晶', '聚灵玉', '青木晶', '灵髓石', '月华石', '山岳玄铁', '厚土晶高阶', '镇山石'],
  // 神矿
  ['赤金矿', '炎阳晶', '火云石', '金乌灵晶', '熔岩精金', '太阴石', '玄冰晶', '月魄玉', '幽月银', '寒星石', '金灵晶', '玄水晶'],
  ['赤炎晶', '厚土晶', '五行灵玉', '通天玄铁', '星陨铁', '天青神石', '剑魂晶', '庚金精魄', '紫霄铁', '九龙炎晶', '赤炎神铁', '火龙玉'],
  // 仙矿
  ['斩仙神铁', '庚金神晶', '太白精金', '天外陨铁', '杀伐晶', '仙纹铁', '太虚石', '虚空晶', '星辰铁', '空冥石', '天河神砂', '空间灵髓'],
  ['星界晶', '万魂石', '幽冥铁', '魂晶', '阴煞石', '九幽玄晶', '冥河砂', '空冥玉', '空间神石', '镜魂晶', '太虚银', '界石'],
  // 道矿
  ['时光石', '岁月晶', '星河砂', '时间神砂', '轮回玉', '因果石', '天命晶', '玄天玉', '道纹金', '命运神砂', '因果神铁', '太阳精金'],
  ['阴阳玉', '乾坤石', '两仪晶', '道韵金', '混沌石', '混沌神晶', '鸿蒙玄铁', '太初金', '虚无石', '道源晶', '混元神金', '诛仙神铁'],
  // 镇界神材
  ['山河神石', '乾坤玉', '世界晶', '地脉神髓', '五行神石', '空间道晶', '六道石', '轮回神晶', '幽冥神晶', '黄泉石', '生死玄金', '轮回神砂'],
  ['魂道晶', '天机石', '星命晶', '紫微神玉', '因果玄金', '天演石', '命运晶'],
  // 天材
  ['九天雷晶', '紫霄神铁', '雷劫石', '天雷精金', '雷神晶', '紫电玉', '追命神铁', '天命石', '因果晶', '杀伐神金', '命运遗石', '天劫石'],
  ['雷霆神晶', '九天玄铁', '紫霄玉', '避劫神金', '天雷石'],
  // 先天神材
  ['鸿蒙神石', '太初神金', '虚无道石', '鸿蒙紫玉', '世界本源晶', '天道石', '天机神晶', '因果道金', '命运神玉', '法则晶', '星辰道石', '天道本源']
]

/** 目录名 → 图鉴切片名 */
const ALIASES = {
  玄铜矿: '玄钢矿',
  镇魂晶: '镜魂晶',
  遁源晶: '道源晶',
  避纹金: '道纹金',
  避韵金: '道韵金'
}

/** 品阶缺图时的回退图标（用该阶第一枚） */
const LEVEL_FALLBACK = {
  灵矿: '青云铁',
  高阶灵矿: '紫云铁',
  神矿: '赤金矿',
  仙矿: '斩仙神铁',
  道矿: '时光石',
  镇界神材: '山河神石',
  天材: '九天雷晶',
  先天神材: '鸿蒙神石',
  先天道材: '鸿蒙神石',
  本源: '天道本源'
}

function slug(name) {
  // 文件名用序号，避免编码问题；映射表用中文名
  return name
}

fs.mkdirSync(OUT_DIR, { recursive: true })

const nameToFile = {}
let index = 0

for (let r = 0; r < GRID.length; r++) {
  const rowNames = GRID[r]
  const [y0, y1] = ROWS[r]
  for (let c = 0; c < rowNames.length; c++) {
    const name = rowNames[c]
    if (!name) continue
    const [x0, x1] = COLS[c]
    const left = x0
    const top = y0
    const width = x1 - x0 + 1
    const height = y1 - y0 + 1
    const file = `ore-${String(index + 1).padStart(3, '0')}.png`
    await sharp(ATLAS)
      .extract({ left, top, width, height })
      .resize(96, 96, {
        fit: 'contain',
        background: { r: 14, g: 20, b: 36, alpha: 1 }
      })
      .png()
      .toFile(path.join(OUT_DIR, file))
    nameToFile[name] = file
    index += 1
  }
}

// 写 TypeScript 映射
const lines = []
lines.push('/** 矿石图标：由 scripts/slice-ore-icons.mjs 自图鉴切片生成 */')
lines.push('')
lines.push("export const ORE_ICON_DIR = '/assets/ores/icons'")
lines.push('')
lines.push('/** 图鉴切片名 → 文件名 */')
lines.push('export const ORE_ICON_FILES: Record<string, string> = {')
for (const [name, file] of Object.entries(nameToFile)) {
  lines.push(`  '${name}': '${file}',`)
}
lines.push('}')
lines.push('')
lines.push('/** 目录名与图鉴名差异 */')
lines.push('export const ORE_ICON_ALIASES: Record<string, string> = {')
for (const [a, b] of Object.entries(ALIASES)) {
  lines.push(`  '${a}': '${b}',`)
}
lines.push('}')
lines.push('')
lines.push('export const ORE_LEVEL_ICON_FALLBACK: Record<string, string> = {')
for (const [a, b] of Object.entries(LEVEL_FALLBACK)) {
  lines.push(`  '${a}': '${b}',`)
}
lines.push('}')
lines.push('')
lines.push('export function resolveOreIconName(name: string, level?: string): string | null {')
lines.push('  if (ORE_ICON_FILES[name]) return name')
lines.push('  const alias = ORE_ICON_ALIASES[name]')
lines.push('  if (alias && ORE_ICON_FILES[alias]) return alias')
lines.push('  if (level) {')
lines.push('    const fb = ORE_LEVEL_ICON_FALLBACK[level]')
lines.push('    if (fb && ORE_ICON_FILES[fb]) return fb')
lines.push('  }')
lines.push('  return null')
lines.push('}')
lines.push('')
lines.push('/** 返回可用于 <image src> 的路径；无图时返回空串 */')
lines.push('export function getOreIconSrc(name: string, level?: string): string {')
lines.push('  const key = resolveOreIconName(name, level)')
lines.push('  if (!key) return \'\'')
lines.push('  const file = ORE_ICON_FILES[key]')
lines.push('  // Vite / Taro：用相对 assets 的 import 映射更稳，见 OreIcon 组件')
lines.push('  return `${ORE_ICON_DIR}/${file}`')
lines.push('}')
lines.push('')

fs.writeFileSync(MAP_FILE, lines.join('\n'), 'utf8')

console.log(`sliced ${index} icons → ${OUT_DIR}`)
console.log(`map → ${MAP_FILE}`)

// 校验目录覆盖
const catalog = fs.readFileSync(path.join(ROOT, 'src/constants/ore-catalog.ts'), 'utf8')
const re = /"name": "([^"]+)",\s*"level": "([^"]+)"/g
let m
const missing = []
while ((m = re.exec(catalog))) {
  const name = m[1]
  const level = m[2]
  const key = nameToFile[name] || nameToFile[ALIASES[name]] || nameToFile[LEVEL_FALLBACK[level]]
  if (!nameToFile[name] && !nameToFile[ALIASES[name]]) {
    missing.push(`${name}(${level})→${key ? 'fallback' : 'NONE'}`)
  }
}
console.log('catalog missing exact icon:', missing.length)
console.log(missing.slice(0, 40).join('\n'))
