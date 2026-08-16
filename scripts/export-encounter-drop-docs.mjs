import fs from 'fs'

const src = fs.readFileSync('src/constants/mission-catalog.ts', 'utf8')
const list = []
const blocks = src.split(/\{\s*\n\s*id:/)
for (let i = 1; i < blocks.length; i++) {
  const block = 'id:' + blocks[i]
  const id = block.match(/id:\s*'([^']+)'/)?.[1]
  const name = block.match(/name:\s*'([^']+)'/)?.[1]
  const tag = block.match(/tag:\s*'([^']+)'/)?.[1]
  if (!id || !name || tag !== '奇遇') continue
  const desc = block.match(/desc:\s*'([^']*)'/)?.[1] || ''
  const playStyle = block.match(/playStyle:\s*'([^']*)'/)?.[1] || ''
  const reward = block.match(/reward:\s*'([^']*)'/)?.[1] || ''
  const dropsMatch = block.match(/drops:\s*'([^']*)'/)
  const dropsRaw = dropsMatch ? dropsMatch[1] : ''
  const drops = dropsRaw
    .split(/[、,，]/)
    .map((part) => part.trim())
    .filter((part) => part && part !== '待补充')
  list.push({
    id,
    name,
    desc,
    playStyle,
    reward,
    dropsRaw,
    drops,
    pending: !drops.length
  })
}

const pendingCount = list.filter((x) => x.pending).length
const filledCount = list.length - pendingCount
const materialIndex = new Map()
for (const item of list) {
  for (const mat of item.drops) {
    if (!materialIndex.has(mat)) materialIndex.set(mat, [])
    materialIndex.get(mat).push(item)
  }
}
const materials = [...materialIndex.keys()].sort((a, b) => a.localeCompare(b, 'zh-CN'))

let md = `# 历练奇遇掉落\n\n`
md += `秘境探索触发 **奇遇** 并了结后，可能掉落的材料总表。\n\n`
md += `数据来源：\`src/constants/mission-catalog.ts\`（奇遇条目字段 \`drops\`）。\n`
md += `结算：\`rollEncounterResolveReward\` → 探索页了结奇遇时发放。\n\n`

md += `## 如何补充\n\n`
md += `在 \`MISSION_CATALOG\` 中找到对应奇遇，把 \`drops: ''\` 改成顿号分隔的材料名，例如：\n\n`
md += `\`\`\`ts\ndrops: '残卷、灵草、秘信'\n\`\`\`\n\n`
md += `留空表示 **待补充**（当前不会掉材料，仅有修为 / 灵石）。改完后执行：\n\n`
md += `\`\`\`bash\nnode scripts/export-encounter-drop-docs.mjs\n\`\`\`\n\n`

md += `## 规则摘要\n\n`
md += `| 项 | 说明 |\n|----|------|\n`
md += `| 触发 | 探索约 **28%** 触发奇遇；了结（探查）时结算 |\n`
md += `| 基础奖励 | 修为约 40～119 · 灵石约 30～99（与材料独立） |\n`
md += `| 材料 | 已配置 \`drops\` 时，从列表 **等概率抽 1 种** 入背包「材料」 |\n`
md += `| 未配置 | \`drops: ''\` → 文档标「待补充」，游戏内不掉材料 |\n`
md += `| 条目 | 奇遇 **${list.length}** · 已填 **${filledCount}** · 待补充 **${pendingCount}** · 材料种类 **${materials.length}** |\n\n`

md += `## 奇遇掉落表\n\n`
md += `| ID | 名称 | 玩法 | 可能掉落 |\n`
md += `|----|------|------|----------|\n`
for (const item of list) {
  const dropText = item.pending ? '**待补充**' : item.drops.join('、')
  md += `| ${item.id} | ${item.name} | ${item.playStyle || '—'} | ${dropText} |\n`
}
md += `\n`

md += `## 奇遇说明（便于填表）\n\n`
for (const item of list) {
  md += `### ${item.name}（${item.id}）\n\n`
  md += `- 描述：${item.desc}\n`
  md += `- 玩法：${item.playStyle || '—'} / ${item.reward}\n`
  const dropLine = item.pending
    ? '**待补充**（在目录中填写 `drops`）'
    : item.drops.join('、')
  md += `- 掉落：${dropLine}\n\n`
}

if (materials.length) {
  md += `## 材料索引\n\n`
  md += `| 材料 | 出现次数 | 来源奇遇 |\n`
  md += `|------|----------|----------|\n`
  for (const mat of materials) {
    const sources = materialIndex.get(mat)
    md += `| ${mat} | ${sources.length} | ${sources.map((x) => x.name).join('、')} |\n`
  }
  md += `\n`
} else {
  md += `## 材料索引\n\n`
  md += `尚无已配置材料。补充 \`drops\` 后重新导出即可生成索引。\n\n`
}

md += `## 关联\n\n`
md += `- 奇遇列表：[任务设定](./任务设定.md)\n`
md += `- 秘境规则：[秘境设定](./秘境设定.md)\n`
md += `- 妖兽击杀掉落：[历练妖兽掉落](./历练妖兽掉落.md)\n`
md += `- 玩法说明：[玩法系统](./玩法系统.md)\n`

fs.writeFileSync('docs/历练奇遇掉落.md', md, 'utf8')
console.log('encounters', list.length, 'filled', filledCount, 'pending', pendingCount)
console.log('wrote docs/历练奇遇掉落.md')
