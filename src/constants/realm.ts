/** 大境界（含凡人起点「无修为」） */
export const REALM_MAJORS = [
  '无修为',
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

/** 无修为仅一档（展示为「无修为」） */
export const MORTAL_STAGES = [''] as const

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

export type MortalStage = (typeof MORTAL_STAGES)[number]
export type QiStage = (typeof QI_STAGES)[number]
export type AdvanceStage = (typeof ADVANCE_STAGES)[number]
export type RealmStage = MortalStage | QiStage | AdvanceStage

export interface RealmState {
  major: RealmMajor
  stage: RealmStage
}

export function getStagesForMajor(major: RealmMajor): readonly RealmStage[] {
  if (major === '无修为') return MORTAL_STAGES
  return major === '炼气' ? QI_STAGES : ADVANCE_STAGES
}

/** 展示文案：无修为 / 炼气三层 / 筑基前期 */
export function formatRealm(major: RealmMajor, stage: RealmStage): string {
  if (major === '无修为') return '无修为'
  return `${major}${stage}`
}

export function formatRealmState(realm: RealmState): string {
  return formatRealm(realm.major, realm.stage)
}

/** 创角 / 重置用的最低境界 */
export function createInitialRealm(): RealmState {
  return createRealm('无修为', '')
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

/** 解析「无修为」「炼气三层」「筑基前期」等展示文案；失败返回 null */
export function parseRealmLabel(label: string): RealmState | null {
  const text = String(label || '').trim()
  if (!text) return null
  if (text === '无修为') return createInitialRealm()
  for (let i = REALM_MAJORS.length - 1; i >= 0; i -= 1) {
    const major = REALM_MAJORS[i]
    if (major === '无修为') continue
    if (!text.startsWith(major)) continue
    const stage = text.slice(major.length).trim() as RealmStage
    const stages = getStagesForMajor(major)
    if (stages.includes(stage as never)) {
      return { major, stage }
    }
  }
  return null
}
