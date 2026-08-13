import Taro from '@tarojs/taro'
import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import {
  createRealm,
  formatRealmState,
  getNextRealm,
  REALM_MAJORS,
  type RealmMajor,
  type RealmStage,
  type RealmState
} from '../constants/realm'
import {
  formatPrimaryRoot,
  pickPrimaryRoot,
  rollRootBones,
  type RootBone
} from '../constants/roots'
import {
  getSpellProficiencyInfo,
  migrateLegacySpellLevel,
  type SpellProficiencyInfo
} from '../constants/spell-proficiency'
import { getStarterGift } from '../constants/starter-gifts'
import type { SectId } from '../constants/sects'
import { useSectStore } from './sect'
import { useTreasureStore } from './treasure'

const STORAGE_KEY = 'cultivation_player_profile'

function todayKey() {
  const d = new Date()
  const m = `${d.getMonth() + 1}`.padStart(2, '0')
  const day = `${d.getDate()}`.padStart(2, '0')
  return `${d.getFullYear()}-${m}-${day}`
}

export type Gender = '男' | '女'

export type BagCategory = '全部' | '丹药' | '功法' | '法术' | '材料' | '法宝'

export interface BagItem {
  id: string
  name: string
  count: number
  category: Exclude<BagCategory, '全部'>
  color?: string
}

export interface Pet {
  id: string
  name: string
  grade: string
  type: string
  bonus: string
  favor: number
  status: '出战' | '待命'
  /** shop=兽阁契约；capture=秘境抓捕妖兽 */
  source?: 'shop' | 'capture'
}

