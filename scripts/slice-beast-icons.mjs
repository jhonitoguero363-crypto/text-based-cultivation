/**
 * 从修仙妖兽图鉴 atlas 切片，生成图标与名称映射。
 */
import fs from 'fs'
import path from 'path'
import sharp from 'sharp'

const ROOT = 'd:/project/text-based-cultivation'
const ATLAS = path.join(ROOT, 'src/assets/beasts/atlas.png')
const OUT_DIR = path.join(ROOT, 'src/assets/beasts/icons')
const MAP_FILE = path.join(ROOT, 'src/constants/beast-icons.ts')

/** 6 图标列（跳过左侧境界竖条） */
const COLS = [
  [55, 156],
  [170, 269],
  [284, 387],
  [399, 502],
  [515, 617],
  [631, 735]
]

/** 10 境界行（跳过标题） */
const ROWS = [
  [88, 161],
  [184, 258],
  [285, 358],
  [385, 456],
  [478, 556],
  [581, 652],
  [678, 750],
  [774, 846],
  [869, 921],
  [942, 1009]
]

/** 与目录 / 图鉴一致：每境 6 只，从左到右 */
const GRID = [
  ['青风狼', '赤焰兔', '黑纹蛇', '青灵狐', '铁甲熊', '月影猫'],
  ['赤炎狼王', '紫电貂', '玄甲龟', '碧水蛇王', '狂暴猿', '风翼雕'],
  ['金翅妖鹰', '寒月狐王', '炎麟兽', '九尾灵猫', '黑水蛟', '大地魔熊'],
  ['青木龙', '玄冰蛟', '雷霆虎王', '九幽狼王', '赤金狮王', '龙血猿'],
  ['赤焰真龙', '太阴玉兔', '九天鹏王', '幽冥凤凰', '万毒蛛皇', '山岳巨猿'],
  ['虚空兽', '星辰龙', '轮回蝶', '太虚鲲', '岁月兽', '九幽冥龙'],
  ['混沌麒麟', '阴阳神凰', '九天应龙', '万灵树妖', '饕餮', '穷奇'],
  ['鸿蒙祖龙', '造化神蝶', '九尾天狐', '太初玄龟', '混沌魔猿', '鲲鹏祖兽'],
  ['九天雷龙', '轮回神凰', '天命麒麟', '虚无神鲲', '九幽魔龙', '混沌凶兽'],
  ['鸿蒙神龙', '混沌凤凰', '无极天狐', '世界树灵', '太初麒麟', '万道祖兽']
]

const ALIASES = {
  炎鳞兽: '炎麟兽',
  空空兽: '虚空兽',
  阴阳神凤: '阴阳神凰',
  吞噬: '万灵树妖',
  练气: '炼气'
}

const LEVEL_FALLBACK = {
  炼气: '青风狼',
  筑基: '赤炎狼王',
  金丹: '金翅妖鹰',
  元婴: '青木龙',
  化神: '赤焰真龙',
  炼虚: '虚空兽',
  合体: '混沌麒麟',
  大乘: '鸿蒙祖龙',
  渡劫: '九天雷龙',
  飞升: '鸿蒙神龙'
}

fs.mkdirSync(OUT_DIR, { recursive: true })

const nameToFile = {}
let index = 0

for (let r = 0; r < GRID.length; r++) {
  const rowNames = GRID[r]
  const [y0, y1] = ROWS[r]
  // 裁切偏上：避开底部名称/稀有度文字条
  const artBottom = y0 + Math.round((y1 - y0 + 1) * 0.78)
  for (let c = 0; c < rowNames.length; c++) {
    const name = rowNames[c]
    const [x0, x1] = COLS[c]
    const file = `beast-${String(index + 1).padStart(3, '0')}.png`
    // 略内缩，去掉边框与编号角标
    const padX = 6
    const padY = 8
    const left = x0 + padX
    const top = y0 + padY
    const width = x1 - x0 + 1 - padX * 2
    const height = artBottom - top
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

const lines = []
lines.push('/** 妖兽图标：由 scripts/slice-beast-icons.mjs 自图鉴切片生成 */')
lines.push('')
lines.push('export const BEAST_ICON_FILES: Record<string, string> = {')
for (const [name, file] of Object.entries(nameToFile)) {
  lines.push(`  '${name}': '${file}',`)
}
lines.push('}')
lines.push('')
lines.push('export const BEAST_ICON_ALIASES: Record<string, string> = {')
for (const [a, b] of Object.entries(ALIASES)) {
  if (a === '练气') continue
  lines.push(`  '${a}': '${b}',`)
}
lines.push('}')
lines.push('')
lines.push('export const BEAST_REALM_ICON_FALLBACK: Record<string, string> = {')
for (const [a, b] of Object.entries(LEVEL_FALLBACK)) {
  lines.push(`  '${a}': '${b}',`)
}
lines.push('}')
lines.push('')
lines.push('export function resolveBeastIconName(name: string, realm?: string): string | null {')
lines.push('  if (BEAST_ICON_FILES[name]) return name')
lines.push('  const alias = BEAST_ICON_ALIASES[name]')
lines.push('  if (alias && BEAST_ICON_FILES[alias]) return alias')
lines.push('  if (realm) {')
lines.push('    const fb = BEAST_REALM_ICON_FALLBACK[realm]')
lines.push('    if (fb && BEAST_ICON_FILES[fb]) return fb')
lines.push('  }')
lines.push('  return null')
lines.push('}')
lines.push('')

fs.writeFileSync(MAP_FILE, lines.join('\n'), 'utf8')
console.log(`sliced ${index} icons → ${OUT_DIR}`)

const catalog = fs.readFileSync(path.join(ROOT, 'src/constants/beast-catalog.ts'), 'utf8')
const re = /"name": "([^"]+)"/g
let m
const missing = []
while ((m = re.exec(catalog))) {
  if (!nameToFile[m[1]] && !nameToFile[ALIASES[m[1]]]) missing.push(m[1])
}
console.log('missing', missing.length, missing.join(','))
