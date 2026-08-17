import { getGameDayKey } from './game-time'
import type { RealmMajor } from './realm'
import { getRealmCombatPowerRange } from './combat-power'

/** 默认日限（镇妖塔 / 魔窟 / 剑冢） */
export const LANDMARK_DAILY_LIMIT = 3

export type LandmarkKey = 'tower' | 'demon_den' | 'sword_tomb' | 'ancestor_pool'

/** 各建筑每天元日次数 */
export const LANDMARK_DAILY_LIMITS: Record<LandmarkKey, number> = {
  tower: 3,
  demon_den: 3,
  sword_tomb: 3,
  ancestor_pool: 2
}

export function getLandmarkDailyLimit(key: LandmarkKey) {
  return LANDMARK_DAILY_LIMITS[key] ?? LANDMARK_DAILY_LIMIT
}

export interface TowerFloorDef {
  id: string
  /** 展示名，如「一层 · 青风狼」 */
  name: string
  /**
   * 相对「当前大境界正道中位 mid」的战力门槛倍数。
   * 一层 0.55 / 二层 0.85 / 三层 1.15
   */
  powerMult: number
  durationSec: number
  contribution: number
  exp: number
  /** block=战力不足不可开；risk=可开，结束时按 injuryChance 判定受伤 */
  underpowered: 'block' | 'risk'
  /** 战力不足且 underpowered=risk 时，结束受伤概率 */
  injuryChance: number
}

/** 青云镇妖塔三层 */
export const TOWER_FLOORS: TowerFloorDef[] = [
  {
    id: 'tf1',
    name: '一层 · 青风狼',
    powerMult: 0.55,
    durationSec: 45,
    contribution: 40,
    exp: 8,
    underpowered: 'block',
    injuryChance: 0
  },
  {
    id: 'tf2',
    name: '二层 · 赤炎狼',
    powerMult: 0.85,
    durationSec: 60,
    contribution: 70,
    exp: 12,
    underpowered: 'risk',
    injuryChance: 0.5
  },
  {
    id: 'tf3',
    name: '三层 · 玄甲龟',
    powerMult: 1.15,
    durationSec: 75,
    contribution: 100,
    exp: 18,
    underpowered: 'risk',
    injuryChance: 1
  }
]

export function getTowerFloor(id: string) {
  return TOWER_FLOORS.find((item) => item.id === id) || null
}

/** 镇妖塔门槛：相对玩家当前大境界 mid（非相对自身战力） */
export function towerRequiredPower(
  realmMajor: RealmMajor | string | null | undefined,
  floor: TowerFloorDef
) {
  const major = (realmMajor || '炼气') as RealmMajor
  const mid = getRealmCombatPowerRange(major).mid
  return Math.max(1, Math.round(mid * floor.powerMult))
}

/** 魔窟杀伐参数 */
export const DEMON_DEN = {
  enemyPowerMinMult: 0.85,
  enemyPowerMaxMult: 1.15,
  winContribution: [50, 80] as const,
  winExp: [10, 15] as const,
  winStones: [10, 30] as const
}

export function rollDemonDenEnemyPower(myPower: number) {
  const span = DEMON_DEN.enemyPowerMaxMult - DEMON_DEN.enemyPowerMinMult
  const mult = DEMON_DEN.enemyPowerMinMult + Math.random() * span
  return Math.max(1, Math.round(Math.max(1, myPower) * mult))
}

/** 万剑剑冢问剑 */
export const SWORD_TOMB = {
  durationSec: 30,
  /** 成功率 = clamp(base + 悟性×per + 剑修加成, min, max) */
  rateBase: 35,
  ratePerComprehension: 0.4,
  swordSchoolBonus: 15,
  rateMin: 20,
  rateMax: 90,
  profGain: [0.8, 1.5] as const,
  swordProfMult: 1.2,
  successContribution: 40,
  failContribution: 10,
  /** 失败扣除当前修为比例 */
  failExpLossRate: 0.03
}

export function calcSwordTombSuccessRate(comprehension: number, isSwordSchool: boolean) {
  const raw =
    SWORD_TOMB.rateBase +
    comprehension * SWORD_TOMB.ratePerComprehension +
    (isSwordSchool ? SWORD_TOMB.swordSchoolBonus : 0)
  return Math.max(SWORD_TOMB.rateMin, Math.min(SWORD_TOMB.rateMax, Math.round(raw)))
}

/** 妖族返祖池 */
export const ANCESTOR_POOL = {
  /** 首次消耗贡献；之后每次 +step（大量贡献下沉） */
  contributionCostBase: 200,
  contributionCostStep: 100,
  rateBase: 25,
  ratePerRoot: 0.5,
  rateMin: 20,
  rateMax: 85,
  /** 终身仅第一次成功：主灵根 +[rootBonusMin, rootBonusMax] 随机整数 */
  rootBonusMin: 1,
  rootBonusMax: 10,
  /** 后续成功：修为基数，按次数指数衰减 */
  expBase: 28,
  expDecay: 0.72,
  expMin: 1.5
}

export function calcAncestorPoolSuccessRate(primaryRootValue: number) {
  const raw = ANCESTOR_POOL.rateBase + primaryRootValue * ANCESTOR_POOL.ratePerRoot
  return Math.max(ANCESTOR_POOL.rateMin, Math.min(ANCESTOR_POOL.rateMax, Math.round(raw)))
}

/** 下一次尝试消耗的贡献（successCount = 已成功次数） */
export function calcAncestorPoolContributionCost(successCount: number) {
  const n = Math.max(0, Math.floor(successCount))
  return ANCESTOR_POOL.contributionCostBase + n * ANCESTOR_POOL.contributionCostStep
}

/**
 * 后续（非首次）成功修为。
 * expOnlyIndex：第几次「只涨修为」的成功（从 0 起）。
 */
export function calcAncestorPoolExpGain(expOnlyIndex: number) {
  const i = Math.max(0, Math.floor(expOnlyIndex))
  const raw = ANCESTOR_POOL.expBase * Math.pow(ANCESTOR_POOL.expDecay, i)
  return Math.max(ANCESTOR_POOL.expMin, Math.round(raw * 10) / 10)
}

/** 首次成功主灵根涨幅：1～10 等概率整数 */
export function rollAncestorPoolRootBonus() {
  const min = ANCESTOR_POOL.rootBonusMin
  const max = ANCESTOR_POOL.rootBonusMax
  if (max <= min) return min
  return min + Math.floor(Math.random() * (max - min + 1))
}

export function rollInclusiveRange(range: readonly [number, number]) {
  const [min, max] = range
  if (max <= min) return min
  return Math.round((min + Math.random() * (max - min)) * 10) / 10
}

export function landmarkDayKey(now = Date.now()) {
  return getGameDayKey(now)
}
