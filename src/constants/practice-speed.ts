import type { RootBone, RootName } from './roots'

/** 悟性基准（此值倍率 = 1） */
const COMPREHENSION_BASE = 50
/** 悟性每偏离基准 1 点 → ±1% 修炼速度 */
const COMPREHENSION_PER_POINT = 0.01

/** 根骨基准 */
const ROOT_BASE = 50
/** 对应根骨每偏离基准 1 点 → ±0.8% 功法修炼速度 */
const ROOT_PER_POINT = 0.008

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n))
}

/** 悟性倍率：约 20→0.70、50→1.00、99→1.49 */
export function comprehensionSpeedMult(comprehension: number) {
  const c = Number.isFinite(comprehension) ? comprehension : COMPREHENSION_BASE
  return clamp(1 + (c - COMPREHENSION_BASE) * COMPREHENSION_PER_POINT, 0.55, 1.6)
}

/** 对应属性根骨倍率：约 0→0.60、50→1.00、100→1.40 */
export function rootSpeedMult(rootValue: number) {
  const v = Number.isFinite(rootValue) ? rootValue : ROOT_BASE
  return clamp(1 + (v - ROOT_BASE) * ROOT_PER_POINT, 0.55, 1.5)
}

export function getRootValue(roots: RootBone[] | undefined, name: RootName) {
  if (!roots?.length) return ROOT_BASE
  const found = roots.find((item) => item.name === name)
  return found ? found.value : 0
}

/**
 * 从功法类型 / 流派解析对应灵根属性。
 * 无对应五行者返回 null（仅受悟性影响）。
 */
export function resolveTechniqueRootAttr(
  typeText: string,
  schoolText?: string
): RootName | null {
  const text = `${typeText || ''}${schoolText ? `/${schoolText}` : ''}`

  // 明确五行 / 异属优先
  if (/木/.test(text)) return '木'
  if (/火|炎/.test(text)) return '火'
  if (/水/.test(text) && !/冰/.test(text)) return '水'
  if (/土|厚土/.test(text)) return '土'
  if (/冰|寒月|玄冰/.test(text)) return '冰'
  if (/雷/.test(text)) return '雷'
  if (/风|疾风/.test(text)) return '风'
  if (/金|剑/.test(text)) return '金'

  // 流派 / 类型近似映射
  if (/身法|空间/.test(text)) return '风'
  if (/炼体/.test(text)) return '土'
  if (/剑修|剑道/.test(text)) return '金'
  if (/雷修/.test(text)) return '雷'
  if (/丹修|驭兽|世界/.test(text)) return '木'
  if (/魂修|魂道/.test(text)) return '冰'

  // 修炼 / 混沌 / 天道 / 时间 / 阴阳 等：无单一对应属性
  return null
}

export function formatSpeedMult(mult: number) {
  return `×${(Math.round(mult * 100) / 100).toFixed(2)}`
}

export interface PracticeSpeedInput {
  comprehension: number
  roots?: RootBone[]
  /** 功法类型（如火系、剑道）；法术演练不传 */
  techniqueType?: string
  techniqueSchool?: string
  /** 洞府修炼加成百分比，如 5 → +5% */
  cultivateBonus?: number
  /** 聚气速度，如 1.1 */
  gatherSpeed?: number
}

export interface PracticeSpeedBreakdown {
  /** 最终综合倍率 */
  total: number
  comprehension: number
  root: number
  rootName: RootName | null
  rootValue: number
  cave: number
}

/** 洞府设施倍率（聚气速度 + 修炼加成） */
function caveSpeedMult(cultivateBonus = 0, gatherSpeed = 1) {
  const gather = 1 + Math.min(0.25, Math.max(0, gatherSpeed - 1) * 0.5)
  const cultivate = 1 + Math.max(0, cultivateBonus) / 100
  return gather * cultivate
}

/** 功法修炼：悟性 × 对应根骨 × 洞府 */
export function calcTechniquePracticeSpeed(input: PracticeSpeedInput): PracticeSpeedBreakdown {
  const comprehension = comprehensionSpeedMult(input.comprehension)
  const rootName = resolveTechniqueRootAttr(input.techniqueType || '', input.techniqueSchool)
  const rootValue = rootName ? getRootValue(input.roots, rootName) : ROOT_BASE
  const root = rootName ? rootSpeedMult(rootValue) : 1
  const cave = caveSpeedMult(input.cultivateBonus, input.gatherSpeed)
  const total = comprehension * root * cave
  return { total, comprehension, root, rootName, rootValue, cave }
}

/** 法术演练：悟性 × 洞府（根骨不影响） */
export function calcSpellPracticeSpeed(input: PracticeSpeedInput): PracticeSpeedBreakdown {
  const comprehension = comprehensionSpeedMult(input.comprehension)
  const cave = caveSpeedMult(input.cultivateBonus, input.gatherSpeed)
  const total = comprehension * cave
  return {
    total,
    comprehension,
    root: 1,
    rootName: null,
    rootValue: 0,
    cave
  }
}
