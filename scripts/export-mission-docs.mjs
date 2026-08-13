import fs from 'fs'

const src = fs.readFileSync('src/constants/mission-catalog.ts', 'utf8')

const missions = []
const blocks = src.split(/\{\s*"id":/)
for (let i = 1; i < blocks.length; i++) {
  const block = '"id":' + blocks[i]
  const id = block.match(/"id":\s*"([^"]+)"/)?.[1]
  const name = block.match(/"name":\s*"([^"]+)"/)?.[1]
  const tag = block.match(/"tag":\s*"([^"]+)"/)?.[1]
  const desc = block.match(/"desc":\s*"([^"]+)"/)?.[1]
  const reward = block.match(/"reward":\s*"([^"]+)"/)?.[1]
  const action = block.match(/"action":\s*"([^"]+)"/)?.[1]
  const playStyle = block.match(/"playStyle":\s*"([^"]*)"/)?.[1] || ''
  if (id && name && tag) {
    missions.push({ id, name, tag, desc, reward, action, playStyle })
  }
}

const TAG_ORDER = ['每日', '悬赏', '周常', '随机', '奇遇']
const TAG_NOTE = {
  每日: '宗门任务堂常见日常，贡献与灵石为主',
  悬赏: '高风险高回报，偏战斗与营救',
  周常: '周期较长、奖励更丰',
  随机: '任务板偶发特殊任务',
  奇遇: '不进任务堂；秘境探索约 28% 概率触发'
}

let md = `# 任务设定\n\n宗门任务与历练奇遇总库，共 **${missions.length}** 条。\n\n数据来源：\`src/constants/mission-catalog.ts\`。\n\n`

md += `## 规则摘要\n\n`
md += `| 项 | 说明 |\n|----|------|\n`
md += `| 时间 | 现实 **6 小时 = 1 修历日**（\`game-time.ts\`） |\n`
md += `| 任务堂槽位 | 每修历日展示 **5** 条（\`DAILY_MISSION_COUNT\`） |\n`
md += `| 换日规则 | **未完成任务保留**；已完成移除后补新 |\n`
md += `| 接取上限 | **同时仅 1 个**进行中任务 |\n`
md += `| 流程 | 任务堂接取 → 角色页完成 / 取消 |\n`
md += `| 完成后续 | 槽位用新任务补齐；无每日完成次数硬上限 |\n`
md += `| 奖励结算 | 贡献 / 灵石 / 修为 / 声望等，见各条 \`reward\` |\n`
md += `| 奇遇 | 标签「奇遇」**不进任务堂**；历练探索时以 **28%** 概率触发 |\n`
md += `| 奇遇了结 | 探索页探查/了结，额外获得修为与灵石 |\n\n`

md += `## 类型说明\n\n`
for (const tag of TAG_ORDER) {
  const n = missions.filter((m) => m.tag === tag).length
  md += `- **${tag}**（${n}）：${TAG_NOTE[tag] || ''}\n`
}
md += `\n`

for (const tag of TAG_ORDER) {
  const list = missions.filter((m) => m.tag === tag)
  if (!list.length) continue
  md += `## ${tag}（${list.length}）\n\n`
  if (tag === '奇遇') {
    md += `| 名称 | 描述 | 奖励 / 玩法 | 玩法说明 |\n`
    md += `|------|------|-------------|----------|\n`
    for (const item of list) {
      md += `| ${item.name} | ${item.desc} | ${item.reward} | ${item.playStyle || '—'} |\n`
    }
  } else {
    md += `| 名称 | 描述 | 奖励 | 操作 |\n`
    md += `|------|------|------|------|\n`
    for (const item of list) {
      md += `| ${item.name} | ${item.desc} | ${item.reward} | ${item.action} |\n`
    }
  }
  md += `\n`
}

md += `## 数据源与常量\n\n`
md += `- \`MISSION_CATALOG\`：全部任务 + 奇遇\n`
md += `- \`SECT_MISSION_CATALOG\`：任务堂池（排除奇遇）\n`
md += `- \`ADVENTURE_ENCOUNTER_CATALOG\`：历练奇遇池\n`
md += `- \`DAILY_MISSION_COUNT = 5\`\n`
md += `- \`ADVENTURE_ENCOUNTER_CHANCE = 0.28\`\n`

fs.writeFileSync('docs/任务设定.md', md, 'utf8')
console.log(
  'missions',
  missions.length,
  TAG_ORDER.map((t) => `${t}:${missions.filter((m) => m.tag === t).length}`).join(' ')
)
console.log('wrote docs/任务设定.md')
