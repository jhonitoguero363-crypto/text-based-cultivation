import { BEAST_CATALOG } from './beast-catalog'
import { HERB_MATERIALS } from './herb-catalog'
import { ADVENTURE_ENCOUNTER_CATALOG, parseEncounterDrops } from './mission-catalog'
import { ORE_MATERIALS } from './ore-catalog'
import type { RealmMajor } from './realm'

export type LootMaterialOrigin = '妖兽' | '奇遇' | '兼有'

export interface LootMaterial {
  id: string
  name: string
  /** 妖兽 / 奇遇 / 兼有 */
  origin: LootMaterialOrigin
  /** 来源妖兽或奇遇名称 */
  sources: string[]
  /** 相关境界（妖兽境界；奇遇暂空） */
  realms: RealmMajor[]
  detail: string
}

const oreNames = new Set(ORE_MATERIALS.map((item) => item.name))
const herbNames = new Set(HERB_MATERIALS.map((item) => item.name))

export function isOreName(name: string) {
  return oreNames.has(name)
}

export function isHerbName(name: string) {
  return herbNames.has(name)
}

/** 是否属于历练专属「材料」（非矿石、非药材） */
export function isLootMaterialName(name: string) {
  return !isOreName(name) && !isHerbName(name)
}

/**
 * 将材料名归入背包分类：
 * 已知矿石 → 矿石；已知药材 → 药材；其余历练掉落 → 材料
 */
export function resolveMaterialBagCategory(name: string): '矿石' | '药材' | '材料' {
  if (isOreName(name)) return '矿石'
  if (isHerbName(name)) return '药材'
  return '材料'
}

interface Acc {
  sources: Set<string>
  realms: Set<RealmMajor>
  fromBeast: boolean
  fromEncounter: boolean
}

function buildLootCatalog(): LootMaterial[] {
  const map = new Map<string, Acc>()

  const ensure = (name: string) => {
    let acc = map.get(name)
    if (!acc) {
      acc = {
        sources: new Set(),
        realms: new Set(),
        fromBeast: false,
        fromEncounter: false
      }
      map.set(name, acc)
    }
    return acc
  }

  for (const beast of BEAST_CATALOG) {
    const parts = beast.drops
      .split(/[、,，]/)
      .map((part) => part.trim())
      .filter(Boolean)
    for (const name of parts) {
      if (!isLootMaterialName(name)) continue
      const acc = ensure(name)
      acc.fromBeast = true
      acc.sources.add(beast.name)
      acc.realms.add(beast.realm)
    }
  }

  for (const enc of ADVENTURE_ENCOUNTER_CATALOG) {
    for (const name of parseEncounterDrops(enc.drops)) {
      if (!isLootMaterialName(name)) continue
      const acc = ensure(name)
      acc.fromEncounter = true
      acc.sources.add(enc.name)
    }
  }

  const list = [...map.entries()]
    .map(([name, acc], index) => {
      const origin: LootMaterialOrigin =
        acc.fromBeast && acc.fromEncounter ? '兼有' : acc.fromEncounter ? '奇遇' : '妖兽'
      const realms = [...acc.realms]
      const sources = [...acc.sources]
      const realmText = realms.length ? realms.join('/') : '—'
      return {
        id: `loot-${index + 1}`,
        name,
        origin,
        sources,
        realms,
        detail: `${origin} · ${realmText} · 来源 ${sources.join('、')}`
      } satisfies LootMaterial
    })
    .sort((a, b) => a.name.localeCompare(b.name, 'zh-CN'))

  return list.map((item, index) => ({ ...item, id: `loot-${index + 1}` }))
}

/** 历练妖兽 / 奇遇掉落的专属材料（已排除矿石、药材名） */
export const LOOT_MATERIALS: LootMaterial[] = buildLootCatalog()

export function getLootMaterial(name: string) {
  return LOOT_MATERIALS.find((item) => item.name === name) || null
}
