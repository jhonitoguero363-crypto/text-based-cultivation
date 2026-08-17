import type { RealmMajor, RealmState } from './realm'
import { getStagesForMajor, REALM_MAJORS } from './realm'
import type { RootName } from './roots'
import { getPetByName } from './pet-catalog'
import { getBeastByName } from './beast-catalog'
import { SPELL_FORGE_CRAFT_NAME, SPELL_PILL_CRAFT_NAME } from './spell-catalog'
import { getSpellProficiencyInfo } from './spell-proficiency'
import type { SectFaction } from './sects'
import { getTechniqueByName } from './technique-catalog'
import {
  getTreasureGradeDef,
  type TreasureGrade
} from './treasure'

/**
 * 同境界战力档位（由高到低）：
 * 剑修 > 异灵根修士 > 妖族势力 > 魔门势力 > 其余正道修士
 */
export type CombatPowerArchetype =
  | 'sword'
  | 'rare_root'
  | 'yaozu'
  | 'demon'
  | 'righteous'

export const COMBAT_POWER_ARCHETYPE_ORDER: CombatPowerArchetype[] = [
  'sword',
  'rare_root',
  'yaozu',
  'demon',
  'righteous'
]

export const COMBAT_POWER_ARCHETYPE_LABEL: Record<CombatPowerArchetype, string> = {
  sword: '剑修',
  rare_root: '异灵根修士',
  yaozu: '妖族势力',
  demon: '魔门势力',
  righteous: '正道修士'
}

/** 相对同境「正道修士」中位的战力倍率 */
export const COMBAT_POWER_ARCHETYPE_MULT: Record<CombatPowerArchetype, number> = {
  sword: 1.28,
  rare_root: 1.18,
  yaozu: 1.1,
  demon: 1.05,
  righteous: 1
}

/** 异灵根：风 / 冰 / 雷 */
export const RARE_ROOT_NAMES: RootName[] = ['风', '冰', '雷']

/** 存档战力公式版本：低于此值则按境界重锚本体 */
export const COMBAT_POWER_REVISION = 2

/**
 * 各大境界战力跨度（含同境各档与阶段浮动）。
 * mid：该境「正道修士」中位参考；min～max 为全境合理上下限（低端偏正道前期，高端偏剑修大圆满）。
 */
export const REALM_COMBAT_POWER_RANGE: Record<
  RealmMajor,
  { min: number; mid: number; max: number }
> = {
  无修为: { min: 1, mid: 20, max: 80 },
  炼气: { min: 3200, mid: 5500, max: 9000 },
  筑基: { min: 16000, mid: 28000, max: 45000 },
  金丹: { min: 42000, mid: 70000, max: 110000 },
  元婴: { min: 85000, mid: 125000, max: 190000 },
  化神: { min: 170000, mid: 240000, max: 350000 },
  炼虚: { min: 280000, mid: 380000, max: 520000 },
  合体: { min: 420000, mid: 560000, max: 750000 },
  大乘: { min: 600000, mid: 780000, max: 1050000 },
  渡劫: { min: 850000, mid: 1100000, max: 1450000 },
  飞升: { min: 1200000, mid: 1600000, max: 2200000 }
}

/** 出战法术对战力倍率的权重（按熟练 powerBonus 从高到低取前 3） */
export const SPELL_COMBAT_BONUS_WEIGHTS = [0.45, 0.3, 0.15] as const
/** 法术战力倍率上限 */
export const SPELL_COMBAT_BONUS_CAP = 0.45
/** 同时出战法术上限 */
export const BATTLE_SPELL_SLOT_MAX = 3

function seedHash(seed: string) {
  let hash = 0
  for (let i = 0; i < seed.length; i += 1) {
    hash = (hash * 31 + seed.charCodeAt(i)) % 997
  }
  return hash
}

export function isRareRootName(name: string | null | undefined) {
  return RARE_ROOT_NAMES.includes(name as RootName)
}

/**
 * 功法属性是否与异灵根同属（属性字段为九种之一：金木水火土风冰雷无属性）。
 * 风 / 冰 / 雷 直接对齐；兼容旧文案（身法/空间→风，雷系→雷）。
 */
