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
const ATTRS = ['金', '木', '水', '火', '土', '风', '冰', '雷', '无属性']

let md = `# 法术设定\n\n功法阁 · 法术目录，共 **${list.length}** 门（含生活法术：炼丹术、炼器术）。\n\n数据来源：\`法术信息.txt\` → \`src/constants/spell-catalog.ts\`。\n\n`
md += `## 规则摘要\n\n| 项 | 说明 |\n|----|------|\n`
md += `| 与功法区别 | **功法**同时仅修习一门；**法术**可同时修习多门 |\n`
md += `| 入口 | 功法阁 →「法术」Tab |\n`
md += `| 筛选 | 黄 / 玄 / 地 / 天 / 仙 |\n`
md += `| 兑换 | 消耗宗门贡献；需达到品阶对应境界 |\n`
md += `| 背包分类 | \`法术\`（与功法分栏） |\n`
md += `| 属性 | 九种：金 / 木 / 水 / 火 / 土 / 风 / 冰 / 雷 / **无属性**（与功法一致；影响洞府演练灵根亲和、秘境属性契合） |\n`
md += `| 生活法术 | **炼丹术** → 丹阁炼制；**炼器术** → 器阁打造（均为无属性） |\n`
md += `| 法术熟练度 | 洞府演练增长点数；六阶见下表；自己炼制成功率受对应炼制法术熟练度影响 |\n`
md += `| 与功法互斥 | 洞府中功法与法术不可同时修炼 |\n\n`

md += `## 灵根属性（九种）\n\n`
md += `| 属性 | 数量 | 法术 |\n|------|------|------|\n`
for (const attr of ATTRS) {
  const names = list.filter((x) => x.attr === attr).map((x) => x.name)
  md += `| ${attr} | ${names.length} | ${names.join('、') || '—'} |\n`
}
md += `\n`

md += `## 熟练度阶位\n\n数据来源：\`法术熟练度.txt\` → \`src/constants/spell-proficiency.ts\`。\n\n`
md += `| 阶 | 熟练度 | 名称 | 效果 |\n|----|--------|------|------|\n`
md += `| 1 | 0～99 | 初窥门径 | 法术基础效果 |\n`
md += `| 2 | 100～299 | 略有小成 | 法术威力 +5% |\n`
md += `| 3 | 300～699 | 登堂入室 | 法术威力 +10%，灵力消耗 -5% |\n`
md += `| 4 | 700～1499 | 融会贯通 | 法术威力 +18%，冷却 -10% |\n`
md += `| 5 | 1500～2999 | 出神入化 | 法术威力 +30%，灵力消耗 -15% |\n`
md += `| 6 | 3000+ | 炉火纯青 | 法术威力 +50%，有概率触发特殊效果 |\n\n`
md += `洞府演练法术时约每 5 秒增加 **0～0.5** 熟练度（受悟性倍率，封顶 0.5），**不增加修为**。进阶时提示境界名称。\n\n`
md += `秘境**击败妖兽 / 人物**均可增长熟练度（约 0.1～0.5；妖兽优先属性契合）。击败妖兽另获微量修为；**击杀**才掉材料（不给灵石）；抓捕成功只得灵宠。击败人物另获灵石与微量修为。\n\n`

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
md += `- 数据源：\`src/constants/spell-catalog.ts\`\n`

fs.writeFileSync('docs/法术设定.md', md, 'utf8')
console.log('spells', list.length)
console.log(
  'by grade',
  Object.fromEntries(TIERS.map((t) => [t, list.filter((x) => x.grade === t).length]))
)
const byAttr = {}
for (const item of list) {
  byAttr[item.attr] = (byAttr[item.attr] || 0) + 1
}
console.log('byAttr', byAttr)
console.log('wrote docs/法术设定.md')
