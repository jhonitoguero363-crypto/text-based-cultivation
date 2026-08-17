import fs from 'fs'

const src = fs.readFileSync('src/constants/technique-catalog.ts', 'utf8')
const list = []
const re =
  /tech\('([^']+)',\s*'([^']+)',\s*'([^']+)',\s*'([^']+)',\s*'([^']+)',\s*'([^']+)',\s*'([^']+)',\s*'([^']+)'(?:,\s*\[([\s\S]*?)\])?\)/g
let m
while ((m = re.exec(src))) {
  const factionsRaw = (m[9] || '').trim()
  const factions = factionsRaw
    ? factionsRaw
        .split(',')
        .map((s) => s.replace(/['"\s]/g, ''))
        .filter(Boolean)
    : []
  list.push({
    id: m[1],
    grade: m[2],
    name: m[3],
    attr: m[4],
    school: m[5],
    realmRaw: m[6].replace(/练气/g, '炼气'),
    effect: m[7],
    origin: m[8],
    factions
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
  ['天道', '无上天道经', '法则', '终极流派'],
  ['魔修', '太古天魔经', '血气、神魂', '魔门专属'],
  ['妖族', '太古妖神经', '血脉、肉身', '妖族专属']
]

const ATTRS = ['金', '木', '水', '火', '土', '风', '冰', '雷', '无属性']

function accessLabel(factions) {
  if (!factions?.length) return '各宗通用'
  return factions.join('、') + '专属'
}

let md = `# 功法设定\n\n功法阁目录，共 **${list.length}** 部。\n\n数据来源：\`功法信息.txt\`、\`功法信息2.txt\`、\`功法流派.txt\` → \`technique-catalog.ts\`。\n\n`
md += `## 规则摘要\n\n| 项 | 说明 |\n|----|------|\n`
md += `| 与法术区别 | **功法**同时仅修习一门；法术见 [法术设定](./法术设定.md) |\n`
md += `| 筛选 | 功法阁「功法」Tab 按 **品阶**（黄 / 玄 / 地 / 天 / 仙）浏览 |\n`
md += `| 派系可见 | **魔修**仅魔门宗门；**妖族**流派仅妖族宗门；**剑修**与**炼体（体修）**各宗通用；其余通用目录各宗可见 |\n`
md += `| 坊市 | 仅上架各宗通用功法；派系专属不出现在坊市 |\n`
md += `| 兑换 | 消耗宗门贡献；需达到适合境界；兑换后自动设为修习中 |\n`
md += `| 改修 | 已收录功法可随时改修，原功法仍保留；**由低品阶改修至更高品阶会损耗修为**（每跨 1 小阶约 8%，上限 48%）；同阶或降阶不损 |\n`
md += `| 流派 | 十四流派（十二通用 + 魔修 / 妖族），每部功法归属其一 |\n`
md += `| 属性 | 九种：金 / 木 / 水 / 火 / 土 / 风 / 冰 / 雷 / **无属性**；影响洞府修炼灵根亲和与异灵根战力 |\n`
md += `| 功法熟练度 | 洞府修炼增长点数；六阶与法术相同；**当前修习中**功法按阶位加战力与修为获取 |\n`
md += `| 品阶与修为 | 品阶越高洞府修为倍率越高（\`getTechniqueGradeExpMult\`），与境界突破需求大致同步 |\n\n`

md += `## 灵根属性（九种）\n\n`
md += `| 属性 | 数量 | 功法 |\n|------|------|------|\n`
for (const attr of ATTRS) {
  const names = list.filter((x) => x.attr === attr).map((x) => x.name)
  md += `| ${attr} | ${names.length} | ${names.join('、') || '—'} |\n`
}
md += `\n`

md += `## 熟练度阶位\n\n数据来源：\`src/constants/technique-proficiency.ts\`（阈值同法术）。\n\n`
md += `| 阶 | 熟练度 | 名称 | 效果 |\n|----|--------|------|------|\n`
md += `| 1 | 0～99 | 初窥门径 | 功法基础效果 |\n`
md += `| 2 | 100～299 | 略有小成 | 战力 +5%，修为获取 +5% |\n`
md += `| 3 | 300～699 | 登堂入室 | 战力 +10%，修为获取 +10% |\n`
md += `| 4 | 700～1499 | 融会贯通 | 战力 +18%，修为获取 +15% |\n`
md += `| 5 | 1500～2999 | 出神入化 | 战力 +30%，修为获取 +25% |\n`
md += `| 6 | ≥3000 | 炉火纯青 | 战力 +50%，修为获取 +40% |\n\n`
md += `洞府修炼功法时约每 5 秒增加修为：随机吐纳 × 悟性/灵根/洞府 × **境界基础** × **功法品阶倍率**（黄下≈0.85～仙上≈3.1）×（1+熟练度修为加成），并增加 **0～0.5** 熟练度（受悟性倍率，封顶 0.5）。境界越高突破需求涨得更快，需换更高阶功法才能跟上。进阶时提示境界名称。仅 **当前修习中** 的功法熟练度计入战力。\n\n`

md += `## 流派\n\n| 流派 | 核心功法 | 主要属性 | 玩法 |\n|------|----------|----------|------|\n`
for (const [school, core, attrs, play] of SCHOOLS) {
  const count = list.filter((x) => x.school === school).length
  md += `| ${school}（${count}） | ${core} | ${attrs} | ${play} |\n`
}
md += `\n`

md += `## 完整目录\n\n`
md += `| 品阶 | 名称 | 属性 | 流派 | 适合境界 | 效果 | 获取方式 | 可见 | 贡献 |\n`
md += `|------|------|------|------|----------|------|----------|------|------|\n`
for (const item of list) {
  const cost = COST[item.grade] || 500
  md += `| ${item.grade} | ${item.name} | ${item.attr} | ${item.school} | ${item.realmRaw} | ${item.effect} | ${item.origin} | ${accessLabel(item.factions)} | ${cost} |\n`
}
md += `\n`

fs.writeFileSync('docs/功法设定.md', md, 'utf8')
console.log('techniques', list.length)
const byAttr = {}
for (const item of list) {
  byAttr[item.attr] = (byAttr[item.attr] || 0) + 1
}
console.log('byAttr', byAttr)
const byAccess = { 通用: 0, 魔门: 0, 妖族: 0 }
for (const item of list) {
  if (!item.factions.length) byAccess['通用']++
  else if (item.factions.includes('魔门')) byAccess['魔门']++
  else if (item.factions.includes('妖族')) byAccess['妖族']++
}
console.log('byAccess', byAccess)
