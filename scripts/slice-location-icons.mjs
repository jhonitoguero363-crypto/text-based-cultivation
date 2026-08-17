/**
 * 从历练地点图鉴 atlas 切片（4 行；前 3 行各 7 列，末行 5 列；仅裁卡片插画）。
 */
import fs from 'fs'
import path from 'path'
import sharp from 'sharp'

const ROOT = 'd:/project/text-based-cultivation'
const ATLAS = path.join(ROOT, 'src/assets/locations/atlas.png')
const OUT_DIR = path.join(ROOT, 'src/assets/locations/icons')
const MAP_FILE = path.join(ROOT, 'src/constants/location-icons.ts')

/** 前三行：7 列插画中心 */
const COL_X_7 = [72, 213, 358, 508, 658, 803, 948]
/** 末行 5 列（间距略宽于上排） */
const COL_X_5 = [72, 216, 401, 585, 776]
/** 各行插画垂直中心（避开卡片底部文案区） */
const ROW_Y = [50, 216, 387, 560]
const HALF = 36

/** 与 adventure-locations.ts / 秘境设定 顺序一致 */
const NAMES = [
  '青云山',
  '黑风林',
  '落霞谷',
  '寒潭洞',
  '赤炎山脉',
  '百兽岭',
  '青木秘境',
  '断剑谷',
  '万妖森林',
  '地火洞',
  '紫云秘境',
  '古剑冢',
  '九幽谷',
  '天雷崖',
  '沧海遗迹',
  '龙骨荒原',
  '太虚秘境',
  '星陨海',
  '凤凰遗墟',
  '万魂古墓',
  '虚空裂谷',
  '岁月长河',
  '轮回古境',
  '无尽星域',
  '混沌海',
  '阴阳天池'
]

fs.mkdirSync(OUT_DIR, { recursive: true })

const meta = await sharp(ATLAS).metadata()
const w = meta.width || 0
const h = meta.height || 0
const nameToFile = {}
let index = 0

for (let ri = 0; ri < 4; ri++) {
  const xs = ri === 3 ? COL_X_5 : COL_X_7
  const y = ROW_Y[ri]
  for (let ci = 0; ci < xs.length; ci++) {
    const name = NAMES[index]
    if (!name) break
    const file = `loc-${String(index + 1).padStart(3, '0')}.png`
    const x = xs[ci]
    const left = Math.max(0, Math.round(x - HALF))
    const top = Math.max(0, Math.round(y - HALF))
    const size = HALF * 2
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
lines.push('/** 历练地点图标：由 scripts/slice-location-icons.mjs 自 atlas 切片生成 */')
lines.push('')
lines.push('export const LOCATION_ICON_FILES: Record<string, string> = {')
for (const [name, file] of Object.entries(nameToFile)) {
  lines.push(`  '${name}': '${file}',`)
}
lines.push('}')
lines.push('')
lines.push('export function resolveLocationIconName(name: string): string | null {')
lines.push('  if (LOCATION_ICON_FILES[name]) return name')
lines.push('  return null')
lines.push('}')
lines.push('')

fs.writeFileSync(MAP_FILE, lines.join('\n'), 'utf8')
console.log(`sliced ${index} location icons → ${OUT_DIR}`)
