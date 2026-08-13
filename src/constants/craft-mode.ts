/** 炼制方式：委托需缴灵石；自己炼制不耗灵石，成功率看法术熟练度与成品品阶 */
import { SPELL_PROFICIENCY_TIERS, SPELL_PROFICIENCY_TIER_MAX } from './spell-proficiency'

export type CraftMode = 'self' | 'entrust'

export const CRAFT_MODE_LABELS = ['自己炼制', '委托炼制'] as const

export const CRAFT_MODE_FROM_LABEL: Record<string, CraftMode> = {
  自己炼制: 'self',
  委托炼制: 'entrust'
}

export const CRAFT_MODE_TO_LABEL: Record<CraftMode, string> = {
  self: '自己炼制',
  entrust: '委托炼制'
}

/** @deprecated 已改为六阶熟练度；保留别名以免旧引用报错 */
export const SPELL_LEVEL_MAX = SPELL_PROFICIENCY_TIER_MAX

const PILL_GRADE_ORDER = [
  '一品',
  '二品',
  '三品',
  '四品',
  '五品',
  '六品',
  '七品',
  '八品',
  '九品',
  '仙丹',
  '神丹',
  '先天神丹'
] as const

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n))
}

export function getPillGradeDifficulty(grade: string) {
  const idx = PILL_GRADE_ORDER.indexOf(grade as (typeof PILL_GRADE_ORDER)[number])
  return idx >= 0 ? idx : 4
}

function resolveCraftTier(spellLevelOrTier: number) {
  return Math.max(1, Math.min(SPELL_PROFICIENCY_TIER_MAX, Math.floor(spellLevelOrTier || 1)))
}

function tierPowerBonus(tier: number) {
  return SPELL_PROFICIENCY_TIERS[resolveCraftTier(tier) - 1]?.powerBonus || 0
}

/**
 * 自己炼丹成功率：炼丹术熟练度越高越高，丹药品阶越高越难。
 * 初窥门径一品约 72%，炉火纯青九品约 70%。
 */
export function calcSelfPillSuccessRate(spellTier: number, grade: string) {
  const tier = resolveCraftTier(spellTier)
  const diff = getPillGradeDifficulty(grade)
  const power = tierPowerBonus(tier)
  return clamp(0.72 + (tier - 1) * 0.055 + power * 0.08 - diff * 0.05, 0.08, 0.95)
}

/**
 * 自己炼器成功率：炼器术熟练度 + 预估品阶难度，材料强度略有加成。
 * gradeIndex：0 法器 … 更高越难。
 */
export function calcSelfForgeSuccessRate(
  spellTier: number,
  gradeIndex: number,
  strength: number
) {
  const tier = resolveCraftTier(spellTier)
  const g = Math.max(0, gradeIndex)
  const matBonus = Math.min(0.15, Math.max(0, strength) * 0.008)
  const power = tierPowerBonus(tier)
  return clamp(0.4 + (tier - 1) * 0.07 + power * 0.1 + matBonus - g * 0.07, 0.08, 0.92)
}

export function formatSuccessRate(rate: number) {
  return `${Math.round(rate * 100)}%`
}
