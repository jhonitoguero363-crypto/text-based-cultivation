/**
 * 从历练人物图鉴切片头像（6 行：弟子/散修/商人/魔修/隐世/奇遇）。
 */
import fs from 'fs'
import path from 'path'
import sharp from 'sharp'

const ROOT = 'd:/project/text-based-cultivation'
const ATLAS = path.join(ROOT, 'src/assets/npcs/atlas.png')
const OUT_DIR = path.join(ROOT, 'src/assets/npcs/icons')
const MAP_FILE = path.join(ROOT, 'src/constants/npc-icons.ts')

const ROWS = [
  {
    y: 90,
    names: ['林青竹', '苏晚晴', '李玄风', '顾少陵', '沈月璃', '赵天河', '慕容雪', '楚狂歌', '洛神音', '白无涯']
  },
  {
    y: 265,
    names: ['王老三', '陈平', '柳如烟', '周青', '魏无忌', '赵老鬼', '宁道远', '魏长生', '莫天行', '老乞丐']
  },
  {
    y: 440,
    names: ['钱多多', '铁算盘', '百宝道人', '灵兽商人', '鬼市商人', '天机商人', '万界商客']
  },
  {
    y: 615,
    names: ['血刀客', '黑煞', '血无痕', '鬼面道人', '赤炼老魔', '黑袍道人', '血海老祖', '无心魔君', '天魔子', '无相魔尊']
  },
  {
    y: 775,
    names: ['卖酒老人', '瘸腿老人', '白发道人', '老乞少女', '守墓人', '钓鱼老翁', '采药少女', '黑猫少年', '无名剑客', '棋盘老人']
  },
  {
    y: 940,
    names: ['失忆少女', '受伤剑客', '被追杀少年', '灵宠少女', '神秘商队', '宗门叛徒', '妖族使者', '魔宗卧底', '上古残魂', '天外来客']
  }
]

/** 图鉴名 → 目录名 */
const ALIASES = {
  李玄凤: '李玄风',
  沈月琉: '沈月璃'
}

fs.mkdirSync(OUT_DIR, { recursive: true })

await sharp(ATLAS).png().toFile(path.join(ROOT, 'src/assets/npcs/_atlas_tmp.png'))
fs.renameSync(path.join(ROOT, 'src/assets/npcs/_atlas_tmp.png'), ATLAS)

const meta = await sharp(ATLAS).metadata()
const w = meta.width || 1024
const h = meta.height || 1024

for (const file of fs.readdirSync(OUT_DIR)) {
  if (file.endsWith('.png')) fs.unlinkSync(path.join(OUT_DIR, file))
}

const CELLS = []
for (const row of ROWS) {
  const n = row.names.length
  const cellW = w / n
  const half = Math.min(46, Math.floor(cellW / 2) - 4)
  for (let i = 0; i < n; i++) {
    CELLS.push({
      name: row.names[i],
      x: Math.round(cellW * (i + 0.5)),
      y: row.y,
      half
    })
  }
}

const nameToFile = {}
let index = 0

for (const cell of CELLS) {
  const half = cell.half
  const left = Math.max(0, Math.round(cell.x - half))
  const top = Math.max(0, Math.round(cell.y - half))
  const size = half * 2
  const file = `npc-${String(index + 1).padStart(3, '0')}.png`
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
  nameToFile[cell.name] = file
  index += 1
}

const lines = []
lines.push('/** 历练人物头像：由 scripts/slice-npc-icons.mjs 自图鉴切片生成 */')
lines.push('')
lines.push('export const NPC_ICON_FILES: Record<string, string> = {')
for (const [name, file] of Object.entries(nameToFile)) {
  lines.push(`  '${name}': '${file}',`)
}
lines.push('}')
lines.push('')
lines.push('export const NPC_ICON_ALIASES: Record<string, string> = {')
for (const [a, b] of Object.entries(ALIASES)) {
  lines.push(`  '${a}': '${b}',`)
}
lines.push('}')
lines.push('')
lines.push('export function resolveNpcIconName(name: string): string | null {')
lines.push('  if (NPC_ICON_FILES[name]) return name')
lines.push('  const alias = NPC_ICON_ALIASES[name]')
lines.push('  if (alias && NPC_ICON_FILES[alias]) return alias')
lines.push('  return null')
lines.push('}')
lines.push('')

fs.writeFileSync(MAP_FILE, lines.join('\n'), 'utf8')
console.log(`sliced ${index} npc icons → ${OUT_DIR}`)

const catalog = fs.readFileSync(path.join(ROOT, 'src/constants/adventure-npc-catalog.ts'), 'utf8')
const names = [...catalog.matchAll(/"name": "([^"]+)"/g)].map((m) => m[1])
const unique = [...new Set(names)]
const miss = unique.filter((n) => !nameToFile[n] && !Object.values(ALIASES).includes(n) && !nameToFile[ALIASES[n]])
console.log('catalog unique', unique.length, 'missing', miss)
