import fs from 'fs'

const pillSrc = fs.readFileSync('src/constants/pill-catalog.ts', 'utf8')
const rareSrc = fs.readFileSync('src/constants/pill-market-rare.ts', 'utf8')
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

/** rare() 调用：rare(id, name, grade, type, effect, special, story) */
const rarePills = []
const rareRe =
  /rare\(\s*'[^']+',\s*'([^']+)',\s*'([^']+)',\s*'([^']+)',\s*'([^']+)',\s*'([^']+)',\s*'([^']+)'\s*\)/g
while ((m = rareRe.exec(rareSrc))) {
  rarePills.push({
    name: m[1],
    grade: m[2],
    type: m[3],
    effect: m[4],
    special: m[5],
    story: m[6]
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

const CATEGORY_ORDER = [
  '灵根丹',
  '悟性丹',
  '修为丹',
  '聚灵丹',
  '战斗丹',
  '突破丹',
  '保命丹',
  '特殊丹'
]

const CATEGORY_DESC = {
  灵根丹: '永久提升角色资质（根骨）',
  悟性丹: '临时提升功法、法术领悟',
  修为丹: '直接增加修为',
  聚灵丹: '临时提高挂机/闭关收益',
  战斗丹: '历练、切磋、死斗等；含疗伤',
  突破丹: '境界突破时自动服用',
  保命丹: '防止历练 / 死斗身死',
  特殊丹: '气运、心境、神魂、幻术等（部分待开放）'
}

let md = `# 丹药设定\n\n丹阁售卖与炼制目录，共 **${pills.length}** 种（配方 ${Object.keys(recipeMap).length} 条）；另有坊市稀有丹 **${rarePills.length}** 种（不可炼制）。\n\n`
md += `数据来源：\`pill-catalog.ts\`、\`pill-market-rare.ts\`（坊市稀有）、\`pill-system.ts\`（服用机制）、\`herb-catalog.ts\`（配方）。\n\n`
md += `## 效果方向（八类）\n\n`
md += `服用入口：角色页背包点按丹药。突破丹不在背包手动生效，于洞府突破时自动消耗。\n\n`
md += `| 方向 | 作用 |\n|------|------|\n`
for (const cat of CATEGORY_ORDER) {
  md += `| **${cat}** | ${CATEGORY_DESC[cat]} |\n`
}
md += `\n`

md += `## 品阶说明\n\n一品 → 九品 → 仙丹 → 神丹 → 先天神丹\n\n`
md += `## 炼制难度\n\n独立于品阶，取值 **1～12**，影响自己炼制成功率（越高越难）。委托炼制不受影响。\n\n`
md += `| 数值 | 名称 |\n|------|------|\n`
DIFF_LABELS.forEach((label, i) => {
  md += `| ${i + 1} | ${label} |\n`
})
md += `\n默认与品阶档位对齐（一品=1 … 先天神丹=12），可在 \`pill-catalog.ts\` 的 \`craftDifficulty\` 单独调整。\n\n`
md += `## 获取方式\n\n1. **丹阁购买**：按境界浏览，消耗灵石（无需炼丹术）\n2. **丹阁炼制**：需先修习法术「炼丹术」；配方只耗药材，不另扣灵石\n   - **自己炼制**：成功率由炼丹术熟练度与**炼制难度**决定；失败则药材尽毁\n   - **委托炼制**：只耗药材，必定成功\n3. **坊市稀有丹**：不可炼制、不进丹阁；极小概率出现在坊市货架，小概率出现在商人私货（见下节）\n4. **任务 / 历练掉落**（设定方向）\n\n`

md += `## 坊市稀有丹（不可炼制）\n\n`
md += `- 数据：\`src/constants/pill-market-rare.ts\`\n`
md += `- **暂不可炼制**，亦不在丹阁上架\n`
md += `- **坊市货架**：每日刷新时约 **3.5%** 额外上架 1 枚（受玩家境界过滤）\n`
md += `- **商人私货**：抽到丹药槽时约 **14%** 改为稀有丹\n`
md += `- **品阶权重**（越高越稀有）：黄 1 · 玄 0.5 · 地 0.22 · 天 0.08 · 仙 0.025\n`
md += `- **灵根丹 / 悟性丹 / 保命丹**：售价约 **×7**，出现权重再 **×0.12**（相对同阶普通稀有丹）\n`
md += `- 品阶映射建议境界：黄→炼气、玄→筑基、地→金丹、天→元婴、仙→化神\n`
md += `- 注：原文「金刚丹」与丹阁已有丹重名，**未收录**\n\n`
md += `| 名称 | 品阶 | 类别 | 效果 | 特效 | 说明 |\n`
md += `|------|------|------|------|------|------|\n`
for (const p of rarePills) {
  md += `| ${p.name} | ${p.grade} | ${p.type} | ${p.effect} | ${p.special} | ${p.story} |\n`
}
md += `\n`

for (const realm of REALM_ORDER) {
  const list = pills.filter((p) => p.realm === realm)
  if (!list.length) continue
  md += `## ${realm}（${list.length}）\n\n`
  md += `| 名称 | 品阶 | 炼制难度 | 类别 | 效果 | 特效 | 购买价 | 炼制配方 |\n`
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
for (const p of rarePills) {
  ;(byType[p.type] = byType[p.type] || []).push(`${p.name}（稀有）`)
}
md += `## 按类别索引\n\n`
for (const type of CATEGORY_ORDER) {
  const names = byType[type] || []
  if (!names.length) continue
  md += `- **${type}**（${names.length}）：${names.join('、')}\n`
}
const extras = Object.keys(byType).filter((t) => !CATEGORY_ORDER.includes(t))
for (const type of extras) {
  md += `- **${type}**（${byType[type].length}）：${byType[type].join('、')}\n`
}
md += `\n`

const onlyShop = pills.filter((p) => !recipeMap[p.name]).map((p) => p.name)
if (onlyShop.length) {
  md += `## 仅可购买（暂无炼制配方）\n\n${onlyShop.join('、')}\n\n`
}

md += `## 数据源\n\n`
md += `- 目录：\`src/constants/pill-catalog.ts\`\n`
md += `- 坊市稀有：\`src/constants/pill-market-rare.ts\`\n`
md += `- 效果与服用：\`src/constants/pill-system.ts\`\n`
md += `- 坊市/商人刷新：\`src/constants/market-shop.ts\`\n`
md += `- 配方：\`src/constants/herb-catalog.ts\`\n`

fs.writeFileSync('docs/丹药设定.md', md, 'utf8')
console.log('pills', pills.length, 'rare', rarePills.length, 'recipes', Object.keys(recipeMap).length)
console.log('wrote docs/丹药设定.md')
