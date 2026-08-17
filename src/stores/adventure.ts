import Taro from '@tarojs/taro'
import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import {
  estimateExploreReward,
  getLocationById,
  type AdventureLocation
} from '../constants/adventure-locations'
import {
  captureChanceOf,
  estimateBeastLevel,
  pickMatchedPowerBeast,
  rollEncounterBeasts,
  type CatalogBeast
} from '../constants/beast-catalog'
import {
  ADVENTURE_NPC_CATALOG,
  normalizeAdventureNpc,
  pickHostileEncounterNpc,
  rollEncounterNpcs,
  rollMarketNpcs,
  type AdventureNpc
} from '../constants/adventure-npc-catalog'
import {
  COMPANION_POWER_MULT,
  FORCED_BATTLE_CHANCE,
  FORCED_BATTLE_CHANCE_HOSTILE_BETRAYAL,
  rollBattleExpGain,
  rollExploreMaterialLoot,
  rollForcedBattleTrigger,
  rollMatchedBattlePower,
  rollNpcStoneGain,
  type ExploreMaterialLoot,
  type ForcedBattleSide
} from '../constants/adventure-battle'
import { formatTianyuanCalendar, getGameDayKey } from '../constants/game-time'
import {
  hasSplitMaterialShelves,
  normalizeMarketOffers,
  rollDailyMarket,
  rollMerchantOffers,
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
import { usePlayerStore } from './player'
import { useSectStore } from './sect'

const MARKET_STORAGE_KEY = 'cultivation_market_shop'
const COMPANION_STORAGE_KEY = 'cultivation_adventure_companions'

/** 秘境同行最多人数（不含玩家） */
export const ADVENTURE_COMPANION_MAX = 3

export type AdventureTab = '坊市历练' | '秘境历练'
export type ShopCategory = MarketCategory

export interface EncounterBeast extends CatalogBeast {
  level: number
  /** 已击败（战斗胜利，待选择击杀或抓捕） */
  defeated: boolean
  /** 已抓捕为灵宠 */
  captured: boolean
  /** 已击杀（主动击杀，或抓捕失败转击杀） */
  killed: boolean
  encounterId: string
  /** 强制交手：覆盖估算战力（势均力敌） */
  powerOverride?: number
  /** 本次探索强制交手目标 */
  forced?: boolean
}

export interface EncounterNpc extends AdventureNpc {
  interacted: boolean
  encounterId: string
  powerOverride?: number
  forced?: boolean
}

export interface ForcedBattleInfo {
  side: ForcedBattleSide
  encounterId: string
  name: string
  power: number
}

/** 历练同行人员（宗门人物） */
export interface AdventureCompanion {
  id: string
  name: string
  title: string
  realm: string
  power: number
  avatar: string
  group: string
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
  const tab = ref<AdventureTab>('坊市历练')
  const selectedLocationId = ref<string | null>(null)
  const exploreToday = ref(0)
  const remainTimes = ref(8)

  /** 当前探索遭遇的妖兽（每次探索刷新） */
  const encounters = ref<EncounterBeast[]>([])
  /** 当前探索偶遇的人物（每次探索刷新） */
  const npcEncounters = ref<EncounterNpc[]>([])
  /** 当前探索触发的奇遇（每次探索有概率刷新） */
  const encounterEvent = ref<AdventureEncounter | null>(null)

  /** 同行人员（跨地点保留，可持久化） */
  const companions = ref<AdventureCompanion[]>([])

  const selectedLocation = computed(() => getLocationById(selectedLocationId.value))

  const companionCount = computed(() => companions.value.length)
  const companionSlotsLeft = computed(() =>
    Math.max(0, ADVENTURE_COMPANION_MAX - companions.value.length)
  )
  const companionNames = computed(() => companions.value.map((item) => item.name).join('、'))
  /** 同行战力合计（名录 × COMPANION_POWER_MULT；展示=结算） */
  const companionPower = computed(() =>
    Math.round(
      companions.value.reduce((sum, item) => sum + (item.power || 0), 0) * COMPANION_POWER_MULT
    )
  )
  /** 同行对探索/击败收益的倍率加成：每人约 +8%，最多 3 人 */
  const companionRewardMult = computed(() => 1 + companions.value.length * 0.08)

  const logs = ref<Array<{ time: string; text: string; tone: string }>>([])

  function persistCompanions() {
    Taro.setStorageSync(COMPANION_STORAGE_KEY, companions.value)
  }

  function hydrateCompanions() {
    try {
      const data = Taro.getStorageSync(COMPANION_STORAGE_KEY)
      if (!Array.isArray(data)) return
      companions.value = data
        .filter((item) => item && item.id && item.name)
        .slice(0, ADVENTURE_COMPANION_MAX)
        .map((item) => ({
          id: String(item.id),
          name: String(item.name),
          title: String(item.title || ''),
          realm: String(item.realm || ''),
          power: Math.max(0, Math.floor(Number(item.power) || 0)),
          avatar: String(item.avatar || String(item.name).slice(0, 1)),
          group: String(item.group || '')
        }))
    } catch {
      // ignore
    }
  }

  hydrateCompanions()

  function hasCompanion(id: string) {
    return companions.value.some((item) => item.id === id)
  }

  function inviteCompanion(input: AdventureCompanion) {
    if (!input?.id || !input.name) {
      return { ok: false as const, reason: 'invalid' as const }
    }
    if (input.id === 'self') {
      return { ok: false as const, reason: 'self' as const }
    }
    if (hasCompanion(input.id)) {
      return { ok: false as const, reason: 'already' as const }
    }
    if (companions.value.length >= ADVENTURE_COMPANION_MAX) {
      return { ok: false as const, reason: 'full' as const }
    }
    companions.value = [
      ...companions.value,
      {
        id: input.id,
        name: input.name,
        title: input.title || '',
        realm: input.realm || '',
        power: Math.max(0, Math.floor(input.power || 0)),
        avatar: input.avatar || input.name.slice(0, 1),
        group: input.group || ''
      }
    ]
    persistCompanions()
    return { ok: true as const, count: companions.value.length }
  }

  function removeCompanion(id: string) {
    const before = companions.value.length
    companions.value = companions.value.filter((item) => item.id !== id)
    if (companions.value.length !== before) persistCompanions()
    return companions.value.length !== before
  }

  function clearCompanions() {
    companions.value = []
    persistCompanions()
  }

  const shopCategory = ref<ShopCategory>('丹药')
  /** 坊市货架（按游戏日刷新：现实 6 小时 = 1 日） */
  const marketOffers = ref<MarketOffer[]>([])
  const marketDate = ref('')
  const marketRealm = ref<RealmMajor | ''>('')
  /** 坊市当日随机人物（与货架同日刷新） */
  const marketNpcs = ref<AdventureNpc[]>([])
  /** 商人拜访私货：npcId → 当日 3 件高阶货 */
  const merchantShops = ref<Record<string, MarketOffer[]>>({})
  /** 当前拜访的坊市 / 历练人物（非宗门名录） */
  const visitNpc = ref<AdventureNpc | null>(null)

  const marketList = computed(() =>
    marketOffers.value.filter((item) => item.category === shopCategory.value)
  )

  const marketDayLabel = computed(() => formatTianyuanCalendar(undefined, 'short'))

  function persistMarket() {
    Taro.setStorageSync(MARKET_STORAGE_KEY, {
      date: marketDate.value,
      realm: marketRealm.value,
      offers: marketOffers.value,
      npcs: marketNpcs.value,
      merchantShops: merchantShops.value
    })
  }

  function hydrateMarket() {
    try {
      const data = Taro.getStorageSync(MARKET_STORAGE_KEY)
      if (!data?.date || !Array.isArray(data.offers)) return false
      marketDate.value = data.date
      marketRealm.value = data.realm || ''
      marketOffers.value = normalizeMarketOffers(data.offers as MarketOffer[])
      marketNpcs.value = Array.isArray(data.npcs)
        ? (data.npcs as AdventureNpc[]).map(normalizeAdventureNpc)
        : []
      merchantShops.value =
        data.merchantShops && typeof data.merchantShops === 'object'
          ? (data.merchantShops as Record<string, MarketOffer[]>)
          : {}
      return true
    } catch {
      return false
    }
  }

  function syncMerchantShops(playerMajor: RealmMajor) {
    const next: Record<string, MarketOffer[]> = {}
    for (const npc of marketNpcs.value) {
      if (npc.kind !== '商人') continue
      const existing = merchantShops.value[npc.id]
      if (Array.isArray(existing) && existing.length >= 3) {
        next[npc.id] = existing.slice(0, 3)
      } else {
        next[npc.id] = rollMerchantOffers(playerMajor, npc.id)
      }
    }
    merchantShops.value = next
  }

  function rollAllMerchantShops(playerMajor: RealmMajor) {
    const next: Record<string, MarketOffer[]> = {}
    for (const npc of marketNpcs.value) {
      if (npc.kind !== '商人') continue
      next[npc.id] = rollMerchantOffers(playerMajor, npc.id)
    }
    merchantShops.value = next
  }

  /** 确保当前游戏日货架；仅换游戏日时重抽，不可手动刷新 */
  function ensureDailyMarket(playerMajor: RealmMajor) {
    const day = getGameDayKey()
    if (!marketOffers.value.length) hydrateMarket()
    if (marketOffers.value.length) {
      marketOffers.value = normalizeMarketOffers(marketOffers.value)
    }
    const shelvesIncomplete = !hasSplitMaterialShelves(marketOffers.value)
    const needRoll =
      marketDate.value !== day || !marketOffers.value.length || shelvesIncomplete
    if (!needRoll) {
      // 写回拆分后的分类，避免下次仍读到旧「材料」标
      marketNpcs.value = marketNpcs.value.map(normalizeAdventureNpc)
      if (!marketNpcs.value.length) {
        marketNpcs.value = rollMarketNpcs(playerMajor, 3, usePlayerStore().sectId || null)
        rollAllMerchantShops(playerMajor)
      } else {
        syncMerchantShops(playerMajor)
      }
      persistMarket()
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
    marketNpcs.value = rollMarketNpcs(playerMajor, 3, usePlayerStore().sectId || null)
    try {
      const mission = useSectStore().activeMission
      if (mission?.objective?.kind === 'market_talk') {
        const roamers = ADVENTURE_NPC_CATALOG.filter((n) => n.kind === '散修')
        if (roamers.length) {
          const pick = roamers[Math.floor(Math.random() * roamers.length)]
          marketNpcs.value = [pick, ...marketNpcs.value.filter((n) => n.id !== pick.id)].slice(
            0,
            4
          )
        }
      }
    } catch {
      // ignore
    }
    rollAllMerchantShops(playerMajor)
    persistMarket()
    return true
  }

  function getMarketNpc(id: string) {
    return marketNpcs.value.find((item) => item.id === id) || null
  }

  function getMerchantOffers(npcId: string) {
    return merchantShops.value[npcId] || []
  }

  /** 拜访商人时确保当日私货（偶遇商人亦可） */
  function ensureMerchantShop(npcId: string, playerMajor: RealmMajor) {
    const existing = merchantShops.value[npcId]
    if (Array.isArray(existing) && existing.length >= 3) return existing
    const offers = rollMerchantOffers(playerMajor, npcId)
    merchantShops.value = { ...merchantShops.value, [npcId]: offers }
    persistMarket()
    return offers
  }

  function setVisitNpc(npc: AdventureNpc | null) {
    visitNpc.value = npc ? normalizeAdventureNpc(npc) : null
  }

  function getOffer(id: string) {
    return marketOffers.value.find((item) => item.id === id) || null
  }

  /** @deprecated 坊市不再限制库存；保留接口兼容 */
  function consumeOfferStock(id: string, _count = 1) {
    return getOffer(id)
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
      killed: false,
      encounterId: `${beast.id}-${stamp}-${index}`
    }))

    // 约 70% 会偶遇人物；数量 1（偶发 2）
    const meetNpc = Math.random() < 0.7
    let npcCount = meetNpc ? (Math.random() < 0.25 ? 2 : 1) : 0
    const playerSectId = usePlayerStore().sectId || null
    let rolledNpcs = npcCount
      ? rollEncounterNpcs(location.name, location.realm, npcCount, playerSectId)
      : []

    // 任务加成：清剿敌对势力 / 营救弟子
    try {
      const sectStore = useSectStore()
      const mission = sectStore.activeMission
      const kind = mission?.objective?.kind
      if (kind === 'defeat_hostile') {
        const pick = pickHostileEncounterNpc(location.realm, playerSectId)
        if (pick) {
          rolledNpcs = [pick, ...rolledNpcs.filter((n) => n.id !== pick.id)].slice(0, 2)
        }
      }
      if (kind === 'rescue_talk') {
        const sectName = usePlayerStore().sect || '宗门'
        const rescue: AdventureNpc = {
          id: 'npc-rescue-disciple',
          name: '被困弟子',
          title: `${sectName}外门`,
          realm: location.realm,
          personality: '惊恐',
          place: location.name,
          event: '被妖兽围困，急需援手',
          kind: '宗门弟子',
          avatar: '困'
        }
        rolledNpcs = [rescue, ...rolledNpcs].slice(0, 2)
      }
    } catch {
      // ignore
    }

    npcEncounters.value = rolledNpcs.map((npc, index) => ({
      ...npc,
      interacted: false,
      encounterId: `${npc.id}-${stamp}-n${index}`
    }))

    encounterEvent.value = rollAdventureEncounter()

    const playerStore = usePlayerStore()
    playerStore.clearCliffIfExpired()
    let forcedBattle: ForcedBattleInfo | null = null
    const forceChance = playerStore.hasHostileBetrayal()
      ? FORCED_BATTLE_CHANCE_HOSTILE_BETRAYAL
      : FORCED_BATTLE_CHANCE
    const forcedSide =
      playerStore.injured || playerStore.onCliff ? null : rollForcedBattleTrigger(forceChance)
    if (forcedSide) {
      const myPower = Math.max(100, playerStore.combatPower + companionPower.value)
      const matchedPower = rollMatchedBattlePower(myPower)
      if (forcedSide === 'beast') {
        const matched =
          pickMatchedPowerBeast(location.realm, matchedPower) ||
          rollEncounterBeasts(location.realm, 1)[0] ||
          null
        if (matched) {
          const forcedBeast: EncounterBeast = {
            ...matched,
            level: estimateBeastLevel(matched),
            defeated: false,
            captured: false,
            killed: false,
            encounterId: `${matched.id}-${stamp}-forced`,
            powerOverride: matchedPower,
            forced: true
          }
          encounters.value = [
            forcedBeast,
            ...encounters.value.filter((item) => item.id !== matched.id)
          ].slice(0, 3)
          forcedBattle = {
            side: 'beast',
            encounterId: forcedBeast.encounterId,
            name: forcedBeast.name,
            power: matchedPower
          }
        }
      } else {
        const hostile = pickHostileEncounterNpc(location.realm, playerSectId)
        if (hostile) {
          const forcedNpc: EncounterNpc = {
            ...hostile,
            interacted: false,
            encounterId: `${hostile.id}-${stamp}-forced`,
            powerOverride: matchedPower,
            forced: true
          }
          npcEncounters.value = [
            forcedNpc,
            ...npcEncounters.value.filter((item) => item.id !== hostile.id)
          ].slice(0, 2)
          forcedBattle = {
            side: 'hostile',
            encounterId: forcedNpc.encounterId,
            name: forcedNpc.name,
            power: matchedPower
          }
        }
      }
    }

    const base = estimateExploreReward(location)
    const mult = companionRewardMult.value
    const reward = {
      exp: Math.max(1, Math.round(base.exp * mult)),
      stones: Math.max(1, Math.round(base.stones * mult))
    }
    const materials = rollExploreMaterialLoot(location.realm)
    const materialParts: string[] = []
    if (materials.herb) materialParts.push(`药材「${materials.herb.name}」`)
    if (materials.ore) materialParts.push(`矿石「${materials.ore.name}」`)
    const materialText = materialParts.length ? `；拾得 ${materialParts.join('、')}` : ''

    const beastNames = encounters.value.map((item) => item.name).join('、')
    const npcNames = npcEncounters.value.map((item) => item.name).join('、')
    const peopleText = npcNames ? `；偶遇 ${npcNames}` : ''
    const encounterText = encounterEvent.value ? `；触发奇遇「${encounterEvent.value.name}」` : ''
    const forcedText = forcedBattle
      ? `；强制交手「${forcedBattle.name}」（战力约 ${forcedBattle.power.toLocaleString()}）`
      : ''
    const partyText = companionNames.value ? `（同行：${companionNames.value}）` : ''
    pushLog(
      `在${location.name}探索${partyText}，遭遇 ${beastNames || '空无一人'}${peopleText}${encounterText}${forcedText}${materialText}；修为 +${reward.exp}，灵石 ×${reward.stones}`,
      forcedBattle || materialParts.length || encounterEvent.value ? 'gold' : 'jade'
    )

    return {
      ...reward,
      beasts: encounters.value,
      npcs: npcEncounters.value,
      encounter: encounterEvent.value,
      materials: materials as ExploreMaterialLoot,
      forcedBattle
    }
  }

  /** 探查/了结当前奇遇 */
  function resolveEncounter() {
    const target = encounterEvent.value
    if (!target || target.resolved) return null
    target.resolved = true
    const reward = rollEncounterResolveReward(target.drops)
    const place = selectedLocation.value?.name || '秘境'
    const dropText = reward.drop ? `，获得材料「${reward.drop}」×1` : ''
    pushLog(
      `于${place}了结奇遇「${target.name}」：${target.desc}；修为 +${reward.exp}，灵石 ×${reward.stones}${dropText}`,
      'gold'
    )
    return {
      encounter: target,
      ...reward
    }
  }

  function rollBeastMaterialDrop(target: CatalogBeast) {
    const dropParts = target.drops
      .split('、')
      .map((part) => part.trim())
      .filter(Boolean)
    return dropParts[Math.floor(Math.random() * dropParts.length)] || target.drops
  }

  /** 挑战妖兽：战斗胜利，暂不掉落；需再选击杀或抓捕 */
  function challengeMonster(encounterId: string) {
    const location = selectedLocation.value
    const target = encounters.value.find((item) => item.encounterId === encounterId)
    if (!target || target.defeated || target.captured || target.killed) return null

    target.defeated = true
    const place = location ? location.name : '秘境'
    const mult = companionRewardMult.value
    /** 击败妖兽：微量修为；材料在击杀时结算。法术熟练度由页面结算 */
    const bonusExp = rollBattleExpGain(mult)
    const partyText = companionNames.value ? `，与${companionNames.value}联手` : ''

    pushLog(
      `于${place}${partyText}击败${target.name}（${target.rarity}），修为 +${bonusExp}；可选择击杀或抓捕`,
      'hp'
    )

    return {
      beast: target,
      exp: bonusExp,
      stones: 0
    }
  }

  /** 击杀已击败的妖兽：掉落材料（不给灵石） */
  function killMonster(encounterId: string) {
    const location = selectedLocation.value
    const target = encounters.value.find((item) => item.encounterId === encounterId)
    if (!target || !target.defeated || target.captured || target.killed) return null

    target.killed = true
    const place = location ? location.name : '秘境'
    const drop = rollBeastMaterialDrop(target)

    pushLog(`于${place}击杀${target.name}，获得 ${drop}×1`, 'gold')
    return {
      beast: target,
      drop
    }
  }

  /**
   * 抓捕妖兽化为灵宠（仅一次机会）。
   * 成功：不掉落材料，只得灵兽。
   * 失败：自动转为击杀并掉落材料。
   */
  function captureMonster(encounterId: string, alreadyOwned: boolean) {
    const location = selectedLocation.value
    const target = encounters.value.find((item) => item.encounterId === encounterId)
    if (!target || target.captured || target.killed) return null
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
      target.killed = true
      const drop = rollBeastMaterialDrop(target)
      pushLog(
        `于${place}抓捕${target.name}失败（约 ${Math.round(chance * 100)}%），转而击杀，获得 ${drop}×1`,
        'hp'
      )
      return {
        ok: false as const,
        reason: 'failed' as const,
        beast: target,
        chance,
        drop
      }
    }

    target.captured = true
    pushLog(`于${place}成功抓捕${target.name}，收为灵宠（无材料掉落）`, 'jade')
    return { ok: true as const, beast: target, chance }
  }

  /** 击败偶遇人物：灵石 + 微量修为；法术熟练度由页面结算 */
  function challengeNpc(encounterId: string) {
    const location = selectedLocation.value
    const target = npcEncounters.value.find((item) => item.encounterId === encounterId)
    if (!target || target.interacted) return null

    target.interacted = true
    const place = location ? location.name : '秘境'
    const mult = companionRewardMult.value
    const bonusExp = rollBattleExpGain(mult)
    const bonusStones = rollNpcStoneGain(getRealmMajorIndex(target.realm), mult)
    const partyText = companionNames.value ? `，与${companionNames.value}联手` : ''

    pushLog(
      `于${place}${partyText}击败${target.name}：${target.event}；修为 +${bonusExp}，灵石 ×${bonusStones}`,
      'mp'
    )

    return {
      npc: target,
      exp: bonusExp,
      stones: bonusStones
    }
  }

  /** @deprecated 使用 challengeNpc */
  function interactNpc(encounterId: string) {
    return challengeNpc(encounterId)
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
    companions,
    companionCount,
    companionSlotsLeft,
    companionNames,
    companionPower,
    companionRewardMult,
    hasCompanion,
    inviteCompanion,
    removeCompanion,
    clearCompanions,
    logs,
    shopCategory,
    marketOffers,
    marketDate,
    marketDayLabel,
    marketList,
    marketNpcs,
    merchantShops,
    visitNpc,
    ensureDailyMarket,
    getMarketNpc,
    getMerchantOffers,
    ensureMerchantShop,
    setVisitNpc,
    getOffer,
    consumeOfferStock,
    setTab,
    setShopCategory,
    selectLocation,
    clearLocation,
    pushLog,
    exploreOnce,
    challengeMonster,
    killMonster,
    captureMonster,
    challengeNpc,
    interactNpc,
    resolveEncounter
  }
})
