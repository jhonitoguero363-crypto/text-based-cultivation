import fs from 'fs'

const src = fs.readFileSync('c:/Users/64209/Desktop/矿石材料.txt', 'utf8')
const lines = src.split(/\r?\n/).filter((l) => l.trim() && !l.includes('矿石/矿材名称') && !l.includes('---'))

const LEVEL_RANK = {
  灵矿: 1,
  高阶灵矿: 2,
  神矿: 3,
  仙矿: 4,
  道矿: 5,
  镇界神材: 6
}

/** @type {Map<string, any>} */
const byName = new Map()
/** @type {Record<string, string[]>} */
const byTreasure = {}

for (const line of lines) {
  const cols = line
    .split('|')
    .map((c) => c.trim())
    .filter(Boolean)
  if (cols.length < 5) continue
  const [name, level, attr, origin, treasure] = cols
  if (!name || !treasure) continue

  if (!byTreasure[treasure]) byTreasure[treasure] = []
  if (!byTreasure[treasure].includes(name)) byTreasure[treasure].push(name)

  const existing = byName.get(name)
  if (!existing) {
    byName.set(name, {
      name,
      level,
      attr,
      origin,
      treasures: [treasure]
    })
  } else {
    if (!existing.treasures.includes(treasure)) existing.treasures.push(treasure)
    const oldRank = LEVEL_RANK[existing.level] || 0
    const newRank = LEVEL_RANK[level] || 0
    if (newRank > oldRank) {
      existing.level = level
      existing.attr = attr
      existing.origin = origin
    }
  }
}

const mats = [...byName.values()]

function qtyByLevel(level) {
  if (level === '灵矿' || level === '高阶灵矿') return 2
  return 1
}

const stoneByGrade = {
  法器: 80,
  灵器: 500,
  仙器: 3000,
  道器: 15000,
  镇界神器: 50000,
  先天至宝: 200000
}

const treasureSrc = fs.readFileSync(
  'd:/project/text-based-cultivation/src/constants/treasure-catalog.ts',
  'utf8'
)
const treasureMeta = {}
const re =
  /name:\s*'([^']+)'[\s\S]*?grade:\s*'([^']+)'[\s\S]*?realm:\s*'([^']+)'/g
let m
while ((m = re.exec(treasureSrc))) {
  treasureMeta[m[1]] = { grade: m[2], realm: m[3] }
}

function exchangeCost(level) {
  if (level === '镇界神材') return 8000
  if (level === '道矿') return 3000
  if (level === '仙矿') return 1200
  if (level === '神矿') return 500
  if (level === '高阶灵矿') return 120
  return 40
}

const ores = mats.map((item, i) => ({
  id: `ore-${i + 1}`,
  name: item.name,
  level: item.level,
  attr: item.attr,
  origin: item.origin,
  treasures: item.treasures,
  exchangeCost: exchangeCost(item.level)
}))

const recipes = Object.entries(byTreasure).map(([treasureName, oreNames]) => {
  const materials = oreNames.map((name) => {
    const mat = byName.get(name)
    return { name, count: qtyByLevel(mat.level) }
  })
  const meta = treasureMeta[treasureName] || { grade: '法器', realm: '炼气' }
  return {
    treasureName,
    grade: meta.grade,
    realm: meta.realm,
    spiritStones: stoneByGrade[meta.grade] || 100,
    materials
  }
})

