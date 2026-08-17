import fs from 'fs'

function parseMaterialNames(file, idPrefix) {
  const src = fs.readFileSync(file, 'utf8')
  const names = new Set()
  const blocks = src.split(new RegExp(`\\{\\s*"id":\\s*"${idPrefix}`))
  for (let i = 1; i < blocks.length; i++) {
    const block = blocks[i]
    const name = block.match(/"name":\s*"([^"]+)"/)?.[1]
    if (name) names.add(name)
    if (block.includes('as OreMaterial') || block.includes('as HerbMaterial')) break
  }
  return names
}

const oreNames = parseMaterialNames('src/constants/ore-catalog.ts', 'ore-')
const herbNames = parseMaterialNames('src/constants/herb-catalog.ts', 'herb-')

function isLoot(name) {
  return !oreNames.has(name) && !herbNames.has(name)
}

const beastSrc = fs.readFileSync('src/constants/beast-catalog.ts', 'utf8')
const map = new Map()

function ensure(name) {
  if (!map.has(name)) {
    map.set(name, { sources: new Set(), realms: new Set(), fromBeast: false, fromEncounter: false })
  }
  return map.get(name)
}

const beastBlocks = beastSrc.split(/\{\s*"id":/)
for (let i = 1; i < beastBlocks.length; i++) {
  const block = '"id":' + beastBlocks[i]
  if (!block.includes('"name"')) continue
  const name = block.match(/"name":\s*"([^"]*)"/)?.[1]
  const realm = block.match(/"realm":\s*"([^"]*)"/)?.[1]
  const drops = block.match(/"drops":\s*"([^"]*)"/)?.[1] || ''
  if (!name || !name || !block.includes('beast-')) continue
  if (!block.match(/"id":\s*"beast-/)) continue
  for (const part of drops.split(/[、,，]/).map((s) => s.trim()).filter(Boolean)) {
    if (!isLoot(part)) continue
    const acc = ensure(part)
    acc.fromBeast = true
    acc.sources.add(name)
    if (realm) acc.realms.add(realm)
  }
  if (beastBlocks[i].includes('as CatalogBeast')) break
}

const missionSrc = fs.readFileSync('src/constants/mission-catalog.ts', 'utf8')
const encBlocks = missionSrc.split(/\{\s*\n\s*id:/)
for (let i = 1; i < encBlocks.length; i++) {
  const block = 'id:' + encBlocks[i]
  const tag = block.match(/tag:\s*'([^']*)'/)?.[1]
  if (tag !== '奇遇') continue
  const encName = block.match(/name:\s*'([^']*)'/)?.[1]
  const drops = block.match(/drops:\s*'([^']*)'/)?.[1] || ''
  if (!encName) continue
  for (const part of drops
    .split(/[、,，]/)
    .map((s) => s.trim())
    .filter((s) => s && s !== '待补充')) {
    if (!isLoot(part)) continue
    const acc = ensure(part)
    acc.fromEncounter = true
    acc.sources.add(encName)
  }
}

const list = [...map.entries()]
  .map(([name, acc]) => {
    const origin =
      acc.fromBeast && acc.fromEncounter ? '兼有' : acc.fromEncounter ? '奇遇' : '妖兽'
    return {
      name,
      origin,
      sources: [...acc.sources].sort((a, b) => a.localeCompare(b, 'zh-CN')),
      realms: [...acc.realms]
    }
  })
  .sort((a, b) => a.name.localeCompare(b.name, 'zh-CN'))

let md = `# 图鉴-材料\n\n`
md += `历练专属材料：主要来自 **妖兽击杀** 与 **奇遇了结** 掉落。\n\n`
md += `已与矿石、药材目录去重；若掉落名恰好是已知矿石/药材，会进入对应背包分类与图鉴，不列入本表。\n\n`
md += `数据来源：\`src/constants/beast-catalog.ts\` + \`mission-catalog.ts\`（奇遇 \`drops\`）→ \`loot-material-catalog.ts\`。\n\n`
md += `共 **${list.length}** 种。\n\n`

md += `## 规则\n\n`
md += `| 项 | 说明 |\n|----|------|\n`
md += `| 背包分类 | 矿石 / 药材 / 材料 三分；本表对应「材料」 |\n`
md += `| 用途 | 器阁炼器可与矿石一并投入；强度按来源妖兽境界折算 |\n`
md += `| 收录 | 背包中持有该材料后解锁图鉴 |\n`
md += `| 头像 | \`src/assets/loot/icons/\` · \`loot-icons.ts\`；重切：\`node scripts/slice-loot-icons.mjs\` |\n`
md += `| 奇遇 | 奇遇 \`drops\` 仍可待补充；补全后重新导出 |\n\n`

md += `## 名录\n\n`
md += `| 名称 | 来源类型 | 来源 |\n`
md += `|------|----------|------|\n`
for (const item of list) {
  md += `| ${item.name} | ${item.origin} | ${item.sources.join('、')} |\n`
}
md += `\n`

md += `## 关联\n\n`
md += `- [历练对战掉落](./历练对战掉落.md)（规则总览）\n`
md += `- [历练妖兽掉落](./历练妖兽掉落.md)\n`
md += `- [历练奇遇掉落](./历练奇遇掉落.md)\n`
md += `- [图鉴-矿石](./图鉴-矿石.md) · [图鉴-药材](./图鉴-药材.md)\n`

fs.writeFileSync('docs/图鉴-材料.md', md, 'utf8')
console.log('loot materials', list.length)
console.log('wrote docs/图鉴-材料.md')
