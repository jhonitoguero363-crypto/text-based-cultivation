import fs from 'fs'

function parseObjects(src, startMarker) {
  const start = src.indexOf(startMarker)
  if (start < 0) return []
  const slice = src.slice(start)
  const blocks = slice.split(/\{\s*"id":/)
  const list = []
  for (let i = 1; i < blocks.length; i++) {
    const block = '"id":' + blocks[i]
    // stop if we hit next export
    if (block.includes('export function') || block.includes('export const')) {
      // still parse this block until first closing of object - ok
    }
    const get = (key) => block.match(new RegExp(`"${key}":\\s*"([^"]*)"`))?.[1] || ''
    const getNum = (key) => Number(block.match(new RegExp(`"${key}":\\s*(\\d+)`))?.[1] || 0)
    const id = get('id')
    if (!id || !id.startsWith('qy-') && !id.startsWith('adv-npc-')) {
      // allow both prefixes; skip if empty
      if (!id) continue
    }
    list.push({
      id,
      name: get('name'),
      title: get('title'),
      realm: get('realm'),
      power: getNum('power'),
      group: get('group'),
      personality: get('personality'),
      specialty: get('specialty'),
      note: get('note'),
      attitude: get('attitude'),
      sectId: get('sectId'),
      place: get('place'),
      event: get('event'),
      kind: get('kind'),
      avatar: get('avatar')
    })
    // stop after member catalog ends: last qy or when we see as CatalogMember
    if (blocks[i].includes('as CatalogMember') || blocks[i].includes('export function getSectMembers')) {
      // include current then break after this iteration for members file handled separately
    }
  }
  return list
}

const memberSrc = fs.readFileSync('src/constants/member-catalog.ts', 'utf8')
const npcSrc = fs.readFileSync('src/constants/adventure-npc-catalog.ts', 'utf8')

const members = []
{
  const start = memberSrc.indexOf('export const SECT_MEMBER_CATALOG')
  const end = memberSrc.indexOf('export function getSectMembers', start)
  const slice = memberSrc.slice(start, end > 0 ? end : undefined)
  const re =
    /\{\s*id:\s*'([^']+)'\s*,\s*name:\s*'([^']+)'\s*,\s*title:\s*'([^']+)'\s*,\s*realm:\s*'([^']+)'\s*,\s*power:\s*(\d+)[\s\S]*?group:\s*'([^']+)'\s*,\s*personality:\s*'([^']*)'\s*,\s*specialty:\s*'([^']*)'\s*,\s*note:\s*'([^']*)'\s*,\s*attitude:\s*'([^']*)'\s*,\s*sectId:\s*'([^']+)'\s*\}/g
  let m
  while ((m = re.exec(slice))) {
    members.push({
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
}

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

const KIND_ORDER = ['宗门弟子', '散修', '商人', '魔修', '隐世', '奇遇']
const GROUP_ORDER = [
  '宗主',
  '长老',
  '执事',
  '亲传弟子',
  '内门弟子',
  '外门弟子',
  '杂役弟子'
]
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

const SECT_NAME = {
  qingyun: '青云宗',
  tianmo: '天魔宗',
  wanjian: '万剑宗',
  yaozu: '妖族'
}

let md = `# 人物设定\n\n包含两类人物：\n\n1. **宗门人物**：\`member-catalog.ts\`（当前已录入青云宗）\n2. **历练偶遇**：\`adventure-npc-catalog.ts\`\n\n共 **${members.length + npcs.length}** 人（宗门 ${members.length} + 历练 ${npcs.length}）。\n\n`

md += `## 规则摘要\n\n| 项 | 说明 |\n|----|------|\n`
md += `| 宗门人物 | 「人物」页按分组浏览，可拜访 |\n`
md += `| 历练偶遇 | 秘境探索时随机刷新；约 70% 可遇到人物 |\n`
md += `| 图鉴 | 「人物」页合并展示，默认可见 |\n`
md += `| 扩展 | 天魔宗 / 万剑宗 / 妖族人物名录待补 |\n\n`

// ---- 宗门 ----
md += `## 一、宗门人物（青云宗）\n\n`
md += `身份层级：宗主 · 长老 · 执事 · 亲传弟子 · 内门弟子 · 外门弟子 · 杂役弟子。\n`
md += `玩家拜入后默认为 **外门弟子**（动态加入名录）。\n\n`

for (const group of GROUP_ORDER) {
  const list = members.filter((m) => m.group === group)
  if (!list.length) continue
  md += `### ${group}（${list.length}）\n\n`
  md += `| 姓名 | 职位 | 境界 | 战力 | 性格 | 专长 | 备注 | 对玩家 |\n`
  md += `|------|------|------|------|------|------|------|--------|\n`
  for (const m of list) {
    md += `| ${m.name} | ${m.title} | ${m.realm} | ${m.power.toLocaleString()} | ${m.personality} | ${m.specialty} | ${m.note || '—'} | ${m.attitude} |\n`
  }
  md += `\n`
}
md += `> 玩家拜入后以当前身份（默认外门弟子）动态列入名录。\n\n`

// ---- 历练 ----
md += `## 二、历练偶遇人物\n\n`
md += `类型：${KIND_ORDER.join(' / ')}。\n\n`

const kindCount = {}
for (const n of npcs) kindCount[n.kind] = (kindCount[n.kind] || 0) + 1
md += `### 类型统计\n\n`
for (const k of KIND_ORDER) {
  md += `- **${k}**：${kindCount[k] || 0}\n`
}
md += `\n`

for (const kind of KIND_ORDER) {
  const list = npcs.filter((n) => n.kind === kind)
  if (!list.length) continue
  md += `### ${kind}（${list.length}）\n\n`
  md += `| 姓名 | 称号 | 境界 | 性格 | 出没地点 | 可能事件 |\n`
  md += `|------|------|------|------|----------|----------|\n`
  // sort by realm order then name
  list.sort((a, b) => {
    const ia = REALM_ORDER.indexOf(a.realm)
    const ib = REALM_ORDER.indexOf(b.realm)
    if (ia !== ib) return (ia < 0 ? 99 : ia) - (ib < 0 ? 99 : ib)
    return a.name.localeCompare(b.name, 'zh')
  })
  for (const n of list) {
    md += `| ${n.name} | ${n.title} | ${n.realm} | ${n.personality} | ${n.place} | ${n.event} |\n`
  }
  md += `\n`
}

md += `## 数据源\n\n`
md += `- \`src/constants/member-catalog.ts\`\n`
md += `- \`src/constants/adventure-npc-catalog.ts\`\n`
md += `- 图鉴合并逻辑：\`src/stores/codex.ts\`（人物页）\n`

fs.writeFileSync('docs/人物设定.md', md, 'utf8')
console.log('members', members.length, 'npcs', npcs.length)
console.log('kinds', kindCount)
console.log('wrote docs/人物设定.md')