const content = `import type { RealmMajor, RealmState } from './realm'
import { getStagesForMajor, REALM_MAJORS } from './realm'
import type { TreasureGrade } from './treasure'

export interface OreMaterial {
  id: string
  name: string
  level: string
  attr: string
  origin: string
  /** 可用于炼制的法宝 */
  treasures: string[]
  exchangeCost: number
}

export interface TreasureRecipeMaterial {
  name: string
  count: number
}

export interface TreasureRecipe {
  treasureName: string
  grade: TreasureGrade | string
  realm: RealmMajor | string
  spiritStones: number
  materials: TreasureRecipeMaterial[]
}

export type MineReward =
  | { kind: 'empty' }
  | { kind: 'ore'; name: string; level: string; count: number }
  | { kind: 'spirit'; amount: number }

/** 每日挖矿次数 */
export const DAILY_MINE_LIMIT = 12

/** 全部矿石 */
export const ORE_MATERIALS: OreMaterial[] = ${JSON.stringify(ores, null, 2)}

/** 法宝炼制配方（由矿石表反推） */
export const TREASURE_RECIPES: TreasureRecipe[] = ${JSON.stringify(recipes, null, 2)}

export function getRecipeByTreasureName(name: string) {
  return TREASURE_RECIPES.find((item) => item.treasureName === name) || null
}

export const ORE_LEVEL_TABS = ['全部', '灵矿', '高阶灵矿', '神矿', '仙矿', '道矿', '镇界神材'] as const

export function filterOresByTab(tab: string) {
  if (!tab || tab === '全部') return ORE_MATERIALS
  return ORE_MATERIALS.filter((item) => item.level === tab)
}

export function getOresByLevel(level: string) {
  return ORE_MATERIALS.filter((item) => item.level === level)
}

/** 修为进度分：炼气一层≈0，飞升大圆满≈93 */
export function getCultivationScore(realm: RealmState) {
  const majorIdx = Math.max(0, REALM_MAJORS.indexOf(realm.major))
  const stages = getStagesForMajor(realm.major)
  const stageIdx = Math.max(0, stages.indexOf(realm.stage as never))
  return majorIdx * 10 + stageIdx
}

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n))
}

function pickWeighted<T extends { weight: number }>(entries: T[]): T {
  const total = entries.reduce((sum, item) => sum + Math.max(0, item.weight), 0)
  let roll = Math.random() * total
  for (const item of entries) {
    roll -= Math.max(0, item.weight)
    if (roll <= 0) return item
  }
  return entries[entries.length - 1]
}

function randInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

const ORE_TIERS = ['灵矿', '高阶灵矿', '神矿', '仙矿', '道矿', '镇界神材'] as const

/** 境界越高，高阶矿石权重越大 */
function oreTierWeights(score: number) {
  const t = clamp(score / 93, 0, 1)
  return [
    { level: '灵矿', weight: Math.max(2, 42 - t * 36) },
    { level: '高阶灵矿', weight: 18 + t * 8 },
    { level: '神矿', weight: 6 + t * 16 },
    { level: '仙矿', weight: 2 + t * 18 },
    { level: '道矿', weight: t > 0.35 ? 1 + (t - 0.35) * 22 : 0.2 },
    { level: '镇界神材', weight: t > 0.55 ? (t - 0.55) * 28 : 0.05 }
  ]
}

/** 境界越高，单次灵石数量区间越高（不再区分品级） */
function spiritAmountByScore(score: number) {
  const t = clamp(score / 93, 0, 1)
  const min = Math.round(10 + t * 90)
  const max = Math.round(35 + t * 365)
  return randInt(min, Math.max(min, max))
}

/**
 * 依修为随机挖矿奖励：
 * - 空手约 65%（高境界略降至约 55%）
 * - 有收获时约 60% 矿石 / 40% 灵石
 * - 矿石品阶随修为提升；灵石仅数量随修为提升
 */
export function rollMineReward(realm: RealmState): MineReward {
  const score = getCultivationScore(realm)
  const t = clamp(score / 93, 0, 1)
  const emptyChance = 0.65 - t * 0.1
  if (Math.random() < emptyChance) {
    return { kind: 'empty' }
  }
  const oreChance = 0.55 + t * 0.1
  if (Math.random() < oreChance) {
    let tier = pickWeighted(oreTierWeights(score)).level
    let pool = getOresByLevel(tier)
    // 若该阶暂无矿（理论上不会），向下回退
    if (!pool.length) {
      for (let i = ORE_TIERS.indexOf(tier as (typeof ORE_TIERS)[number]); i >= 0; i -= 1) {
        pool = getOresByLevel(ORE_TIERS[i])
        if (pool.length) {
          tier = ORE_TIERS[i]
          break
        }
      }
    }
    const ore = pool[Math.floor(Math.random() * pool.length)]
    return { kind: 'ore', name: ore.name, level: ore.level, count: 1 }
  }
  return { kind: 'spirit', amount: spiritAmountByScore(score) }
}

export function formatMineReward(reward: MineReward) {
  if (reward.kind === 'empty') return '一无所获，矿脉空空'
  if (reward.kind === 'ore') return \`挖到 \${reward.level}·\${reward.name} ×\${reward.count}\`
  return \`挖到 灵石 ×\${reward.amount}\`
}
`

fs.writeFileSync(
  'd:/project/text-based-cultivation/src/constants/ore-catalog.ts',
  content,
  'utf8'
)
console.log('ok ores', ores.length, 'recipes', recipes.length)
console.log(
  'treasures',
  Object.keys(byTreasure).join(', ')
)
