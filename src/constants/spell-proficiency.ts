/** 法术熟练度：点数 → 六阶境界（见桌面「法术熟练度.txt」） */

export interface SpellProficiencyTierDef {
  /** 1～6 */
  tier: number
  /** 含下限 */
  min: number
  /** 含上限；最高阶为 Infinity */
  max: number
  name: string
  /** 法术威力加成 */
  powerBonus: number
  /** 灵力消耗减免 */
  manaCostReduce: number
  /** 冷却减免 */
  cooldownReduce: number
  /** 特殊效果触发概率（炉火纯青） */
  specialChance: number
  effect: string
}

export const SPELL_PROFICIENCY_TIERS: SpellProficiencyTierDef[] = [
  {
    tier: 1,
    min: 0,
    max: 99,
    name: '初窥门径',
    powerBonus: 0,
    manaCostReduce: 0,
    cooldownReduce: 0,
    specialChance: 0,
    effect: '法术基础效果'
  },
  {
    tier: 2,
    min: 100,
    max: 299,
    name: '略有小成',
    powerBonus: 0.05,
    manaCostReduce: 0,
    cooldownReduce: 0,
    specialChance: 0,
    effect: '法术威力 +5%'
  },
  {
    tier: 3,
    min: 300,
    max: 699,
    name: '登堂入室',
    powerBonus: 0.1,
    manaCostReduce: 0.05,
    cooldownReduce: 0,
    specialChance: 0,
    effect: '法术威力 +10%，灵力消耗 -5%'
  },
  {
    tier: 4,
    min: 700,
    max: 1499,
    name: '融会贯通',
    powerBonus: 0.18,
    manaCostReduce: 0,
    cooldownReduce: 0.1,
    specialChance: 0,
    effect: '法术威力 +18%，冷却 -10%'
  },
  {
    tier: 5,
    min: 1500,
    max: 2999,
    name: '出神入化',
    powerBonus: 0.3,
    manaCostReduce: 0.15,
    cooldownReduce: 0,
    specialChance: 0,
    effect: '法术威力 +30%，灵力消耗 -15%'
  },
  {
    tier: 6,
    min: 3000,
    max: Infinity,
    name: '炉火纯青',
    powerBonus: 0.5,
    manaCostReduce: 0,
    cooldownReduce: 0,
    specialChance: 0.12,
    effect: '法术威力 +50%，有概率触发特殊效果'
  }
]

export const SPELL_PROFICIENCY_TIER_MAX = 6
/** 达到炉火纯青的最低熟练度 */
export const SPELL_PROFICIENCY_CAP = 3000

export interface SpellProficiencyInfo {
  points: number
  tier: number
  name: string
  effect: string
  powerBonus: number
  manaCostReduce: number
  cooldownReduce: number
  specialChance: number
  /** 当前阶内进度文案，如 45/99；满阶为「已圆满」 */
  progressText: string
  /** 距下一阶还差多少（满阶为 0） */
  toNext: number
  maxed: boolean
}

/** 熟练度保留 1 位小数 */
function normalizePoints(points: number) {
  if (!Number.isFinite(points) || points < 0) return 0
  return Math.round(points * 10) / 10
}

/** 判定阶位时向下取整 */
function floorPoints(points: number) {
  return Math.floor(normalizePoints(points))
}

export function getSpellProficiencyTierDef(points: number): SpellProficiencyTierDef {
  const p = floorPoints(points)
  for (let i = SPELL_PROFICIENCY_TIERS.length - 1; i >= 0; i -= 1) {
    const tier = SPELL_PROFICIENCY_TIERS[i]
    if (p >= tier.min) return tier
  }
  return SPELL_PROFICIENCY_TIERS[0]
}

function formatPoints(n: number) {
  const v = normalizePoints(n)
  return Number.isInteger(v) ? String(v) : v.toFixed(1)
}

export function getSpellProficiencyInfo(points: number): SpellProficiencyInfo {
  const p = normalizePoints(points)
  const def = getSpellProficiencyTierDef(p)
  const maxed = def.tier >= SPELL_PROFICIENCY_TIER_MAX
  let progressText = '已圆满'
  let toNext = 0
  if (!maxed) {
    const spanMax = def.max
    progressText = `${formatPoints(p)}/${spanMax}`
    toNext = Math.max(0, Math.round((spanMax + 1 - p) * 10) / 10)
  } else {
    progressText = formatPoints(p)
  }
  return {
    points: p,
    tier: def.tier,
    name: def.name,
    effect: def.effect,
    powerBonus: def.powerBonus,
    manaCostReduce: def.manaCostReduce,
    cooldownReduce: def.cooldownReduce,
    specialChance: def.specialChance,
    progressText,
    toNext,
    maxed
  }
}

/**
 * 洞府演练每次吐纳增加的熟练度：基础 0～0.5，受悟性倍率，最终仍落在 0～0.5。
 */
export function rollSpellProficiencyGain(speedMult = 1) {
  const base = Math.random() * 0.5
  const scaled = Math.min(0.5, base * Math.max(0.2, speedMult))
  return Math.round(scaled * 10) / 10
}

/**
 * 旧存档 Lv.1～10 → 熟练度点数。
 * 大致落在六阶区间内，便于平滑迁移。
 */
export function migrateLegacySpellLevel(level: number) {
  const lv = Math.max(0, Math.floor(level || 0))
  if (lv <= 0) return 0
  const table = [0, 0, 100, 300, 700, 1500, 3000, 3500, 4000, 4500, 5000]
  if (lv < table.length) return table[lv]
  return 5000 + (lv - 10) * 200
}

export function formatSpellProficiencyLabel(points: number) {
  const info = getSpellProficiencyInfo(points)
  if (info.maxed) return `${info.name} · ${info.points}`
  return `${info.name} · ${info.progressText}`
}
