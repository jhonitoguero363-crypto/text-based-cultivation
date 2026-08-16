import fs from 'fs'

function parseMemberObjects(src) {
  const list = []
  const re =
    /\{\s*id:\s*'([^']+)'\s*,\s*name:\s*'([^']+)'\s*,\s*title:\s*'([^']+)'\s*,\s*realm:\s*'([^']+)'\s*,\s*power:\s*(\d+)[\s\S]*?group:\s*'([^']+)'\s*,\s*personality:\s*'([^']*)'\s*,\s*specialty:\s*'([^']*)'\s*,\s*note:\s*'([^']*)'\s*,\s*attitude:\s*'([^']*)'\s*,\s*sectId:\s*'([^']+)'\s*\}/g
  let m
  while ((m = re.exec(src))) {
    list.push({
      id: m[1],
      name: m[2],
      title: m[3],
      realm: m[4],
      power: Number(m[5]),
      group: m[6],
      personality: m[7],
      specialty: m[8],
      note: m[9],
      attitude: m[10],
      sectId: m[11]
    })
  }
  return list
}

const memberSrc = fs.readFileSync('src/constants/member-catalog.ts', 'utf8')
const memberExtraFiles = [
  'src/constants/member-catalog-qingyun-extra.ts',
  'src/constants/member-catalog-tianmo.ts',
  'src/constants/member-catalog-wanjian.ts',
  'src/constants/member-catalog-yaozu.ts'
]
const memberExtraSrc = memberExtraFiles
  .filter((p) => fs.existsSync(p))
  .map((p) => fs.readFileSync(p, 'utf8'))
  .join('\n')
const npcSrc = fs.readFileSync('src/constants/adventure-npc-catalog.ts', 'utf8')

const memberStart = memberSrc.indexOf('const SECT_MEMBER_CATALOG_DRAFT')
const memberEnd = memberSrc.indexOf('export const SECT_MEMBER_CATALOG', memberStart)
const memberSlice = memberSrc.slice(memberStart, memberEnd > 0 ? memberEnd : undefined)

function inferMemberDivision(member) {
  const text = `${member.title}${member.specialty}${member.note || ''}`
  if (/丹阁|丹房|炼丹|丹方|丹渣|晒药|清扫丹渣|魔丹|妖丹|剑丹/.test(text)) return '丹阁'
  if (/器阁|器房|炼器|锤锻|器屑|矿料|收拾器屑|骨兵|铸剑|骨甲/.test(text)) return '器阁'
  if (/灵兽|兽栏|饲灵禽|喂养灵|草料|灵禽|灵鸡|清理兽栏|魔兽|饲魔禽|剑灵/.test(text)) return '灵兽阁'
  if (/矿洞|挖矿|采矿|矿石运|运料/.test(text)) return '矿洞'
  if (/药园|灵田|灵泉|菜畦|菜园|晒谷|督耕|灌溉|灵药|药材|药泉|施肥|粪肥|医术|医理|毒田|魔药|医剑|药谷/.test(text)) {
    return '药园'
  }
  return '未划分'
}

const byId = new Map()
for (const m of [
  ...parseMemberObjects(memberSlice),
  ...parseMemberObjects(memberExtraSrc)
]) {
  byId.set(m.id, { ...m, division: inferMemberDivision(m) })
}
const members = [...byId.values()]

