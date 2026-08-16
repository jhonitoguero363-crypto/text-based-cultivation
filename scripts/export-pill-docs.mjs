import fs from 'fs'

const pillSrc = fs.readFileSync('src/constants/pill-catalog.ts', 'utf8')
const herbSrc = fs.readFileSync('src/constants/herb-catalog.ts', 'utf8')

const DIFF_LABELS = [
  '入门',
  '简单',
  '普通',
  '偏难',
  '困难',
  '艰难',
  '极难',
  '险绝',
  '天劫',
  '造化',
  '鸿蒙',
  '无极'
]

const pills = []
const blockRe =
  /\{\s*id:\s*'[^']+',\s*name:\s*'([^']+)',\s*grade:\s*'([^']+)',\s*type:\s*'([^']+)',\s*effect:\s*'([^']+)',\s*special:\s*'([^']+)',\s*story:\s*'([^']+)',\s*realm:\s*'([^']+)',\s*price:\s*(\d+),\s*craftDifficulty:\s*(\d+)\s*\}/g
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
    price: Number(m[8]),
    craftDifficulty: Number(m[9])
  })
}

const start = herbSrc.indexOf('export const PILL_RECIPES')
const slice = herbSrc.slice(start)
const recipeMap = {}
const pillBlocks = slice.split(/\{\s*"pillName":/)
for (let i = 1; i < pillBlocks.length; i++) {
  const block = '"pillName":' + pillBlocks[i]
  const name = block.match(/"pillName":\s*"([^"]+)"/)?.[1]
  const grade = block.match(/"grade":\s*"([^"]+)"/)?.[1]
  const stones = Number(block.match(/"spiritStones":\s*(\d+)/)?.[1] || 0)
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

function diffLabel(n) {
  return `${DIFF_LABELS[n - 1] || '普通'}（${n}）`
}

let md = `# 丹药设定\n\n丹阁售卖与炼制目录，共 **${pills.length}** 种（配方 ${Object.keys(recipeMap).length} 条）。\n\n数据来源：\`pill-catalog.ts\`、\`herb-catalog.ts\`。\n\n`
md += `## 品阶说明\n\n一品 → 九品 → 仙丹 → 神丹 → 先天神丹\n\n`
md += `## 炼制难度\n\n独立于品阶，取值 **1～12**，影响自己炼制成功率（越高越难）。委托炼制不受影响。\n\n`
md += `| 数值 | 名称 |\n|------|------|\n`
DIFF_LABELS.forEach((label, i) => {
  md += `| ${i + 1} | ${label} |\n`
})
md += `\n默认与品阶档位对齐（一品=1 … 先天神丹=12），可在 \`pill-catalog.ts\` 的 \`craftDifficulty\` 单独调整。\n\n`
md += `## 获取方式\n\n1. **丹阁购买**：按境界浏览，消耗灵石（无需炼丹术）\n2. **丹阁炼制**：需先修习法术「炼丹术」；配方只耗药材，不另扣灵石\n   - **自己炼制**：成功率由炼丹术熟练度与**炼制难度**决定；失败则药材尽毁\n   - **委托炼制**：只耗药材，必定成功\n3. **任务 / 历练掉落**（设定方向）\n\n`

for (const realm of REALM_ORDER) {
  const list = pills.filter((p) => p.realm === realm)
  if (!list.length) continue
  md += `## ${realm}（${list.length}）\n\n`
  md += `| 名称 | 品阶 | 炼制难度 | 类型 | 效果 | 特效 | 购买价 | 炼制配方 |\n`
  md += `|------|------|----------|------|------|------|--------|----------|\n`
  for (const p of list) {
    const r = recipeMap[p.name]
    const recipeText = r
      ? r.materials.map((x) => `${x.name}×${x.count}`).join('、')
      : '—'
    md += `| ${p.name} | ${p.grade} | ${diffLabel(p.craftDifficulty)} | ${p.type} | ${p.effect} | ${p.special} | ${p.price} | ${recipeText} |\n`
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

const onlyShop = pills.filter((p) => !recipeMap[p.name]).map((p) => p.name)
if (onlyShop.length) {
  md += `## 仅可购买（暂无炼制配方）\n\n${onlyShop.join('、')}\n\n`
}

fs.writeFileSync('docs/丹药设定.md', md, 'utf8')
console.log('pills', pills.length, 'recipes', Object.keys(recipeMap).length)
console.log('wrote docs/丹药设定.md')
