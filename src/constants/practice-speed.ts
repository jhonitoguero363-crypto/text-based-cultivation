import type { RootBone, RootName } from './roots'
import { pickPrimaryRoot, pickPrimaryRoots } from './roots'

/** 悟性基准（此值倍率 = 1） */
const COMPREHENSION_BASE = 50
/** 悟性每偏离基准 1 点 → ±1% 修炼速度 */
const COMPREHENSION_PER_POINT = 0.01

/** 根骨基准 */
const ROOT_BASE = 50
/** 对应根骨每偏离基准 1 点 → ±0.8% 功法/法术修习速度 */
const ROOT_PER_POINT = 0.008

/** 与主灵根相克：大幅降低 */
export const ELEMENT_RESTRAIN_MULT = 0.38
/** 非同属、非相克（含相生等异属）：小幅降低 */
export const ELEMENT_OTHER_MULT = 0.82

/** 五行核心 */
export type WuxingCore = '金' | '木' | '水' | '火' | '土'

/** 属性关系：同属 / 相克 / 异属 / 无属性 */
export type ElementRelation = 'match' | 'restrain' | 'other' | 'none'

/** 相生：木→火→土→金→水→木 */
export const WUXING_GENERATE: Record<WuxingCore, WuxingCore> = {
  木: '火',
  火: '土',
  土: '金',
  金: '水',
  水: '木'
}

/** 相克：木→土→水→火→金→木 */
export const WUXING_RESTRAIN: Record<WuxingCore, WuxingCore> = {
  木: '土',
  土: '水',
  水: '火',
  火: '金',
  金: '木'
}

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n))
}

function randInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

/**
 * 创建角色时随机悟性（与灵根独立）。
 * 约：8% 20–34、20% 35–49、44% 50–69、20% 70–84、8% 85–99
 */
