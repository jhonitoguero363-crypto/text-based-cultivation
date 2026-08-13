import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { ADVENTURE_NPC_CATALOG } from '../constants/adventure-npc-catalog'
import { BEAST_CATALOG } from '../constants/beast-catalog'
import { HERB_MATERIALS } from '../constants/herb-catalog'
import { SECT_MEMBER_CATALOG } from '../constants/member-catalog'
import { ORE_MATERIALS } from '../constants/ore-catalog'
import { PET_SHOP_CATALOG } from '../constants/pet-catalog'
import { PILL_SHOP_CATALOG } from '../constants/pill-catalog'
import { FORGE_SHOP_CATALOG } from '../constants/treasure-catalog'
import { usePlayerStore } from './player'
import { useTreasureStore } from './treasure'

export type CodexTab = '灵兽' | '法宝' | '丹药' | '药材' | '矿石' | '人物'

export interface CodexEntry {
  id: string
  name: string
  detail: string
  unlocked: boolean
  /** 灵兽图鉴图标：兽阁灵宠 / 野妖 */
  icon?: 'pet' | 'beast'
  /** 灵兽来源 */
  origin?: '灵宠' | '妖兽' | '兼有'
}

export const CODEX_TABS: CodexTab[] = ['灵兽', '法宝', '丹药', '药材', '矿石', '人物']

function materialOwned(name: string) {
  const player = usePlayerStore()
  return player.getBagCount(name, '材料') > 0
}

export const useCodexStore = defineStore('codex', () => {
  const tab = ref<CodexTab>('灵兽')

  /**
   * 灵兽图鉴 = 兽阁灵宠 ∪ 秘境妖兽（按名去重）
   * 收录：拥有灵宠，或击败/抓捕后见过
   */
  const spiritBeasts = computed<CodexEntry[]>(() => {
    const player = usePlayerStore()
    const map = new Map<string, CodexEntry>()

    for (const item of PET_SHOP_CATALOG) {
      map.set(item.name, {
        id: item.id,
        name: item.name,
        detail: `灵宠 · ${item.realm} · ${item.rarity} · ${item.race} · ${item.role} · ${item.ability}`,
        unlocked: player.hasSeenSpiritBeast(item.name),
        icon: 'pet',
        origin: '灵宠'
      })
    }

    for (const item of BEAST_CATALOG) {
      const existing = map.get(item.name)
      if (existing) {
        existing.origin = '兼有'
        existing.detail = `${existing.detail} ｜ 妖兽形态 · ${item.element} · ${item.ability}`
        existing.unlocked = existing.unlocked || player.hasSeenSpiritBeast(item.name)
        continue
      }
      map.set(item.name, {
        id: item.id,
        name: item.name,
        detail: `妖兽 · ${item.realm} · ${item.rarity} · ${item.race} · ${item.element} · ${item.ability}`,
        unlocked: player.hasSeenSpiritBeast(item.name),
        icon: 'beast',
        origin: '妖兽'
      })
    }

    return [...map.values()]
  })

  const treasures = computed<CodexEntry[]>(() => {
    const treasure = useTreasureStore()
    const owned = new Set(treasure.list.map((item) => item.name))
    return FORGE_SHOP_CATALOG.map((item) => ({
      id: item.id,
      name: item.name,
      detail: `${item.gradeLabel} · ${item.realm} · ${item.type} · ${item.effect}`,
      unlocked: owned.has(item.name)
    }))
  })

  const pills = computed<CodexEntry[]>(() => {
    const player = usePlayerStore()
    const owned = new Set(
      player.bag.filter((item) => item.category === '丹药').map((item) => item.name)
    )
    return PILL_SHOP_CATALOG.map((item) => ({
      id: item.id,
      name: item.name,
      detail: `${item.grade} · ${item.realm} · ${item.type} · ${item.effect}`,
      unlocked: owned.has(item.name)
    }))
  })

  const herbs = computed<CodexEntry[]>(() =>
    HERB_MATERIALS.map((item) => ({
      id: item.id,
      name: item.name,
      detail: `${item.level} · ${item.attr} · ${item.origin} · 可炼 ${item.pills.join('、')}`,
      unlocked: materialOwned(item.name)
    }))
  )

  const ores = computed<CodexEntry[]>(() =>
    ORE_MATERIALS.map((item) => ({
      id: item.id,
      name: item.name,
      detail: `${item.level} · ${item.attr} · ${item.origin} · 可炼 ${item.treasures.join('、')}`,
      unlocked: materialOwned(item.name)
    }))
  )

  const people = computed<CodexEntry[]>(() => {
    const map = new Map<string, CodexEntry>()

    for (const item of SECT_MEMBER_CATALOG) {
      map.set(item.name, {
        id: item.id,
        name: item.name,
        detail: `宗门 · ${item.title} · ${item.realm} · ${item.specialty}`,
        unlocked: true
      })
    }

    for (const item of ADVENTURE_NPC_CATALOG) {
      if (map.has(item.name)) continue
      map.set(item.name, {
        id: item.id,
        name: item.name,
        detail: `${item.kind} · ${item.title} · ${item.realm} · ${item.event}`,
        unlocked: true
      })
    }

    return [...map.values()]
  })

  const currentList = computed(() => {
    switch (tab.value) {
      case '法宝':
        return treasures.value
      case '丹药':
        return pills.value
      case '药材':
        return herbs.value
      case '矿石':
        return ores.value
      case '人物':
        return people.value
      default:
        return spiritBeasts.value
    }
  })

  const progressText = computed(() => {
    const list = currentList.value
    const unlocked = list.filter((item) => item.unlocked).length
    return `已收录 ${unlocked} / ${list.length}`
  })

  function setTab(next: CodexTab) {
    tab.value = next
  }

  return {
    tab,
    spiritBeasts,
    treasures,
    pills,
    herbs,
    ores,
    people,
    currentList,
    progressText,
    setTab
  }
})
