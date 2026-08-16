import { HERB_MATERIALS, type HerbMaterial } from './herb-catalog'
import { getOresByLevel, ORE_MATERIALS, type OreMaterial } from './ore-catalog'
import { PILL_SHOP_CATALOG, type CatalogPill } from './pill-catalog'
import type { RealmMajor } from './realm'
import { REALM_MAJORS } from './realm'
import { SPELL_FORGE_CRAFT_NAME, SPELL_PILL_CRAFT_NAME } from './spell-catalog'
import { FORGE_SHOP_CATALOG, type CatalogTreasure } from './treasure-catalog'
import { getRealmMajorIndex } from './treasure'

export interface BattleSpellCandidate {
  name: string
  attr: string
}

/** 击败人物：小概率掉法宝 */
export const NPC_TREASURE_DROP_CHANCE = 0.12
/** 击败人物：极小概率掉丹药 */
export const NPC_PILL_DROP_CHANCE = 0.03
/** 探索：极小概率掉药材 */
export const EXPLORE_HERB_DROP_CHANCE = 0.04
/** 探索：极小概率掉矿石 */
export const EXPLORE_ORE_DROP_CHANCE = 0.04

export interface NpcDefeatLoot {
  treasure: CatalogTreasure | null
  pill: CatalogPill | null
}

export interface ExploreMaterialLoot {
  herb: HerbMaterial | null
  ore: OreMaterial | null
}

const ORE_TIERS = ['灵矿', '高阶灵矿', '神矿', '仙矿', '道矿', '镇界神材'] as const

/** 药材品阶随地点境界放宽 */
function herbLevelsForRealm(realmIndex: number): string[] {
  if (realmIndex <= 0) return ['灵草', '灵药', '灵果', '灵液']
  if (realmIndex <= 2) return ['灵草', '灵药', '灵果', '灵液', '灵藤', '灵木']
  if (realmIndex <= 5) {
    return ['灵草', '灵药', '灵果', '灵液', '灵藤', '灵木', '仙草', '仙花', '仙果', '仙藤', '仙材', '仙芝']
  }
  return [] // 空 = 不限
}

const LIFE_SPELLS = new Set([SPELL_PILL_CRAFT_NAME, SPELL_FORGE_CRAFT_NAME])

function randPick<T>(list: T[]): T | null {
  if (!list.length) return null
  return list[Math.floor(Math.random() * list.length)]
}

/** 取对应境界货池；若无则向下兼容最近有货的境界 */
function poolByRealmOrBelow<T extends { realm: RealmMajor }>(
  catalog: T[],
  realm: RealmMajor
): T[] {
  let idx = getRealmMajorIndex(realm === '无修为' ? '炼气' : realm)
  for (let i = Math.max(0, idx); i >= 0; i -= 1) {
    const major = REALM_MAJORS[i]
    if (major === '无修为') continue
    const pool = catalog.filter((item) => item.realm === major)
    if (pool.length) return pool
  }
  return catalog.slice()
}

/** 战斗微量修为：0.1～0.5，可乘同行倍率后封顶 1.0 */
export function rollBattleExpGain(companionMult = 1) {
  const base = 0.1 + Math.random() * 0.4
  const scaled = Math.min(1, base * Math.max(1, companionMult))
  return Math.round(scaled * 10) / 10
}

/** 战斗法术熟练度：0.1～0.5 */
export function rollBattleSpellProfGain(companionMult = 1) {
  const base = 0.1 + Math.random() * 0.4
  const scaled = Math.min(0.5, base * Math.max(1, 1 + (companionMult - 1) * 0.5))
  return Math.round(scaled * 10) / 10
}

/** 击败人物灵石：随境界提升，可乘同行倍率 */
export function rollNpcStoneGain(realmIndex: number, companionMult = 1) {
  const base = 15 + Math.max(0, realmIndex) * 10
  return Math.max(1, Math.round(base * Math.max(1, companionMult)))
}

/**
 * 击败人物额外掉落：
 * - 小概率对应境界法宝
 * - 极小概率对应境界丹药
 */
export function rollNpcDefeatLoot(realm: RealmMajor): NpcDefeatLoot {
  let treasure: CatalogTreasure | null = null
  let pill: CatalogPill | null = null

  if (Math.random() < NPC_TREASURE_DROP_CHANCE) {
    treasure = randPick(poolByRealmOrBelow(FORGE_SHOP_CATALOG, realm))
  }
  if (Math.random() < NPC_PILL_DROP_CHANCE) {
    pill = randPick(poolByRealmOrBelow(PILL_SHOP_CATALOG, realm))
  }

  return { treasure, pill }
}

function pickHerbForRealm(realm: RealmMajor): HerbMaterial | null {
  const idx = getRealmMajorIndex(realm)
  const levels = herbLevelsForRealm(idx)
  const pool = levels.length
    ? HERB_MATERIALS.filter((item) => levels.includes(item.level))
    : HERB_MATERIALS
  return randPick(pool.length ? pool : HERB_MATERIALS)
}

function pickOreForRealm(realm: RealmMajor): OreMaterial | null {
  const idx = getRealmMajorIndex(realm)
  const maxTier = Math.min(ORE_TIERS.length - 1, Math.floor(idx / 2) + 1)
  const tier = ORE_TIERS[Math.floor(Math.random() * (maxTier + 1))]
  let pool = getOresByLevel(tier)
  if (!pool.length) {
    for (let i = ORE_TIERS.indexOf(tier); i >= 0; i -= 1) {
      pool = getOresByLevel(ORE_TIERS[i])
      if (pool.length) break
    }
  }
  return randPick(pool.length ? pool : ORE_MATERIALS)
}

