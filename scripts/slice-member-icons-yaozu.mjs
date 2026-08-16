/**
 * 从妖族人物图鉴切片头像，并入 member-icons 映射。
 * 保留青云 / 天魔已有切片。
 *
 * 运行：node scripts/slice-member-icons-yaozu.mjs
 */
import fs from 'fs'
import path from 'path'
import sharp from 'sharp'

const ROOT = 'd:/project/text-based-cultivation'
const SRC_ATLAS =
  'C:/Users/64209/.cursor/projects/d-project-text-based-cultivation/assets/c__Users_64209_AppData_Roaming_Cursor_User_workspaceStorage_91ba6d27d63085fe755fd7075487e4f4_images_demonCharacter-f17729f4-3806-4d12-b229-bc3ee5f7b95c.png'
const ATLAS = path.join(ROOT, 'src/assets/members/atlas-yaozu.png')
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

// 顶栏：宗主2 + 长老6 + 执事5
addRow(
  [
    '万妖王',
    '青丘狐帝',
    '玄龟长老',
    '蝶母',
    '金犀匠',
    '蛛网尊者',
    '醉猿',
    '白虎判',
    '狼牙使',
    '仓鼠管事',
    '陈清尘',
    '胡明远',
    '梁芙蕖'
  ],
  78,
  30,
  8,
  1008
)

// 亲传（左）+ 内门第一行（右）
addRow(
  ['烈焰狮子', '雪狐', '朱明远', '宋芙蕖', '萧若虚', '曾正阳', '丁剑影'],
  248,
  34,
  10,
  500
)
addRow(
  ['黑豹', '青雀', '岩龟', '董知微', '沈有恒', '贾望川', '杜鸾音', '范素心', '金听雨'],
  248,
  28,
  520,
  490
)

// 内门第二行
addRow(
  ['邱疏影', '龙怀橘', '易厚德', '聂悟真', '刘铸剑', '孙定川', '罗拾薪', '于斫木', '傅巡山'],
  310,
  28,
  30,
  964
)

const WAI = [
  '小狸',
  '青禾兔',
  '崔御风',
  '侯抱朴',
  '汤崇德',
  '赖浣纱',
  '张步莲',
  '周无瑕',
  '何令仪',
  '韩慧心',
  '袁琼华',
  '苏绿筠',
  '叶黄粱',
  '汪金蕊',
  '谭禾穗',
  '白药香',
  '顾萱草',
  '钱石桥',
  '贺水衡',
  '夜霜刃',
  '赵云起',
  '林月白',
  '谢子昂',
  '曹叔平',
  '吕屠魔',
  '薛断岳',
  '钟噬魂',
  '姚煞星',
  '孔怀安',
  '史致远',
  '雷景行',
  '乔无咎'
]

// 图鉴外门为两行 × 16
addRow(WAI.slice(0, 16), 420, 24, 8, 1008)
addRow(WAI.slice(16, 32), 512, 24, 8, 1008)

fs.mkdirSync(OUT_DIR, { recursive: true })
await sharp(SRC_ATLAS).png().toFile(ATLAS)

const meta = await sharp(ATLAS).metadata()
const w = meta.width || 1024
const h = meta.height || 682

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
lines.push('/** 宗门人物头像：青云 + 天魔 + 妖族；由 slice-member-icons*.mjs 切片生成 */')
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
console.log(`yaozu sliced ${CELLS.length} icons; map size ${Object.keys(nameToFile).length} → ${MAP_FILE}`)