export function techniqueMatchesRareRoot(root: RootName, techniqueAttr: string) {
  const attr = (techniqueAttr || '').trim()
  if (!attr || attr === '无属性') return false
  if (root === '风') return attr === '风' || /风|身法|空间/.test(attr)
  if (root === '冰') return attr === '冰' || /冰/.test(attr)
  if (root === '雷') return attr === '雷' || /雷/.test(attr)
  return false
}

/** 是否剑修道途（功法门派 / 属性含剑） */
export function isSwordTechnique(schoolOrAttr: string) {
  const text = (schoolOrAttr || '').trim()
  return /剑/.test(text)
}

export function getRealmCombatPowerRange(major: RealmMajor) {
  return REALM_COMBAT_POWER_RANGE[major] || REALM_COMBAT_POWER_RANGE['炼气']
}

/** 同境阶段进度 0～1（一层/前期=0，九层/大圆满=1） */
export function realmStageProgress(realm: RealmState) {
  const stages = getStagesForMajor(realm.major)
  if (stages.length <= 1) return 0
  const idx = Math.max(0, stages.indexOf(realm.stage as never))
  return idx / (stages.length - 1)
}

/**
 * 玩家本体战力锚点：大境界 min～mid 按阶段插值。
 * （档位倍率、功法/法术熟练、法宝、灵宠另计）
 */
export function bodyCombatPowerForRealm(realm: RealmState) {
  const range = getRealmCombatPowerRange(realm.major)
  const t = realmStageProgress(realm)
  return Math.max(1, Math.round(range.min + (range.mid - range.min) * t))
}

/**
 * 解析玩家同境档位：剑修 > 异灵根（主灵根集合含风/冰/雷且同属功法）> 宗门派系 > 正道。
 */
export function resolvePlayerCombatArchetype(input: {
  faction?: SectFaction | string | null
  primaryRoot?: RootName | string | null
  /** 多灵根时传入全部主系；优先于 primaryRoot */
  primaryRoots?: Array<RootName | string | null | undefined>
  techniqueName?: string | null
  techniqueSchool?: string | null
  techniqueAttr?: string | null
}): CombatPowerArchetype {
  const tech =
    input.techniqueName && !input.techniqueSchool
      ? getTechniqueByName(input.techniqueName)
      : null
  const school = (input.techniqueSchool || tech?.school || '').trim()
  const attr = (input.techniqueAttr || tech?.attr || '').trim()
  if (school === '剑修' || isSwordTechnique(school) || isSwordTechnique(attr)) {
    return 'sword'
  }
  const rootList = (
    input.primaryRoots?.length
      ? input.primaryRoots
      : input.primaryRoot
        ? [input.primaryRoot]
        : []
  ).filter(Boolean) as RootName[]
  for (const root of rootList) {
    if (isRareRootName(root) && techniqueMatchesRareRoot(root, attr)) {
      return 'rare_root'
    }
  }
  if (input.faction === '妖族') return 'yaozu'
  if (input.faction === '魔门') return 'demon'
  return 'righteous'
}

/** 战斗向法术名（排除炼丹 / 炼器） */
export function isCombatSpellName(name: string) {
  const text = (name || '').trim()
  if (!text) return false
  return text !== SPELL_PILL_CRAFT_NAME && text !== SPELL_FORGE_CRAFT_NAME
}

/**
 * 已习战斗法术 → 战力倍率加成（取熟练 powerBonus 最高的 3 门加权）。
 */
export function calcSpellCombatPowerBonus(
  ownedSpellNames: string[],
  proficiency: Record<string, number> | null | undefined
) {
  const map = proficiency || {}
  const bonuses = ownedSpellNames
    .filter(isCombatSpellName)
    .map((name) => getSpellProficiencyInfo(map[name] || 0).powerBonus)
    .filter((n) => n > 0)
    .sort((a, b) => b - a)
    .slice(0, SPELL_COMBAT_BONUS_WEIGHTS.length)

  let sum = 0
  bonuses.forEach((bonus, i) => {
    sum += bonus * SPELL_COMBAT_BONUS_WEIGHTS[i]
  })
  return Math.min(SPELL_COMBAT_BONUS_CAP, Math.round(sum * 1000) / 1000)
}