const npcs = []
{
  const start = npcSrc.indexOf('export const ADVENTURE_NPC_CATALOG')
  const end = npcSrc.indexOf('export function', start)
  const slice = npcSrc.slice(start, end > 0 ? end : undefined)
  const blocks = slice.split(/\{\s*"id":/)
  for (let i = 1; i < blocks.length; i++) {
    const block = '"id":' + blocks[i]
    const get = (key) => block.match(new RegExp(`"${key}":\\s*"([^"]*)"`))?.[1] || ''
    npcs.push({
      id: get('id'),
      name: get('name'),
      title: get('title'),
      realm: get('realm'),
      personality: get('personality'),
      place: get('place'),
      event: get('event'),
      kind: get('kind')
    })
  }
}

const KIND_ORDER = ['宗门弟子', '正道修士', '散修', '商人', '魔道修士', '妖族', '隐世', '奇遇']
const GROUP_ORDER = [
  '宗主',
  '长老',
  '执事',
  '亲传弟子',
  '内门弟子',
  '外门弟子',
  '杂役弟子'
]
const DIVISION_ORDER = ['丹阁', '器阁', '灵兽阁', '药园', '矿洞', '未划分']
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

const SECT_DOC_ORDER = [
  { id: 'qingyun', name: '青云宗', file: '宗门人物-青云宗.md', source: 'member-catalog.ts / member-catalog-qingyun-extra.ts' },
  { id: 'tianmo', name: '天魔宗', file: '宗门人物-天魔宗.md', source: 'member-catalog-tianmo.ts' },
  { id: 'wanjian', name: '万剑宗', file: '宗门人物-万剑宗.md', source: 'member-catalog-wanjian.ts' },
  { id: 'yaozu', name: '妖族', file: '宗门人物-妖族.md', source: 'member-catalog-yaozu.ts' }
]

const DATA_SOURCES = [
  '`src/constants/member-catalog.ts`',
  '`src/constants/member-catalog-qingyun-extra.ts`',
  '`src/constants/member-catalog-tianmo.ts`',
  '`src/constants/member-catalog-wanjian.ts`',
  '`src/constants/member-catalog-yaozu.ts`',
  '生成脚本：`scripts/gen-sect-members.mjs`',
  '图鉴：`src/stores/codex.ts`（人物页）'
]

function buildDivisionTable(list) {
  const counts = Object.fromEntries(DIVISION_ORDER.map((d) => [d, 0]))
  for (const m of list) counts[m.division] = (counts[m.division] || 0) + 1
  let md = `| 归属 | 人数 |\n|------|------|\n`
  for (const d of DIVISION_ORDER) {
    md += `| ${d} | ${counts[d] || 0} |\n`
  }
  return md + '\n'
}

function buildGroupRoster(sectMembers) {
  let md = ''
  for (const group of GROUP_ORDER) {
    const list = sectMembers.filter((m) => m.group === group)
    if (!list.length) continue
    md += `### ${group}（${list.length}）\n\n`
    md += `| 姓名 | 职位 | 归属 | 境界 | 战力 | 性格 | 专长 | 备注 | 对玩家 |\n`
    md += `|------|------|------|------|------|------|------|------|--------|\n`
    for (const m of list) {
      md += `| ${m.name} | ${m.title} | ${m.division} | ${m.realm} | ${m.power.toLocaleString()} | ${m.personality} | ${m.specialty} | ${m.note || '—'} | ${m.attitude} |\n`
    }
    md += `\n`
  }
  return md
}

/** 索引页：规则 + 分宗链接 */
let sectIndexMd = `# 宗门人物\n\n`
sectIndexMd += `四宗人物名录索引。共 **${members.length}** 人（每宗结构对齐，约 122 人）。相关：[历练人物](./历练人物.md)\n\n`
sectIndexMd += `## 规则摘要\n\n`
sectIndexMd += `| 项 | 说明 |\n|----|------|\n`
sectIndexMd += `| 浏览 | 「人物」页按身份与设施归属筛选，可拜访 |\n`
sectIndexMd += `| 身份 | 宗主 · 长老 · 执事 · 亲传 · 内门 · 外门 · 杂役 |\n`
sectIndexMd += `| 归属 | 丹阁 · 器阁 · 灵兽阁 · 药园 · 矿洞 · 未划分（按专长/职位推断） |\n`
sectIndexMd += `| 玩家 | 拜入后默认为 **外门弟子**、归属 **未划分**（动态加入对应宗门名录） |\n`
sectIndexMd += `| 图鉴 | 「人物」页默认可见 |\n`
sectIndexMd += `| 结构 | 每宗：宗主2 · 长老6 · 执事5 · 亲传7 · 内门18 · 外门32 · 杂役52 |\n\n`

sectIndexMd += `## 分宗文档\n\n| 宗门 | 人数 | 文档 |\n|------|------|------|\n`
for (const s of SECT_DOC_ORDER) {
  const n = members.filter((m) => m.sectId === s.id).length
  sectIndexMd += `| ${s.name} | ${n} | [${s.file.replace('.md', '')}](./${s.file}) |\n`
}
sectIndexMd += `\n`

sectIndexMd += `## 设施归属概览（全宗合计）\n\n`
sectIndexMd += buildDivisionTable(members)

sectIndexMd += `## 数据源\n\n`
for (const line of DATA_SOURCES) {
  sectIndexMd += `- ${line}\n`
}

const wroteFiles = ['docs/宗门人物.md']
fs.writeFileSync('docs/宗门人物.md', sectIndexMd, 'utf8')

for (const s of SECT_DOC_ORDER) {
  const sectMembers = members.filter((m) => m.sectId === s.id)
  if (!sectMembers.length) continue
  let md = `# ${s.name}人物\n\n`
  md += `数据源：\`${s.source}\`。\n\n`
  md += `共 **${sectMembers.length}** 人。返回：[宗门人物](./宗门人物.md) · 相关：[历练人物](./历练人物.md)\n\n`
  md += `身份层级：宗主 · 长老 · 执事 · 亲传弟子 · 内门弟子 · 外门弟子 · 杂役弟子。\n\n`
  md += `## 设施归属概览\n\n`
  md += buildDivisionTable(sectMembers)
  md += `## 名录\n\n`
  md += buildGroupRoster(sectMembers)
  md += `> 玩家拜入${s.name}后以当前身份（默认外门弟子）动态列入名录。\n\n`
  md += `## 数据源\n\n`
  for (const src of s.source.split(' / ')) {
    md += `- \`src/constants/${src}\`\n`
  }
  md += `- 索引：[宗门人物](./宗门人物.md)\n`
  md += `- 图鉴：\`src/stores/codex.ts\`（人物页）\n`
  const out = `docs/${s.file}`
  fs.writeFileSync(out, md, 'utf8')
  wroteFiles.push(out)
}

const kindCount = {}
for (const n of npcs) kindCount[n.kind] = (kindCount[n.kind] || 0) + 1

/** 固定目录仍参与偶遇/坊市的类型（运行时主池已改走宗门名录） */
const CATALOG_ACTIVE_KINDS = ['散修', '商人', '隐世', '奇遇']
/** 仅作回退 / 未入宗备用 */
const CATALOG_FALLBACK_KINDS = ['宗门弟子', '魔道修士']

const catalogActive = npcs.filter((n) => CATALOG_ACTIVE_KINDS.includes(n.kind))
const catalogFallback = npcs.filter((n) => CATALOG_FALLBACK_KINDS.includes(n.kind))

let advMd = `# 历练人物\n\n`
advMd += `相关：[宗门人物](./宗门人物.md)（偶遇主池）· 实现：\`adventure-npc-catalog.ts\`。\n\n`

advMd += `## 运行时偶遇逻辑\n\n`
advMd += `秘境探索约 **70%** 偶遇人物；人数多为 1，约 25% 为 2。抽取时优先境界邻近（大境界差 ≤ 1）。\n\n`
advMd += `| 标签 | 来源 | 说明 |\n|------|------|------|\n`
advMd += `| 宗门弟子 | **本宗**名录 | 执事 / 亲传 / 内门 / 外门 / 杂役；地点 ≥ 元婴时可含长老。池内 **×3** 加权 |\n`
advMd += `| 正道修士 | **其他**正道宗门 | 青云宗 ↔ 万剑宗（排除本宗）。**×2** |\n`
advMd += `| 魔道修士 | **其他**魔门宗门 | 优先其他魔门；若无其他同派，回退该派全部宗门名录；仍空则用下方目录魔修。**×2** |\n`
advMd += `| 妖族 | **其他**妖族宗门 | 优先其他妖族宗门；若无其他同派，回退该派全部名录。**×2** |\n`
advMd += `| 散修 / 商人 | 本页固定目录 | \`place=各地\` 且境界邻近。**×2** |\n`
advMd += `| 隐世 / 奇遇 | 本页固定目录 | 各地可刷，权重最低（**×1**） |\n\n`

advMd += `### 未入宗\n\n`
advMd += `尚无 \`sectId\` 时：不走四宗名录。池为目录中「地点匹配 / 同境界宗门弟子 / 邻近魔修」加重，再混入散修、商人、隐世、奇遇。\n\n`

advMd += `### 坊市人物\n\n`
advMd += `每日 2～4 人，四类打乱后各取一类：**商人 / 正道修士 / 魔道修士 / 散修**（不足再补）。\n\n`
advMd += `- 商人、散修：固定目录（境界邻近）\n`
advMd += `- 正道修士：其他正道宗门名录；无则目录「正道修士 / 宗门弟子」（弟子映射为正道）\n`
advMd += `- 魔道修士：其他魔门宗门名录；无则目录魔修\n\n`

advMd += `### 任务特例\n\n`
advMd += `- **清剿魔修**（\`defeat_mo_xiu\`）：优先塞入一名其他魔门人物（逻辑同 \`pickDemonicEncounterNpc\`，无则目录魔修）\n`
advMd += `- **营救弟子**（\`rescue_talk\`）：生成「被困弟子」，\`kind=宗门弟子\`，称号为「{本宗名}外门」\n\n`

advMd += `## 分宗名录（偶遇主池）\n\n`
advMd += `| 宗门 | 派系 | 偶遇角色 | 文档 |\n|------|------|----------|------|\n`
advMd += `| 青云宗 | 正道 | 本宗→宗门弟子；对外→正道修士 | [宗门人物-青云宗](./宗门人物-青云宗.md) |\n`
advMd += `| 万剑宗 | 正道 | 本宗→宗门弟子；对外→正道修士 | [宗门人物-万剑宗](./宗门人物-万剑宗.md) |\n`
advMd += `| 天魔宗 | 魔门 | 本宗→宗门弟子；对外→魔道修士 | [宗门人物-天魔宗](./宗门人物-天魔宗.md) |\n`
advMd += `| 妖族 | 妖族 | 本宗→宗门弟子；对外→妖族 | [宗门人物-妖族](./宗门人物-妖族.md) |\n\n`

advMd += `> 人物 id 与宗门名录一致，拜访亲密值可共用。\n\n`

advMd += `## 固定目录池\n\n`
advMd += `以下条目仍写在 \`ADVENTURE_NPC_CATALOG\`，用于散修 / 商人 / 隐世 / 奇遇，以及未入宗、魔道回退。\n\n`
advMd += `共 **${npcs.length}** 条（其中活跃 ${catalogActive.length} · 回退备用 ${catalogFallback.length}）。\n\n`

advMd += `### 目录类型统计\n\n`
for (const k of KIND_ORDER) {
  const n = kindCount[k] || 0
  if (!n) continue
  const role = CATALOG_ACTIVE_KINDS.includes(k)
    ? '活跃'
    : CATALOG_FALLBACK_KINDS.includes(k)
      ? '回退备用'
      : '目录残留'
  advMd += `- **${k}**：${n}（${role}）\n`
}
advMd += `\n`

function appendNpcTable(title, list) {
  if (!list.length) return
  advMd += `### ${title}（${list.length}）\n\n`
  advMd += `| 姓名 | 称号 | 境界 | 性格 | 出没地点 | 可能事件 |\n`
  advMd += `|------|------|------|------|----------|----------|\n`
  const sorted = [...list].sort((a, b) => {
    const ia = REALM_ORDER.indexOf(a.realm)
    const ib = REALM_ORDER.indexOf(b.realm)
    if (ia !== ib) return (ia < 0 ? 99 : ia) - (ib < 0 ? 99 : ib)
    return a.name.localeCompare(b.name, 'zh')
  })
  for (const n of sorted) {
    advMd += `| ${n.name} | ${n.title} | ${n.realm} | ${n.personality} | ${n.place} | ${n.event} |\n`
  }
  advMd += `\n`
}

advMd += `## 活跃目录\n\n`
for (const kind of CATALOG_ACTIVE_KINDS) {
  appendNpcTable(kind, npcs.filter((n) => n.kind === kind))
}

advMd += `## 回退备用目录\n\n`
advMd += `入宗后一般不再作为「宗门弟子 / 正道 / 魔道」主池；未入宗或无其他同派宗门时仍可能抽到。\n\n`
for (const kind of CATALOG_FALLBACK_KINDS) {
  appendNpcTable(kind, npcs.filter((n) => n.kind === kind))
}

advMd += `## 数据源\n\n`
advMd += `- 偶遇 / 坊市逻辑：\`src/constants/adventure-npc-catalog.ts\`（\`rollEncounterNpcs\` / \`rollMarketNpcs\`）\n`
advMd += `- 宗门名录：\`src/constants/member-catalog*.ts\`\n`
advMd += `- 图鉴：\`src/stores/codex.ts\`（人物页）\n`

let indexMd = `# 人物设定\n\n`
indexMd += `人物设定已拆分为索引与分宗文档：\n\n`
indexMd += `| 文档 | 内容 | 人数 |\n|------|------|------|\n`
indexMd += `| [宗门人物](./宗门人物.md) | 四宗索引与规则 | ${members.length} |\n`
for (const s of SECT_DOC_ORDER) {
  const n = members.filter((m) => m.sectId === s.id).length
  indexMd += `| [${s.name}人物](./${s.file}) | ${s.name}名录（历练偶遇主池） | ${n} |\n`
}
indexMd += `| [历练人物](./历练人物.md) | 偶遇规则 + 散修/商人/隐世/奇遇等固定目录 | ${npcs.length} |\n\n`
indexMd += `合计宗门 **${members.length}** + 历练目录 **${npcs.length}**。图鉴「人物」页合并展示。\n`

fs.writeFileSync('docs/历练人物.md', advMd, 'utf8')
fs.writeFileSync('docs/人物设定.md', indexMd, 'utf8')
wroteFiles.push('docs/历练人物.md', 'docs/人物设定.md')

console.log('members', members.length, 'npcs', npcs.length)
console.log('kinds', kindCount)
console.log('wrote', wroteFiles.join(', '))
