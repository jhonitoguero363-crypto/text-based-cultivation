import {
  ADVANCE_STAGES,
  getNextRealm,
  QI_STAGES,
  REALM_MAJORS,
  type RealmState
} from './realm'

/**
 * 境界修为进度序号：无修为 = 0，炼气一层 = 1 … 炼气九层 = 9；
 * 筑基前期 = 10 … 飞升大圆满 = 45。
 */
export function getRealmProgressIndex(state: RealmState): number {
  if (state.major === '无修为') return 0
  if (state.major === '炼气') {
    const idx = QI_STAGES.indexOf(state.stage as (typeof QI_STAGES)[number])
    return 1 + Math.max(0, idx)
  }
  const majorIdx = REALM_MAJORS.indexOf(state.major)
  const stageIdx = ADVANCE_STAGES.indexOf(state.stage as (typeof ADVANCE_STAGES)[number])
  // 筑基 index=2 → 10；其后每大境界 +4
  const m = majorIdx < 2 ? 2 : majorIdx
  const s = stageIdx < 0 ? 0 : stageIdx
  return 10 + (m - 2) * 4 + s
}

/** 突破需求基数（无修为 → 炼气一层） */
const EXP_BASE = 150
/** 每推进一阶段，突破需求倍率（高于吐纳增速 → 越高越难） */
const EXP_GROWTH = 1.3

/** 洞府吐纳基础修为（再乘功法品阶 / 熟练度 / 悟性等） */
const PRACTICE_BASE = 0.95
/** 吐纳基础随境界增长（慢于突破需求，逼迫换更高阶功法） */
const PRACTICE_GROWTH = 1.24

/**
 * 当前境界「本层」突破所需修为（独立进度，非生涯累计）。
 * 例：无修为需攒满本层 → 突破后归零，再按炼气一层的本层需求重新积攒。
 * 已达飞升大圆满时仍返回本档数值（仅作展示，不可再突破）。
 */
export function getExpRequiredToBreakthrough(state: RealmState): number {
  const p = getRealmProgressIndex(state)
  return Math.max(1, Math.round(EXP_BASE * Math.pow(EXP_GROWTH, p)))
}

/**
 * 洞府吐纳的境界基础修为（约每 5 秒的期望尺度，再乘随机 0～0.5 与各类倍率）。
 * 境界越高基数越大，但增速慢于突破需求，故整体修炼难度上升。
 */
export function getRealmPracticeExpBase(state: RealmState): number {
  const p = getRealmProgressIndex(state)
  return Math.round(PRACTICE_BASE * Math.pow(PRACTICE_GROWTH, p) * 100) / 100
}

/** 是否还可突破 */
export function canRealmBreakthrough(state: RealmState) {
  return !!getNextRealm(state)
}
