import Taro from '@tarojs/taro'
import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import {
  createInitialRealm,
  createRealm,
  formatRealmState,
  getNextRealm,
  parseRealmLabel,
  REALM_MAJORS,
  type RealmMajor,
  type RealmStage,
  type RealmState
} from '../constants/realm'
import {
  BREAKTHROUGH_FAIL_EXP_KEEP,
  calcBreakthroughSuccessRate,
  type BreakthroughRateDetail
} from '../constants/breakthrough'
import { getExpRequiredToBreakthrough } from '../constants/realm-exp'
import {
  formatPrimaryRoot,
  pickPrimaryRoot,
  rollRootBones,
  type RootBone
} from '../constants/roots'
import { rollComprehension } from '../constants/practice-speed'
import { INJURY_POWER_MULT } from '../constants/spar'
import {
  CLIFF_ENCOUNTER_INTERVAL_MS,
  cliffSentenceMs,
  rollCliffEncounter,
  type CliffEncounterResult,
  type DeathDuelLoot
} from '../constants/sect-duel'
import type { MemberGroup } from '../constants/member-catalog'
import {
  getSpellProficiencyInfo,
  migrateLegacySpellLevel,
  type SpellProficiencyInfo
} from '../constants/spell-proficiency'
import { TECHNIQUE_CATALOG } from '../constants/technique-catalog'
import {
  getTechniqueProficiencyInfo,
  type TechniqueProficiencyInfo
} from '../constants/technique-proficiency'
import { getStarterGift } from '../constants/starter-gifts'
import { canHealInjury } from '../constants/pill-catalog'
import {
  clampIntimacy,
  seedIntimacyFromAttitude
} from '../constants/intimacy'

export type DualPartner = {
  id: string
  name: string
  gender: string
  attitude?: string
}
import { getGameMonthKey, getTianyuanDate } from '../constants/game-time'
import { resolveMaterialBagCategory } from '../constants/loot-material-catalog'
import {
  getSectMonthlyStipend,
  resolveSectStipendGroup
} from '../constants/sect-stipend'
import { applyUiTheme, applyUiThemeForSect } from '../constants/ui-theme'
import type { SectId } from '../constants/sects'
import { useSectStore } from './sect'
import { useTreasureStore } from './treasure'

export type BreakthroughAttemptResult =
  | { ok: true; realm: string; rate: number; usedPill: string | null }
  | { ok: false; rate: number; usedPill: string | null; expAfter: number }

const STORAGE_KEY = 'cultivation_player_profile'

const BAG_MATERIAL_CATEGORIES = new Set(['材料', '矿石', '药材'])

/**
 * 将背包中的矿石 / 药材 / 历练材料归入正确分类。
 * - 名称在矿石目录 → 矿石
 * - 名称在药材目录 → 药材
 * - 其余原「材料/矿石/药材」条目 → 材料（历练掉落等）
 * - 丹药 / 功法 / 法术 / 法宝 不动
 * 同名同分类合并堆叠。
 */
function migrateBagItems(items: BagItem[]): BagItem[] {
  const next: BagItem[] = []
  for (const raw of items) {
    if (!raw?.name) continue
    const count = Math.max(0, Number(raw.count) || 0)
    if (count <= 0) continue

    let name = raw.name
    // 功法更名：疾风步 → 疾风决（法术「疾风步」保持不变）
    if (raw.category === '功法' && name === '疾风步') name = '疾风决'

    let category = (raw.category || '材料') as BagItem['category']
    const resolved = resolveMaterialBagCategory(name)

    if (resolved === '矿石' || resolved === '药材') {
      category = resolved
    } else if (BAG_MATERIAL_CATEGORIES.has(category) || !category) {
      category = '材料'
    }

    const found = next.find((item) => item.name === name && item.category === category)
    if (found) {
      found.count += count
      continue
    }
    next.push({
      id: raw.id || `b-${Date.now()}-${next.length}`,
      name,
      count,
      category,
      color: raw.color
    })
  }
  return next
}

function bagMigrationChanged(before: BagItem[], after: BagItem[]) {
  const keyOf = (list: BagItem[]) =>
    list
      .map((item) => `${item.name}\0${item.category}\0${item.count}`)
      .sort()
      .join('\n')
  return keyOf(before) !== keyOf(after)
}

