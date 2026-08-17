/**
 * 导出宗门任务堂文档（通用 / 特色）与历练奇遇文档。
 * 奇遇不写入任务设定。
 */
import fs from 'fs'

const src = fs.readFileSync('src/constants/mission-catalog.ts', 'utf8')

function getStr(block, key) {
  const re = new RegExp(`${key}:\\s*'([^']*)'`)
  return block.match(re)?.[1]
}

const FACILITY_LABEL = {
  tower: '青云宗 · 镇妖塔',
  demon_den: '天魔宗 · 魔窟',
  sword_tomb: '万剑宗 · 剑冢',
  ancestor_pool: '妖族 · 返祖池'
}

const missions = []
const blocks = src.split(/\{\s*\n\s*id:/)
for (let i = 1; i < blocks.length; i++) {
  const block = 'id:' + blocks[i]
  const id = getStr(block, 'id')
  const name = getStr(block, 'name')
  const tag = getStr(block, 'tag')
  if (!id || !name || !tag) continue
  missions.push({
    id,
    name,
    tag,
    desc: getStr(block, 'desc') || '',
    reward: getStr(block, 'reward') || '',
    action: getStr(block, 'action') || '',
    playStyle: getStr(block, 'playStyle') || '',
    drops: getStr(block, 'drops') || '',
    requiresFacility: getStr(block, 'requiresFacility') || ''
  })
}

const encounters = missions.filter((m) => m.tag === '奇遇')
const sectMissions = missions.filter((m) => m.tag !== '奇遇')
const TAG_ORDER = ['每日', '悬赏', '周常', '随机']

function sortByTag(list) {
  return [...list].sort((a, b) => {
    const ta = TAG_ORDER.indexOf(a.tag)
    const tb = TAG_ORDER.indexOf(b.tag)
    if (ta !== tb) return ta - tb
    return a.id.localeCompare(b.id, 'en')
  })
}

const general = sortByTag(sectMissions.filter((m) => !m.requiresFacility))
const special = sortByTag(sectMissions.filter((m) => m.requiresFacility))

function writeMissionTable(list, { withFacility = false } = {}) {
  let out = ''
  if (withFacility) {
    out += `| 名称 | 标签 | 所属 | 描述 | 奖励 | 操作 |\n`
    out += `|------|------|------|------|------|------|\n`
    for (const item of list) {
      const belonging = FACILITY_LABEL[item.requiresFacility] || item.requiresFacility
      out += `| ${item.name} | ${item.tag} | ${belonging} | ${item.desc} | ${item.reward} | ${item.action} |\n`
    }
  } else {
    out += `| 名称 | 标签 | 描述 | 奖励 | 操作 |\n`
    out += `|------|------|------|------|------|\n`
    for (const item of list) {
      out += `| ${item.name} | ${item.tag} | ${item.desc} | ${item.reward} | ${item.action} |\n`
    }
  }
  return out
}

let missionMd = `# 任务设定\n\n`
missionMd += `宗门**任务堂**名录，共 **${sectMissions.length}** 条（不含历练奇遇）。\n\n`
missionMd += `数据来源：\`src/constants/mission-catalog.ts\` → \`SECT_MISSION_CATALOG\`。\n\n`
missionMd += `历练奇遇见 [奇遇设定](./奇遇设定.md)；奇遇材料见 [历练奇遇掉落](./历练奇遇掉落.md)。\n\n`

missionMd += `## 规则摘要\n\n`
missionMd += `| 项 | 说明 |\n|----|------|\n`
missionMd += `| 时间 | 现实 **6 小时 = 1 修历日**（\`game-time.ts\`） |\n`
missionMd += `| 任务堂槽位 | 每修历日展示 **5** 条（\`DAILY_MISSION_COUNT\`） |\n`
missionMd += `| 换日规则 | **未完成任务保留**；已完成移除后补新 |\n`
missionMd += `| 接取上限 | **同时仅 1 个**进行中任务 |\n`
missionMd += `| 流程 | 任务堂接取 → 角色页完成 / 取消 |\n`
missionMd += `| 完成后续 | 槽位用新任务补齐；无每日完成次数硬上限 |\n`
missionMd += `| 奖励结算 | 贡献 / 灵石 / 修为 / 声望等，见各条 \`reward\` |\n`
missionMd += `| 分类 | **通用**：各宗可刷；**特色**：依赖本宗特色建筑（\`requiresFacility\`） |\n`
missionMd += `| 文案宗门化 | 目录用中性设施名；展示时按当前宗门替换，见 \`mission-localize.ts\` |\n`
missionMd += `| 完成条件细表 | [宗门任务-完成条件](./宗门任务-完成条件.md) |\n\n`

missionMd += `## 类型说明\n\n`
missionMd += `- **通用任务**（${general.length}）：各宗任务堂均可出现；标签仍为每日 / 悬赏 / 周常 / 随机\n`
missionMd += `- **特色任务**（${special.length}）：绑定各宗特色建筑，仅本宗拥有对应设施时刷出\n\n`
missionMd += `标签含义（板面展示用，与通用/特色正交）：\n\n`
for (const tag of TAG_ORDER) {
  const n = sectMissions.filter((m) => m.tag === tag).length
  const note =
    tag === '每日'
      ? '日常，贡献与灵石为主'
      : tag === '悬赏'
        ? '高风险高回报，偏战斗与营救'
        : tag === '周常'
          ? '周期较长、奖励更丰'
          : '任务板偶发特殊任务'
  missionMd += `- **${tag}**（${n}）：${note}\n`
}
missionMd += `\n`

missionMd += `## 通用任务（${general.length}）\n\n`
missionMd += writeMissionTable(general)
missionMd += `\n`

missionMd += `## 特色任务（${special.length}）\n\n`
missionMd += `仅当本宗拥有对应特色建筑时，才可能出现在任务堂。\n\n`
missionMd += writeMissionTable(special, { withFacility: true })
missionMd += `\n`

missionMd += `## 数据源与常量\n\n`
missionMd += `- \`SECT_MISSION_CATALOG\`：任务堂池；无 \`requiresFacility\` 为通用，有则为特色\n`
missionMd += `- \`MISSION_CATALOG\`：任务堂 + 奇遇总库（奇遇见 [奇遇设定](./奇遇设定.md)）\n`
missionMd += `- \`DAILY_MISSION_COUNT = 5\`\n`
missionMd += `- 设施与特色建筑：\`src/constants/sect-facilities.ts\`\n`
missionMd += `- 文案本地化：\`src/constants/mission-localize.ts\`\n`

fs.writeFileSync('docs/任务设定.md', missionMd, 'utf8')

let encounterMd = `# 奇遇设定\n\n`
encounterMd += `历练秘境探索触发的 **奇遇** 名录，共 **${encounters.length}** 条。**不进**宗门任务堂。\n\n`
encounterMd += `数据来源：\`src/constants/mission-catalog.ts\` → \`ADVENTURE_ENCOUNTER_CATALOG\`。\n\n`
encounterMd += `宗门任务堂见 [任务设定](./任务设定.md)；了结材料见 [历练奇遇掉落](./历练奇遇掉落.md)。\n\n`

encounterMd += `## 规则摘要\n\n`
encounterMd += `| 项 | 说明 |\n|----|------|\n`
encounterMd += `| 触发 | 秘境探索约 **28%**（\`ADVENTURE_ENCOUNTER_CHANCE\`） |\n`
encounterMd += `| 入口 | 探索页「旅途奇遇」· 探查 / 了结 |\n`
encounterMd += `| 基础奖励 | 了结时额外修为与灵石（与材料独立） |\n`
encounterMd += `| 材料 | 条目 \`drops\` 配置后等概率抽 1 种；空则为待补充 |\n`
encounterMd += `| 玩法 | 当前多为文案占位；分支可玩化见 [待完善功能](./待完善功能.md) |\n\n`

encounterMd += `## 奇遇名录（${encounters.length}）\n\n`
encounterMd += `| 名称 | 描述 | 奖励 / 玩法 | 玩法说明 | 材料掉落 |\n`
encounterMd += `|------|------|-------------|----------|----------|\n`
for (const item of encounters) {
  const drops = item.drops?.trim()
  const dropText = drops && drops !== '待补充' ? drops : '待补充'
  encounterMd += `| ${item.name} | ${item.desc} | ${item.reward} | ${item.playStyle || '—'} | ${dropText} |\n`
}
encounterMd += `\n`

encounterMd += `## 数据源与常量\n\n`
encounterMd += `- \`ADVENTURE_ENCOUNTER_CATALOG\`：历练奇遇池\n`
encounterMd += `- \`ADVENTURE_ENCOUNTER_CHANCE = 0.28\`\n`
encounterMd += `- 材料掉落细表：[历练奇遇掉落](./历练奇遇掉落.md)\n`
encounterMd += `- 结算：\`rollEncounterResolveReward\` → 探索页了结\n`

fs.writeFileSync('docs/奇遇设定.md', encounterMd, 'utf8')

console.log(
  'sect',
  sectMissions.length,
  `通用:${general.length}`,
  `特色:${special.length}`,
  '奇遇',
  encounters.length
)
console.log('wrote docs/任务设定.md + docs/奇遇设定.md')
