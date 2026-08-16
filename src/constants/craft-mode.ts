/** 炼制方式：委托与自己炼制均只耗药材；自己炼制成功率看法术熟练度与炼制难度 */
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

/** 炼制难度 1～12 对应名（与品阶默认对齐，可单独改数值） */
export const PILL_CRAFT_DIFFICULTY_LABELS = [
  '入门',
  '简单',
  '普通',
  '偏难',
  '困难',
  '艰难',
  '极难',
  '险绝',
  '天劫',
  '造化',
  '鸿蒙',
  '无极'
] as const

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

/** 品阶 → 默认炼制难度（1～12） */
export function getPillGradeDifficulty(grade: string) {
  const idx = PILL_GRADE_ORDER.indexOf(grade as (typeof PILL_GRADE_ORDER)[number])
  return idx >= 0 ? idx + 1 : 5
}

/** 规范化炼制难度数值 */
export function resolvePillCraftDifficulty(craftDifficulty?: number, grade?: string) {
  if (typeof craftDifficulty === 'number' && Number.isFinite(craftDifficulty)) {
    return clamp(Math.round(craftDifficulty), 1, 12)
  }
  return getPillGradeDifficulty(grade || '')
}

export function formatPillCraftDifficulty(craftDifficulty?: number, grade?: string) {
  const n = resolvePillCraftDifficulty(craftDifficulty, grade)
  const label = PILL_CRAFT_DIFFICULTY_LABELS[n - 1] || '普通'
  return `${label}（${n}）`
}

function resolveCraftTier(spellLevelOrTier: number) {
  return Math.max(1, Math.min(SPELL_PROFICIENCY_TIER_MAX, Math.floor(spellLevelOrTier || 1)))
}

function tierPowerBonus(tier: number) {
  return SPELL_PROFICIENCY_TIERS[resolveCraftTier(tier) - 1]?.powerBonus || 0
}

/**
 * 自己炼丹成功率：炼丹术熟练度越高越高，炼制难度越高越难。
 * 初窥门径 · 难度1 约 72%；炉火纯青 · 难度9 约 70%。
 * @param craftDifficultyOrGrade 传数字为炼制难度 1～12；传品阶字符串则按品阶推算（兼容旧调用）
 */
export function calcSelfPillSuccessRate(spellTier: number, craftDifficultyOrGrade: number | string) {
  const tier = resolveCraftTier(spellTier)
  const diff =
    typeof craftDifficultyOrGrade === 'number'
      ? resolvePillCraftDifficulty(craftDifficultyOrGrade) - 1
      : resolvePillCraftDifficulty(undefined, craftDifficultyOrGrade) - 1
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
