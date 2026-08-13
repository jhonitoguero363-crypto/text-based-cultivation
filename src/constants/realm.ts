/** 大境界 */
export const REALM_MAJORS = [
  '炼气',
  '筑基',
  '金丹',
  '元婴',
  '化神',
  '炼虚',
  '合体',
  '大乘',
  '渡劫',
  '飞升'
] as const

export type RealmMajor = (typeof REALM_MAJORS)[number]

/** 炼气一至九层 */
export const QI_STAGES = [
  '一层',
  '二层',
  '三层',
  '四层',
  '五层',
  '六层',
  '七层',
  '八层',
  '九层'
] as const

/** 筑基及以上阶段 */
export const ADVANCE_STAGES = ['前期', '中期', '后期', '大圆满'] as const

export type QiStage = (typeof QI_STAGES)[number]
export type AdvanceStage = (typeof ADVANCE_STAGES)[number]
export type RealmStage = QiStage | AdvanceStage

export interface RealmState {
  major: RealmMajor
  stage: RealmStage
}

export function getStagesForMajor(major: RealmMajor): readonly RealmStage[] {
  return major === '炼气' ? QI_STAGES : ADVANCE_STAGES
}

/** 展示文案：炼气三层 / 筑基前期 */
export function formatRealm(major: RealmMajor, stage: RealmStage): string {
  return `${major}${stage}`
}

export function formatRealmState(realm: RealmState): string {
  return formatRealm(realm.major, realm.stage)
}

/** 下一境界；已达飞升大圆满则返回 null */
export function getNextRealm(realm: RealmState): RealmState | null {
  const stages = getStagesForMajor(realm.major)
  const stageIndex = stages.indexOf(realm.stage as never)

  if (stageIndex >= 0 && stageIndex < stages.length - 1) {
    return {
      major: realm.major,
      stage: stages[stageIndex + 1]
    }
  }

  const majorIndex = REALM_MAJORS.indexOf(realm.major)
  if (majorIndex < 0 || majorIndex >= REALM_MAJORS.length - 1) {
    return null
  }

  const nextMajor = REALM_MAJORS[majorIndex + 1]
  const nextStages = getStagesForMajor(nextMajor)
  return {
    major: nextMajor,
    stage: nextStages[0]
  }
}

export function createRealm(major: RealmMajor, stage: RealmStage): RealmState {
  const stages = getStagesForMajor(major)
  if (!stages.includes(stage as never)) {
    throw new Error(`境界「${major}」不支持阶段「${stage}」`)
  }
  return { major, stage }
}
