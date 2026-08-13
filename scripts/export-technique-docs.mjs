import fs from 'fs'

const src = fs.readFileSync('src/constants/technique-catalog.ts', 'utf8')
const list = []
const re =
  /tech\('([^']+)',\s*'([^']+)',\s*'([^']+)',\s*'([^']+)',\s*'([^']+)',\s*'([^']+)',\s*'([^']+)',\s*'([^']+)'\)/g
let m
while ((m = re.exec(src))) {
  list.push({
    id: m[1],
    grade: m[2],
    name: m[3],
    type: m[4],
    school: m[5],
    realmRaw: m[6].replace(/练气/g, '炼气'),
    effect: m[7],
    origin: m[8]
  })
}

const COST = {
  黄阶下品: 80,
  黄阶中品: 120,
  黄阶上品: 180,
  玄阶下品: 280,
  玄阶中品: 400,
  玄阶上品: 560,
  地阶下品: 900,
  地阶中品: 1300,
  地阶上品: 1800,
  天阶下品: 3000,
  天阶中品: 4500,
  天阶上品: 6500,
  仙阶下品: 12000,
  仙阶中品: 20000,
  仙阶上品: 35000
}

const SCHOOLS = [
  ['剑修', '太虚剑诀', '攻击、暴击', '高爆发'],
  ['炼体', '九转炼体诀', '生命、防御', '肉盾'],
  ['法修', '太玄功', '灵力、法伤', '技能输出'],
  ['雷修', '九天雷皇诀', '雷伤、暴击', '爆发'],
  ['魂修', '九幽魂诀', '神魂、控制', '控制'],
  ['驭兽', '万兽灵诀', '灵宠属性', '灵宠战斗'],
  ['丹修', '青帝长生诀', '恢复、炼丹', '辅助'],
  ['阵修', '阴阳造化诀', '阵法、控制', '策略'],
  ['空间', '虚空经', '闪避、空间', '高机动'],
  ['时间', '岁月诀', '时间减速', '后期玩法'],
  ['混沌', '混沌炼气诀', '全属性', '全能'],
  ['天道', '无上天道经', '法则', '终极流派']
]

let md = `# 功法设定\n\n功法阁目录，共 **${list.length}** 部。\n\n数据来源：\`功法信息.txt\`、\`功法流派.txt\` → \`technique-catalog.ts\`。\n\n`
md += `## 规则摘要\n\n| 项 | 说明 |\n|----|------|\n`
md += `| 与法术区别 | **功法**同时仅修习一门；法术见 [法术设定](./法术设定.md) |\n`
md += `| 筛选 | 功法阁「功法」Tab 按 **品阶**（黄 / 玄 / 地 / 天 / 仙）浏览 |\n`
md += `| 兑换 | 消耗宗门贡献；需达到适合境界；兑换后自动设为修习中 |\n`
md += `| 改修 | 已收录功法可随时改修，原功法仍保留 |\n`
md += `| 流派 | 十二流派，每部功法归属其一 |\n\n`

md += `## 十二流派\n\n| 流派 | 核心功法 | 主要属性 | 玩法 |\n|------|----------|----------|------|\n`
for (const [school, core, attrs, play] of SCHOOLS) {
  const count = list.filter((x) => x.school === school).length
  md += `| ${school}（${count}） | ${core} | ${attrs} | ${play} |\n`
}
md += `\n`

md += `## 完整目录\n\n`
md += `| 品阶 | 名称 | 流派 | 类型 | 适合境界 | 效果 | 获取方式 | 贡献 |\n`
md += `|------|------|------|------|----------|------|----------|------|\n`
for (const item of list) {
  const cost = COST[item.grade] || 500
  md += `| ${item.grade} | ${item.name} | ${item.school} | ${item.type} | ${item.realmRaw} | ${item.effect} | ${item.origin} | ${cost} |\n`
}
md += `\n`

fs.writeFileSync('docs/功法设定.md', md, 'utf8')
console.log('techniques', list.length)
const bySchool = {}
for (const item of list) bySchool[item.school] = (bySchool[item.school] || 0) + 1
console.log('schools', bySchool)
console.log('wrote docs/功法设定.md')
