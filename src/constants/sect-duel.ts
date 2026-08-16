import type { MemberGroup } from './member-catalog'
import { MEMBER_GROUP_ORDER } from './member-catalog'
import { HERB_MATERIALS } from './herb-catalog'
import { ORE_MATERIALS } from './ore-catalog'
import { PILL_SHOP_CATALOG, type CatalogPill } from './pill-catalog'
import { FORGE_SHOP_CATALOG, type CatalogTreasure } from './treasure-catalog'
import { parseRealmLabel, REALM_MAJORS, type RealmMajor } from './realm'
import { getRealmMajorIndex } from './treasure'

/** 死斗胜利后从对方身上夺走的资源摘要 */
export interface DeathDuelLoot {
  stones: number
  herbs: Array<{ name: string; count: number }>
  ores: Array<{ name: string; count: number }>
  pills: Array<{ name: string; count: number }>
  treasures: CatalogTreasure[]
}

/** 思过崖处罚时长（现实毫秒）——按对方职位由低到高加重（2 分钟～1 小时） */
export const CLIFF_SENTENCE_MS: Record<MemberGroup, number> = {
  杂役弟子: 2 * 60 * 1000,
  外门弟子: 5 * 60 * 1000,
  内门弟子: 10 * 60 * 1000,
  亲传弟子: 20 * 60 * 1000,
  执事: 30 * 60 * 1000,
  长老: 45 * 60 * 1000,
  宗主: 60 * 60 * 1000
}

/** 思过崖奇遇：每隔此时长判定一次 */
export const CLIFF_ENCOUNTER_INTERVAL_MS = 10_000
/** 每次判定触发奇遇的概率（极低） */
export const CLIFF_ENCOUNTER_CHANCE = 0.01

export type CliffEncounterKind = 'material' | 'technique' | 'spell'

export interface CliffEncounterResult {
  kind: CliffEncounterKind
  message: string
  /** 材料名（仅 material） */
  materialName?: string
  materialCategory?: '药材' | '矿石' | '材料'
  materialCount?: number
  /** 功法 / 法术名 */
  skillName?: string
  proficiencyGain?: number
}

export function cliffSentenceMs(group: MemberGroup | string) {
  if (group in CLIFF_SENTENCE_MS) return CLIFF_SENTENCE_MS[group as MemberGroup]
  return CLIFF_SENTENCE_MS.外门弟子
}

