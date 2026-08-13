/**
 * 从修仙丹药材料图鉴 atlas 切片，生成草药图标与名称映射。
 */
import fs from 'fs'
import path from 'path'
import sharp from 'sharp'

const ROOT = 'd:/project/text-based-cultivation'
const ATLAS = path.join(ROOT, 'src/assets/herbs/atlas.png')
const OUT_DIR = path.join(ROOT, 'src/assets/herbs/icons')
const MAP_FILE = path.join(ROOT, 'src/constants/herb-icons.ts')

/** 12 图标列（跳过左侧品阶竖条） */
const COLS = [
  [65, 99],
  [116, 153],
  [167, 202],
  [218, 253],
  [270, 306],
  [322, 360],
  [374, 409],
  [428, 461],
  [478, 514],
  [531, 566],
  [582, 616],
  [632, 668]
]

/** 10 内容行（跳过标题） */
const ROWS = [
  [105, 163],
  [204, 261],
  [303, 358],
  [402, 458],
  [500, 553],
  [594, 647],
  [687, 733],
  [772, 813],
  [849, 895],
  [931, 988]
]

/**
 * 图鉴从左到右、从上到下。名称尽量对齐目录；图鉴独有名保留以占位。
 */
const GRID = [
  // 灵草
  ['聚灵草', '凝气花', '青灵叶', '月光藤', '回灵草', '清心花', '凝血草', '赤根花', '血玉藤', '洗髓草', '玉骨花', '灵泉水'],
  // 灵药
  ['百年黄精', '地灵根', '筑基草', '紫猴花', '凝神花', '地心莲', '养魂草', '魂灵木', '月魂花', '紫灵草', '紫云花', '聚灵藤'],
  // 灵果
  ['青木果', '金灵果', '青灵果', '火灵果', '玄冰果', '生命果', '元婴果', '神识果', '五行果', '天元果', '神魂果', '星辰果'],
  // 灵花等
  ['紫玉花', '太阴花', '赤铜花', '炎心草', '金刚藤', '月魂草', '寒月莲', '幽冥藤', '九窍花', '万灵花', '天灵花', '逆命花'],
  // 灵参 / 灵木 / 灵芝
  ['紫金参', '地灵参', '紫府参', '龙筋草', '金丝灵芝', '魂玉花', '养神木', '聚灵神木', '九天灵芝', '菩提果', '生命藤', '悟道藤'],
  // 灵芝 / 灵莲
  ['九转灵芝', '青木莲', '九窍莲', '赤焰莲', '百兽血莲', '紫府莲', '九色莲', '造化莲', '太虚芝', '灵悟芝', '九窍神芝', '涅槃花'],
  // 灵藤 / 神藤
  [
    '月光藤·图',
    '聚灵藤·图',
    '金刚藤·图',
    '朱雀藤',
    '血玉藤·图',
    '幽冥藤·图',
    '天魂藤',
    '轮回藤',
    '凤凰血藤',
    '太虚藤',
    '星魂藤',
    '裂界藤'
  ],
  // 灵液
  [
    '灵泉水·图',
    '地心乳',
    '寒泉露',
    '九幽露',
    '阳炎露',
    '月华露',
    '生命露',
    '星河露',
    '混沌露',
    '天机露',
    '太虚露',
    '造化露'
  ],
  // 神材
  [
    '魂灵木·图',
    '凤凰羽灵',
    '虚空石髓',
    '天机叶',
    '界灵花',
    '世界树果',
    '天道藤',
    '混沌神木',
    '时空花',
    '乾坤莲',
    '太初灵果',
    '鸿蒙果'
  ],
  // 仙材
  [
    '不死草',
    '太虚草',
    '空间花',
    '星辰果·图',
    '菩提果·图',
    '虚空草',
    '悟道花',
    '天道花',
    '命运花',
    '太初花',
    '鸿蒙紫芝',
    '九天神莲'
  ]
]

const ALIASES = {
  月魄花: '月魂花',
  焦宙藤: '金刚藤',
  冥月莲: '寒月莲',
  九穹花: '九窍花',
  龙箭草: '龙筋草',
  赤阳莲: '赤焰莲',
  百会血莲: '百兽血莲',
  天魂果: '神魂果',
  幽冥果: '神识果',
  命魂芝: '灵悟芝',
  时光砂: '天机叶',
  魂玉: '魂玉花',
  回元草: '回灵草',
  九转玄草: '不死草',
  不死神草: '不死草',
  九转神芝: '九转灵芝',
  悟道神芝: '悟道花',
  星辰神芝: '星辰果',
  星辰芝: '星辰果',
  五行神果: '五行果',
  九天神果: '天元果',
  玄天神果: '玄天果',
  玄天果: '天元果',
  生命神树枝: '生命藤',
  太初灵液: '混沌露',
  太初露: '混沌露',
  九转轮回草: '轮回藤',
  六道花: '命运花',
  黄泉花: '天道花',
  忘川藤: '裂界藤',
  因果藤: '裂界藤',
  天命果: '星辰果',
  轮回果: '鸿蒙果',
  幽冥莲: '寒月莲',
  合道花: '悟道花',
  道韵草: '悟道花',
  生死草: '悟道花',
  道心草: '悟道花',
  悟道果: '菩提果',
  造化果: '造化莲',
  紫微果: '鸿蒙果',
  法则果: '悟道藤',
  法则藤: '悟道藤',
  天机藤: '天机叶',
  道韵藤: '悟道藤',
  天人参: '紫府参',
  紫府神参: '紫府参',
  阴阳莲: '万灵花',
  混沌莲: '混沌露',
  福缘莲: '造化莲',
  天人莲: '造化莲',
  混元草: '太虚草',
  阴阳神花: '万灵花',
  阴阳花: '万灵花',
  气运花: '造化莲',
  造化神花: '造化莲',
  大乘花: '九天神莲',
  九天玄花: '九天神莲',
  万道花: '鸿蒙紫芝',
  万道芝: '鸿蒙紫芝',
  鸿运石: '鸿蒙果',
  三千叶: '天机叶',
  化神草: '天魂藤',
  灵源草: '天魂藤',
  天魂草: '天魂藤',
  地火莲: '赤焰莲',
  凝丹草: '筑基草',
  玄阳花: '炎心草',
  赤阳花: '炎心草',
  婴灵草: '养魂草',
  铁骨草: '洗髓草',
  回元草: '回灵草',
  九转神莲: '造化莲',
  凤凰血莲: '凤凰血藤',
  太虚莲: '太虚芝',
  九转神芝: '九转灵芝',
  悟道神芝: '悟道花',
  命魂芝: '灵悟芝'
}

