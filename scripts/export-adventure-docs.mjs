import fs from 'fs'

const src = fs.readFileSync('src/constants/adventure-locations.ts', 'utf8')
const list = []
const blocks = src.split(/\{\s*"id":/)
for (let i = 1; i < blocks.length; i++) {
  const block = '"id":' + blocks[i]
  if (block.includes('export function') && !block.includes('"name"')) break
  const get = (key) => block.match(new RegExp(`"${key}":\\s*"([^"]*)"`))?.[1] || ''
  const getNum = (key) => Number(block.match(new RegExp(`"${key}":\\s*(\\d+)`))?.[1] || 0)
  const id = get('id')
  const name = get('name')
  if (!id || !name || !id.startsWith('loc-')) continue
  list.push({
    id,
    name,
    realm: get('realm'),
    danger: get('danger'),
    stars: getNum('stars'),
    drops: get('drops'),
    feature: get('feature')
  })
  if (blocks[i].includes('as AdventureLocation')) break
}

const REALM_ORDER = ['炼气', '筑基', '金丹', '元婴', '化神', '炼虚', '合体', '大乘', '渡劫', '飞升']

function estimateReward(item) {
  const realmBonus = Math.max(0, REALM_ORDER.indexOf(item.realm))
  const exp = 30 + item.stars * 18 + realmBonus * 25
  const stones = 16 + item.stars * 10 + realmBonus * 14
  return { exp, stones }
}

let md = `# 秘境设定\n\n历练 · 秘境探索地点总表，共 **${list.length}** 处。\n\n数据来源：\`src/constants/adventure-locations.ts\`。\n\n`

md += `## 规则摘要\n\n`
md += `| 项 | 说明 |\n|----|------|\n`
md += `| 入口 | 历练 Tab → 秘境历练 |\n`
md += `| 每日次数 | 默认剩余 **8** 次（\`remainTimes\`） |\n`
md += `| 进入条件 | 玩家境界 ≥ 地点建议境界 |\n`
md += `| 单次探索 | 消耗 1 次；刷新 **1～3** 只妖兽 |\n`
md += `| 偶遇人物 | 约 **70%** 概率；通常 1 人，偶发 2 人 |\n`
md += `| 奇遇 | 约 **28%** 触发（见 [任务设定](./任务设定.md) 奇遇） |\n`
md += `| 基础收益 | 修为 / 灵石随危险星级与境界估算 |\n`
md += `| 妖兽掉落 | 击败后获材料；妖兽按地点境界及邻近境界抽取 |\n`
md += `| 抓捕 | 击败后可抓捕化为灵宠（稀有度影响成功率）；可回售兽阁 |\n\n`

md += `## 收益估算\n\n\`estimateExploreReward\`：\n\n- 修为 = \`30 + 星级×18 + 境界序号×25\`\n- 灵石 = \`16 + 星级×10 + 境界序号×14\`\n\n境界序号：炼气=0 … 合体=6（本表最高至合体）。\n\n`

md += `## 按境界汇总\n\n| 境界 | 地点数 | 危险跨度 |\n|------|--------|----------|\n`
for (const realm of REALM_ORDER) {
  const items = list.filter((x) => x.realm === realm)
  if (!items.length) continue
  const stars = items.map((x) => x.stars)
  const lo = Math.min(...stars)
  const hi = Math.max(...stars)
  md += `| ${realm} | ${items.length} | ${'★'.repeat(lo)}${lo !== hi ? `～${'★'.repeat(hi)}` : ''} |\n`
}
md += `\n`

md += `## 完整目录\n\n`
for (const realm of REALM_ORDER) {
  const items = list.filter((x) => x.realm === realm)
  if (!items.length) continue
  md += `### ${realm}\n\n`
  md += `| 名称 | 危险 | 掉落 | 特色 | 估算修为 | 估算灵石 |\n`
  md += `|------|------|------|------|----------|----------|\n`
  for (const item of items) {
    const r = estimateReward(item)
    md += `| ${item.name} | ${item.danger} | ${item.drops} | ${item.feature} | +${r.exp} | ×${r.stones} |\n`
  }
  md += `\n`
}

md += `## 关联\n\n`
md += `- 偶遇人物：[历练人物](./历练人物.md)\n`
md += `- 遭遇妖兽 / 灵宠：[图鉴-灵兽](./图鉴-灵兽.md)\n`
md += `- 击杀掉落材料：[历练妖兽掉落](./历练妖兽掉落.md)\n`
md += `- 奇遇掉落材料：[历练奇遇掉落](./历练奇遇掉落.md)\n`
md += `- 奇遇任务：[任务设定](./任务设定.md)\n`
md += `- 玩法说明：[玩法系统](./玩法系统.md)\n`

fs.writeFileSync('docs/秘境设定.md', md, 'utf8')
console.log('locations', list.length)
console.log(
  'by realm',
  Object.fromEntries(
    REALM_ORDER.map((r) => [r, list.filter((x) => x.realm === r).length]).filter(([, n]) => n)
  )
)
console.log('wrote docs/秘境设定.md')
