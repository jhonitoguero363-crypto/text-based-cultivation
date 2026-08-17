/**
 * 从功法图鉴 atlas 切片（上区 5×6 网格 + 下区宽距行，共 42 部对齐目录）。
 * 仅覆盖 tech-001～042；特色功法请用 slice-technique-special-icons.mjs。
 */
import fs from 'fs'
import path from 'path'
import sharp from 'sharp'

const ROOT = 'd:/project/text-based-cultivation'
const ATLAS = path.join(ROOT, 'src/assets/techniques/atlas.png')
const OUT_DIR = path.join(ROOT, 'src/assets/techniques/icons')
const MAP_FILE = path.join(ROOT, 'src/constants/technique-icons.ts')

const COLS = [168, 324, 480, 636, 792, 940]
const TOP_ROWS = [55, 158, 264, 368, 474]
const TOP_HALF = 44

const TOP_NAMES = [
  // 行1
  '纳气诀', '青木诀', '烈火诀', '凝水诀', '玄铁炼体诀', '疾风决',
  // 行2
  '青云心法', '金刚诀', '赤炎真诀', '寒月诀', '紫雷诀', '影遁术',
  // 行3
  '太玄功', '厚土神诀', '青冥剑诀', '九转炼体诀', '九霄雷法', '万兽灵诀',
  // 行4
  '太虚剑诀', '九幽魂诀', '青帝长生诀', '玄冰神诀', '九天雷皇诀', '天妖炼体诀',
  // 行5（第 5 格为图鉴多余罗盘像，映射到岁月诀相邻占位后跳过，目录仅 5 部）
  '太阴炼魂诀', '星辰炼体术', '虚空经', '岁月诀', null, '六道轮回经'
]

/** 下区：图标在左、名称在右 */
const BOTTOM = [
  { name: '混沌炼气诀', x: 188, y: 558, half: 46 },
  { name: '阴阳造化诀', x: 488, y: 558, half: 46 },
  { name: '万界归元诀', x: 788, y: 558, half: 46 },
  { name: '世界树经', x: 188, y: 638, half: 46 },
  { name: '鸿蒙紫气诀', x: 488, y: 638, half: 46 },
  { name: '太初神诀', x: 788, y: 638, half: 46 },
  { name: '诸天帝经', x: 175, y: 698, half: 40 },
  { name: '九转仙经', x: 175, y: 768, half: 40 },
  { name: '混沌仙经', x: 470, y: 768, half: 40 },
  { name: '鸿蒙神典', x: 175, y: 818, half: 40 },
  { name: '万道神诀', x: 470, y: 818, half: 40 },
  { name: '太初道经', x: 175, y: 868, half: 38 },
  { name: '无上天道经', x: 470, y: 868, half: 38 }
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
const h = meta.height || 908

for (const file of fs.readdirSync(OUT_DIR)) {
  // 保留特色功法 tech-043+；仅重切通用图鉴
  const m = file.match(/^tech-(\d+)\.png$/)
  if (m && Number(m[1]) <= 42) fs.unlinkSync(path.join(OUT_DIR, file))
}

const nameToFile = {}
let index = 0

async function sliceOne(name, x, y, half) {
  const left = Math.max(0, Math.round(x - half))
  const top = Math.max(0, Math.round(y - half))
  const size = half * 2
  const file = `tech-${String(index + 1).padStart(3, '0')}.png`
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
  nameToFile[name] = file
  index += 1
}

for (let r = 0; r < TOP_ROWS.length; r++) {
  for (let c = 0; c < COLS.length; c++) {
    const name = TOP_NAMES[r * 6 + c]
    if (!name) continue
    await sliceOne(name, COLS[c], TOP_ROWS[r], TOP_HALF)
  }
}

for (const cell of BOTTOM) {
  await sliceOne(cell.name, cell.x, cell.y, cell.half)
}

// 合并已有特色映射（tech-043+），避免重切通用图鉴时冲掉
const prev = fs.existsSync(MAP_FILE) ? fs.readFileSync(MAP_FILE, 'utf8') : ''
for (const m of prev.matchAll(/'([^']+)':\s*'(tech-(?:0(?:4[3-9]|[5-9]\d)|[1-9]\d{2,})\.png)'/g)) {
  if (!nameToFile[m[1]]) nameToFile[m[1]] = m[2]
}

const lines = []
lines.push('/** 功法图标：通用 atlas + 特色功法 atlas-special 切片 */')
lines.push('')
lines.push('export const TECHNIQUE_ICON_FILES: Record<string, string> = {')
for (const [name, file] of Object.entries(nameToFile)) {
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
console.log(`sliced ${index} technique icons → ${OUT_DIR}`)

const catalog = fs.readFileSync(path.join(ROOT, 'src/constants/technique-catalog.ts'), 'utf8')
const names = [...catalog.matchAll(/tech\('tech-\d+',\s*'[^']+',\s*'([^']+)'/g)].map((m) => m[1])
const miss = names.filter((n) => !nameToFile[n] && !nameToFile[ALIASES[n]])
const extra = Object.keys(nameToFile).filter((n) => !names.includes(n))
console.log('catalog', names.length, 'missing', miss.length ? miss.join(', ') : 'none')
console.log('extra icons', extra.length ? extra.join(', ') : 'none')
