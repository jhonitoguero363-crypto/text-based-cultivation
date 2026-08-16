/**
 * 从法术图鉴 atlas 切片（黄阶 10+2，其余各 10，共 52 枚对齐目录）。
 */
import fs from 'fs'
import path from 'path'
import sharp from 'sharp'

const ROOT = 'd:/project/text-based-cultivation'
const ATLAS = path.join(ROOT, 'src/assets/spells/atlas.png')
const OUT_DIR = path.join(ROOT, 'src/assets/spells/icons')
const MAP_FILE = path.join(ROOT, 'src/constants/spell-icons.ts')

/** 图鉴自左到右约 10 列中心（含左侧品阶标签后的内容区） */
const COLS = [90, 192, 290, 386, 490, 590, 684, 790, 878, 976]

/**
 * 按图鉴顺序：黄阶两行（10+2），玄/地/天/仙各一行 10
 * half 略偏上，避开底部编号与名称条
 */
const ROWS = [
  {
    y: 58,
    half: 38,
    names: [
      '炼丹术',
      '炼器术',
      '火球术',
      '水箭术',
      '风刃术',
      '地刺术',
      '木藤术',
      '冰箭术',
      '雷光术',
      '灵盾术'
    ]
  },
  {
    y: 198,
    half: 38,
    names: ['疾风步', '灵目术']
  },
  {
    y: 328,
    half: 40,
    names: [
      '赤炎掌',
      '寒冰刺',
      '紫雷击',
      '狂风刃',
      '地裂术',
      '青木缠绕',
      '烈焰风暴',
      '雷火爆',
      '五行剑气',
      '金刚护体'
    ]
  },
  {
    y: 498,
    half: 40,
    names: [
      '九霄雷法',
      '玄冰领域',
      '青帝回春术',
      '赤炎天火',
      '大地镇压',
      '万剑归宗',
      '雷狱',
      '九幽魂刺',
      '五行逆转',
      '天罡护体'
    ]
  },
  {
    y: 682,
    half: 40,
    names: [
      '太虚剑气',
      '九天神雷',
      '凤凰涅槃',
      '万魂噬天',
      '星陨术',
      '虚空大手印',
      '天剑降世',
      '九幽冥火',
      '万雷天牢',
      '乾坤挪移'
    ]
  },
  {
    y: 880,
    half: 40,
    names: [
      '九天仙雷',
      '太阴仙光',
      '太阳真火',
      '仙剑斩天',
      '万界传送',
      '时间回溯',
      '六道仙轮',
      '鸿蒙神雷',
      '混沌仙火',
      '万道归墟'
    ]
  }
]

const ALIASES = {
  疾风术: '疾风步',
  灵目: '灵目术',
  火球: '火球术',
  水箭: '水箭术'
}

fs.mkdirSync(OUT_DIR, { recursive: true })

// 统一转存为 png atlas（源可能是 jpeg）
await sharp(ATLAS).png().toFile(path.join(ROOT, 'src/assets/spells/_atlas_tmp.png'))
fs.renameSync(path.join(ROOT, 'src/assets/spells/_atlas_tmp.png'), ATLAS)

const meta = await sharp(ATLAS).metadata()
const w = meta.width || 1024
const h = meta.height || 1024

for (const file of fs.readdirSync(OUT_DIR)) {
  if (file.endsWith('.png')) fs.unlinkSync(path.join(OUT_DIR, file))
}

const nameToFile = {}
let index = 0

async function sliceOne(name, x, y, half) {
  const left = Math.max(0, Math.round(x - half))
  const top = Math.max(0, Math.round(y - half))
  const size = half * 2
  const file = `spell-${String(index + 1).padStart(3, '0')}.png`
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

for (const row of ROWS) {
  for (let c = 0; c < row.names.length; c += 1) {
    await sliceOne(row.names[c], COLS[c], row.y, row.half)
  }
}

const lines = []
lines.push('/** 法术图标：由 scripts/slice-spell-icons.mjs 自图鉴切片生成 */')
lines.push('')
lines.push('export const SPELL_ICON_FILES: Record<string, string> = {')
for (const [name, file] of Object.entries(nameToFile)) {
  lines.push(`  '${name}': '${file}',`)
}
lines.push('}')
lines.push('')
lines.push('export const SPELL_ICON_ALIASES: Record<string, string> = {')
for (const [a, b] of Object.entries(ALIASES)) {
  lines.push(`  '${a}': '${b}',`)
}
lines.push('}')
lines.push('')
lines.push('export function resolveSpellIconName(name: string): string | null {')
lines.push('  if (SPELL_ICON_FILES[name]) return name')
lines.push('  const alias = SPELL_ICON_ALIASES[name]')
lines.push('  if (alias && SPELL_ICON_FILES[alias]) return alias')
lines.push('  return null')
lines.push('}')
lines.push('')

fs.writeFileSync(MAP_FILE, lines.join('\n'), 'utf8')
console.log(`sliced ${index} spell icons → ${OUT_DIR}`)

const catalog = fs.readFileSync(path.join(ROOT, 'src/constants/spell-catalog.ts'), 'utf8')
const names = [...catalog.matchAll(/spell\('spell-\d+',\s*'[^']+',\s*'([^']+)'/g)].map((m) => m[1])
const miss = names.filter((n) => !nameToFile[n] && !nameToFile[ALIASES[n]])
const extra = Object.keys(nameToFile).filter((n) => !names.includes(n))
console.log('catalog', names.length, 'missing', miss.length ? miss.join(', ') : 'none')
console.log('extra icons', extra.length ? extra.join(', ') : 'none')