export function formatDurationMs(ms: number) {
  const totalSec = Math.max(0, Math.ceil(ms / 1000))
  const h = Math.floor(totalSec / 3600)
  const m = Math.floor((totalSec % 3600) / 60)
  const s = totalSec % 60
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${pad(h)}:${pad(m)}:${pad(s)}`
}

export function formatCliffSentenceLabel(group: MemberGroup | string) {
  const ms = cliffSentenceMs(group)
  if (ms < 60 * 60 * 1000) return `${Math.round(ms / 60000)} 分钟`
  const hours = ms / (60 * 60 * 1000)
  return Number.isInteger(hours) ? `${hours} 小时` : `${hours.toFixed(1)} 小时`
}

function randInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

function randPick<T>(list: T[]): T | null {
  if (!list.length) return null
  return list[Math.floor(Math.random() * list.length)]
}

function groupRank(group: MemberGroup) {
  const i = MEMBER_GROUP_ORDER.indexOf(group)
  return i < 0 ? MEMBER_GROUP_ORDER.indexOf('外门弟子') : i
}

function resolveMajor(realmLabel: string): RealmMajor {
  const parsed = parseRealmLabel(realmLabel)
  if (parsed) return parsed.major === '无修为' ? '炼气' : parsed.major
  for (const major of REALM_MAJORS) {
    if (major !== '无修为' && realmLabel.includes(major)) return major
  }
  return '炼气'
}

function poolByRealmOrBelow<T extends { realm: RealmMajor }>(catalog: T[], realm: RealmMajor): T[] {
  let idx = getRealmMajorIndex(realm === '无修为' ? '炼气' : realm)
  for (let i = Math.max(0, idx); i >= 0; i -= 1) {
    const major = REALM_MAJORS[i]
    if (major === '无修为') continue
    const pool = catalog.filter((item) => item.realm === major)
    if (pool.length) return pool
  }
  return catalog.slice()
}

/**
 * 死斗胜利：夺对方全部随身资源（按职位与境界生成一份完整辎重）。
 */
export function rollDeathDuelLoot(input: {
  group: MemberGroup
  realm: string
}): DeathDuelLoot {
  const rank = groupRank(input.group)
  const major = resolveMajor(input.realm)
  const realmIdx = Math.max(0, getRealmMajorIndex(major))
  const wealth = 1 + (MEMBER_GROUP_ORDER.length - 1 - rank)

  const stones = Math.round((80 + realmIdx * 40) * wealth * (0.85 + Math.random() * 0.35))

  const herbCount = Math.min(6, 1 + Math.floor(wealth / 2) + randInt(0, 1))
  const herbs: DeathDuelLoot['herbs'] = []
  for (let i = 0; i < herbCount; i += 1) {
    const herb = randPick(HERB_MATERIALS)
    if (!herb) break
    herbs.push({ name: herb.name, count: randInt(1, 1 + Math.floor(wealth / 2)) })
  }

  const oreCount = Math.min(5, 1 + Math.floor(wealth / 2))
  const ores: DeathDuelLoot['ores'] = []
  for (let i = 0; i < oreCount; i += 1) {
    const ore = randPick(ORE_MATERIALS)
    if (!ore) break
    ores.push({ name: ore.name, count: randInt(1, 1 + Math.floor(wealth / 3)) })
  }

  const pillPool = poolByRealmOrBelow(PILL_SHOP_CATALOG, major)
  const pillCount = Math.min(4, Math.max(1, Math.floor(wealth / 2)))
  const pills: DeathDuelLoot['pills'] = []
  const usedPill = new Set<string>()
  for (let i = 0; i < pillCount; i += 1) {
    const pill = randPick(pillPool.filter((p) => !usedPill.has(p.name))) as CatalogPill | null
    if (!pill) break
    usedPill.add(pill.name)
    pills.push({ name: pill.name, count: randInt(1, 2) })
  }

  const treasurePool = poolByRealmOrBelow(FORGE_SHOP_CATALOG, major)
  const treasureCount = Math.min(3, Math.max(1, Math.floor((wealth + 1) / 2)))
  const treasures: CatalogTreasure[] = []
  const usedTreasure = new Set<string>()
  for (let i = 0; i < treasureCount; i += 1) {
    const t = randPick(treasurePool.filter((item) => !usedTreasure.has(item.id)))
    if (!t) break
    usedTreasure.add(t.id)
    treasures.push(t)
  }

  return { stones, herbs, ores, pills, treasures }
}

export function summarizeDeathDuelLoot(loot: DeathDuelLoot) {
  const parts = [`灵石 ×${loot.stones}`]
  const bagBits = [
    ...loot.herbs.map((h) => `${h.name}×${h.count}`),
    ...loot.ores.map((o) => `${o.name}×${o.count}`),
    ...loot.pills.map((p) => `${p.name}×${p.count}`),
    ...loot.treasures.map((t) => t.name)
  ]
  if (bagBits.length) parts.push(bagBits.slice(0, 6).join('、') + (bagBits.length > 6 ? '…' : ''))
  return parts.join(' · ')
}

const HIGH_HERB_LEVEL = /神|仙|道/
const HIGH_ORE_LEVEL = /神矿|仙矿|道矿|镇界/

function pickHighTierHerb() {
  const pool = HERB_MATERIALS.filter((h) => HIGH_HERB_LEVEL.test(h.level))
  return randPick(pool.length ? pool : HERB_MATERIALS)
}

function pickHighTierOre() {
  const pool = ORE_MATERIALS.filter((o) => HIGH_ORE_LEVEL.test(o.level))
  return randPick(pool.length ? pool : ORE_MATERIALS)
}

/**
 * 思过崖奇遇掷骰：未触发返回 null。
 * 触发后在「高阶材料 / 功法熟练度 / 法术熟练度」中择一（无对应技能则回落到材料）。
 */
export function rollCliffEncounter(input: {
  techniqueName?: string | null
  spellNames?: string[]
}): CliffEncounterResult | null {
  if (Math.random() >= CLIFF_ENCOUNTER_CHANCE) return null

  const options: CliffEncounterKind[] = ['material']
  if (input.techniqueName) options.push('technique')
  if (input.spellNames && input.spellNames.length) options.push('spell')
  const kind = randPick(options) || 'material'

  if (kind === 'technique' && input.techniqueName) {
    const gain = Math.round((0.8 + Math.random() * 2.2) * 10) / 10
    return {
      kind: 'technique',
      skillName: input.techniqueName,
      proficiencyGain: gain,
      message: `面壁顿悟：功法「${input.techniqueName}」熟练度 +${gain}`
    }
  }

  if (kind === 'spell' && input.spellNames?.length) {
    const spellName = randPick(input.spellNames)
    if (spellName) {
      const gain = Math.round((0.8 + Math.random() * 2.2) * 10) / 10
      return {
        kind: 'spell',
        skillName: spellName,
        proficiencyGain: gain,
        message: `崖风入窍：法术「${spellName}」熟练度 +${gain}`
      }
    }
  }

  // 高阶材料：药材 / 矿石 各半
  if (Math.random() < 0.5) {
    const herb = pickHighTierHerb()
    if (herb) {
      const count = randInt(1, 2)
      return {
        kind: 'material',
        materialName: herb.name,
        materialCategory: '药材',
        materialCount: count,
        message: `崖缝异宝：获得高阶药材「${herb.name}」×${count}`
      }
    }
  }
  const ore = pickHighTierOre()
  if (ore) {
    const count = randInt(1, 2)
    return {
      kind: 'material',
      materialName: ore.name,
      materialCategory: '矿石',
      materialCount: count,
      message: `石壁藏珍：获得高阶矿石「${ore.name}」×${count}`
    }
  }
  return null
}
