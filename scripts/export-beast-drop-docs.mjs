import fs from 'fs'

const src = fs.readFileSync('src/constants/beast-catalog.ts', 'utf8')
const list = []
const blocks = src.split(/\{\s*"id":/)
for (let i = 1; i < blocks.length; i++) {
  const block = '"id":' + blocks[i]
  if (block.includes('export function') && !block.includes('"name"')) break
  const get = (key) => block.match(new RegExp(`"${key}":\\s*"([^"]*)"`))?.[1] || ''
  const getNum = (key) => Number(block.match(new RegExp(`"${key}":\\s*(\\d+)`))?.[1] || 0)
  const id = get('id')
  const name = get('name')
  if (!id || !name || !id.startsWith('beast-')) continue
  const dropsRaw = get('drops')
  const drops = dropsRaw
    .split('、')
    .map((part) => part.trim())
    .filter(Boolean)
  list.push({
    id,
    name,
    race: get('race'),
    rarity: get('rarity'),
    element: get('element'),
    ability: get('ability'),
    drops,
    dropsRaw,
    realm: get('realm'),
    weight: getNum('weight')
  })
  if (blocks[i].includes('as CatalogBeast')) break
}

const REALM_ORDER = ['炼气', '筑基', '金丹', '元婴', '化神', '炼虚', '合体', '大乘', '渡劫', '飞升']
const RARITY_ORDER = ['普通', '精英', '稀有', '传说', '神话']

function splitMaterials(drops) {
  return drops
}

/** 材料 → 掉落来源妖兽 */
const materialIndex = new Map()
for (const beast of list) {
  for (const mat of beast.drops) {
    if (!materialIndex.has(mat)) materialIndex.set(mat, [])
    materialIndex.get(mat).push(beast)
  }
}

const materials = [...materialIndex.keys()].sort((a, b) => a.localeCompare(b, 'zh-CN'))

let md = `# 历练妖兽掉落\n\n`
md += `秘境击败妖兽后，选择 **击杀**（或抓捕失败转击杀）时掉落的材料总表。\n\n`
md += `数据来源：\`src/constants/beast-catalog.ts\`（字段 \`drops\`）。结算逻辑：\`src/stores/adventure.ts\` → \`rollBeastMaterialDrop\`。\n\n`

md += `## 规则摘要\n\n`
md += `| 项 | 说明 |\n|----|------|\n`
md += `| 触发 | 战斗胜利后选 **击杀**；或 **抓捕失败** 自动转击杀 |\n`
md += `| 抓捕成功 | 只得灵宠，**不掉材料** |\n`
md += `| 掉落数量 | 固定 **1** 份 |\n`
md += `| 抽取方式 | 从该妖兽 \`drops\` 列表中 **等概率随机 1 种** |\n`
md += `| 灵石 | 击杀妖兽 **不给灵石**（仅微量修为在击败时结算） |\n`
md += `| 条目 | 妖兽 **${list.length}** 种 · 材料种类 **${materials.length}** |\n\n`

md += `## 按境界 · 妖兽掉落表\n\n`
for (const realm of REALM_ORDER) {
  const items = list.filter((x) => x.realm === realm)
  if (!items.length) continue
  md += `### ${realm}（${items.length}）\n\n`
  md += `| 名称 | 稀有 | 种族 | 属性 | 可能掉落 |\n`
  md += `|------|------|------|------|----------|\n`
  for (const item of items) {
    md += `| ${item.name} | ${item.rarity} | ${item.race} | ${item.element} | ${item.drops.join('、')} |\n`
  }
  md += `\n`
}

md += `## 材料索引\n\n`
md += `按材料名汇总「可能由哪些妖兽掉落」。同一材料可出现在多只妖兽的掉落池中。\n\n`
md += `| 材料 | 出现次数 | 来源妖兽（境界） |\n`
md += `|------|----------|------------------|\n`
for (const mat of materials) {
  const sources = materialIndex.get(mat)
  const label = sources
    .map((b) => `${b.name}（${b.realm}）`)
    .join('、')
  md += `| ${mat} | ${sources.length} | ${label} |\n`
}
md += `\n`

md += `## 统计\n\n`
md += `### 按境界\n\n`
md += `| 境界 | 妖兽数 | 材料条目（去重前） |\n`
md += `|------|--------|--------------------|\n`
for (const realm of REALM_ORDER) {
  const items = list.filter((x) => x.realm === realm)
  if (!items.length) continue
  const dropCount = items.reduce((n, b) => n + b.drops.length, 0)
  md += `| ${realm} | ${items.length} | ${dropCount} |\n`
}
md += `\n`

md += `### 按稀有度\n\n`
md += `| 稀有度 | 数量 |\n`
md += `|--------|------|\n`
for (const rarity of RARITY_ORDER) {
  const n = list.filter((x) => x.rarity === rarity).length
  if (!n) continue
  md += `| ${rarity} | ${n} |\n`
}
const otherRarity = list.filter((x) => !RARITY_ORDER.includes(x.rarity))
if (otherRarity.length) {
  md += `| 其他 | ${otherRarity.length} |\n`
}
md += `\n`

md += `## 关联\n\n`
md += `- 秘境地点：[秘境设定](./秘境设定.md)\n`
md += `- 妖兽名录：[图鉴-灵兽](./图鉴-灵兽.md)\n`
md += `- 玩法说明：[玩法系统](./玩法系统.md)\n`

fs.writeFileSync('docs/历练妖兽掉落.md', md, 'utf8')
console.log('beasts', list.length)
console.log('materials', materials.length)
console.log('wrote docs/历练妖兽掉落.md')