export const usePlayerStore = defineStore('player', () => {
  const created = ref(false)
  const name = ref('')
  const gender = ref<Gender>('男')
  const sect = ref('')
  const sectId = ref('')
  const rank = ref('散修')
  /** 当前境界：大境界 + 阶段 */
  const realmState = ref<RealmState>(createRealm('炼气', '一层'))
  const rootBone = ref('未知')
  const comprehension = ref(50)
  const power = ref(1000)
  const spiritStones = ref(100)
  const contribution = ref(0)
  const exp = ref(0)
  const expMax = ref(1000)

  const roots = ref<RootBone[]>([])

  const bag = ref<BagItem[]>([])

  const bagFilter = ref<BagCategory>('全部')

  /** 当前修习中的功法 id（仅一门） */
  const activeTechniqueId = ref('')

  /** 已习法术熟练度点数（名称 → 0+；六阶见 spell-proficiency） */
  const spellProficiency = ref<Record<string, number>>({})

  const pets = ref<Pet[]>([])
  /** 图鉴已见过的灵兽名（击败 / 抓捕 / 购买） */
  const seenSpiritBeasts = ref<string[]>([])

  /** 当日已挖矿次数 */
  const mineDigsUsed = ref(0)
  /** 挖矿次数所属日期 YYYY-MM-DD */
  const mineDigDate = ref('')

  const filteredBag = computed(() => {
    if (bagFilter.value === '全部') return bag.value
    return bag.value.filter((item) => item.category === bagFilter.value)
  })

  const avatarChar = computed(() => name.value.slice(0, 1))

  /** 战力 = 本体战力 + 已装备法宝加成 */
  const combatPower = computed(() => {
    try {
      return power.value + useTreasureStore().equippedPowerBonus
    } catch {
      return power.value
    }
  })

  /** 境界展示：炼气三层 / 筑基前期 */
  const realm = computed(() => formatRealmState(realmState.value))

  const nextRealmState = computed(() => getNextRealm(realmState.value))

  const nextRealm = computed(() =>
    nextRealmState.value ? formatRealmState(nextRealmState.value) : null
  )

  const canBreakthrough = computed(
    () => !!nextRealmState.value && exp.value >= expMax.value
  )

  function setRealm(major: RealmMajor, stage: RealmStage) {
    realmState.value = createRealm(major, stage)
  }

  function addPower(amount: number) {
    if (amount <= 0) return
    power.value += Math.round(amount)
  }

  /** 突破到下一境界；成功返回新境界文案，失败返回 null */
  function breakthrough(): string | null {
    if (!canBreakthrough.value || !nextRealmState.value) return null
    const majorIdx = Math.max(0, REALM_MAJORS.indexOf(realmState.value.major))
    realmState.value = { ...nextRealmState.value }
    exp.value = 0
    // 突破提升战力
    addPower(30 + majorIdx * 25)
    persist()
    return realm.value
  }

  function spendStones(amount: number) {
    if (spiritStones.value < amount) return false
    spiritStones.value -= amount
    return true
  }

  function earnStones(amount: number) {
    spiritStones.value += amount
  }

  function earnContribution(amount: number) {
    contribution.value += Math.max(0, amount)
  }

  function addExp(amount: number) {
    if (amount <= 0) return
    // 支持小数修为（闭关吐纳），保留 1 位小数
    exp.value = Math.round((exp.value + amount) * 10) / 10
  }

  /** 扣除修为（不低于 0），返回实际扣除量 */
  function loseExp(amount: number) {
    if (amount <= 0 || exp.value <= 0) return 0
    const before = exp.value
    exp.value = Math.max(0, Math.round((exp.value - amount) * 10) / 10)
    return Math.round((before - exp.value) * 10) / 10
  }

  function addBagItem(nameText: string, category: BagItem['category'], count = 1) {
    const found = bag.value.find((item) => item.name === nameText && item.category === category)
    if (found) {
      found.count += count
      return
    }
    bag.value.push({
      id: `b-${Date.now()}`,
      name: nameText,
      count,
      category
    })
    if (category === '法术') ensureSpellProficiency(nameText)
  }

  function getSpellProficiency(nameText: string) {
    if (!nameText) return 0
    const raw = spellProficiency.value[nameText]
    if (raw == null || raw < 0) return 0
    return Math.round(raw * 10) / 10
  }

  function getSpellProficiencyDetail(nameText: string): SpellProficiencyInfo {
    return getSpellProficiencyInfo(getSpellProficiency(nameText))
  }

  /** 熟练度阶位 1～6；未学会为 0（炼制成功率用） */
  function getSpellLevel(nameText: string) {
    if (!nameText || spellProficiency.value[nameText] == null) return 0
    return getSpellProficiencyDetail(nameText).tier
  }

  /** 学会法术时初始化熟练度 0（初窥门径） */
  function ensureSpellProficiency(nameText: string) {
    if (!nameText) return 0
    if (spellProficiency.value[nameText] == null || spellProficiency.value[nameText] < 0) {
      spellProficiency.value = { ...spellProficiency.value, [nameText]: 0 }
    }
    return spellProficiency.value[nameText]
  }

  /** @deprecated 使用 ensureSpellProficiency */
  function ensureSpellLevel(nameText: string) {
    return ensureSpellProficiency(nameText)
  }

  /** 洞府演练增加熟练度；tierUp 表示跨入更高阶 */
  function addSpellProficiency(nameText: string, amount: number) {
    if (!nameText || amount <= 0) {
      return {
        points: 0,
        tier: 0,
        name: '',
        tierUp: false,
        gain: 0
      }
    }
    ensureSpellProficiency(nameText)
    const before = getSpellProficiencyDetail(nameText)
    const add = Math.round(amount * 10) / 10
    const nextPoints = Math.round((before.points + add) * 10) / 10
    spellProficiency.value = { ...spellProficiency.value, [nameText]: nextPoints }
    const after = getSpellProficiencyInfo(nextPoints)
    return {
      points: after.points,
      tier: after.tier,
      name: after.name,
      tierUp: after.tier > before.tier,
      gain: Math.round((after.points - before.points) * 10) / 10
    }
  }

  function getBagCount(nameText: string, category?: BagItem['category']) {
    const found = bag.value.find(
      (item) => item.name === nameText && (!category || item.category === category)
    )
    return found?.count || 0
  }

  /** 扣除背包物品；不足则返回 false 且不改动 */
  function removeBagItem(nameText: string, category: BagItem['category'], count = 1) {
    const index = bag.value.findIndex((item) => item.name === nameText && item.category === category)
    if (index < 0) return false
    const item = bag.value[index]
    if (item.count < count) return false
    item.count -= count
    if (item.count <= 0) bag.value.splice(index, 1)
    return true
  }

  function ensureMineDay() {
    const today = todayKey()
    if (mineDigDate.value !== today) {
      mineDigDate.value = today
      mineDigsUsed.value = 0
    }
  }

  /** 今日已挖次数（无上限，仅作统计） */
  const mineDigsLeft = computed(() => Number.POSITIVE_INFINITY)

  /** 记录一次挖矿；无每日上限，始终成功 */
  function consumeMineDig() {
    ensureMineDay()
    mineDigsUsed.value += 1
    return true
  }

  function persist() {
    Taro.setStorageSync(STORAGE_KEY, {
      created: created.value,
      name: name.value,
      gender: gender.value,
      roots: roots.value,
      rootBone: rootBone.value,
      comprehension: comprehension.value,
      realmState: realmState.value,
      power: power.value,
      spiritStones: spiritStones.value,
      contribution: contribution.value,
      exp: exp.value,
      expMax: expMax.value,
      rank: rank.value,
      sect: sect.value,
      sectId: sectId.value,
      bag: bag.value,
      pets: pets.value,
      seenSpiritBeasts: seenSpiritBeasts.value,
      activeTechniqueId: activeTechniqueId.value,
      spellProficiency: spellProficiency.value,
      mineDigsUsed: mineDigsUsed.value,
      mineDigDate: mineDigDate.value
    })
  }

  function hydrate() {
    try {
      const data = Taro.getStorageSync(STORAGE_KEY)
      if (!data || !data.created) return false
      created.value = true
      name.value = data.name || ''
      gender.value = data.gender === '女' ? '女' : '男'
      roots.value = data.roots || []
      rootBone.value = data.rootBone || '未知'
      comprehension.value = data.comprehension ?? 50
      if (data.realmState?.major && data.realmState?.stage) {
        realmState.value = createRealm(data.realmState.major, data.realmState.stage)
      }
      power.value = data.power ?? power.value
      spiritStones.value = data.spiritStones ?? spiritStones.value
      contribution.value = data.contribution ?? contribution.value
      exp.value = data.exp ?? exp.value
      expMax.value = data.expMax ?? expMax.value
      rank.value = data.rank || rank.value
      sect.value = data.sect || ''
      sectId.value = data.sectId || ''
      bag.value = Array.isArray(data.bag) ? data.bag : []
      pets.value = Array.isArray(data.pets) ? data.pets : []
      seenSpiritBeasts.value = Array.isArray(data.seenSpiritBeasts)
        ? data.seenSpiritBeasts
        : pets.value.map((item) => item.name)
      activeTechniqueId.value = data.activeTechniqueId || ''
      if (data.spellProficiency && typeof data.spellProficiency === 'object') {
        spellProficiency.value = { ...data.spellProficiency }
      } else if (data.spellLevels && typeof data.spellLevels === 'object') {
        // 旧存档 Lv.1～10 → 熟练度点数
        const migrated: Record<string, number> = {}
        Object.entries(data.spellLevels as Record<string, number>).forEach(([k, v]) => {
          migrated[k] = migrateLegacySpellLevel(Number(v) || 0)
        })
        spellProficiency.value = migrated
      } else {
        spellProficiency.value = {}
      }
      mineDigsUsed.value = data.mineDigsUsed ?? 0
      mineDigDate.value = data.mineDigDate || ''
      ensureMineDay()
      const sectStore = useSectStore()
      if (sectId.value || sect.value) {
        sectStore.applyJoinedSect(sectId.value || sect.value)
      }
      // 旧存档：已有法术但无熟练度记录时补 0（初窥门径）
      bag.value
        .filter((item) => item.category === '法术')
        .forEach((item) => ensureSpellProficiency(item.name))
      sectStore.syncLearnedFromBag(bag.value, activeTechniqueId.value || null, spellProficiency.value)
      activeTechniqueId.value = sectStore.activeTechniqueId || ''
      return true
    } catch {
      return false
    }
  }

  /** 创建角色：写入姓名性别，随机灵根；法宝/灵宠/功法/宗门初始为空 */
  function createCharacter(inputName: string, inputGender: Gender) {
    const rolled = rollRootBones()
    const primary = pickPrimaryRoot(rolled)
    const primaryValue = primary.value

    name.value = inputName.trim()
    gender.value = inputGender
    roots.value = rolled
    rootBone.value = formatPrimaryRoot(primary)
    comprehension.value = Math.min(99, Math.max(20, Math.round(primaryValue * 0.85 + Math.random() * 15)))
    realmState.value = createRealm('炼气', '一层')
    power.value = 10
    spiritStones.value = 100
    contribution.value = 0
    exp.value = 0
    expMax.value = 1000
    rank.value = '散修'
    sect.value = ''
    sectId.value = ''
    bag.value = []
    pets.value = []
    seenSpiritBeasts.value = []
    activeTechniqueId.value = ''
    spellProficiency.value = {}
    mineDigsUsed.value = 0
    mineDigDate.value = todayKey()
    created.value = true
    useTreasureStore().resetOwned()
    useSectStore().resetOwnedTechniques()
    useSectStore().clearJoinedSect()
    persist()
  }

  /**
   * 加入宗门（仅首次）
   * 入门赠送：基础功法（设为修习中）+ 基础法术
   */
  function joinSect(id: string, sectName: string) {
    if (sect.value) return false
    sectId.value = id
    sect.value = sectName
    rank.value = '外门弟子'
    const sectStore = useSectStore()
    sectStore.applyJoinedSect(id)

    const { technique, spell } = getStarterGift(id as SectId)
    if (technique) {
      sectStore.learnTechnique(technique.id)
      addBagItem(technique.name, '功法')
      activeTechniqueId.value = technique.id
    }
    if (spell) {
      sectStore.learnSpell(spell.id)
      addBagItem(spell.name, '法术')
      ensureSpellProficiency(spell.name)
    }

    sectStore.syncLearnedFromBag(bag.value, activeTechniqueId.value || null, spellProficiency.value)
    persist()
    return {
      ok: true as const,
      techniqueName: technique?.name || '',
      spellName: spell?.name || ''
    }
  }

  function ownedPet(nameText: string) {
    return pets.value.some((item) => item.name === nameText)
  }

  function markSpiritBeastSeen(nameText: string) {
    if (!nameText || seenSpiritBeasts.value.includes(nameText)) return
    seenSpiritBeasts.value = [...seenSpiritBeasts.value, nameText]
  }

  function hasSeenSpiritBeast(nameText: string) {
    return seenSpiritBeasts.value.includes(nameText) || ownedPet(nameText)
  }

  function addPet(input: {
    name: string
    grade: string
    type: string
    bonus: string
    source?: 'shop' | 'capture'
  }) {
    if (ownedPet(input.name)) return null
    const pet: Pet = {
      id: `pet-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      name: input.name,
      grade: input.grade,
      type: input.type,
      bonus: input.bonus,
      favor: 50,
      status: pets.value.some((item) => item.status === '出战') ? '待命' : '出战',
      source: input.source || 'shop'
    }
    pets.value.push(pet)
    markSpiritBeastSeen(input.name)
    return pet
  }

  function removePet(id: string) {
    const index = pets.value.findIndex((item) => item.id === id)
    if (index < 0) return null
    const [removed] = pets.value.splice(index, 1)
    if (removed.status === '出战') {
      const next = pets.value[0]
      if (next) next.status = '出战'
    }
    return removed
  }

  const hasSect = computed(() => !!sect.value)

  hydrate()

  return {
    created,
    name,
    gender,
    sect,
    sectId,
    hasSect,
    rank,
    realmState,
    realm,
    nextRealm,
    nextRealmState,
    canBreakthrough,
    setRealm,
    breakthrough,
    rootBone,
    comprehension,
    power,
    combatPower,
    addPower,
    spiritStones,
    contribution,
    exp,
    expMax,
    roots,
    bag,
    bagFilter,
    activeTechniqueId,
    spellProficiency,
    getSpellProficiency,
    getSpellProficiencyDetail,
    getSpellLevel,
    ensureSpellProficiency,
    ensureSpellLevel,
    addSpellProficiency,
    pets,
    seenSpiritBeasts,
    ownedPet,
    markSpiritBeastSeen,
    hasSeenSpiritBeast,
    addPet,
    removePet,
    filteredBag,
    avatarChar,
    spendStones,
    earnStones,
    earnContribution,
    addExp,
    loseExp,
    addBagItem,
    getBagCount,
    removeBagItem,
    mineDigsUsed,
    mineDigDate,
    mineDigsLeft,
    ensureMineDay,
    consumeMineDig,
    createCharacter,
    joinSect,
    hydrate,
    persist
  }
})
