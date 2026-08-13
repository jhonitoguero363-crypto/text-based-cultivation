import fs from 'fs'

const src = fs.readFileSync('src/constants/spell-catalog.ts', 'utf8')
const list = []
const re =
  /spell\('([^']+)',\s*'([^']+)',\s*'([^']+)',\s*'([^']+)',\s*'([^']+)',\s*'([^']+)'\)/g
let m
while ((m = re.exec(src))) {
  list.push({
    id: m[1],
    grade: m[2],
    name: m[3],
    attr: m[4],
    effect: m[5],
    type: m[6]
  })
}

const COST = { 黄阶: 60, 玄阶: 220, 地阶: 800, 天阶: 2800, 仙阶: 12000 }
const REALM = { 黄阶: '炼气', 玄阶: '筑基', 地阶: '金丹', 天阶: '元婴', 仙阶: '渡劫' }
const TIERS = ['黄阶', '玄阶', '地阶', '天阶', '仙阶']

let md = `# 法术设定\n\n功法阁 · 法术目录，共 **${list.length}** 门（含生活法术：炼丹术、炼器术）。\n\n数据来源：\`法术信息.txt\` → \`src/constants/spell-catalog.ts\`。\n\n`
md += `## 规则摘要\n\n| 项 | 说明 |\n|----|------|\n`
md += `| 与功法区别 | **功法**同时仅修习一门；**法术**可同时修习多门 |\n`
md += `| 入口 | 功法阁 →「法术」Tab |\n`
md += `| 筛选 | 黄 / 玄 / 地 / 天 / 仙 |\n`
md += `| 兑换 | 消耗宗门贡献；需达到品阶对应境界 |\n`
md += `| 背包分类 | \`法术\`（与功法分栏） |\n`
md += `| 生活法术 | **炼丹术** → 丹阁炼制；**炼器术** → 器阁打造 |\n`
md += `| 法术等级 | 洞府演练可提升（Lv.1～10）；自己炼制成功率受对应炼制法术等级影响 |\n\n`

md += `## 品阶门槛\n\n| 品阶 | 最低境界 | 贡献 |\n|------|----------|------|\n`
for (const tier of TIERS) {
  const n = list.filter((x) => x.grade === tier).length
  md += `| ${tier}（${n}） | ${REALM[tier]} | ${COST[tier]} |\n`
}
md += `\n`

md += `## 完整目录\n\n`
for (const tier of TIERS) {
  const items = list.filter((x) => x.grade === tier)
  md += `### ${tier}\n\n`
  md += `| 名称 | 属性 | 类型 | 效果 | 贡献 |\n`
  md += `|------|------|------|------|------|\n`
  for (const item of items) {
    md += `| ${item.name} | ${item.attr} | ${item.type} | ${item.effect} | ${COST[tier]} |\n`
  }
  md += `\n`
}

md += `## 关联\n\n`
md += `- 功法目录：[功法设定](./功法设定.md)\n`
md += `- 角色详情展示本命功法与已习法术\n`

fs.writeFileSync('docs/法术设定.md', md, 'utf8')
console.log('spells', list.length)
console.log(
  'by grade',
  Object.fromEntries(TIERS.map((t) => [t, list.filter((x) => x.grade === t).length]))
)
console.log('wrote docs/法术设定.md')
