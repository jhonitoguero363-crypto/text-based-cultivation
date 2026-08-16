/**
 * 从万剑宗（图鉴标题天剑宗）人物图鉴切片头像，并入 member-icons 映射。
 * 保留青云 / 天魔 / 妖族已有切片。
 *
 * 运行：node scripts/slice-member-icons-wanjian.mjs
 */
import fs from 'fs'
import path from 'path'
import sharp from 'sharp'

const ROOT = 'd:/project/text-based-cultivation'
const SRC_ATLAS =
  'C:/Users/64209/.cursor/projects/d-project-text-based-cultivation/assets/c__Users_64209_AppData_Roaming_Cursor_User_workspaceStorage_91ba6d27d63085fe755fd7075487e4f4_images_swordPerson-c4a8ae5e-b845-479d-98a8-6f10db5bb883.png'
const ATLAS = path.join(ROOT, 'src/assets/members/atlas-wanjian.png')
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

// 顶栏：宗主2 + 长老6 + 执事5（名录键；图鉴个别用字可能不同）
addRow(
  [
    '剑无涯',
    '霜华剑尊',
    '丹剑真人',
    '青莲剑娘',
    '铸剑山人',
    '玄阵剑客',
    '醉剑仙',
    '律剑长老',
    '断罪剑使',
    '簿剑执事',
    '李清尘',
    '徐明远',
    '马芙蕖'
  ],
  78,
  30,
  8,
  1008
)

// 亲传（左）+ 内门第一行（右）
addRow(
  ['凌霄剑子', '霜月', '孙明远', '罗芙蕖', '于若虚', '傅正阳', '蔡剑影'],
  248,
  34,
  10,
  500
)
addRow(
  ['烈锋', '追影', '石剑', '冯知微', '许有恒', '蒋望川', '余鸾音', '任素心', '邹听雨'],
  248,
  28,
  520,
  490
)

// 内门第二行（本图人脸中心约在 y=280；名录「邵怀橘」对应图鉴「邓怀橘」等异写）
addRow(
  ['康疏影', '邵怀橘', '尹厚德', '龚悟真', '王铸剑', '吴定川', '郭拾薪', '唐斫木', '邓巡山'],
  280,
  26,
  30,
  964
)

// 图鉴外门第一行 15 格（无「魏黄粱」），第二行 16 格；名录仍保留魏黄粱但不切片
const WAI_ROW1 = [
  '小剑童',
  '青禾',
  '孔御风',
  '史抱朴',
  '雷崇德',
  '乔浣纱',
  '冷步莲',
  '黄无瑕',
  '高令仪',
  '郑慧心',
  '程琼华',
  '彭绿筠',
  '夏金蕊',
  '石禾穗',
  '郝药香'
]
const WAI_ROW2 = [
  '江萱草',
  '段石桥',
  '武水衡',
  '墨霜刃',
  '杨云起',
  '朱月白',
  '宋子昂',
  '萧叔平',
  '曾屠魔',
  '丁断岳',
  '戴噬魂',
  '方煞星',
  '陆怀安',
  '秦致远',
  '万景行'
]

// 图鉴外门两行各 15；名录「魏黄粱」「常无咎」图鉴无对应格，不切片
addRow(WAI_ROW1, 412, 22, 8, 1008)
addRow(WAI_ROW2, 495, 22, 8, 1008)

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

// 图鉴无此人像，避免沿用错误切片
delete existing['魏黄粱']
delete existing['常无咎']

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
lines.push('/** 宗门人物头像：青云 + 天魔 + 妖族 + 万剑；由 slice-member-icons*.mjs 切片生成 */')
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
console.log(`wanjian sliced ${CELLS.length} icons; map size ${Object.keys(nameToFile).length} → ${MAP_FILE}`)
