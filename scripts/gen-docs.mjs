import fs from 'fs'
import path from 'path'

const ROOT = 'd:/project/text-based-cultivation'
const DOCS = path.join(ROOT, 'docs')
const data = JSON.parse(fs.readFileSync(path.join(ROOT, 'scripts/_doc-data.json'), 'utf8'))

function sectionByGroup(title, groups, order) {
  const keys = order || Object.keys(groups)
  let md = `## ${title}\n\n`
  for (const key of keys) {
    const list = groups[key]
    if (!list?.length) continue
    md += `### ${key}（${list.length}）\n\n`
    md += list.map((n) => `- ${n}`).join('\n') + '\n\n'
  }
  return md
}

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

const ORE_ORDER = ['灵矿', '高阶灵矿', '神矿', '仙矿', '道矿', '镇界神材']

fs.writeFileSync(
  path.join(DOCS, '图鉴-矿石.md'),
  `# 矿石图鉴\n\n共 ${Object.values(data.ore).reduce((a, b) => a + b.length, 0)} 种。矿洞挖掘获取，可用于器阁打造法宝。\n\n` +
    sectionByGroup('品阶一览', data.ore, ORE_ORDER)
)

fs.writeFileSync(
  path.join(DOCS, '图鉴-药材.md'),
  `# 药材图鉴\n\n共 ${Object.values(data.herb).reduce((a, b) => a + b.length, 0)} 种。药园兑换或历练获取，可用于丹阁炼丹。\n\n药园筛选：全部 / 灵草 / 灵药 / 灵果 / 神 / 仙 / 道\n\n` +
    sectionByGroup('品阶一览', data.herb)
)

const beastCount = Object.values(data.beast).reduce((a, b) => a + b.length, 0)
const petCount = Object.values(data.pet).reduce((a, b) => a + b.length, 0)

const spiritMd =
  `# 灵兽图鉴\n\n` +
  `图鉴将 **妖兽** 与 **灵宠** 合并为「灵兽」。\n\n` +
  `- 兽阁灵宠：${petCount} 种（仅兽阁出售）\n` +
  `- 秘境妖兽：${beastCount} 种（击败后可抓捕为灵宠，可回售兽阁）\n` +
  `- 同名去重后在游戏内合并展示；击败/抓捕/购买后解锁详情\n\n` +
  `## 兽阁灵宠\n\n` +
  sectionByGroup('按境界', data.pet, REALM_ORDER) +
  `## 秘境妖兽\n\n` +
  sectionByGroup('按境界', data.beast, REALM_ORDER)

fs.writeFileSync(path.join(DOCS, '图鉴-灵兽.md'), spiritMd)

// 兼容旧链接
fs.writeFileSync(
  path.join(DOCS, '图鉴-妖兽.md'),
  `# 妖兽图鉴\n\n已合并至 [灵兽图鉴](./图鉴-灵兽.md)。\n\n秘境遭遇妖兽，击败取材料，抓捕化为灵宠后可回售兽阁。\n`
)
fs.writeFileSync(
  path.join(DOCS, '图鉴-灵宠.md'),
  `# 灵宠图鉴\n\n已合并至 [灵兽图鉴](./图鉴-灵兽.md)。\n\n兽阁仅出售驯化灵宠；野妖需秘境抓捕。\n`
)

console.log('catalog docs written')
