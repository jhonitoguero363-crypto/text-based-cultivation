import { calcSelfForgeSuccessRate, type CraftMode } from './craft-mode'
import { getLootMaterial, isOreName } from './loot-material-catalog'
import { ORE_MATERIALS } from './ore-catalog'
import {
  TREASURE_CATEGORIES,
  TREASURE_GRADES,
  canWieldTreasureGrade,
  getMaxTreasureGrade,
  getRealmMajorIndex,
  isTreasureCategory,
  type TreasureCategory,
  type TreasureGrade
} from './treasure'
import type { RealmState } from './realm'

const ORE_STRENGTH: Record<string, number> = {
  灵矿: 1,
  高阶灵矿: 2,
  神矿: 4,
  仙矿: 7,
  道矿: 12,
  镇界神材: 20
}

/** 历练材料强度：按来源妖兽最高境界折算（略高于同阶灵矿，低于顶级神材） */
const LOOT_STRENGTH_BY_REALM_IDX = [2, 2, 3, 4, 5, 7, 9, 12, 15, 18]

const QUALITIES = ['下品', '中品', '上品', '极品'] as const

export type ForgeBagKind = '矿石' | '材料'

export interface ForgeMaterialInput {
  name: string
  count: number
  /** 矿阶；历练材料可空 */
  level?: string
  /** 背包分类，扣除时用 */
  kind?: ForgeBagKind
}

export interface ForgePreview {
  strength: number
  successRate: number
  spiritCost: number
  gradeHint: TreasureGrade
  maxGrade: TreasureGrade
  mode: CraftMode
}

export interface ForgeCraftResult {
  ok: boolean
  reason?: string
  /** 失败时材料与灵石仍已消耗 */
  consumed: boolean
  treasure?: {
    name: string
    grade: TreasureGrade
    gradeLabel: string
    type: string
    desc: string
    special: string
    story: string
    cost: number
  }
}

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n))
}

function randInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

export function getOreLevelByName(name: string) {
  return ORE_MATERIALS.find((item) => item.name === name)?.level || ''
}

/** 背包扣除用：矿石目录名 → 矿石，其余可炼材料 → 材料 */
export function getForgeBagKind(name: string): ForgeBagKind {
  if (isOreName(name) || getOreLevelByName(name)) return '矿石'
  return '材料'
}

export function getLootMaterialStrength(name: string) {
  const loot = getLootMaterial(name)
  if (!loot) return 2
  if (!loot.realms.length) return 3
  const maxIdx = Math.max(...loot.realms.map((realm) => getRealmMajorIndex(realm)))
  return LOOT_STRENGTH_BY_REALM_IDX[clamp(maxIdx, 0, LOOT_STRENGTH_BY_REALM_IDX.length - 1)] || 2
}

export function getMaterialStrength(name: string, level?: string) {
  const tier = level || getOreLevelByName(name)
  if (tier && ORE_STRENGTH[tier]) return ORE_STRENGTH[tier]
  if (isOreName(name)) return ORE_STRENGTH['灵矿'] || 1
  return getLootMaterialStrength(name)
}

export function calcForgeStrength(materials: ForgeMaterialInput[]) {
  return materials.reduce((sum, item) => {
    if (item.count <= 0) return sum
    return sum + getMaterialStrength(item.name, item.level) * item.count
  }, 0)
}

/** @deprecated 自炼已改看法术等级；保留给对照 */
export function calcForgeSuccessRate(strength: number) {
  if (strength <= 0) return 0
  return clamp(0.18 + strength * 0.035, 0.18, 0.72)
}

/** 委托炼制灵石消耗（自己炼制为 0） */
export function calcForgeSpiritCost(strength: number) {
  if (strength <= 0) return 0
  return 30 + strength * 18
}

function gradeIndexFromStrength(strength: number): number {
  if (strength >= 70) return 5
  if (strength >= 48) return 4
  if (strength >= 30) return 3
  if (strength >= 16) return 2
  if (strength >= 7) return 1
  return 0
}

export function previewForge(
  materials: ForgeMaterialInput[],
  realm: RealmState,
  opts?: { mode?: CraftMode; spellLevel?: number }
): ForgePreview {
  const mode: CraftMode = opts?.mode || 'self'
  const strength = calcForgeStrength(materials)
  const maxGrade = getMaxTreasureGrade(realm)
  const maxIdx = TREASURE_GRADES.indexOf(maxGrade)
  const rolledIdx = clamp(gradeIndexFromStrength(strength), 0, maxIdx)
  const gradeHint = TREASURE_GRADES[rolledIdx]

  if (strength <= 0) {
    return {
      strength: 0,
      successRate: 0,
      spiritCost: 0,
      gradeHint,
      maxGrade,
      mode
    }
  }

  if (mode === 'entrust') {
    return {
      strength,
      successRate: 1,
      spiritCost: calcForgeSpiritCost(strength),
      gradeHint,
      maxGrade,
      mode
    }
  }

  return {
    strength,
    successRate: calcSelfForgeSuccessRate(opts?.spellLevel || 1, rolledIdx, strength),
    spiritCost: 0,
    gradeHint,
    maxGrade,
    mode
  }
}