export interface PetCombatInput {
  name: string
  grade?: string
  type?: string
  realm?: string
}

function petStars(pet: PetCombatInput) {
  const shop = getPetByName(pet.name)
  if (shop) return Math.max(1, shop.stars)
  const stars = (pet.grade || '').match(/★/g)
  if (stars?.length) return Math.min(6, stars.length)
  if (/传说|神话|至高/.test(pet.grade || '')) return 5
  if (/史诗|稀有/.test(pet.grade || '')) return 3
  return 2
}

function petRealmMajor(pet: PetCombatInput): RealmMajor {
  if (pet.realm && REALM_MAJORS.includes(pet.realm as RealmMajor)) {
    return pet.realm as RealmMajor
  }
  const shop = getPetByName(pet.name)
  if (shop) return shop.realm
  const beast = getBeastByName(pet.name)
  if (beast) return beast.realm
  for (const major of REALM_MAJORS) {
    if (major !== '无修为' && (pet.grade || '').includes(major)) return major
  }
  return '炼气'
}

/** 出战灵兽扁平战力加成（约同境 mid 的 3%～9%，随星级） */
export function estimateActivePetCombatBonus(pet: PetCombatInput | null | undefined) {
  if (!pet?.name) return 0
  const stars = petStars(pet)
  const mid = getRealmCombatPowerRange(petRealmMajor(pet)).mid
  const mult = 0.05 * (0.6 + stars * 0.18)
  return Math.max(1, Math.round(mid * mult))
}

/** 品阶默认战力占比（相对所属境界 mid） */
const TREASURE_GRADE_POWER_RATE: Record<TreasureGrade, number> = {
  法器: 0.04,
  灵器: 0.05,
  仙器: 0.055,
  道器: 0.06,
  镇界神器: 0.07,
  先天至宝: 0.08
}

/**
 * 法宝战力加成：按品阶 × 驾驭境界 mid。
 * 未指定境界时取该品阶可用大境界的第一档。
 */
export function estimateTreasurePowerBonus(
  grade: TreasureGrade | string,
  realm?: RealmMajor | null
) {
  const def = getTreasureGradeDef(grade)
  const g = (def?.grade || '法器') as TreasureGrade
  const major =
    realm && REALM_MAJORS.includes(realm)
      ? realm
      : def?.majors?.[0] || ('炼气' as RealmMajor)
  const mid = getRealmCombatPowerRange(major).mid
  const rate = TREASURE_GRADE_POWER_RATE[g] ?? 0.04
  return Math.max(10, Math.round(mid * rate))
}

/**
 * 估算人物战力：境界中位 × 档位倍率，再按 seed 在同境档内小幅浮动（约 ±8%）。
 */
export function estimateCombatPowerByArchetype(
  major: RealmMajor,
  archetype: CombatPowerArchetype = 'righteous',
  seed = ''
) {
  const range = getRealmCombatPowerRange(major)
  const mult = COMBAT_POWER_ARCHETYPE_MULT[archetype] || 1
  const base = range.mid * mult
  const wobble = 0.92 + (seedHash(seed) % 161) / 1000
  const value = Math.round(base * wobble)
  return Math.max(range.min, Math.min(range.max, value))
}

/** 兼容旧调用：无档位信息时按正道中位浮动 */
export function estimateCombatPowerForRealm(major: RealmMajor, seed = '') {
  return estimateCombatPowerByArchetype(major, 'righteous', seed)
}

/** 文档 / 调试：各大境界与各档中位一览 */
export function listRealmCombatPowerBands() {
  return REALM_MAJORS.map((major) => {
    const range = REALM_COMBAT_POWER_RANGE[major]
    const bands = COMBAT_POWER_ARCHETYPE_ORDER.map((archetype) => ({
      archetype,
      label: COMBAT_POWER_ARCHETYPE_LABEL[archetype],
      mid: Math.round(range.mid * COMBAT_POWER_ARCHETYPE_MULT[archetype])
    }))
    return { major, ...range, bands }
  })
}
