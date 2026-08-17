import { PILL_SHOP_CATALOG } from './pill-catalog'
import {
  getNextRealm,
  REALM_MAJORS,
  type RealmMajor,
  type RealmState
} from './realm'
import { getRealmProgressIndex } from './realm-exp'
import { pickPrimaryRoot, type RootBone } from './roots'
import { getTechniqueGradeRank } from './technique-catalog'

/** 主灵根基准值（此值对突破成功率修正为 0） */
export const BREAKTHROUGH_ROOT_BASE = 50
/** 主灵根每偏离基准 1 点 → ±0.4 百分点成功率 */
export const BREAKTHROUGH_ROOT_PER_POINT = 0.4

export interface BreakthroughRateDetail {
  /** 最终成功率 0～100（整数展示用） */
  rate: number
  isMajor: boolean
  base: number
  gradeBonus: number
  rootBonus: number
  pillBonus: number
  /** 参与计算的主灵根数值；无灵根为 null */
  primaryRootValue: number | null
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
  const pill = PILL_SHOP_CATALOG.find((item) => item.realm === major && item.type === '突破丹')
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
 * 主灵根对突破成功率的修正（百分点）。
 * 相对基准 50：约 0→−20、50→0、100→+20。
 */
export function calcRootBreakthroughBonus(roots: RootBone[] | null | undefined) {
  if (!roots?.length) return 0
  const primary = pickPrimaryRoot(roots)
  return Math.round((primary.value - BREAKTHROUGH_ROOT_BASE) * BREAKTHROUGH_ROOT_PER_POINT)
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
  roots?: RootBone[] | null
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
  const rootBonus = calcRootBreakthroughBonus(input.roots)
  const primaryRootValue = input.roots?.length ? pickPrimaryRoot(input.roots).value : null
  const pillBonus = hasPill ? getBreakthroughPillBonus(isMajor, pillName) : 0
  const rate = clampRate(base + gradeBonus + rootBonus + pillBonus)

  return {
    rate,
    isMajor,
    base,
    gradeBonus,
    rootBonus,
    pillBonus,
    primaryRootValue,
    pillName,
    hasPill,
    fromLabel: input.formatRealm(input.current),
    toLabel: input.formatRealm(next)
  }
}

/** 失败时修为保留比例（降 20%） */
export const BREAKTHROUGH_FAIL_EXP_KEEP = 0.8
