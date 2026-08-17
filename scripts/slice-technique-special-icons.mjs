/**
 * 从特色功法图鉴 atlas-special 切片（4 行×10 列：魔修 / 妖族 / 剑修 / 体修）
 * 输出 tech-043 起，合并进 technique-icons.ts（不删原图鉴切片）。
 */
import fs from 'fs'
import path from 'path'
import sharp from 'sharp'

const ROOT = 'd:/project/text-based-cultivation'
const ATLAS = path.join(ROOT, 'src/assets/techniques/atlas-special.png')
const OUT_DIR = path.join(ROOT, 'src/assets/techniques/icons')
const MAP_FILE = path.join(ROOT, 'src/constants/technique-icons.ts')

/** 每行图标中心 Y；列中心自左起均匀排布（含左侧流派标签留白） */
const ROW_Y = [168, 348, 528, 708]
const COL_X = [128, 220, 312, 404, 496, 588, 680, 772, 864, 956]
const HALF = 38

const ROWS = [
  // 魔修（仅魔门）
  [
    '血煞诀',
    '噬魂诀',
    '赤血魔功',
    '九幽炼魂诀',
    '万魂魔典',
    '天魔噬灵功',
    '六欲天魔诀',
    '血海魔经',
    '太古天魔经',
    '万古魔神诀'
  ],
  // 妖族
  [
    '妖灵炼体诀',
    '百兽化形诀',
    '狼王啸月诀',
    '金刚妖体诀',
    '万兽吞天诀',
    '九尾天狐诀',
    '真龙炼体诀',
    '鲲鹏逍遥诀',
    '太古妖神经',
    '混沌祖妖诀'
  ],
  // 剑修（各宗通传）
  [
    '基础剑诀',
    '青锋剑诀',
    '流云剑诀',
    '烈阳剑诀',
    '万剑诀',
    '无影剑诀',
    '天罡剑典',
    '太虚剑经',
    '一剑通天诀',
    '万古无极剑典'
  ],
  // 体修 → 炼体（各宗通传）
  [
    '锻骨诀',
    '铁身功',
    '金刚炼体诀',
    '巨力诀',
    '九转金身诀',
    '龙象镇狱功',
    '不灭战体诀',
    '霸体真经',
    '荒古圣体诀',
    '万劫不灭体'
  ]
]

const ALIASES = {
  纳气决: '纳气诀',
  青木决: '青木诀',
  烈火决: '烈火诀',
  凝水决: '凝水诀',
  玄铁炼体决: '玄铁炼体诀',
  金刚决: '金刚诀',
  九转炼体决: '九转炼体诀',
  万兽灵决: '万兽灵诀',
  太阴炼魂决: '太阴炼魂诀',
  星辰锻体术: '星辰炼体术',
  星辰转体术: '星辰炼体术'
}

fs.mkdirSync(OUT_DIR, { recursive: true })

const meta = await sharp(ATLAS).metadata()
const w = meta.width || 1024
const h = meta.height || 819

/** 保留原图鉴 tech-001～042 */
const existingSrc = fs.readFileSync(MAP_FILE, 'utf8')
const existing = {}
for (const m of existingSrc.matchAll(/'([^']+)':\s*'([^']+\.png)'/g)) {
  // 跳过 ALIASES 段：别名右侧不是文件名时仍可能匹配，过滤仅 .png
  if (m[2].endsWith('.png')) existing[m[1]] = m[2]
}

let nextIndex = 43
for (const file of Object.values(existing)) {
  const n = Number((file.match(/tech-(\d+)/) || [])[1] || 0)
  if (n >= nextIndex) nextIndex = n + 1
}

const specialMap = {}
for (let r = 0; r < ROWS.length; r++) {
  const y = ROW_Y[r]
  for (let c = 0; c < ROWS[r].length; c++) {
    const name = ROWS[r][c]
    const x = COL_X[c]
    const left = Math.max(0, Math.round(x - HALF))
    const top = Math.max(0, Math.round(y - HALF))
    const size = HALF * 2
    const file = `tech-${String(nextIndex).padStart(3, '0')}.png`
    await sharp(ATLAS)
      .extract({
        left,
        top,
        width: Math.min(size, w - left),
        height: Math.min(size, h - top)
      })
      .resize(96, 96, {
        fit: 'cover',
        position: 'centre'
      })
      .png()
      .toFile(path.join(OUT_DIR, file))
    specialMap[name] = file
    nextIndex += 1
  }
}

const merged = { ...existing, ...specialMap }

const lines = []
lines.push('/** 功法图标：通用 atlas + 特色功法 atlas-special 切片 */')
lines.push('')
lines.push('export const TECHNIQUE_ICON_FILES: Record<string, string> = {')
for (const [name, file] of Object.entries(merged)) {
  lines.push(`  '${name}': '${file}',`)
}
lines.push('}')
lines.push('')
lines.push('export const TECHNIQUE_ICON_ALIASES: Record<string, string> = {')
for (const [a, b] of Object.entries(ALIASES)) {
  lines.push(`  '${a}': '${b}',`)
}
lines.push('}')
lines.push('')
lines.push('export function resolveTechniqueIconName(name: string): string | null {')
lines.push('  if (TECHNIQUE_ICON_FILES[name]) return name')
lines.push('  const alias = TECHNIQUE_ICON_ALIASES[name]')
lines.push('  if (alias && TECHNIQUE_ICON_FILES[alias]) return alias')
lines.push('  return null')
lines.push('}')
lines.push('')

fs.writeFileSync(MAP_FILE, lines.join('\n'), 'utf8')
console.log(`sliced ${Object.keys(specialMap).length} special technique icons → ${OUT_DIR}`)

const catalog = fs.readFileSync(path.join(ROOT, 'src/constants/technique-catalog.ts'), 'utf8')
const names = [...catalog.matchAll(/tech\('tech-\d+',\s*'[^']+',\s*'([^']+)'/g)].map((m) => m[1])
const miss = names.filter((n) => !merged[n] && !merged[ALIASES[n]])
console.log('catalog', names.length, 'icons', Object.keys(merged).length)
console.log('missing', miss.length ? miss.join(', ') : 'none')
