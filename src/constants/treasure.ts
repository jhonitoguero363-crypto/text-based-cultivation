import { REALM_MAJORS, type RealmMajor, type RealmState } from './realm'

/** 法宝类别 */
export const TREASURE_CATEGORIES = ['攻击类', '防御类', '辅助类', '特殊类'] as const
export type TreasureCategory = (typeof TREASURE_CATEGORIES)[number]

export type TreasureSlot = '攻击位' | '防御位' | '辅助位' | '特殊位'

export const TREASURE_SLOTS: TreasureSlot[] = ['攻击位', '防御位', '辅助位', '特殊位']

export const TREASURE_CATEGORY_TO_SLOT: Record<TreasureCategory, TreasureSlot> = {
  攻击类: '攻击位',
  防御类: '防御位',
  辅助类: '辅助位',
  特殊类: '特殊位'
}

export const TREASURE_SLOT_TO_CATEGORY: Record<TreasureSlot, TreasureCategory> = {
  攻击位: '攻击类',
  防御位: '防御类',
  辅助位: '辅助类',
  特殊位: '特殊类'
}

/** 由类别解析装备位；兼容旧数据中的「型」后缀 */
export function getTreasureSlot(type: string): TreasureSlot {
  const normalized = type.replace(/型$/, '类')
  if (normalized === '攻击类') return '攻击位'
  if (normalized === '防御类') return '防御位'
  if (normalized === '辅助类') return '辅助位'
  if (normalized === '特殊类') return '特殊位'
  return '特殊位'
}

export function isTreasureCategory(type: string): type is TreasureCategory {
  return (TREASURE_CATEGORIES as readonly string[]).includes(type)
}

/** 法宝品阶 */
export const TREASURE_GRADES = [
  '法器',
  '灵器',
  '仙器',
  '道器',
  '镇界神器',
  '先天至宝'
] as const

export type TreasureGrade = (typeof TREASURE_GRADES)[number]

export interface TreasureGradeDef {
  grade: TreasureGrade
  /** 对应境界范围文案 */
  realmRange: string
  /** 可用的大境界 */
  majors: RealmMajor[]
  /** 特点 */
  trait: string
  tone: 'muted' | 'jade' | 'mp' | 'gold' | 'hp'
}

export const TREASURE_GRADE_DEFS: TreasureGradeDef[] = [
  {
    grade: '法器',
    realmRange: '炼气～筑基',
    majors: ['炼气', '筑基'],
    trait: '基础属性、简单技能',
    tone: 'muted'
  },
  {
    grade: '灵器',
    realmRange: '金丹～元婴',
    majors: ['金丹', '元婴'],
    trait: '属性强化、特殊技能',
    tone: 'jade'
  },
  {
    grade: '仙器',
    realmRange: '化神～炼虚',
    majors: ['化神', '炼虚'],
    trait: '空间、时间、灵魂等高级能力',
    tone: 'mp'
  },
  {
    grade: '道器',
    realmRange: '合体～渡劫',
    majors: ['合体', '渡劫'],
    trait: '开始影响规则、领域和因果',
    tone: 'gold'
  },
  {
    grade: '镇界神器',
    realmRange: '大乘',
    majors: ['大乘'],
    trait: '影响世界、宗门、轮回',
    tone: 'hp'
  },
  {
    grade: '先天至宝',
    realmRange: '飞升',
    majors: ['飞升'],
    trait: '创造规则、世界和大道',
    tone: 'gold'
  }
]

export function getTreasureGradeDef(grade: TreasureGrade | string) {
  return TREASURE_GRADE_DEFS.find((item) => item.grade === grade) || null
}

export function getRealmMajorIndex(major: RealmMajor) {
  return REALM_MAJORS.indexOf(major)
}

/** 当前境界最高可驾驭/打造的法宝品阶 */
export function getMaxTreasureGrade(realm: RealmState): TreasureGrade {
  const major = realm.major
  for (let i = TREASURE_GRADE_DEFS.length - 1; i >= 0; i -= 1) {
    const def = TREASURE_GRADE_DEFS[i]
    if (def.majors.includes(major)) return def.grade
  }
  // 境界若落在区间之间：取不超过当前境界的最高品阶
  const idx = getRealmMajorIndex(major)
  for (let i = TREASURE_GRADE_DEFS.length - 1; i >= 0; i -= 1) {
    const def = TREASURE_GRADE_DEFS[i]
    const minIdx = Math.min(...def.majors.map(getRealmMajorIndex))
    if (minIdx <= idx) return def.grade
  }
  return '法器'
}

/** 境界是否达到驾驭该品阶的最低要求 */
export function canWieldTreasureGrade(realm: RealmState, grade: TreasureGrade | string) {
  const def = getTreasureGradeDef(grade)
  if (!def) return false
  const need = Math.min(...def.majors.map(getRealmMajorIndex))
  return getRealmMajorIndex(realm.major) >= need
}

/** 当前可打造的品阶列表（不超过境界上限） */
export function getForgeableGrades(realm: RealmState): TreasureGradeDef[] {
  const max = getMaxTreasureGrade(realm)
  const maxIndex = TREASURE_GRADES.indexOf(max)
  return TREASURE_GRADE_DEFS.filter((item) => TREASURE_GRADES.indexOf(item.grade) <= maxIndex)
}
