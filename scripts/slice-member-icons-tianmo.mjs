/**
 * 从天魔宗（魔道）人物图鉴切片头像，并入 member-icons 映射。
 * 保留青云宗已有切片，不覆盖 member-001～011。
 *
 * 运行：node scripts/slice-member-icons-tianmo.mjs
 */
import fs from 'fs'
import path from 'path'
import sharp from 'sharp'
import { createRequire } from 'module'

const require = createRequire(import.meta.url)

const ROOT = 'd:/project/text-based-cultivation'
const SRC_ATLAS =
  'C:/Users/64209/.cursor/projects/d-project-text-based-cultivation/assets/c__Users_64209_AppData_Roaming_Cursor_User_workspaceStorage_91ba6d27d63085fe755fd7075487e4f4_images_charactersDemonic-8a548b09-7f42-47e7-a262-37cbc0b974c3.png'
const ATLAS = path.join(ROOT, 'src/assets/members/atlas-tianmo.png')
const OUT_DIR = path.join(ROOT, 'src/assets/members/icons')
const MAP_FILE = path.join(ROOT, 'src/constants/member-icons.ts')

/** @type {{ name: string, x: number, y: number, half: number }[]} */
const CELLS = []

function centers(n, margin, usable) {
  const cell = usable / n
  return Array.from({ length: n }, (_, i) => Math.round(margin + cell * (i + 0.5)))
}

function addRow(names, y, half, margin, usable) {
  const xs = centers(names.length, margin, usable)
  names.forEach((name, i) => {
    CELLS.push({ name, x: xs[i], y, half })
  })
}

// ——— 按图鉴排版（与 member-catalog-tianmo 分组顺序对齐）———
// 顶栏：宗主2 + 长老6 + 执事5
addRow(
  [
    '血煞天魔',
    '幽冥鬼姬',
    '赤炼魔尊',
    '夜煞魔女',
    '骨铸魔匠',
    '裂空魔影',
    '噬魂老魔',
    '铁血魔判',
    '屠魔刀',
    '血簿执事',
    '夜清尘',
    '赵明远',
    '林芙蕖'
  ],
  78,
  30,
  8,
  1008
)

// 亲传（左）+ 内门第一行（右）
addRow(
  ['魔焰公子', '血璃', '周明远', '何芙蕖', '韩若虚', '袁正阳', '苏剑影'],
  248,
  34,
  10,
  500
)
addRow(
  ['狂煞', '暗影', '石魔', '谢知微', '曹有恒', '吕望川', '薛鸾音', '钟素心', '姚听雨'],
  248,
  28,
  520,
  490
)

// 内门第二行
addRow(
  ['孔疏影', '史怀橘', '雷厚德', '乔悟真', '冷铸剑', '黄定川', '高拾薪', '郑斫木', '程巡山'],
  310,
  28,
  30,
  964
)

const WAI = [
  '小魔头',
  '毒萝',
  '金御风',
  '邱抱朴',
  '龙崇德',
  '易浣纱',
  '聂步莲',
  '刘无瑕',
  '孙令仪',
  '罗慧心',
  '于琼华',
  '傅绿筠',
  '蔡黄粱',
  '潘金蕊',
  '姜禾穗',
  '熊药香',
  '毛萱草',
  '孟石桥',
  '黎水衡',
  '文霜刃',
  '李云起',
  '徐月白',
  '马子昂',
  '冯叔平',
  '许屠魔',
  '蒋断岳',
  '余噬魂',
  '任煞星',
  '邹怀安',
  '康致远',
  '邵景行',
  '尹无咎'
]

addRow(WAI.slice(0, 15), 420, 26, 8, 1008)
addRow(WAI.slice(15, 30), 512, 26, 8, 1008)
addRow(WAI.slice(30, 32), 560, 28, 20, 160)

fs.mkdirSync(OUT_DIR, { recursive: true })
await sharp(SRC_ATLAS).png().toFile(ATLAS)

const meta = await sharp(ATLAS).metadata()
const w = meta.width || 1024
const h = meta.height || 682

// 读取已有青云映射，避免冲掉
let existing = {}
if (fs.existsSync(MAP_FILE)) {
  const text = fs.readFileSync(MAP_FILE, 'utf8')
  const re = /'([^']+)':\s*'([^']+)'/g
  let m
  while ((m = re.exec(text))) {
    existing[m[1]] = m[2]
  }
}

const usedFiles = new Set(Object.values(existing))
let nextIndex = 1
while (usedFiles.has(`member-${String(nextIndex).padStart(3, '0')}.png`)) {
  nextIndex += 1
}

const nameToFile = { ...existing }

for (const cell of CELLS) {
  if (nameToFile[cell.name] && !cell.name.startsWith('__')) {
    // 已有则覆盖文件内容但保留文件名
  }
  const half = cell.half
  const left = Math.max(0, Math.round(cell.x - half))
  const top = Math.max(0, Math.round(cell.y - half))
  const size = half * 2
  let file = nameToFile[cell.name]
  if (!file) {
    file = `member-${String(nextIndex).padStart(3, '0')}.png`
    nextIndex += 1
    while (usedFiles.has(file) || fs.existsSync(path.join(OUT_DIR, file))) {
      file = `member-${String(nextIndex).padStart(3, '0')}.png`
      nextIndex += 1
    }
  }
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
  usedFiles.add(file)
}

const lines = []
lines.push('/** 宗门人物头像：青云 + 天魔；由 slice-member-icons*.mjs 切片生成 */')
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
console.log(`tianmo sliced ${CELLS.length} icons; map size ${Object.keys(nameToFile).length} → ${MAP_FILE}`)
