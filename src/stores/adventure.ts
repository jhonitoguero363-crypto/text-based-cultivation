import Taro from '@tarojs/taro'
import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import {
  estimateExploreReward,
  getLocationById,
  type AdventureLocation
} from '../constants/adventure-locations'
import {
  rollEncounterNpcs,
  type AdventureNpc
} from '../constants/adventure-npc-catalog'
import {
  captureChanceOf,
  estimateBeastLevel,
  rollEncounterBeasts,
  type CatalogBeast
} from '../constants/beast-catalog'
import { formatTianyuanCalendar, getGameDayKey } from '../constants/game-time'
import {
  rollDailyMarket,
  type MarketCategory,
  type MarketOffer
} from '../constants/market-shop'
import {
  rollAdventureEncounter,
  rollEncounterResolveReward,
  type AdventureEncounter
} from '../constants/mission-catalog'
import type { RealmMajor } from '../constants/realm'
import { getRealmMajorIndex } from '../constants/treasure'

const MARKET_STORAGE_KEY = 'cultivation_market_shop'

export type AdventureTab = '坊市历练' | '秘境历练'
export type ShopCategory = MarketCategory

export interface EncounterBeast extends CatalogBeast {
  level: number
  defeated: boolean
  captured: boolean
  encounterId: string
}

export interface EncounterNpc extends AdventureNpc {
  interacted: boolean
  encounterId: string
}

function nowTime() {
  const d = new Date()
  const h = `${d.getHours()}`.padStart(2, '0')
  const m = `${d.getMinutes()}`.padStart(2, '0')
  return `${h}:${m}`
}

function randInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