function resolveCraftType(type?: string): TreasureCategory {
  if (type && isTreasureCategory(type)) return type
  return TREASURE_CATEGORIES[randInt(0, TREASURE_CATEGORIES.length - 1)]
}

function pickQuality(strength: number) {
  const t = clamp(strength / 60, 0, 1)
  const weights = [
    Math.max(1, 40 - t * 30),
    25 + t * 5,
    18 + t * 12,
    5 + t * 20
  ]
  const total = weights.reduce((a, b) => a + b, 0)
  let r = Math.random() * total
  for (let i = 0; i < QUALITIES.length; i += 1) {
    r -= weights[i]
    if (r <= 0) return QUALITIES[i]
  }
  return '下品'
}

function buildEffect(grade: TreasureGrade, type: string, strength: number) {
  const power = 8 + strength * 3 + TREASURE_GRADES.indexOf(grade) * 20
  if (type === '攻击类') return `攻击 +${power}，破甲略增`
  if (type === '防御类') return `防御 +${Math.round(power * 0.9)}，护体凝形`
  if (type === '辅助类') return `修炼效率 +${8 + Math.floor(strength / 2)}%，聚灵自生`
  return `灵力上限 +${power}，特技触发率提升`
}

function buildSpecial(grade: TreasureGrade, type: string) {
  const pool = {
    攻击类: ['锋锐', '裂空', '追魂', '斩妄'],
    防御类: ['金钟', '龟息', '化劲', '不坏'],
    辅助类: ['聚灵', '悟道', '回春', '通玄'],
    特殊类: ['幻影', '定身', '破障', '窥天']
  } as Record<string, string[]>
  const list = pool[type] || pool['特殊类']
  const word = list[randInt(0, list.length - 1)]
  return `${grade}特技·${word}`
}

/**
 * 按材料强度随机生成法宝。
 * 自己炼制有失败概率；委托炼制成功率 100%。
 * 调用方负责扣材料与灵石；本函数只做判定与生成。
 */
export function craftTreasureByMaterials(input: {
  name: string
  materials: ForgeMaterialInput[]
  realm: RealmState
  mode?: CraftMode
  spellLevel?: number
  /** 攻击类 / 防御类 / 辅助类 / 特殊类；打造时由玩家选定 */
  type?: TreasureCategory | string
}): ForgeCraftResult {
  const name = input.name.trim()
  if (!name) return { ok: false, reason: '请输入法宝名称', consumed: false }
  if (name.length < 2) return { ok: false, reason: '名称至少 2 个字', consumed: false }
  if (name.length > 8) return { ok: false, reason: '名称最多 8 个字', consumed: false }
  if (!input.type || !isTreasureCategory(input.type)) {
    return { ok: false, reason: '请选择法宝类别', consumed: false }
  }

  const mats = input.materials.filter((item) => item.count > 0)
  if (!mats.length) return { ok: false, reason: '请投入至少一种材料', consumed: false }

  const preview = previewForge(mats, input.realm, {
    mode: input.mode || 'self',
    spellLevel: input.spellLevel
  })
  if (preview.strength <= 0) return { ok: false, reason: '材料无效', consumed: false }

  if (Math.random() > preview.successRate) {
    return { ok: false, reason: '炼器失败，材料尽毁', consumed: true }
  }

  const maxIdx = TREASURE_GRADES.indexOf(preview.maxGrade)
  let gradeIdx = gradeIndexFromStrength(preview.strength)
  // 随机浮动一档，仍受境界上限约束
  gradeIdx += randInt(-1, 1)
  gradeIdx = clamp(gradeIdx, 0, maxIdx)
  let grade = TREASURE_GRADES[gradeIdx]
  if (!canWieldTreasureGrade(input.realm, grade)) {
    grade = preview.maxGrade
  }

  const quality = pickQuality(preview.strength)
  const type = resolveCraftType(input.type)
  const gradeLabel = `${quality}${grade}`

  return {
    ok: true,
    consumed: true,
    treasure: {
      name,
      grade,
      gradeLabel,
      type,
      desc: buildEffect(grade, type, preview.strength),
      special: buildSpecial(grade, type),
      story: `以${mats.map((m) => `${m.name}×${m.count}`).join('、')}淬炼而成。`,
      cost: preview.spiritCost
    }
  }
}