const LEVEL_FALLBACK = {
  灵草: '聚灵草',
  灵液: '灵泉水',
  灵药: '百年黄精',
  灵果: '青木果',
  灵木: '魂灵木',
  灵藤: '聚灵藤',
  灵花: '紫玉花',
  灵参: '紫金参',
  灵芝: '金丝灵芝',
  灵莲: '寒月莲',
  神藤: '天魂藤',
  神草: '不死草',
  神莲: '造化莲',
  神木: '养神木',
  神花: '万灵花',
  神芝: '九天灵芝',
  神果: '神魂果',
  神材: '凤凰羽灵',
  神液: '混沌露',
  仙草: '不死草',
  仙花: '空间花',
  仙藤: '裂界藤',
  仙果: '星辰果',
  仙材: '虚空石髓',
  仙芝: '灵悟芝',
  仙莲: '造化莲',
  道药: '悟道花',
  道果: '菩提果',
  道参: '紫府参',
  道莲: '造化莲',
  道藤: '悟道藤',
  道草: '太虚草',
  道花: '悟道花',
  道芝: '太虚芝',
  道材: '虚空石髓',
  神参: '紫府参',
  鸿蒙灵果: '鸿蒙果'
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
    const file = `herb-${String(index + 1).padStart(3, '0')}.png`
    await sharp(ATLAS)
      .extract({
        left: x0,
        top: y0,
        width: x1 - x0 + 1,
        height: y1 - y0 + 1
      })
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

// 同名重复切片：主名优先保留首次；·图 后缀用于占位不覆盖主名
for (const [name, file] of Object.entries({ ...nameToFile })) {
  if (name.endsWith('·图')) {
    const base = name.replace(/·图$/, '')
    if (!nameToFile[base]) nameToFile[base] = file
  }
}

const lines = []
lines.push('/** 草药图标：由 scripts/slice-herb-icons.mjs 自图鉴切片生成 */')
lines.push('')
lines.push('/** 图鉴切片名 → 文件名 */')
lines.push('export const HERB_ICON_FILES: Record<string, string> = {')
for (const [name, file] of Object.entries(nameToFile)) {
  if (name.endsWith('·图')) continue
  lines.push(`  '${name}': '${file}',`)
}
lines.push('}')
lines.push('')
lines.push('export const HERB_ICON_ALIASES: Record<string, string> = {')
for (const [a, b] of Object.entries(ALIASES)) {
  lines.push(`  '${a}': '${b}',`)
}
lines.push('}')
lines.push('')
lines.push('export const HERB_LEVEL_ICON_FALLBACK: Record<string, string> = {')
for (const [a, b] of Object.entries(LEVEL_FALLBACK)) {
  lines.push(`  '${a}': '${b}',`)
}
lines.push('}')
lines.push('')
lines.push('export function resolveHerbIconName(name: string, level?: string): string | null {')
lines.push('  if (HERB_ICON_FILES[name]) return name')
lines.push('  const alias = HERB_ICON_ALIASES[name]')
lines.push('  if (alias && HERB_ICON_FILES[alias]) return alias')
lines.push('  if (level) {')
lines.push('    const fb = HERB_LEVEL_ICON_FALLBACK[level]')
lines.push('    if (fb && HERB_ICON_FILES[fb]) return fb')
lines.push('  }')
lines.push('  return null')
lines.push('}')
lines.push('')

fs.writeFileSync(MAP_FILE, lines.join('\n'), 'utf8')

console.log(`sliced ${index} icons → ${OUT_DIR}`)

const catalog = fs.readFileSync(path.join(ROOT, 'src/constants/herb-catalog.ts'), 'utf8')
const re = /"name": "([^"]+)",\s*"level": "([^"]+)"/g
let m
const missing = []
const covered = []
while ((m = re.exec(catalog))) {
  const name = m[1]
  const level = m[2]
  if (nameToFile[name] || nameToFile[ALIASES[name]]) covered.push(name)
  else {
    const fb = LEVEL_FALLBACK[level]
    missing.push(`${name}(${level})→${fb && nameToFile[fb] ? 'fallback' : 'NONE'}`)
  }
}
console.log('exact/alias', covered.length, 'fallback/missing', missing.length)
console.log(missing.slice(0, 50).join('\n'))