export const useAdventureStore = defineStore('adventure', () => {
  const tab = ref<AdventureTab>('秘境历练')
  const selectedLocationId = ref<string | null>(null)
  const exploreToday = ref(0)
  const remainTimes = ref(8)

  /** 当前探索遭遇的妖兽（每次探索刷新） */
  const encounters = ref<EncounterBeast[]>([])
  /** 当前探索偶遇的人物（每次探索刷新） */
  const npcEncounters = ref<EncounterNpc[]>([])
  /** 当前探索触发的奇遇（每次探索有概率刷新） */
  const encounterEvent = ref<AdventureEncounter | null>(null)

  const selectedLocation = computed(() => getLocationById(selectedLocationId.value))

  const logs = ref<Array<{ time: string; text: string; tone: string }>>([])

  const shopCategory = ref<ShopCategory>('丹药')
  /** 坊市货架（按游戏日刷新：现实 6 小时 = 1 日） */
  const marketOffers = ref<MarketOffer[]>([])
  const marketDate = ref('')
  const marketRealm = ref<RealmMajor | ''>('')

  const marketList = computed(() =>
    marketOffers.value.filter((item) => item.category === shopCategory.value)
  )

  const marketDayLabel = computed(() => formatTianyuanCalendar(undefined, 'short'))

  function persistMarket() {
    Taro.setStorageSync(MARKET_STORAGE_KEY, {
      date: marketDate.value,
      realm: marketRealm.value,
      offers: marketOffers.value
    })
  }

  function hydrateMarket() {
    try {
      const data = Taro.getStorageSync(MARKET_STORAGE_KEY)
      if (!data?.date || !Array.isArray(data.offers)) return false
      marketDate.value = data.date
      marketRealm.value = data.realm || ''
      marketOffers.value = data.offers
      return true
    } catch {
      return false
    }
  }

  /** 确保当前游戏日货架；仅换游戏日时重抽，不可手动刷新 */
  function ensureDailyMarket(playerMajor: RealmMajor) {
    const day = getGameDayKey()
    if (!marketOffers.value.length) hydrateMarket()
    const needRoll = marketDate.value !== day || !marketOffers.value.length
    if (!needRoll) {
      // 同日仅记录当前境界（不影响已上架货物）
      if (marketRealm.value !== playerMajor) {
        marketRealm.value = playerMajor
        persistMarket()
      }
      return false
    }
    marketDate.value = day
    marketRealm.value = playerMajor
    marketOffers.value = rollDailyMarket(playerMajor)
    persistMarket()
    return true
  }

  function getOffer(id: string) {
    return marketOffers.value.find((item) => item.id === id) || null
  }

  /** 扣减库存；售罄后仍保留条目以便展示「已售罄」 */
  function consumeOfferStock(id: string, count = 1) {
    const item = getOffer(id)
    if (!item || item.stock < count) return null
    item.stock -= count
    persistMarket()
    return item
  }

  function setTab(next: AdventureTab) {
    tab.value = next
  }

  function setShopCategory(next: ShopCategory) {
    shopCategory.value = next
  }

  function selectLocation(location: AdventureLocation) {
    selectedLocationId.value = location.id
    encounters.value = []
    npcEncounters.value = []
    encounterEvent.value = null
    logs.value = [
      {
        time: nowTime(),
        text: `已抵达${location.name}，危险 ${location.danger}，可开始探索`,
        tone: 'jade'
      }
    ]
  }

  function clearLocation() {
    selectedLocationId.value = null
    encounters.value = []
    npcEncounters.value = []
    encounterEvent.value = null
  }

  function pushLog(text: string, tone = 'secondary') {
    logs.value = [{ time: nowTime(), text, tone }, ...logs.value].slice(0, 24)
  }

  /** 探索一次：刷新妖兽与人物，并返回地点基础收益 */
  function exploreOnce() {
    const location = selectedLocation.value
    if (!location) return null
    if (remainTimes.value <= 0) return null

    remainTimes.value -= 1
    exploreToday.value += 1

    const stamp = Date.now()
    const beastCount = randInt(1, 3)
    const rolledBeasts = rollEncounterBeasts(location.realm, beastCount)
    encounters.value = rolledBeasts.map((beast, index) => ({
      ...beast,
      level: estimateBeastLevel(beast),
      defeated: false,
      captured: false,
      encounterId: `${beast.id}-${stamp}-${index}`
    }))

    // 约 70% 会偶遇人物；数量 1（偶发 2）
    const meetNpc = Math.random() < 0.7
    const npcCount = meetNpc ? (Math.random() < 0.25 ? 2 : 1) : 0
    const rolledNpcs = npcCount
      ? rollEncounterNpcs(location.name, location.realm, npcCount)
      : []
    npcEncounters.value = rolledNpcs.map((npc, index) => ({
      ...npc,
      interacted: false,
      encounterId: `${npc.id}-${stamp}-n${index}`
    }))

    encounterEvent.value = rollAdventureEncounter()

    const reward = estimateExploreReward(location)
    const beastNames = encounters.value.map((item) => item.name).join('、')
    const npcNames = npcEncounters.value.map((item) => item.name).join('、')
    const peopleText = npcNames ? `；偶遇 ${npcNames}` : ''
    const encounterText = encounterEvent.value ? `；触发奇遇「${encounterEvent.value.name}」` : ''
    pushLog(
      `在${location.name}探索，遭遇 ${beastNames || '空无一人'}${peopleText}${encounterText}；修为 +${reward.exp}，灵石 ×${reward.stones}`,
      encounterEvent.value ? 'gold' : 'jade'
    )

    return {
      ...reward,
      beasts: encounters.value,
      npcs: npcEncounters.value,
      encounter: encounterEvent.value
    }
  }

  /** 探查/了结当前奇遇 */
  function resolveEncounter() {
    const target = encounterEvent.value
    if (!target || target.resolved) return null
    target.resolved = true
    const reward = rollEncounterResolveReward()
    const place = selectedLocation.value?.name || '秘境'
    pushLog(
      `于${place}了结奇遇「${target.name}」：${target.desc}；修为 +${reward.exp}，灵石 ×${reward.stones}`,
      'gold'
    )
    return {
      encounter: target,
      ...reward
    }
  }

  /** 挑战妖兽；成功返回掉落文案，失败返回 null */
  function challengeMonster(encounterId: string) {
    const location = selectedLocation.value
    const target = encounters.value.find((item) => item.encounterId === encounterId)
    if (!target || target.defeated || target.captured) return null

    target.defeated = true
    const place = location ? location.name : '秘境'
    const dropParts = target.drops.split('、').map((part) => part.trim()).filter(Boolean)
    const got = dropParts[Math.floor(Math.random() * dropParts.length)] || target.drops
    const bonusExp = 12 + target.level
    const bonusStones = 8 + Math.floor(target.level / 2)

    pushLog(
      `于${place}击败${target.name}（${target.rarity}），获得 ${got}×1，修为 +${bonusExp}，灵石 ×${bonusStones}`,
      'hp'
    )

    return {
      beast: target,
      drop: got,
      exp: bonusExp,
      stones: bonusStones
    }
  }

  /**
   * 抓捕妖兽化为灵宠。
   * 需先击败；成功则 captured=true，失败仍可再试（已击败状态保留）。
   */
  function captureMonster(encounterId: string, alreadyOwned: boolean) {
    const location = selectedLocation.value
    const target = encounters.value.find((item) => item.encounterId === encounterId)
    if (!target || target.captured) return null
    if (!target.defeated) {
      return { ok: false as const, reason: 'need_defeat' as const, beast: target }
    }
    if (alreadyOwned) {
      return { ok: false as const, reason: 'owned' as const, beast: target }
    }

    const chance = captureChanceOf(target)
    const success = Math.random() < chance
    const place = location ? location.name : '秘境'

    if (!success) {
      pushLog(`于${place}抓捕${target.name}失败（成功率约 ${Math.round(chance * 100)}%）`, 'hp')
      return { ok: false as const, reason: 'failed' as const, beast: target, chance }
    }

    target.captured = true
    pushLog(`于${place}成功抓捕${target.name}，收为灵宠`, 'jade')
    return { ok: true as const, beast: target, chance }
  }

  /** 与偶遇人物互动 */
  function interactNpc(encounterId: string) {
    const location = selectedLocation.value
    const target = npcEncounters.value.find((item) => item.encounterId === encounterId)
    if (!target || target.interacted) return null

    target.interacted = true
    const place = location ? location.name : '秘境'
    const bonusExp = 20 + Math.max(0, getRealmMajorIndex(target.realm)) * 15
    const bonusStones = 15 + Math.max(0, getRealmMajorIndex(target.realm)) * 10

    pushLog(
      `于${place}与${target.name}互动：${target.event}；修为 +${bonusExp}，灵石 ×${bonusStones}`,
      'mp'
    )

    return {
      npc: target,
      exp: bonusExp,
      stones: bonusStones
    }
  }

  return {
    tab,
    selectedLocationId,
    selectedLocation,
    exploreToday,
    remainTimes,
    encounters,
    npcEncounters,
    encounterEvent,
    logs,
    shopCategory,
    marketOffers,
    marketDate,
    marketDayLabel,
    marketList,
    ensureDailyMarket,
    getOffer,
    consumeOfferStock,
    setTab,
    setShopCategory,
    selectLocation,
    clearLocation,
    exploreOnce,
    challengeMonster,
    captureMonster,
    interactNpc,
    resolveEncounter
  }
})
