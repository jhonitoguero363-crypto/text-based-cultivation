import { PILL_SHOP_CATALOG } from './pill-catalog'
import {
  getNextRealm,
  REALM_MAJORS,
  type RealmMajor,
  type RealmState
} from './realm'
import { getRealmProgressIndex } from './realm-exp'
import { getTechniqueGradeRank } from './technique-catalog'

export interface BreakthroughRateDetail {
  /** 最终成功率 0～100（整数展示用） */
  rate: number
  isMajor: boolean
  base: number
  gradeBonus: number
  pillBonus: number
  /** 对应突破丹名称；炼气等无丹则为 null */
  pillName: string | null
  /** 是否已持有并会计入加成 */
  hasPill: boolean
  fromLabel: string
  toLabel: string
}

/** 是否为大境界跨越（如炼气九层→筑基前期） */
export function isMajorRealmBreakthrough(current: RealmState, next: RealmState) {
  return current.major !== next.major
}

/**
 * 某大境界对应的突破丹。
 * 飞升用「飞升丹」；炼气无专用突破丹；炼虚目录暂无突破类丹。
 */
export function getBreakthroughPillName(major: RealmMajor): string | null {
  if (major === '无修为' || major === '炼气') return null
  if (major === '飞升') return '飞升丹'
  const pill = PILL_SHOP_CATALOG.find((item) => item.realm === major && item.type === '突破')
  return pill?.name || null
}

/** 突破丹对成功率的加成（百分点） */
export function getBreakthroughPillBonus(isMajor: boolean, pillName: string | null) {
  if (!pillName) return 0
  if (pillName === '渡劫丹') return isMajor ? 20 : 8
  if (pillName === '飞升丹') return isMajor ? 30 : 10
  return isMajor ? 25 : 10
}

/**
 * 本命功法品阶对突破成功率的修正（百分点）。
 * 黄阶下品约 −2，仙阶上品约 +12；无功法 −4。
 */
export function calcTechniqueBreakthroughBonus(grade: string | null | undefined) {
  if (!grade) return -4
  const rank = getTechniqueGradeRank(grade)
  return Math.round(-2 + rank)
}

/**
 * 基础成功率：大境界约 10%～50%（越高越低），小境界约 80%+。
 */
export function calcBreakthroughBaseRate(current: RealmState, next: RealmState) {
  // 凡人引气入体：无修为 → 炼气，成功率偏高
  if (current.major === '无修为') {
    return 90
  }
  if (isMajorRealmBreakthrough(current, next)) {
    const idx = REALM_MAJORS.indexOf(next.major)
    // 筑基(2)=50 … 飞升(10)=10
    const steps = Math.max(0, idx - 2)
    return Math.round((50 - steps * 5) * 10) / 10
  }
  const p = getRealmProgressIndex(current)
  return Math.max(80, Math.round((92 - p * 0.25) * 10) / 10)
}

function clampRate(n: number) {
  return Math.max(5, Math.min(95, Math.round(n)))
}

/**
 * 计算突破成功率。
 * 大境界 pill 按目标大境界；小境界按当前大境界。
 */
export function calcBreakthroughSuccessRate(input: {
  current: RealmState
  next?: RealmState | null
  techniqueGrade?: string | null
  hasPill?: boolean
  formatRealm: (state: RealmState) => string
}): BreakthroughRateDetail | null {
  const next = input.next ?? getNextRealm(input.current)
  if (!next) return null

  const isMajor = isMajorRealmBreakthrough(input.current, next)
  const pillMajor = isMajor ? next.major : input.current.major
  const pillName = getBreakthroughPillName(pillMajor)
  const hasPill = !!(pillName && input.hasPill)
  const base = calcBreakthroughBaseRate(input.current, next)
  const gradeBonus = calcTechniqueBreakthroughBonus(input.techniqueGrade)
  const pillBonus = hasPill ? getBreakthroughPillBonus(isMajor, pillName) : 0
  const rate = clampRate(base + gradeBonus + pillBonus)

  return {
    rate,
    isMajor,
    base,
    gradeBonus,
    pillBonus,
    pillName,
    hasPill,
    fromLabel: input.formatRealm(input.current),
    toLabel: input.formatRealm(next)
  }
}

/** 失败时修为保留比例（降 20%） */
export const BREAKTHROUGH_FAIL_EXP_KEEP = 0.8
