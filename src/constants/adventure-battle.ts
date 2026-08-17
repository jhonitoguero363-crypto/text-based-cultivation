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

/** 探索时强制交手概率（妖兽 / 敌对势力） */
export const FORCED_BATTLE_CHANCE = 0.28
/** 叛出后加入敌对派系宗门：势均力敌强制交手必触发 */
export const FORCED_BATTLE_CHANCE_HOSTILE_BETRAYAL = 1
/** 强制交手敌方战力相对我方下限（势均力敌） */
export const FORCED_BATTLE_POWER_MIN_RATIO = 0.88
/** 强制交手敌方战力相对我方上限 */
export const FORCED_BATTLE_POWER_MAX_RATIO = 1.12
/** 强制交手为妖兽的概率（其余为敌对势力修士） */
export const FORCED_BATTLE_BEAST_CHANCE = 0.5

/** 历练同行战力相对名录的折算 */
export const COMPANION_POWER_MULT = 0.3
/** 属性克制对胜率修正（正为克制，负为被克） */
export const ELEMENT_WIN_CHANCE_DELTA = 0.1
/** 胜率钳制 */
export const BATTLE_WIN_CHANCE_MIN = 0.08
export const BATTLE_WIN_CHANCE_MAX = 0.95

export type ForcedBattleSide = 'beast' | 'hostile'
export type ElementAdvantage = 'advantage' | 'disadvantage' | 'neutral'

/** 属性相克：键克数组内元素（对外只读） */
export const ELEMENT_BEATS: Record<string, string[]> = {
  金: ['木', '风'],
  木: ['土'],
  土: ['水'],
  水: ['火'],
  火: ['金', '冰'],
  风: ['木', '土'],
  冰: ['火', '风'],
  雷: ['金', '水']
}

const COMBAT_ELEMENT_CHARS = Object.keys(ELEMENT_BEATS)

/** 按我方战力掷出势均力敌的敌方战力 */
export function rollMatchedBattlePower(myPower: number) {
  const mine = Math.max(100, Math.round(myPower))
  const lo = mine * FORCED_BATTLE_POWER_MIN_RATIO
  const hi = mine * FORCED_BATTLE_POWER_MAX_RATIO
  return Math.max(100, Math.round(lo + Math.random() * (hi - lo)))
}

/** 掷是否强制交手，以及敌方类型 */
export function rollForcedBattleTrigger(chance = FORCED_BATTLE_CHANCE): ForcedBattleSide | null {
  if (Math.random() >= chance) return null
  return Math.random() < FORCED_BATTLE_BEAST_CHANCE ? 'beast' : 'hostile'
}

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
  return []
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
  const idx = getRealmMajorIndex(realm === '无修为' ? '炼气' : realm)
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

/** 拆出可参与克制的单字属性（金木水火土风冰雷） */
export function normalizeCombatElements(raw: string | null | undefined): string[] {
  const text = (raw || '').trim()
  if (!text || text === '无属性') return []
  const found: string[] = []
  for (const el of COMBAT_ELEMENT_CHARS) {
    if (text.includes(el) && !found.includes(el)) found.push(el)
  }
  return found
}

function elementBeats(attacker: string, defender: string) {
  return (ELEMENT_BEATS[attacker] || []).includes(defender)
}

/** 克制简表文案（文档 / UI） */
export function listElementBeatLines() {
  return COMBAT_ELEMENT_CHARS.map((el) => `${el} 克 ${(ELEMENT_BEATS[el] || []).join('、')}`)
}

/**
 * 目录旧战斗句（伤害%/冷却等）展示用：保留原文并标明为风味。
 * 机械效果以战力与克制为准。
 */
export function alignCombatLoreText(text: string | null | undefined) {
  const raw = String(text || '').trim()
  if (!raw) return ''
  if (/设定风味|战力与克制|出战贡献|出战战力/.test(raw)) return raw
  if (/伤害|冷却|灵力|生命|防御\s*\+|闪避|复活|护盾|法伤|神魂伤害/.test(raw)) {
    return `${raw}（设定风味；战斗以战力与克制结算）`
  }
  return raw
}

/** 被何系所克（用于妖兽展示） */
export function elementsThatBeat(targetAttr: string | null | undefined) {
  const theirs = normalizeCombatElements(targetAttr)
  if (!theirs.length) return [] as string[]
  const beaters: string[] = []
  for (const atk of COMBAT_ELEMENT_CHARS) {
    if (theirs.some((t) => elementBeats(atk, t)) && !beaters.includes(atk)) beaters.push(atk)
  }
  return beaters
}