export function rollComprehension(): number {
  const roll = Math.random()
  if (roll < 0.08) return randInt(20, 34)
  if (roll < 0.28) return randInt(35, 49)
  if (roll < 0.72) return randInt(50, 69)
  if (roll < 0.92) return randInt(70, 84)
  return randInt(85, 99)
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
 * 风/冰/雷归入五行：风≈木、冰≈水、雷≈火。
 * 用于判定相生相克；同属判定时精确名优先。
 */
export function toWuxingCore(name: RootName | string | null | undefined): WuxingCore | null {
  if (!name) return null
  if (name === '风') return '木'
  if (name === '冰') return '水'
  if (name === '雷') return '火'
  if (name === '金' || name === '木' || name === '水' || name === '火' || name === '土') {
    return name
  }
  return null
}

/** 主灵根与功法/法术属性的五行关系 */
export function getElementRelation(
  primaryRoot: RootName | null | undefined,
  targetRoot: RootName | null | undefined
): ElementRelation {
  if (!targetRoot) return 'none'
  if (!primaryRoot) return 'other'
  if (primaryRoot === targetRoot) return 'match'

  const a = toWuxingCore(primaryRoot)
  const b = toWuxingCore(targetRoot)
  if (!a || !b) return 'other'
  if (a === b) return 'match'
  if (WUXING_RESTRAIN[a] === b || WUXING_RESTRAIN[b] === a) return 'restrain'
  return 'other'
}

export function formatRelationLabel(relation: ElementRelation) {
  if (relation === 'match') return '同属'
  if (relation === 'restrain') return '相克'
  if (relation === 'other') return '异属'
  return '无属性'
}

/**
 * 从功法属性 / 类型 / 流派解析对应灵根。
 * 优先识别九种标准属性；无属性或无法对应者返回 null（仅受悟性影响）。
 */
export function resolveTechniqueRootAttr(
  typeText: string,
  schoolText?: string
): RootName | null {
  const raw = (typeText || '').trim()
  if (!raw || raw === '无属性') return null
  if (
    raw === '金' ||
    raw === '木' ||
    raw === '水' ||
    raw === '火' ||
    raw === '土' ||
    raw === '风' ||
    raw === '冰' ||
    raw === '雷'
  ) {
    return raw
  }

  const text = `${raw}${schoolText ? `/${schoolText}` : ''}`

  if (/木/.test(text)) return '木'
  if (/火|炎/.test(text)) return '火'
  if (/水/.test(text) && !/冰/.test(text)) return '水'
  if (/土|厚土/.test(text)) return '土'
  if (/冰|寒月|玄冰/.test(text)) return '冰'
  if (/雷/.test(text)) return '雷'
  if (/风|疾风/.test(text)) return '风'
  if (/金|剑/.test(text)) return '金'

  if (/身法|空间/.test(text)) return '风'
  if (/炼体|体修/.test(text)) return '土'
  if (/剑修|剑道/.test(text)) return '金'
  if (/魔修|血煞|天魔/.test(text)) return '火'
  if (/妖族|妖神|血脉/.test(text)) return '土'
  if (/雷修/.test(text)) return '雷'
  if (/丹修|驭兽|世界/.test(text)) return '木'
  if (/魂修|魂道/.test(text)) return '冰'

  return null
}

/** 从法术属性文案解析灵根 */
export function resolveSpellRootAttr(attrText: string): RootName | null {
  return resolveTechniqueRootAttr(attrText || '')
}

export function formatSpeedMult(mult: number) {
  return `×${(Math.round(mult * 100) / 100).toFixed(2)}`
}

export interface PracticeSpeedInput {
  comprehension: number
  roots?: RootBone[]
  /** 功法类型（如火系、剑道） */
  techniqueType?: string
  techniqueSchool?: string
  /** 法术属性（如火、冰） */
  spellAttr?: string
  /** 洞府修炼加成百分比，如 5 → +5% */
  cultivateBonus?: number
  /** 聚气速度，如 1.1 */
  gatherSpeed?: number
}

export interface PracticeSpeedBreakdown {
  /** 最终综合倍率 */
  total: number
  comprehension: number
  /** 灵根亲和倍率（同属看根骨；相克/异属为惩罚系数） */
  root: number
  rootName: RootName | null
  rootValue: number
  primaryRoot: RootName | null
  relation: ElementRelation
  cave: number
}

/** 洞府设施倍率（聚气速度 + 修炼加成） */
function caveSpeedMult(cultivateBonus = 0, gatherSpeed = 1) {
  const gather = 1 + Math.min(0.25, Math.max(0, gatherSpeed - 1) * 0.5)
  const cultivate = 1 + Math.max(0, cultivateBonus) / 100
  return gather * cultivate
}

/**
 * 灵根亲和：
 * - 同属（含风≈木、冰≈水、雷≈火）：看对应根骨；多灵根时任一主系同属即算同属
 * - 与最高主灵根相克：大幅降低
 * - 其他异属（含相生）：小幅降低
 * - 无属性：不乘灵根项
 */
export function calcElementAffinity(
  roots: RootBone[] | undefined,
  targetRoot: RootName | null
): Pick<PracticeSpeedBreakdown, 'root' | 'rootName' | 'rootValue' | 'primaryRoot' | 'relation'> {
  const primaries = roots?.length ? pickPrimaryRoots(roots) : []
  const primaryRoot = primaries[0]?.name || (roots?.length ? pickPrimaryRoot(roots).name : null)
  if (!targetRoot) {
    return {
      root: 1,
      rootName: null,
      rootValue: 0,
      primaryRoot,
      relation: 'none'
    }
  }

  const rootValue = getRootValue(roots, targetRoot)

  for (const item of primaries) {
    if (getElementRelation(item.name, targetRoot) === 'match') {
      return {
        root: rootSpeedMult(rootValue),
        rootName: targetRoot,
        rootValue,
        primaryRoot,
        relation: 'match'
      }
    }
  }

  const relation = getElementRelation(primaryRoot, targetRoot)
  if (relation === 'restrain') {
    return {
      root: ELEMENT_RESTRAIN_MULT,
      rootName: targetRoot,
      rootValue,
      primaryRoot,
      relation
    }
  }
  return {
    root: ELEMENT_OTHER_MULT,
    rootName: targetRoot,
    rootValue,
    primaryRoot,
    relation: relation === 'match' ? 'other' : relation
  }
}

/** 功法修炼：悟性 × 灵根亲和 × 洞府 */
export function calcTechniquePracticeSpeed(input: PracticeSpeedInput): PracticeSpeedBreakdown {
  const comprehension = comprehensionSpeedMult(input.comprehension)
  const rootName = resolveTechniqueRootAttr(input.techniqueType || '', input.techniqueSchool)
  const affinity = calcElementAffinity(input.roots, rootName)
  const cave = caveSpeedMult(input.cultivateBonus, input.gatherSpeed)
  const total = comprehension * affinity.root * cave
  return { total, comprehension, cave, ...affinity }
}

/** 法术演练：悟性 × 灵根亲和 × 洞府（与功法同一套五行规则） */
export function calcSpellPracticeSpeed(input: PracticeSpeedInput): PracticeSpeedBreakdown {
  const comprehension = comprehensionSpeedMult(input.comprehension)
  const rootName = resolveSpellRootAttr(input.spellAttr || '')
  const affinity = calcElementAffinity(input.roots, rootName)
  const cave = caveSpeedMult(input.cultivateBonus, input.gatherSpeed)
  const total = comprehension * affinity.root * cave
  return { total, comprehension, cave, ...affinity }
}