/**
 * 探索额外掉落：极小概率药材 / 矿石（各自独立判定，品阶随地点境界）
 */
export function rollExploreMaterialLoot(realm: RealmMajor): ExploreMaterialLoot {
  return {
    herb: Math.random() < EXPLORE_HERB_DROP_CHANCE ? pickHerbForRealm(realm) : null,
    ore: Math.random() < EXPLORE_ORE_DROP_CHANCE ? pickOreForRealm(realm) : null
  }
}

/** 妖兽属性是否与法术属性相关 */
export function spellMatchesBeastElement(spellAttr: string, beastElement: string) {
  const attr = (spellAttr || '').trim()
  const el = (beastElement || '').trim()
  if (!attr || !el) return false
  if (el.includes(attr) || attr.includes(el)) return true
  // 复合属性如「金火」拆字匹配单字法术属性
  for (const ch of attr) {
    if (ch.length && el.includes(ch)) return true
  }
  return false
}

/**
 * 选取战斗中施展的法术：优先属性契合的战斗法术，其次任意战斗法术，再次生活法术。
 */
export function pickBattleSpell(
  owned: BattleSpellCandidate[],
  beastElement: string
): BattleSpellCandidate | null {
  if (!owned.length) return null
  const combat = owned.filter((item) => !LIFE_SPELLS.has(item.name))
  const pool = combat.length ? combat : owned
  const matched = pool.filter((item) => spellMatchesBeastElement(item.attr, beastElement))
  return randPick(matched.length ? matched : pool)
}

/**
 * 出战灵兽阵亡概率：按敌我战力比判定。
 * ratio = 敌战力 / 我方战力（含同行）；越悬殊越危险，约 2%～42%。
 */
export function petFallChanceByPowerGap(myPower: number, enemyPower: number) {
  const mine = Math.max(1, myPower)
  const enemy = Math.max(0, enemyPower)
  const ratio = enemy / mine
  let chance: number
  if (ratio <= 0.5) chance = 0.02
  else if (ratio <= 1) chance = 0.02 + (ratio - 0.5) * 0.16
  else if (ratio <= 2) chance = 0.1 + (ratio - 1) * 0.24
  else chance = 0.34 + Math.min(0.08, (ratio - 2) * 0.08)
  return Math.round(Math.min(0.42, Math.max(0.02, chance)) * 1000) / 1000
}

/** 掷出战灵兽是否阵亡 */
export function rollPetFallInBattle(myPower: number, enemyPower: number) {
  const chance = petFallChanceByPowerGap(myPower, enemyPower)
  return {
    chance,
    died: Math.random() < chance
  }
}

/**
 * 战斗胜率：按敌我战力比判定。
 * ratio = 敌 / 我；我方越强胜率越高，约 8%～95%。
 */
export function battleWinChanceByPowerGap(myPower: number, enemyPower: number) {
  const mine = Math.max(1, myPower)
  const enemy = Math.max(0, enemyPower)
  const ratio = enemy / mine
  let chance: number
  if (ratio <= 0.4) chance = 0.95
  else if (ratio <= 0.7) chance = 0.88
  else if (ratio <= 1) chance = 0.72
  else if (ratio <= 1.3) chance = 0.52
  else if (ratio <= 1.6) chance = 0.36
  else if (ratio <= 2) chance = 0.24
  else if (ratio <= 2.5) chance = 0.15
  else chance = 0.08
  return Math.round(chance * 1000) / 1000
}

export function rollBattleOutcome(myPower: number, enemyPower: number) {
  const winChance = battleWinChanceByPowerGap(myPower, enemyPower)
  return {
    winChance,
    won: Math.random() < winChance
  }
}

/**
 * 战败后角色阵亡概率（敌我战力差）。
 * 约 6%～50%。
 */
export function playerDeathChanceOnFail(myPower: number, enemyPower: number) {
  const mine = Math.max(1, myPower)
  const enemy = Math.max(0, enemyPower)
  const ratio = enemy / mine
  let chance: number
  if (ratio <= 0.8) chance = 0.06
  else if (ratio <= 1.2) chance = 0.12
  else if (ratio <= 1.6) chance = 0.22
  else if (ratio <= 2.2) chance = 0.34
  else chance = 0.5
  return Math.round(chance * 1000) / 1000
}

/**
 * 战败且未阵亡时，受伤概率。
 * 约 40%～85%。
 */
export function playerInjuryChanceOnFail(myPower: number, enemyPower: number) {
  const mine = Math.max(1, myPower)
  const enemy = Math.max(0, enemyPower)
  const ratio = enemy / mine
  let chance: number
  if (ratio <= 0.8) chance = 0.4
  else if (ratio <= 1.2) chance = 0.55
  else if (ratio <= 1.6) chance = 0.68
  else if (ratio <= 2.2) chance = 0.78
  else chance = 0.85
  return Math.round(chance * 1000) / 1000
}

export type PlayerBattleFate = 'death' | 'injury' | 'escape'

/** 战败后掷角色命运：阵亡 / 受伤 / 幸免 */
export function rollPlayerBattleFate(myPower: number, enemyPower: number): {
  fate: PlayerBattleFate
  deathChance: number
  injuryChance: number
} {
  const deathChance = playerDeathChanceOnFail(myPower, enemyPower)
  const injuryChance = playerInjuryChanceOnFail(myPower, enemyPower)
  if (Math.random() < deathChance) {
    return { fate: 'death', deathChance, injuryChance }
  }
  if (Math.random() < injuryChance) {
    return { fate: 'injury', deathChance, injuryChance }
  }
  return { fate: 'escape', deathChance, injuryChance }
}