/**
 * 我方若干属性 vs 敌方属性：任一克制敌方 → advantage；
 * 否则敌方克制我方全部已参战属性 → disadvantage；其余 neutral。
 */
export function resolveElementAdvantage(
  myAttrs: string[],
  enemyAttr: string | null | undefined
): ElementAdvantage {
  const mine = myAttrs.flatMap((a) => normalizeCombatElements(a))
  const theirs = normalizeCombatElements(enemyAttr)
  if (!mine.length || !theirs.length) return 'neutral'

  let iBeat = false
  let theyBeatAll = mine.length > 0
  for (const m of mine) {
    let beatenByEnemy = false
    for (const t of theirs) {
      if (elementBeats(m, t)) iBeat = true
      if (elementBeats(t, m)) beatenByEnemy = true
    }
    if (!beatenByEnemy) theyBeatAll = false
  }
  if (iBeat) return 'advantage'
  if (theyBeatAll) return 'disadvantage'
  return 'neutral'
}

export function elementAdvantageDelta(adv: ElementAdvantage) {
  if (adv === 'advantage') return ELEMENT_WIN_CHANCE_DELTA
  if (adv === 'disadvantage') return -ELEMENT_WIN_CHANCE_DELTA
  return 0
}

export function elementAdvantageLabel(adv: ElementAdvantage) {
  if (adv === 'advantage') return '属性克制'
  if (adv === 'disadvantage') return '属性被克'
  return '属性无关'
}

/** 历练人物类型 → 默认对抗属性（无明确灵根时） */
export function enemyAttrFromNpcKind(kind: string | null | undefined) {
  if (kind === '妖族') return '木'
  if (kind === '魔修' || kind === '魔道' || kind === '魔门') return '火'
  if (kind === '正道') return '金'
  return '无属性'
}

/** 妖兽属性是否与法术属性相关（无属性不参与契合） */
export function spellMatchesBeastElement(spellAttr: string, beastElement: string) {
  const attr = (spellAttr || '').trim()
  const el = (beastElement || '').trim()
  if (!attr || attr === '无属性' || !el) return false
  if (el.includes(attr) || attr.includes(el)) return true
  for (const ch of attr) {
    if (ch.length && el.includes(ch)) return true
  }
  return false
}

/**
 * 选取战斗中施展的法术：优先属性克制，其次属性契合，再次任意战斗法术。
 */