function todayKey() {
  const d = new Date()
  const m = `${d.getMonth() + 1}`.padStart(2, '0')
  const day = `${d.getDate()}`.padStart(2, '0')
  return `${d.getFullYear()}-${m}-${day}`
}

export type Gender = '男' | '女'

export type BagCategory =
  | '全部'
  | '丹药'
  | '功法'
  | '法术'
  | '矿石'
  | '药材'
  | '材料'
  | '法宝'

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
  const realmState = ref<RealmState>(createInitialRealm())
  const rootBone = ref('未知')
  const comprehension = ref(50)
  const power = ref(1000)
  const spiritStones = ref(100)
  const contribution = ref(0)
  const exp = ref(0)
  const expMax = ref(getExpRequiredToBreakthrough(createInitialRealm()))

  function syncExpMaxFromRealm() {
    // 始终按「当前境界本层需求」取值，绝不把前序境界修为累加进上限
    expMax.value = getExpRequiredToBreakthrough(realmState.value)
  }

  const roots = ref<RootBone[]>([])

  const bag = ref<BagItem[]>([])

  const bagFilter = ref<BagCategory>('全部')

  /** 当前修习中的功法 id（仅一门） */
  const activeTechniqueId = ref('')

  /** 已习法术熟练度点数（名称 → 0+；六阶见 spell-proficiency） */
  const spellProficiency = ref<Record<string, number>>({})
  /** 已习功法熟练度点数（名称 → 0+；六阶见 technique-proficiency） */
  const techniqueProficiency = ref<Record<string, number>>({})

  const pets = ref<Pet[]>([])
  /** 图鉴已见过的灵兽名（击败 / 抓捕 / 购买） */
  const seenSpiritBeasts = ref<string[]>([])
  /** 受伤：战力缩减；洞府静养或服用疗伤丹药可愈；愈前不宜再战 */
  const injured = ref(false)

  /** 当日已挖矿次数 */
  const mineDigsUsed = ref(0)
  /** 挖矿次数所属日期 YYYY-MM-DD */
  const mineDigDate = ref('')

  /** 人物亲密值（宗门 / 坊市 / 历练人物 id → 0～100） */
  const intimacyMap = ref<Record<string, number>>({})

  /** 洞府双修对象（拜访邀请后写入） */
  const dualPartner = ref<DualPartner | null>(null)

  /** 思过崖面壁处罚 */
  const cliff = ref<{
    active: boolean
    startedAt: number
    endsAt: number
    reason: string
    targetName: string
    targetGroup: string
    /** 上次奇遇判定时间 */
    lastEncounterAt: number
    /** 本次面壁奇遇日志（最多保留 20 条） */
    encounterLogs: string[]
  } | null>(null)

  const onCliff = computed(() => {
    if (!cliff.value?.active) return false
    if (Date.now() >= cliff.value.endsAt) return false
    return true
  })

  const cliffRemainMs = computed(() => {
    if (!cliff.value?.active) return 0
    return Math.max(0, cliff.value.endsAt - Date.now())
  })

  function clearCliffIfExpired(now = Date.now()) {
    if (!cliff.value?.active) return false
    if (now < cliff.value.endsAt) return false
    cliff.value = {
      ...cliff.value,
      active: false
    }
    persist()
    return true
  }

  function startCliffPunishment(input: {
    targetName: string
    targetGroup: MemberGroup | string
    reason?: string
  }) {
    const now = Date.now()
    const duration = cliffSentenceMs(input.targetGroup)
    cliff.value = {
      active: true,
      startedAt: now,
      endsAt: now + duration,
      reason: input.reason || `与同门「${input.targetName}」生死比斗，夺其资财`,
      targetName: input.targetName,
      targetGroup: input.targetGroup,
      lastEncounterAt: now,
      encounterLogs: []
    }
    persist()
    return cliff.value
  }

  function ownedSpellNames() {
    return bag.value.filter((item) => item.category === '法术').map((item) => item.name)
  }

  function activeTechniqueName() {
    const id = activeTechniqueId.value
    if (id) {
      const tech = TECHNIQUE_CATALOG.find((item) => item.id === id)
      if (tech?.name) return tech.name
    }
    return bag.value.find((item) => item.category === '功法')?.name || null
  }

  function applyCliffEncounterResult(result: CliffEncounterResult) {
    if (result.kind === 'material' && result.materialName && result.materialCategory) {
      addBagItem(result.materialName, result.materialCategory, result.materialCount || 1)
    } else if (result.kind === 'technique' && result.skillName && result.proficiencyGain) {
      addTechniqueProficiency(result.skillName, result.proficiencyGain)
    } else if (result.kind === 'spell' && result.skillName && result.proficiencyGain) {
      addSpellProficiency(result.skillName, result.proficiencyGain)
    }
    if (!cliff.value) return result.message
    const logs = [result.message, ...(cliff.value.encounterLogs || [])].slice(0, 20)
    cliff.value = { ...cliff.value, encounterLogs: logs }
    return result.message
  }

  /**
   * 思过崖奇遇判定：每 10 秒一次；可补算离开页面期间错过的判定（最多 36 次）。
   * 返回本次触发的奇遇文案列表。
   */
  function tickCliffEncounters(now = Date.now()) {
    if (!cliff.value?.active) return [] as string[]
    const state = cliff.value
    const end = Math.min(now, state.endsAt)
    let cursor = state.lastEncounterAt || state.startedAt
    if (cursor > end) cursor = end
    const messages: string[] = []
    let ticks = 0
    while (cursor + CLIFF_ENCOUNTER_INTERVAL_MS <= end && ticks < 36) {
      cursor += CLIFF_ENCOUNTER_INTERVAL_MS
      ticks += 1
      const rolled = rollCliffEncounter({
        techniqueName: activeTechniqueName(),
        spellNames: ownedSpellNames()
      })
      if (rolled) {
        messages.push(applyCliffEncounterResult(rolled))
      }
    }
    cliff.value = {
      ...cliff.value,
      lastEncounterAt: cursor
    }
    if (messages.length || ticks > 0) persist()
    return messages
  }

  function applyDeathDuelLoot(loot: DeathDuelLoot) {
    earnStones(loot.stones)
    for (const herb of loot.herbs) addBagItem(herb.name, '药材', herb.count)
    for (const ore of loot.ores) addBagItem(ore.name, '矿石', ore.count)
    for (const pill of loot.pills) addBagItem(pill.name, '丹药', pill.count)
    const treasureStore = useTreasureStore()
    for (const t of loot.treasures) {
      treasureStore.addTreasure({
        id: `duel-${t.id}-${Date.now()}-${Math.floor(Math.random() * 999)}`,
        name: t.name,
        grade: t.grade,
        gradeLabel: t.gradeLabel,
        type: t.type,
        desc: t.effect,
        special: t.special,
        story: t.story,
        equipped: false,
        level: 1,
        refine: 0
      })
    }
  }

  /** 已领取宗门月俸的游戏月 key（gmonth-年-月） */
  const lastStipendMonthKey = ref('')
  /** 待展示的月俸提示（内存；页面 didShow 消费） */
  const pendingStipendNotice = ref('')

  function getIntimacy(characterId: string, attitudeHint?: string) {
    const id = (characterId || '').trim()
    if (!id || id === 'self') return 0
    const raw = intimacyMap.value[id]
    if (typeof raw === 'number' && Number.isFinite(raw)) return clampIntimacy(raw)
    return clampIntimacy(seedIntimacyFromAttitude(attitudeHint))
  }

  function setIntimacy(characterId: string, value: number) {
    const id = (characterId || '').trim()
    if (!id || id === 'self') return 0
    const next = clampIntimacy(value)
    intimacyMap.value = { ...intimacyMap.value, [id]: next }
    return next
  }

  /** 增减亲密；首次无记录时可用态度作底 */
  function addIntimacy(characterId: string, delta: number, attitudeHint?: string) {
    const id = (characterId || '').trim()
    if (!id || id === 'self') return 0
    const base =
      typeof intimacyMap.value[id] === 'number'
        ? intimacyMap.value[id]
        : seedIntimacyFromAttitude(attitudeHint)
    const next = clampIntimacy(base + delta)
    intimacyMap.value = { ...intimacyMap.value, [id]: next }
    return next
  }

  function ensureIntimacySeed(characterId: string, attitudeHint?: string) {
    const id = (characterId || '').trim()
    if (!id || id === 'self') return 0
    if (typeof intimacyMap.value[id] === 'number') return clampIntimacy(intimacyMap.value[id])
    return setIntimacy(id, seedIntimacyFromAttitude(attitudeHint))
  }

  function setDualPartner(partner: DualPartner | null) {
    if (!partner) {
      dualPartner.value = null
      return null
    }
    const id = (partner.id || '').trim()
    if (!id || id === 'self') {
      dualPartner.value = null
      return null
    }
    dualPartner.value = {
      id,
      name: (partner.name || '').trim() || '无名',
      gender: partner.gender === '女' ? '女' : '男',
      attitude: partner.attitude
    }
    return dualPartner.value
  }

  function clearDualPartner() {
    dualPartner.value = null
  }

  const filteredBag = computed(() => {
    if (bagFilter.value === '全部') return bag.value
    return bag.value.filter((item) => item.category === bagFilter.value)
  })

  const avatarChar = computed(() => name.value.slice(0, 1))

  /** 战力（未计受伤缩减）= 本体 ×（1+功法熟练）+ 已装备法宝 */
  const combatPowerHealthy = computed(() => {
    let techBonus = 0
    const activeId = activeTechniqueId.value
    const fromId = activeId
      ? TECHNIQUE_CATALOG.find((item) => item.id === activeId)?.name || ''
      : ''
    const activeName =
      fromId || bag.value.find((item) => item.category === '功法')?.name || ''
    if (activeName) {
      techBonus = getTechniqueProficiencyInfo(getTechniqueProficiency(activeName)).powerBonus
    }
    const base = Math.round(power.value * (1 + Math.max(0, techBonus)))
    try {
      return base + useTreasureStore().equippedPowerBonus
    } catch {
      return base
    }
  })

  /** 实际战力：受伤时再乘缩减 */
  const combatPower = computed(() => {
    const full = combatPowerHealthy.value
    if (!injured.value) return full
    return Math.max(1, Math.round(full * INJURY_POWER_MULT))
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
    syncExpMaxFromRealm()
  }

  function addPower(amount: number) {
    if (amount <= 0) return
    power.value += Math.round(amount)
  }

  function resolveActiveTechniqueGrade(): string | null {
    const activeId = activeTechniqueId.value
    if (activeId) {
      const fromId = TECHNIQUE_CATALOG.find((item) => item.id === activeId)
      if (fromId?.grade) return fromId.grade
    }
    const bagTech = bag.value.find((item) => item.category === '功法')
    if (bagTech) {
      return TECHNIQUE_CATALOG.find((item) => item.name === bagTech.name)?.grade || null
    }
    return null
  }

  /** 预览突破成功率（不消耗丹药 / 不改状态） */
  function getBreakthroughPreview(): BreakthroughRateDetail | null {
    if (!nextRealmState.value) return null
    const detail = calcBreakthroughSuccessRate({
      current: realmState.value,
      next: nextRealmState.value,
      techniqueGrade: resolveActiveTechniqueGrade(),
      hasPill: false,
      formatRealm: formatRealmState
    })
    if (!detail) return null
    const hasPill = !!(detail.pillName && getBagCount(detail.pillName, '丹药') > 0)
    if (!hasPill) return detail
    return (
      calcBreakthroughSuccessRate({
        current: realmState.value,
        next: nextRealmState.value,
        techniqueGrade: resolveActiveTechniqueGrade(),
        hasPill: true,
        formatRealm: formatRealmState
      }) || detail
    )
  }

  /**
   * 突破到下一境界：按成功率判定；失败修为降至八成。
   * 成功后境界推进、修为归零并按新境界重算需求上限。
   * 若持有对应突破丹，尝试时自动服用（无论成败均消耗）。
   */
  function breakthrough(): BreakthroughAttemptResult | null {
    if (!canBreakthrough.value || !nextRealmState.value) return null
    const preview = getBreakthroughPreview()
    if (!preview) return null
    // 先固定目标，避免判定过程中 computed 变化
    const targetMajor = nextRealmState.value.major
    const targetStage = nextRealmState.value.stage

    let usedPill: string | null = null
    if (preview.pillName && preview.hasPill) {
      if (removeBagItem(preview.pillName, '丹药', 1)) {
        usedPill = preview.pillName
      }
    }

    const roll = Math.random() * 100
    if (roll < preview.rate) {
      const majorIdx = Math.max(0, REALM_MAJORS.indexOf(realmState.value.major))
      // 整对象替换，确保界面与存档都能读到新境界
      realmState.value = createRealm(targetMajor, targetStage)
      // 本层进度清零，上限改为新境界本层所需（非累加）
      syncExpMaxFromRealm()
      exp.value = 0
      addPower(30 + majorIdx * 25)
      persist()
      return {
        ok: true,
        realm: formatRealmState(realmState.value),
        rate: preview.rate,
        usedPill
      }
    }

    exp.value = Math.round(exp.value * BREAKTHROUGH_FAIL_EXP_KEEP * 10) / 10
    if (exp.value > expMax.value) exp.value = expMax.value
    persist()
    return { ok: false, rate: preview.rate, usedPill, expAfter: exp.value }
  }

  function spendStones(amount: number) {
    if (spiritStones.value < amount) return false
    spiritStones.value -= amount
    return true
  }

  function earnStones(amount: number) {
    spiritStones.value += amount
  }

  /**
   * 宗门月俸：天元历每月一次，按当前身份发放灵石。
   * 若月初未登录，首次进入时补发当月；散修不发。
   */
  function claimMonthlyStipend(now = Date.now()) {
    if (!sect.value) return null
    const monthKey = getGameMonthKey(now)
    if (lastStipendMonthKey.value === monthKey) return null
    const group = resolveSectStipendGroup(rank.value)
    const amount = getSectMonthlyStipend(rank.value)
    lastStipendMonthKey.value = monthKey
    if (!group || amount <= 0) {
      persist()
      return null
    }
    earnStones(amount)
    const d = getTianyuanDate(now)
    const notice = `宗门月俸 · ${d.monthName} · ${group} · 灵石 +${amount}`
    pendingStipendNotice.value = notice
    persist()
    return { amount, group, monthKey, monthName: d.monthName, notice }
  }

  /** 领取月俸并返回待提示文案（有则清空） */
  function ensureMonthlyStipend(now = Date.now()) {
    claimMonthlyStipend(now)
    const notice = pendingStipendNotice.value
    if (notice) pendingStipendNotice.value = ''
    return notice
  }

  function earnContribution(amount: number) {
    contribution.value += Math.max(0, amount)
  }

  function addExp(amount: number) {
    if (amount <= 0) return
    // 支持小数修为（闭关吐纳），保留 1 位小数；封顶至突破所需
    exp.value = Math.min(expMax.value, Math.round((exp.value + amount) * 10) / 10)
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
    if (category === '功法') ensureTechniqueProficiency(nameText)
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

  function getTechniqueProficiency(nameText: string) {
    if (!nameText) return 0
    const raw = techniqueProficiency.value[nameText]
    if (raw == null || raw < 0) return 0
    return Math.round(raw * 10) / 10
  }

  function getTechniqueProficiencyDetail(nameText: string): TechniqueProficiencyInfo {
    return getTechniqueProficiencyInfo(getTechniqueProficiency(nameText))
  }

  function ensureTechniqueProficiency(nameText: string) {
    if (!nameText) return 0
    if (
      techniqueProficiency.value[nameText] == null ||
      techniqueProficiency.value[nameText] < 0
    ) {
      techniqueProficiency.value = { ...techniqueProficiency.value, [nameText]: 0 }
    }
    return techniqueProficiency.value[nameText]
  }

  function addTechniqueProficiency(nameText: string, amount: number) {
    if (!nameText || amount <= 0) {
      return {
        points: 0,
        tier: 0,
        name: '',
        tierUp: false,
        gain: 0
      }
    }
    ensureTechniqueProficiency(nameText)
    const before = getTechniqueProficiencyDetail(nameText)
    const add = Math.round(amount * 10) / 10
    const nextPoints = Math.round((before.points + add) * 10) / 10
    techniqueProficiency.value = { ...techniqueProficiency.value, [nameText]: nextPoints }
    const after = getTechniqueProficiencyInfo(nextPoints)
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
    const realmSnap = {
      major: realmState.value.major,
      stage: realmState.value.stage
    }
    Taro.setStorageSync(STORAGE_KEY, {
      created: created.value,
      name: name.value,
      gender: gender.value,
      roots: roots.value,
      rootBone: rootBone.value,
      comprehension: comprehension.value,
      realmState: realmSnap,
      realmMajor: realmSnap.major,
      realmStage: realmSnap.stage,
      realm: formatRealmState(realmSnap),
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
      injured: injured.value,
      activeTechniqueId: activeTechniqueId.value,
      spellProficiency: spellProficiency.value,
      techniqueProficiency: techniqueProficiency.value,
      mineDigsUsed: mineDigsUsed.value,
      mineDigDate: mineDigDate.value,
      intimacyMap: intimacyMap.value,
      dualPartner: dualPartner.value,
      lastStipendMonthKey: lastStipendMonthKey.value,
      cliff: cliff.value
    })
  }

  function resolveRealmFromSave(data: Record<string, any>): RealmState | null {
    const nested = data.realmState
    if (nested && typeof nested === 'object' && nested.major && nested.stage) {
      try {
        return createRealm(nested.major, nested.stage)
      } catch {
        /* continue */
      }
    }
    if (data.realmMajor && data.realmStage) {
      try {
        return createRealm(data.realmMajor, data.realmStage)
      } catch {
        /* continue */
      }
    }
    if (typeof data.realm === 'string') {
      return parseRealmLabel(data.realm)
    }
    return null
  }

  function hydrate() {
    try {
      let data: any = Taro.getStorageSync(STORAGE_KEY)
      if (typeof data === 'string') {
        try {
          data = JSON.parse(data)
        } catch {
          return false
        }
      }
      if (!data || !data.created) return false
      created.value = true
      name.value = data.name || ''
      gender.value = data.gender === '女' ? '女' : '男'
      roots.value = data.roots || []
      rootBone.value = data.rootBone || '未知'
      comprehension.value = data.comprehension ?? 50
      const loadedRealm = resolveRealmFromSave(data)
      if (loadedRealm) {
        realmState.value = loadedRealm
      }
      power.value = data.power ?? power.value
      spiritStones.value = data.spiritStones ?? spiritStones.value
      contribution.value = data.contribution ?? contribution.value
      exp.value = Number(data.exp) || 0
      // 上限只由当前境界本层需求决定，忽略存档里可能过时的 expMax
      syncExpMaxFromRealm()
      if (exp.value > expMax.value) exp.value = expMax.value
      rank.value = data.rank || rank.value
      sect.value = data.sect || ''
      sectId.value = data.sectId || ''
      const rawBag = Array.isArray(data.bag) ? data.bag : []
      const migratedBag = migrateBagItems(rawBag)
      bag.value = migratedBag
      if (
        bagFilter.value !== '全部' &&
        !['丹药', '功法', '法术', '矿石', '药材', '材料', '法宝'].includes(bagFilter.value)
      ) {
        bagFilter.value = '全部'
      }
      pets.value = Array.isArray(data.pets) ? data.pets : []
      normalizePetBattleStatus()
      seenSpiritBeasts.value = Array.isArray(data.seenSpiritBeasts)
        ? data.seenSpiritBeasts
        : pets.value.map((item) => item.name)
      injured.value = Boolean(data.injured)
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
      if (data.techniqueProficiency && typeof data.techniqueProficiency === 'object') {
        const next = { ...data.techniqueProficiency } as Record<string, number>
        if (typeof next['疾风步'] === 'number' && next['疾风决'] == null) {
          next['疾风决'] = next['疾风步']
          delete next['疾风步']
        } else if (typeof next['疾风步'] === 'number') {
          delete next['疾风步']
        }
        techniqueProficiency.value = next
      } else {
        techniqueProficiency.value = {}
      }
      mineDigsUsed.value = data.mineDigsUsed ?? 0
      mineDigDate.value = data.mineDigDate || ''
      if (data.intimacyMap && typeof data.intimacyMap === 'object') {
        const next: Record<string, number> = {}
        Object.entries(data.intimacyMap as Record<string, number>).forEach(([k, v]) => {
          next[k] = clampIntimacy(Number(v) || 0)
        })
        intimacyMap.value = next
      } else {
        intimacyMap.value = {}
      }
      if (data.dualPartner && typeof data.dualPartner === 'object' && data.dualPartner.id) {
        dualPartner.value = {
          id: String(data.dualPartner.id),
          name: String(data.dualPartner.name || '无名'),
          gender: data.dualPartner.gender === '女' ? '女' : '男',
          attitude:
            typeof data.dualPartner.attitude === 'string' ? data.dualPartner.attitude : undefined
        }
      } else {
        dualPartner.value = null
      }
      lastStipendMonthKey.value =
        typeof data.lastStipendMonthKey === 'string' ? data.lastStipendMonthKey : ''
      if (data.cliff && typeof data.cliff === 'object') {
        cliff.value = {
          active: Boolean(data.cliff.active),
          startedAt: Number(data.cliff.startedAt) || 0,
          endsAt: Number(data.cliff.endsAt) || 0,
          reason: String(data.cliff.reason || ''),
          targetName: String(data.cliff.targetName || ''),
          targetGroup: String(data.cliff.targetGroup || ''),
          lastEncounterAt:
            Number(data.cliff.lastEncounterAt) ||
            Number(data.cliff.startedAt) ||
            0,
          encounterLogs: Array.isArray(data.cliff.encounterLogs)
            ? data.cliff.encounterLogs.map(String).slice(0, 20)
            : []
        }
        clearCliffIfExpired()
      } else {
        cliff.value = null
      }
      ensureMineDay()
      const sectStore = useSectStore()
      if (sectId.value || sect.value) {
        sectStore.applyJoinedSect(sectId.value || sect.value)
      }
      applyUiThemeForSect(sectId.value || null)
      claimMonthlyStipend()
      // 旧存档：已有法术但无熟练度记录时补 0（初窥门径）
      bag.value
        .filter((item) => item.category === '法术')
        .forEach((item) => ensureSpellProficiency(item.name))
      bag.value
        .filter((item) => item.category === '功法')
        .forEach((item) => ensureTechniqueProficiency(item.name))
      sectStore.syncLearnedFromBag(
        bag.value,
        activeTechniqueId.value || null,
        spellProficiency.value,
        techniqueProficiency.value
      )
      activeTechniqueId.value = sectStore.activeTechniqueId || ''
      if (bagMigrationChanged(rawBag, migratedBag)) {
        persist()
      }
      return true
    } catch {
      return false
    }
  }

  /** 创建角色：写入姓名性别，随机灵根与悟性；法宝/灵宠/功法/宗门初始为空 */
  function createCharacter(inputName: string, inputGender: Gender) {
    const rolled = rollRootBones()
    const primary = pickPrimaryRoot(rolled)

    name.value = inputName.trim()
    gender.value = inputGender
    roots.value = rolled
    rootBone.value = formatPrimaryRoot(primary)
    comprehension.value = rollComprehension()
    realmState.value = createInitialRealm()
    power.value = 10
    spiritStones.value = 100
    contribution.value = 0
    exp.value = 0
    syncExpMaxFromRealm()
    rank.value = '散修'
    sect.value = ''
    sectId.value = ''
    bag.value = []
    pets.value = []
    seenSpiritBeasts.value = []
    injured.value = false
    activeTechniqueId.value = ''
    spellProficiency.value = {}
    techniqueProficiency.value = {}
    mineDigsUsed.value = 0
    mineDigDate.value = todayKey()
    intimacyMap.value = {}
    dualPartner.value = null
    lastStipendMonthKey.value = ''
    pendingStipendNotice.value = ''
    cliff.value = null
    created.value = true
    useTreasureStore().resetOwned()
    useSectStore().resetOwnedTechniques()
    useSectStore().clearJoinedSect()
    applyUiTheme('modao')
    persist()
  }

  /** 身死道消：清空存档，回到创角 */
  function wipeOnDeath() {
    created.value = false
    name.value = ''
    gender.value = '男'
    roots.value = []
    rootBone.value = '未知'
    comprehension.value = 50
    realmState.value = createInitialRealm()
    power.value = 1000
    spiritStones.value = 100
    contribution.value = 0
    exp.value = 0
    syncExpMaxFromRealm()
    rank.value = '散修'
    sect.value = ''
    sectId.value = ''
    bag.value = []
    pets.value = []
    seenSpiritBeasts.value = []
    injured.value = false
    activeTechniqueId.value = ''
    spellProficiency.value = {}
    techniqueProficiency.value = {}
    mineDigsUsed.value = 0
    mineDigDate.value = ''
    intimacyMap.value = {}
    dualPartner.value = null
    lastStipendMonthKey.value = ''
    pendingStipendNotice.value = ''
    cliff.value = null
    bagFilter.value = '全部'
    useTreasureStore().resetOwned()
    useSectStore().resetOwnedTechniques()
    useSectStore().clearJoinedSect()
    try {
      Taro.removeStorageSync(STORAGE_KEY)
    } catch {
      persist()
    }
    applyUiTheme('modao')
  }

  function setInjured(value: boolean) {
    injured.value = value
    if (value) persist()
  }

  /** 洞府静养疗伤（免费） */
  function healInjuryAtCave() {
    if (!injured.value) return { ok: false as const, reason: 'healthy' as const }
    injured.value = false
    persist()
    return { ok: true as const }
  }

  /** 服用丹药疗伤；成功消耗 1 颗并清除受伤 */
  function healInjuryWithPill(pillName: string) {
    if (!injured.value) return { ok: false as const, reason: 'healthy' as const }
    if (!canHealInjury(pillName)) {
      return { ok: false as const, reason: 'invalid_pill' as const }
    }
    if (!removeBagItem(pillName, '丹药', 1)) {
      return { ok: false as const, reason: 'no_pill' as const }
    }
    injured.value = false
    persist()
    return { ok: true as const, pillName }
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
      ensureTechniqueProficiency(technique.name)
      activeTechniqueId.value = technique.id
    }
    if (spell) {
      sectStore.learnSpell(spell.id)
      addBagItem(spell.name, '法术')
      ensureSpellProficiency(spell.name)
    }

    sectStore.syncLearnedFromBag(
      bag.value,
      activeTechniqueId.value || null,
      spellProficiency.value,
      techniqueProficiency.value
    )
    const stipend = claimMonthlyStipend()
    applyUiThemeForSect(id)
    persist()
    return {
      ok: true as const,
      techniqueName: technique?.name || '',
      spellName: spell?.name || '',
      stipendAmount: stipend?.amount || 0,
      stipendNotice: stipend?.notice || ''
    }
  }

  /** 同时仅允许一只灵兽出战；允许全部待命 */
  function normalizePetBattleStatus() {
    const list = pets.value
    if (!list.length) return
    const actives = list.filter((item) => item.status === '出战')
    if (actives.length <= 1) return
    const keepId = actives[0].id
    list.forEach((item) => {
      if (item.id !== keepId) item.status = '待命'
    })
  }

  const activePet = computed(() => pets.value.find((item) => item.status === '出战') || null)

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
    normalizePetBattleStatus()
    return pet
  }

  /** 指定灵兽出战（同时仅一只） */
  function setActivePet(id: string) {
    const target = pets.value.find((item) => item.id === id)
    if (!target) return false
    pets.value.forEach((item) => {
      item.status = item.id === id ? '出战' : '待命'
    })
    persist()
    return true
  }

  /** 取消出战，全部待命 */
  function clearActivePet() {
    if (!pets.value.some((item) => item.status === '出战')) return false
    pets.value.forEach((item) => {
      item.status = '待命'
    })
    persist()
    return true
  }

  function removePet(id: string) {
    const index = pets.value.findIndex((item) => item.id === id)
    if (index < 0) return null
    const [removed] = pets.value.splice(index, 1)
    if (removed.status === '出战') {
      normalizePetBattleStatus()
    }
    return removed
  }

  const hasSect = computed(() => !!sect.value)

  /** 将背包矿石/药材/历练材料重新归类并写回存档 */
  function reclassifyBagMaterials() {
    const before = bag.value.slice()
    const after = migrateBagItems(before)
    bag.value = after
    if (bagMigrationChanged(before, after)) {
      persist()
      return true
    }
    return false
  }

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
    getBreakthroughPreview,
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
    techniqueProficiency,
    getTechniqueProficiency,
    getTechniqueProficiencyDetail,
    ensureTechniqueProficiency,
    addTechniqueProficiency,
    pets,
    activePet,
    injured,
    combatPowerHealthy,
    seenSpiritBeasts,
    ownedPet,
    markSpiritBeastSeen,
    hasSeenSpiritBeast,
    addPet,
    setActivePet,
    clearActivePet,
    removePet,
    setInjured,
    healInjuryAtCave,
    healInjuryWithPill,
    wipeOnDeath,
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
    intimacyMap,
    dualPartner,
    getIntimacy,
    setIntimacy,
    addIntimacy,
    ensureIntimacySeed,
    setDualPartner,
    clearDualPartner,
    lastStipendMonthKey,
    claimMonthlyStipend,
    ensureMonthlyStipend,
    cliff,
    onCliff,
    cliffRemainMs,
    startCliffPunishment,
    clearCliffIfExpired,
    tickCliffEncounters,
    applyDeathDuelLoot,
    createCharacter,
    joinSect,
    reclassifyBagMaterials,
    hydrate,
    persist
  }
})
