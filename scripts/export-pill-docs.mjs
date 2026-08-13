import fs from 'fs'

const pillSrc = fs.readFileSync('src/constants/pill-catalog.ts', 'utf8')
const herbSrc = fs.readFileSync('src/constants/herb-catalog.ts', 'utf8')

const pills = []
const blockRe =
  /\{\s*id:\s*'[^']+',\s*name:\s*'([^']+)',\s*grade:\s*'([^']+)',\s*type:\s*'([^']+)',\s*effect:\s*'([^']+)',\s*special:\s*'([^']+)',\s*story:\s*'([^']+)',\s*realm:\s*'([^']+)',\s*price:\s*(\d+)\s*\}/g
let m
while ((m = blockRe.exec(pillSrc))) {
  pills.push({
    name: m[1],
    grade: m[2],
    type: m[3],
    effect: m[4],
    special: m[5],
    story: m[6],
    realm: m[7],
    price: Number(m[8])
  })
}

// 截取 PILL_RECIPES 数组并按 pillName 切块
const start = herbSrc.indexOf('export const PILL_RECIPES')
const slice = herbSrc.slice(start)
const recipeMap = {}
const pillBlocks = slice.split(/\{\s*"pillName":/)
for (let i = 1; i < pillBlocks.length; i++) {
  const block = '"pillName":' + pillBlocks[i]
  const name = block.match(/"pillName":\s*"([^"]+)"/)?.[1]
  const grade = block.match(/"grade":\s*"([^"]+)"/)?.[1]
  const stones = Number(block.match(/"spiritStones":\s*(\d+)/)?.[1] || 0)
  const mats = []
  const matRe = /"name":\s*"([^"]+)",\s*"count":\s*(\d+)/g
  let mm
  while ((mm = matRe.exec(block))) {
    // 只取 materials 段内的：遇到下一个 pillName 或数组结束前
    if (mm.index > block.indexOf('"materials"')) {
      // stop if we somehow went past next pill - already split
      mats.push({ name: mm[1], count: Number(mm[2]) })
    }
  }
  // materials 里的 name/count；排除 pill 自身字段已匹配的第一个 name? pillName 用的是 pillName 键
  // 上面 matRe 可能匹配到无关 —— materials 内只有 name+count 对
  const cleanMats = []
  const matOnly = block.match(/"materials":\s*\[([\s\S]*?)\]/)
  if (matOnly) {
    const inner = matOnly[1]
    const ir = /"name":\s*"([^"]+)",\s*"count":\s*(\d+)/g
    let im
    while ((im = ir.exec(inner))) cleanMats.push({ name: im[1], count: Number(im[2]) })
  }
  if (name) {
    recipeMap[name] = { pillName: name, grade, spiritStones: stones, materials: cleanMats }
  }
}

const REALM_ORDER = [
  '炼气',
  '筑基',
  '金丹',
  '元婴',
  '化神',
  '炼虚',
  '合体',
  '大乘',
  '渡劫',
  '飞升'
]

let md = `# 丹药设定\n\n丹阁售卖与炼制目录，共 **${pills.length}** 种（配方 ${Object.keys(recipeMap).length} 条）。\n\n数据来源：\`pill-catalog.ts\`、\`herb-catalog.ts\`。\n\n`
md += `## 品阶说明\n\n一品 → 九品 → 仙丹 → 神丹 → 先天神丹\n\n`
md += `## 获取方式\n\n1. **丹阁购买**：按境界浏览，消耗灵石\n2. **丹阁炼制**：消耗药材 + 灵石（见配方列）\n3. **任务 / 历练掉落**（设定方向）\n\n`

for (const realm of REALM_ORDER) {
  const list = pills.filter((p) => p.realm === realm)
  if (!list.length) continue
  md += `## ${realm}（${list.length}）\n\n`
  md += `| 名称 | 品阶 | 类型 | 效果 | 特效 | 购买价 | 炼制配方 |\n`
  md += `|------|------|------|------|------|--------|----------|\n`
  for (const p of list) {
    const r = recipeMap[p.name]
    const recipeText = r
      ? `${r.materials.map((x) => `${x.name}×${x.count}`).join('、')} + ${r.spiritStones} 灵石`
      : '—'
    md += `| ${p.name} | ${p.grade} | ${p.type} | ${p.effect} | ${p.special} | ${p.price} | ${recipeText} |\n`
  }
  md += `\n`
}

const byType = {}
for (const p of pills) {
  ;(byType[p.type] = byType[p.type] || []).push(p.name)
}
md += `## 按类型索引\n\n`
for (const [type, names] of Object.entries(byType)) {
  md += `- **${type}**（${names.length}）：${names.join('、')}\n`
}
md += `\n`

const onlyRecipe = Object.keys(recipeMap).filter((n) => !pills.some((p) => p.name === n))
const onlyShop = pills.filter((p) => !recipeMap[p.name]).map((p) => p.name)
if (onlyShop.length) {
  md += `## 仅可购买（暂无炼制配方）\n\n${onlyShop.join('、')}\n\n`
}
if (onlyRecipe.length) {
  md += `## 仅有配方（未进丹阁售卖表）\n\n${onlyRecipe.join('、')}\n\n`
}

fs.writeFileSync('docs/丹药设定.md', md, 'utf8')
console.log('pills', pills.length, 'recipes', Object.keys(recipeMap).length)
console.log('wrote docs/丹药设定.md')
