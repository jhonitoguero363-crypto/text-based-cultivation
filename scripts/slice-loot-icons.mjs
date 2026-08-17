/**
 * 从历练材料图鉴 atlas 切片（8 行 × 最多 12 列，共 94 种，对齐图鉴-材料名录）。
 */
import fs from 'fs'
import path from 'path'
import sharp from 'sharp'

const ROOT = 'd:/project/text-based-cultivation'
const ATLAS = path.join(ROOT, 'src/assets/loot/atlas.png')
const OUT_DIR = path.join(ROOT, 'src/assets/loot/icons')
const MAP_FILE = path.join(ROOT, 'src/constants/loot-icons.ts')

/** 图标中心（含标题行后的 8 内容行 × 12 列；末行仅 10 格） */
const COL_X = [42, 127, 212, 297, 382, 467, 552, 637, 722, 807, 892, 977]
const ROW_Y = [53, 128, 213, 294, 382, 467, 550, 630]
const HALF = 32

/** 与 docs/图鉴-材料.md / LOOT_MATERIALS 中文排序一致 */
const NAMES = [
  '本源晶',
  '赤金',
  '雕羽',
  '毒晶',
  '毒囊',
  '风雷晶',
  '风灵石',
  '凤凰本源',
  '凤凰羽',
  '龟灵丹',
  '鸿蒙龙鳞',
  '鸿蒙神晶',
  '狐皮',
  '狐尾',
  '虎骨',
  '幻道晶',
  '皇毒囊',
  '混沌本源',
  '混沌魔骨',
  '混沌神羽',
  '火灵草',
  '火灵晶',
  '蛟丹',
  '蛟龙鳞',
  '金翅',
  '空间晶',
  '鲲鹏羽',
  '鲲鹏祖羽',
  '狼王妖丹',
  '狼牙',
  '雷劫石',
  '雷晶',
  '雷灵石',
  '雷龙精血',
  '灵草',
  '龙骨',
  '龙魂',
  '龙鳞',
  '龙血',
  '轮回晶',
  '轮回神羽',
  '猫魂',
  '猫灵',
  '冥龙鳞',
  '魔道本源',
  '魔龙晶',
  '木灵髓',
  '涅槃石',
  '麒麟本源',
  '麒麟血',
  '穷奇骨',
  '山岳神骨',
  '蛇胆',
  '神蝶翅',
  '神凰羽',
  '神鲲骨',
  '神龙本源',
  '神血',
  '生命晶',
  '狮心',
  '世界本源',
  '世界木心',
  '世界树心',
  '水灵晶',
  '四象晶',
  '太初龟甲',
  '太初神晶',
  '太虚骨',
  '太阴晶',
  '饕餮骨',
  '天狐本源',
  '天狐尾',
  '天命石',
  '土灵晶',
  '吞噬晶',
  '万道晶',
  '无极晶',
  '星辰晶',
  '凶兽精血',
  '熊胆',
  '虚无道石',
  '玄甲',
  '炎麟晶',
  '妖丹',
  '应龙角',
  '幽冥晶',
  '幽冥狼牙',
  '猿骨',
  '月华晶',
  '月魄石',
  '造化晶',
  '真龙鳞',
  '祖龙精血',
  '祖兽本源'
]

const ALIASES = {
  神风羽: '神凰羽',
  色灵丹: '龟灵丹',
  狼骨: '猿骨'
}

fs.mkdirSync(OUT_DIR, { recursive: true })

const meta = await sharp(ATLAS).metadata()
const w = meta.width || 1024
const h = meta.height || 682

for (const file of fs.readdirSync(OUT_DIR)) {
  if (file.endsWith('.png')) fs.unlinkSync(path.join(OUT_DIR, file))
}

const nameToFile = {}
let index = 0

for (let r = 0; r < ROW_Y.length; r++) {
  for (let c = 0; c < COL_X.length; c++) {
    const name = NAMES[index]
    if (!name) break
    const x = COL_X[c]
    const y = ROW_Y[r]
    const left = Math.max(0, Math.round(x - HALF))
    const top = Math.max(0, Math.round(y - HALF - 4))
    const size = HALF * 2
    const file = `loot-${String(index + 1).padStart(3, '0')}.png`
    await sharp(ATLAS)
      .extract({
        left,
        top,
        width: Math.min(size, w - left),
        height: Math.min(size, h - top)
      })
      .resize(96, 96, { fit: 'cover', position: 'centre' })
      .png()
      .toFile(path.join(OUT_DIR, file))
    nameToFile[name] = file
    index += 1
  }
}

const lines = []
lines.push('/** 历练材料图标：由 scripts/slice-loot-icons.mjs 自 atlas 切片生成 */')
lines.push('')
lines.push('export const LOOT_ICON_FILES: Record<string, string> = {')
for (const [name, file] of Object.entries(nameToFile)) {
  lines.push(`  '${name}': '${file}',`)
}
lines.push('}')
lines.push('')
lines.push('export const LOOT_ICON_ALIASES: Record<string, string> = {')
for (const [a, b] of Object.entries(ALIASES)) {
  lines.push(`  '${a}': '${b}',`)
}
lines.push('}')
lines.push('')
lines.push('export function resolveLootIconName(name: string): string | null {')
lines.push('  if (LOOT_ICON_FILES[name]) return name')
lines.push('  const alias = LOOT_ICON_ALIASES[name]')
lines.push('  if (alias && LOOT_ICON_FILES[alias]) return alias')
lines.push('  return null')
lines.push('}')
lines.push('')

fs.writeFileSync(MAP_FILE, lines.join('\n'), 'utf8')
console.log(`sliced ${index} loot icons → ${OUT_DIR}`)

const catalog = fs.readFileSync(path.join(ROOT, 'docs/图鉴-材料.md'), 'utf8')
const docNames = [...catalog.matchAll(/^\| ([^|]+) \| 妖兽/gm)].map((m) => m[1].trim())
const miss = docNames.filter((n) => !nameToFile[n] && !nameToFile[ALIASES[n]])
const extra = Object.keys(nameToFile).filter((n) => !docNames.includes(n))
console.log('docs', docNames.length, 'missing', miss.length ? miss.join(', ') : 'none')
console.log('extra', extra.length ? extra.join(', ') : 'none')
