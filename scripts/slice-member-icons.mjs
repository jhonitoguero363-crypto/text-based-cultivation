/**
 * 从宗门人物图鉴切片头像（高层 7 + 执法堂 4）。
 */
import fs from 'fs'
import path from 'path'
import sharp from 'sharp'

const ROOT = 'd:/project/text-based-cultivation'
const ATLAS = path.join(ROOT, 'src/assets/members/atlas.png')
const OUT_DIR = path.join(ROOT, 'src/assets/members/icons')
const MAP_FILE = path.join(ROOT, 'src/constants/member-icons.ts')

const CELLS = [
  { name: '沈天玄', x: 73, y: 175, half: 52 },
  { name: '柳清寒', x: 219, y: 175, half: 52 },
  { name: '顾长风', x: 366, y: 175, half: 52 },
  { name: '苏灵月', x: 512, y: 175, half: 52 },
  { name: '韩铁山', x: 658, y: 175, half: 52 },
  { name: '莫问道', x: 805, y: 175, half: 52 },
  { name: '林玄机', x: 951, y: 175, half: 52 },
  { name: '秦无夜', x: 128, y: 700, half: 72 },
  { name: '白无尘', x: 384, y: 700, half: 72 },
  { name: '周烈', x: 640, y: 700, half: 72 },
  { name: '叶青璃', x: 896, y: 700, half: 72 }
]

fs.mkdirSync(OUT_DIR, { recursive: true })

await sharp(ATLAS).png().toFile(path.join(ROOT, 'src/assets/members/_atlas_tmp.png'))
fs.renameSync(path.join(ROOT, 'src/assets/members/_atlas_tmp.png'), ATLAS)

const meta = await sharp(ATLAS).metadata()
const w = meta.width || 1024
const h = meta.height || 1024

for (const file of fs.readdirSync(OUT_DIR)) {
  if (file.endsWith('.png')) fs.unlinkSync(path.join(OUT_DIR, file))
}

const nameToFile = {}
let index = 0

for (const cell of CELLS) {
  const half = cell.half
  const left = Math.max(0, Math.round(cell.x - half))
  const top = Math.max(0, Math.round(cell.y - half))
  const size = half * 2
  const file = `member-${String(index + 1).padStart(3, '0')}.png`
  await sharp(ATLAS)
    .extract({
      left,
      top,
      width: Math.min(size, w - left),
      height: Math.min(size, h - top)
    })
    .resize(128, 128, { fit: 'cover', position: 'centre' })
    .png()
    .toFile(path.join(OUT_DIR, file))
  nameToFile[cell.name] = file
  index += 1
}

const lines = []
lines.push('/** 宗门人物头像：由 scripts/slice-member-icons.mjs 自图鉴切片生成 */')
lines.push('')
lines.push('export const MEMBER_ICON_FILES: Record<string, string> = {')
for (const [name, file] of Object.entries(nameToFile)) {
  lines.push(`  '${name}': '${file}',`)
}
lines.push('}')
lines.push('')
lines.push('export function resolveMemberIconName(name: string): string | null {')
lines.push('  if (MEMBER_ICON_FILES[name]) return name')
lines.push('  return null')
lines.push('}')
lines.push('')

fs.writeFileSync(MAP_FILE, lines.join('\n'), 'utf8')
console.log(`sliced ${index} member icons → ${OUT_DIR}`)