export function pickBattleSpell(
  owned: BattleSpellCandidate[],
  beastElement: string
): BattleSpellCandidate | null {
  if (!owned.length) return null
  const combat = owned.filter((item) => !LIFE_SPELLS.has(item.name))
  const pool = combat.length ? combat : owned
  const adv = pool.filter(
    (item) => resolveElementAdvantage([item.attr], beastElement) === 'advantage'
  )
  if (adv.length) return randPick(adv)
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

export function clampBattleWinChance(chance: number) {
  return (
    Math.round(
      Math.min(BATTLE_WIN_CHANCE_MAX, Math.max(BATTLE_WIN_CHANCE_MIN, chance)) * 1000
    ) / 1000
  )
}

export function rollBattleOutcome(
  myPower: number,
  enemyPower: number,
  opts?: { elementMod?: number }
) {
  const base = battleWinChanceByPowerGap(myPower, enemyPower)
  const winChance = clampBattleWinChance(base + (opts?.elementMod || 0))
  return {
    baseChance: base,
    winChance,
    won: Math.random() < winChance
  }
}

export interface BattlePreview {
  myPower: number
  enemyPower: number
  baseChance: number
  elementMod: number
  winChance: number
  advantage: ElementAdvantage
  elementLabel: string
  enemyAttrLabel: string
  deathChance: number
  injuryChance: number
  /** 弹窗正文 */
  content: string
}

export type BattleFlavorScene = 'adventure' | 'duel' | 'demon' | 'spar'
export type PlayerBattleFate = 'death' | 'injury' | 'escape'

/**
 * 胜负短句（绑定真实法术 / 克制 / 命运）。
 */
export function formatBattleFlavor(input: {
  won: boolean
  enemyName: string
  scene?: BattleFlavorScene
  castSpell?: string | null
  elementLabel?: string
  fate?: PlayerBattleFate | null
  winChance?: number
}) {
  const scene = input.scene || 'adventure'
  const foe = input.enemyName || '对手'
  const el = input.elementLabel || ''
  const spell = (input.castSpell || '').trim()
  const pct =
    typeof input.winChance === 'number' ? `（本场胜率约 ${Math.round(input.winChance * 100)}%）` : ''

  if (input.won) {
    if (scene === 'spar') {
      return spell
        ? `点到为止，你以《${spell}》压过${foe}一筹${el ? `·${el}` : ''}`
        : `与${foe}切磋小胜${el ? `，${el}` : ''}`
    }
    if (scene === 'demon') {
      return spell
        ? `魔影溃散，你催动《${spell}》斩杀之${el ? `（${el}）` : ''}`
        : `魔影溃散，杀伐得手${el ? `（${el}）` : ''}`
    }
    if (scene === 'duel') {
      return spell
        ? `生死一线，你祭出《${spell}》击溃${foe}${el ? `·${el}` : ''}`
        : `你力压${foe}，死斗获胜${el ? `·${el}` : ''}`
    }
    return spell
      ? `你施展《${spell}》克敌，${foe}不支败退${el ? `（${el}）` : ''}`
      : `你与${foe}交手得胜${el ? `（${el}）` : ''}`
  }

  // 落败
  if (scene === 'spar') {
    return `与${foe}切磋落于下风${pct}${el ? `·${el}` : ''}，点到为止未伤和气`
  }
  if (input.fate === 'death') {
    return `不敌${foe}${pct}，法力告竭，身死道消…`
  }
  if (input.fate === 'injury') {
    return `不敌${foe}${pct}，勉强脱身却已身受重创`
  }
  if (input.fate === 'escape') {
    return `不敌${foe}${pct}，狼狈脱身，侥幸未成大伤`
  }
  if (scene === 'demon') {
    return `魔影反噬，杀伐落败${pct}${el ? `·${el}` : ''}`
  }
  return `与${foe}交手不敌${pct}${el ? `·${el}` : ''}`
}

/** 交手前预览：双方战力、胜率、克制；可选战败风险与保命提示 */
export function buildBattlePreview(input: {
  myPower: number
  enemyPower: number
  enemyName: string
  myAttrs?: string[]
  enemyAttr?: string | null
  titleHint?: string
  /** 显示战败阵亡/受伤约估（秘境/死斗） */
  showRisk?: boolean
  /** 如「持有保命丹：涅槃丹」或「未持保命丹」 */
  lifesaveLine?: string | null
}): BattlePreview {
  const advantage = resolveElementAdvantage(input.myAttrs || [], input.enemyAttr || '')
  const elementMod = elementAdvantageDelta(advantage)
  const baseChance = battleWinChanceByPowerGap(input.myPower, input.enemyPower)
  const winChance = clampBattleWinChance(baseChance + elementMod)
  const elementLabel = elementAdvantageLabel(advantage)
  const enemyEls = normalizeCombatElements(input.enemyAttr)
  const enemyAttrLabel = enemyEls.length
    ? enemyEls.join('')
    : (input.enemyAttr || '').trim() === '无属性' || !input.enemyAttr
      ? '无'
      : String(input.enemyAttr).trim()
  const deathChance = playerDeathChanceOnFail(input.myPower, input.enemyPower)
  const injuryChance = playerInjuryChanceOnFail(input.myPower, input.enemyPower)

  const hint = input.titleHint ? `${input.titleHint}\n` : ''
  const modText = elementMod
    ? ` ${elementMod > 0 ? '+' : ''}${Math.round(elementMod * 100)}%`
    : ''
  const lines = [
    `${hint}我方战力 ${Math.round(input.myPower).toLocaleString()} · 敌方「${input.enemyName}」 ${Math.round(input.enemyPower).toLocaleString()}`,
    `敌方属性 ${enemyAttrLabel} · 预估胜率 ${Math.round(winChance * 100)}%（${elementLabel}${modText}）`
  ]
  if (input.showRisk) {
    lines.push(
      `战败约 ${Math.round(deathChance * 100)}% 阵亡 / ${Math.round(injuryChance * 100)}% 受伤（其余脱身）`
    )
  }
  if (input.lifesaveLine) {
    lines.push(input.lifesaveLine)
  }
  return {
    myPower: input.myPower,
    enemyPower: input.enemyPower,
    baseChance,
    elementMod,
    winChance,
    advantage,
    elementLabel,
    enemyAttrLabel,
    deathChance,
    injuryChance,
    content: lines.join('\n')
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
