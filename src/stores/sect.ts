import Taro from '@tarojs/taro'
import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { getSectMembers, type CatalogMember } from '../constants/member-catalog'
import { getGameDayKey } from '../constants/game-time'
import {
  DAILY_MISSION_COUNT,
  hydrateMissionFromCatalog,
  isMissionAvailableForFacilities,
  isMissionObjectiveMet,
  rollOneMission,
  type DailyMission,
  type MissionObjectiveKind
} from '../constants/mission-catalog'
import {
  rollRecruitDisciples,
  type RecruitedMember
} from '../constants/recruit-disciple'
import {
  getSectFacilities,
  type SectFacility
} from '../constants/sect-facilities'
import { getSectOption, type SectId } from '../constants/sects'
import {
  formatSpellProficiencyLabel,
  getSpellProficiencyInfo
} from '../constants/spell-proficiency'
import {
  formatTechniqueProficiencyLabel,
  getTechniqueProficiencyInfo
} from '../constants/technique-proficiency'
import { SPELL_CATALOG } from '../constants/spell-catalog'
import {
  isTechniqueAvailableInFaction,
  TECHNIQUE_CATALOG
} from '../constants/technique-catalog'

export interface SectTechnique {
  id: string
  name: string
  grade: string
  gradeTier: string
  type: string
  /** 灵根属性九种：金木水火土风冰雷无属性 */
  attr: string
  school: string
  realmLabel: string
  realm: string
  effect: string
  origin: string
  cost: number
  owned: boolean
  /** 当前正在修习（全局仅一门） */
  active: boolean
  /** 熟练度点数；未拥有为 0 */
  proficiency: number
  proficiencyName: string
  proficiencyEffect: string
  proficiencyLabel: string
  /** 当前阶进度，如 45/99；满阶为点数 */
  proficiencyProgress: string
  /** 战力加成（仅 active 时计入玩家战力） */
  powerBonus: number
}

export interface SectSpell {
  id: string
  name: string
  grade: string
  gradeTier: string
  attr: string
  type: string
  effect: string
  realm: string
  cost: number
  owned: boolean
  /** 熟练度点数；未拥有为 0 */
  proficiency: number
  /** 熟练度阶位 1～6；未拥有为 0（炼制成功率用，兼容旧 level 字段） */
  level: number
  proficiencyName: string
  proficiencyEffect: string
  proficiencyLabel: string
  /** 当前阶进度，如 45/99；满阶为点数 */
  proficiencyProgress: string
}

function buildTechniques(
  ownedNames: Set<string> = new Set(),
  activeId: string | null = null,
  proficiencyMap: Record<string, number> = {},
  sectFaction: string = ''
): SectTechnique[] {
  let resolvedActive: string | null = null
  if (activeId) {
    const candidate = TECHNIQUE_CATALOG.find((item) => item.id === activeId)
    if (candidate && ownedNames.has(candidate.name)) resolvedActive = activeId
  }
  if (!resolvedActive) {
    resolvedActive = TECHNIQUE_CATALOG.find((item) => ownedNames.has(item.name))?.id || null
  }
  return TECHNIQUE_CATALOG.filter((item) => {
    if (ownedNames.has(item.name)) return true
    return isTechniqueAvailableInFaction(item, sectFaction)
  }).map((item) => {
    const owned = ownedNames.has(item.name)
    const points = owned
      ? Math.max(0, Math.round((proficiencyMap[item.name] ?? 0) * 10) / 10)
      : 0
    const info = getTechniqueProficiencyInfo(points)
    return {
      id: item.id,
      name: item.name,
      grade: item.grade,
      gradeTier: item.gradeTier,
      type: item.type,
      attr: item.attr || item.type,
      school: item.school,
      realmLabel: item.realmLabel,
      realm: item.realm,
      effect: item.effect,
      origin: item.origin,
      cost: item.cost,
      owned,
      active: item.id === resolvedActive,
      proficiency: owned ? points : 0,
      proficiencyName: owned ? info.name : '',
      proficiencyEffect: owned ? info.effect : '',
      proficiencyLabel: owned ? formatTechniqueProficiencyLabel(points) : '',
      proficiencyProgress: owned ? info.progressText : '',
      powerBonus: owned ? info.powerBonus : 0
    }
  })
}

function buildSpells(
  ownedNames: Set<string> = new Set(),
  proficiencyMap: Record<string, number> = {}
): SectSpell[] {
  return SPELL_CATALOG.map((item) => {
    const owned = ownedNames.has(item.name)
    const points = owned
      ? Math.max(0, Math.round((proficiencyMap[item.name] ?? 0) * 10) / 10)
      : 0
    const info = getSpellProficiencyInfo(points)
    return {
      id: item.id,
      name: item.name,
      grade: item.grade,
      gradeTier: item.gradeTier,
      attr: item.attr,
      type: item.type,
      effect: item.effect,
      realm: item.realm,
      cost: item.cost,
      owned,
      proficiency: owned ? points : 0,
      level: owned ? info.tier : 0,
      proficiencyName: owned ? info.name : '',
      proficiencyEffect: owned ? info.effect : '',
      proficiencyLabel: owned ? formatSpellProficiencyLabel(points) : '',
      proficiencyProgress: owned ? info.progressText : ''
    }
  })
}

const MISSION_STORAGE_KEY = 'cultivation_daily_missions'


export type Facility = SectFacility

export type Mission = DailyMission

export type Member = CatalogMember & {
  self?: boolean
  recruited?: boolean
  rootBone?: string
  roots?: RecruitedMember['roots']
}

const RECRUITED_STORAGE_KEY = 'sect-recruited-members-v1'

export const useSectStore = defineStore('sect', () => {
  const joined = ref(false)
  const sectId = ref<SectId | ''>('')
  const name = ref('无')
  const tag = ref('')
  const desc = ref('尚未加入任何宗门')
  const base = ref('')
  /** 势力等级：三流 / 二流 / 一流 / 圣地 */
  const tier = ref('')
  /** 派系：正道 / 魔门 / 妖族 */
  const faction = ref('')
  const level = ref(1)
  const disciples = ref(0)
  const veinLevel = ref(1)
  const prestige = ref(0)
  const caveLevel = ref(1)
  const spiritDensity = ref(30)
  const cultivateBonus = ref(0)
  const gatherSpeed = ref(1)

  const facilities = computed(() => getSectFacilities(sectId.value || null))
  const facilityKeys = computed(() => facilities.value.map((item) => item.key))

  const missions = ref<DailyMission[]>([])
  const missionDate = ref('')
  /** 今日累计完成数（无上限，仅统计） */
  const missionsCompletedToday = ref(0)

  const members = ref<Member[]>([])
  /** 坊市招收等额外弟子（按宗门持久化，避免 hydrate 被名录覆盖） */
  const recruitedBySect = ref<Record<string, RecruitedMember[]>>({})

  const visitTargetId = ref('')

  function persistRecruited() {
    try {
      Taro.setStorageSync(RECRUITED_STORAGE_KEY, recruitedBySect.value)
    } catch {
      // ignore
    }
  }

  function hydrateRecruited() {
    try {
      const data = Taro.getStorageSync(RECRUITED_STORAGE_KEY)
      if (data && typeof data === 'object' && !Array.isArray(data)) {
        recruitedBySect.value = data as Record<string, RecruitedMember[]>
      }
    } catch {
      // ignore
    }
  }

  function recruitedForCurrentSect() {
    const id = sectId.value
    if (!id) return [] as RecruitedMember[]
    return (recruitedBySect.value[id] || []).map((item) => ({ ...item }))
  }

  function mergeMembersWithRecruited(catalog: CatalogMember[]) {
    const extras = recruitedForCurrentSect()
    const seen = new Set(catalog.map((item) => item.id))
    const merged = catalog.map((item) => ({ ...item }))
    extras.forEach((item) => {
      if (seen.has(item.id)) return
      seen.add(item.id)
      merged.push({ ...item })
    })
    return merged
  }

  const memberStats = computed(() => {
    const list = members.value.filter((item) => !item.self)
    const count = (group: string) => list.filter((item) => item.group === group).length
    return {
      宗主: count('宗主'),
      长老: count('长老'),
      执事: count('执事'),
      亲传弟子: count('亲传弟子'),
      内门弟子: count('内门弟子'),
      外门弟子: count('外门弟子'),
      杂役弟子: count('杂役弟子'),
      total: list.length
    }
  })

  const activeMission = computed(
    () => missions.value.find((item) => item.accepted && !item.done) || null
  )

  const hasActiveMission = computed(() => !!activeMission.value)

  const missionStats = computed(() => {
    const available = missions.value.filter((item) => !item.done && !item.accepted).length
    const contribHint = missions.value
      .filter((item) => !item.done)
      .reduce((sum, item) => {
        const match = item.reward.match(/贡献\s*\+(\d+)/)
        return sum + (match ? Number(match[1]) : 0)
      }, 0)
    return {
      doneCount: missionsCompletedToday.value,
      pending: available,
      active: hasActiveMission.value ? 1 : 0,
      total: missions.value.length || DAILY_MISSION_COUNT,
      contribHint
    }
  })

  const techniques = ref<SectTechnique[]>(buildTechniques())
  const spells = ref<SectSpell[]>(buildSpells())
  const activeTechniqueId = computed(() => techniques.value.find((item) => item.active)?.id || '')
  const activeTechnique = computed(() => techniques.value.find((item) => item.active) || null)
  const ownedSpellCount = computed(() => spells.value.filter((item) => item.owned).length)

  function hasOwnedSpell(nameOrId: string) {
    return spells.value.some(
      (item) => item.owned && (item.name === nameOrId || item.id === nameOrId)
    )
  }

  /** 返回熟练度阶位 1～6（炼制用）；未拥有为 0 */
  function getSpellLevel(nameOrId: string) {
    const item = spells.value.find(
      (spell) => spell.name === nameOrId || spell.id === nameOrId
    )
    if (!item?.owned) return 0
    return item.level || 1
  }

  function getSpellProficiency(nameOrId: string) {
    const item = spells.value.find(
      (spell) => spell.name === nameOrId || spell.id === nameOrId
    )
    if (!item?.owned) return 0
    return item.proficiency || 0
  }

  const pills = ref([
    {
      id: 'd1',
      name: '聚气丹',
      grade: '一阶',
      cost: '聚气草 ×2 · 灵石 ×50',
      effect: '服用后修为 +200'
    },
    {
      id: 'd2',
      name: '回元丹',
      grade: '二阶',
      cost: '聚气草 ×3 · 妖兽皮 ×1 · 灵石 ×80',
      effect: '服用后灵力 +300'
    },
    {
      id: 'd3',
      name: '筑基丹',
      grade: '三阶',
      cost: '蛇胆 ×2 · 聚气草 ×5 · 灵石 ×200',
      effect: '突破筑基所需'
    }
  ])

  const sellPills = ref([
    { id: 'sp1', name: '聚气丹', detail: '持有 12 · 收购 40 灵石/个' },
    { id: 'sp2', name: '回元丹', detail: '持有 6 · 收购 80 灵石/个' },
    { id: 'sp3', name: '筑基丹', detail: '持有 1 · 收购 300 灵石/个' }
  ])

  const buyPills = ref([
    { id: 'bp1', name: '凝神丹', detail: '冥想效率 +10%', price: 80 },
    { id: 'bp2', name: '蕴灵丹', detail: '灵力上限 +50', price: 150 },
    { id: 'bp3', name: '洗髓丹', detail: '根骨 +1', price: 500 }
  ])

  const mines = ref([
    { id: 'mi1', name: '玄铁矿脉', detail: '产出 玄铁 ×2 · 剩余 3/3' },
    { id: 'mi2', name: '灵石矿脉', detail: '产出 灵石 ×50 · 剩余 3/3' },
    { id: 'mi3', name: '赤铁矿脉', detail: '产出 赤铁精 ×1 · 剩余 1/3' }
  ])

  const gardens = ref([
    { id: 'ga1', name: '聚气草田', detail: '聚气草 · 成熟剩余 2 时辰' },
    { id: 'ga2', name: '灵参田', detail: '灵参 · 成熟剩余 1 日' },
    { id: 'ga3', name: '冰心花田', detail: '冰心花 · 成熟剩余 3 日' }
  ])

  const towerFloors = ref([
    { id: 'tf1', name: '一层 · 青木蛇', detail: 'Lv.26 · 奖励 灵石 ×40 · 贡献 +20', done: true },
    { id: 'tf2', name: '二层 · 赤炎狼', detail: 'Lv.24 · 奖励 妖兽皮 ×2 · 贡献 +30', done: true },
    { id: 'tf3', name: '三层 · 玄甲龟', detail: 'Lv.28 · 奖励 玄铁 ×2 · 贡献 +40', done: true },
    { id: 'tf4', name: '四层 · 紫电貂', detail: 'Lv.35 · 奖励 灵石 ×100 · 贡献 +60', done: false }
  ])

  function setVisitTarget(id: string) {
    visitTargetId.value = id
  }

  function persistMissions() {
    Taro.setStorageSync(MISSION_STORAGE_KEY, {
      date: missionDate.value,
      missions: missions.value,
      completedToday: missionsCompletedToday.value
    })
  }

  /**
   * 按游戏日刷新任务堂（现实 6 小时 = 1 日）。
   * 未完成任务（进行中 / 未接取）一律保留；已完成移除；空位补新。
   */
  function ensureDailyMissions() {
    const day = getGameDayKey()
    if (missionDate.value !== day) {
      missions.value = missions.value.filter((item) => !item.done)
      missionDate.value = day
      missionsCompletedToday.value = 0
    }
    refillMissionBoard()
    persistMissions()
  }

  /** 去掉已完成与当前宗门不具备设施的任务；保留未完成；空位补新 */
  function refillMissionBoard() {
    // 宗门尚未写入（存档 hydrate 早于 applyJoinedSect）时不做设施门禁，避免误删存档任务
    const keys = sectId.value ? facilityKeys.value : null
    missions.value = missions.value.filter((item) => {
      if (item.done) return false
      return isMissionAvailableForFacilities(item, keys)
    })
    const excludeIds = missions.value.map((item) => item.id)
    while (missions.value.length < DAILY_MISSION_COUNT) {
      const next = rollOneMission(excludeIds, keys)
      excludeIds.push(next.id)
      missions.value.push(next)
    }
  }

  function normalizeMission(item: DailyMission): DailyMission | null {
    return hydrateMissionFromCatalog({
      ...item,
      done: !!item.done,
      accepted: !!item.accepted && !item.done,
      progress: Math.max(0, Number(item.progress) || 0),
      meta: item.meta && typeof item.meta === 'object' ? { ...item.meta } : {}
    })
  }

  function hydrateMissions() {
    try {
      const data = Taro.getStorageSync(MISSION_STORAGE_KEY)
      if (data?.date && Array.isArray(data.missions)) {
        missionDate.value = data.date
        missionsCompletedToday.value = Number(data.completedToday) || 0
        // 奇遇 / 已移除任务：用目录回填，无效则丢弃
        missions.value = data.missions
          .map((item: DailyMission) => normalizeMission(item))
          .filter((item: DailyMission | null): item is DailyMission => !!item && item.tag !== '奇遇')
        // 兼容脏数据：同时只保留一个进行中任务
        const actives = missions.value.filter((item) => item.accepted && !item.done)
        if (actives.length > 1) {
          actives.slice(1).forEach((item) => {
            item.accepted = false
          })
        }
        if (missionDate.value !== getGameDayKey()) {
          missionsCompletedToday.value = 0
        }
      }
    } catch {
      // ignore
    }
    ensureDailyMissions()
  }

  function assignEscortMembers(item: DailyMission) {
    const pool = members.value.filter((m) => !m.self)
    if (pool.length < 2) {
      const only = pool[0]
      item.meta = {
        ...(item.meta || {}),
        pickupMemberId: only?.id || '',
        deliverMemberId: only?.id || '',
        pickupMemberName: only?.name || '',
        deliverMemberName: only?.name || '',
        escortPhase: 'none'
      }
      return
    }
    const shuffled = [...pool].sort(() => Math.random() - 0.5)
    const pickup = shuffled[0]
    const deliver = shuffled[1]
    item.meta = {
      ...(item.meta || {}),
      pickupMemberId: pickup.id,
      deliverMemberId: deliver.id,
      pickupMemberName: pickup.name,
      deliverMemberName: deliver.name,
      escortPhase: 'none'
    }
  }

  /** 找出卧底：随机指定一名非自身弟子 */
  function assignMoleMember(item: DailyMission) {
    const pool = members.value.filter((m) => !m.self)
    if (!pool.length) {
      item.meta = { ...(item.meta || {}), moleMemberId: '', moleMemberName: '' }
      return
    }
    const pick = pool[Math.floor(Math.random() * pool.length)]
    item.meta = {
      ...(item.meta || {}),
      moleMemberId: pick.id,
      moleMemberName: pick.name
    }
  }

  /** 领取任务（同时最多一个，无每日次数上限）；成功返回任务 */
  function acceptMission(instanceId: string) {
    ensureDailyMissions()
    if (hasActiveMission.value) return null
    const item = missions.value.find((mission) => mission.instanceId === instanceId)
    if (!item || item.done || item.accepted) return null
    item.accepted = true
    item.progress = 0
    item.meta = {}
    const kind = item.objective?.kind
    if (kind === 'escort_deliver' || kind === 'pill_deliver') {
      assignEscortMembers(item)
    }
    if (kind === 'find_mole') {
      assignMoleMember(item)
    }
    if (kind === 'market_talk') {
      item.meta = { ...(item.meta || {}), marketTargetName: '散修' }
    }
    if (kind === 'rescue_talk') {
      item.meta = { ...(item.meta || {}), rescueName: '被困弟子' }
    }
    persistMissions()
    return item
  }

  /** 完成进行中任务；需达成完成条件；完成后补新任务上板 */
  function completeMission(instanceId?: string) {
    ensureDailyMissions()
    const id = instanceId || activeMission.value?.instanceId
    if (!id) return null
    const index = missions.value.findIndex((mission) => mission.instanceId === id)
    if (index < 0) return null
    const item = missions.value[index]
    if (!item.accepted || item.done) return null
    if (!isMissionObjectiveMet(item)) return null

    const finished = { ...item, done: true, accepted: false }
    missionsCompletedToday.value += 1
    const excludeIds = missions.value
      .filter((_, i) => i !== index)
      .map((mission) => mission.id)
    missions.value[index] = rollOneMission(excludeIds, sectId.value ? facilityKeys.value : null)
    persistMissions()
    return finished
  }

  /** 取消进行中任务，可再领取其他任务 */
  function cancelMission(instanceId?: string) {
    ensureDailyMissions()
    const id = instanceId || activeMission.value?.instanceId
    if (!id) return false
    const item = missions.value.find((mission) => mission.instanceId === id)
    if (!item || !item.accepted || item.done) return false
    item.accepted = false
    item.progress = 0
    item.meta = {}
    persistMissions()
    return true
  }

  /**
   * 上报任务进度。amount 默认 +1；若已达目标则封顶。
   * 返回是否命中进行中任务。
   */
  function reportMissionProgress(
    kind: MissionObjectiveKind,
    amount = 1,
    extra?: Record<string, string | number | boolean>
  ) {
    const item = activeMission.value
    if (!item?.objective || item.objective.kind !== kind) return false
    const target = Math.max(1, item.objective.target)
    const next = Math.min(target, (item.progress || 0) + Math.max(0, amount))
    item.progress = next
    if (extra) item.meta = { ...(item.meta || {}), ...extra }
    persistMissions()
    return true
  }

  /** 设置护送阶段：none → holding → done */
  function advanceEscortPhase(phase: 'holding' | 'done') {
    const item = activeMission.value
    if (!item?.objective) return false
    if (item.objective.kind !== 'escort_deliver' && item.objective.kind !== 'pill_deliver') {
      return false
    }
    item.meta = { ...(item.meta || {}), escortPhase: phase }
    if (phase === 'holding') item.progress = Math.max(item.progress || 0, 1)
    if (phase === 'done') item.progress = item.objective.target
    persistMissions()
    return true
  }

  /** @deprecated 使用 acceptMission / completeMission */
  function claimMission(instanceId: string) {
    return completeMission(instanceId)
  }

  function resetOwnedTechniques() {
    techniques.value = buildTechniques(new Set(), null, {}, faction.value)
    spells.value = buildSpells()
  }

  /** 从背包同步已兑换的功法 / 法术（功法仅一门为修习中） */
  function syncLearnedFromBag(
    bagItems: Array<{ name: string; category: string }>,
    preferredActiveId?: string | null,
    spellProficiencyMap: Record<string, number> = {},
    techniqueProficiencyMap: Record<string, number> = {}
  ) {
    const techNames = new Set(
      bagItems.filter((item) => item.category === '功法').map((item) => item.name)
    )
    const spellNames = new Set(
      bagItems.filter((item) => item.category === '法术').map((item) => item.name)
    )
    const currentActive = preferredActiveId || activeTechniqueId.value || null
    techniques.value = buildTechniques(
      techNames,
      currentActive,
      techniqueProficiencyMap,
      faction.value
    )
    spells.value = buildSpells(spellNames, spellProficiencyMap)
  }

  function applyTechniqueProficiency(proficiencyMap: Record<string, number>) {
    techniques.value = techniques.value.map((item) => {
      if (!item.owned) {
        return {
          ...item,
          proficiency: 0,
          proficiencyName: '',
          proficiencyEffect: '',
          proficiencyLabel: '',
          proficiencyProgress: '',
          powerBonus: 0
        }
      }
      const points = Math.max(
        0,
        Math.round((proficiencyMap[item.name] ?? item.proficiency ?? 0) * 10) / 10
      )
      const info = getTechniqueProficiencyInfo(points)
      return {
        ...item,
        proficiency: points,
        proficiencyName: info.name,
        proficiencyEffect: info.effect,
        proficiencyLabel: formatTechniqueProficiencyLabel(points),
        proficiencyProgress: info.progressText,
        powerBonus: info.powerBonus
      }
    })
  }

  function applySpellProficiency(proficiencyMap: Record<string, number>) {
    spells.value = spells.value.map((item) => {
      if (!item.owned) {
        return {
          ...item,
          proficiency: 0,
          level: 0,
          proficiencyName: '',
          proficiencyEffect: '',
          proficiencyLabel: '',
          proficiencyProgress: ''
        }
      }
      const points = Math.max(
        0,
        Math.round((proficiencyMap[item.name] ?? item.proficiency ?? 0) * 10) / 10
      )
      const info = getSpellProficiencyInfo(points)
      return {
        ...item,
        proficiency: points,
        level: info.tier,
        proficiencyName: info.name,
        proficiencyEffect: info.effect,
        proficiencyLabel: formatSpellProficiencyLabel(points),
        proficiencyProgress: info.progressText
      }
    })
  }

  /** @deprecated 使用 applySpellProficiency */
  function applySpellLevels(proficiencyMap: Record<string, number>) {
    applySpellProficiency(proficiencyMap)
  }

  /** 兑换 / 收录功法，并设为当前唯一修习功法 */
  function learnTechnique(id: string) {
    const item = techniques.value.find((tech) => tech.id === id)
    if (!item) return false
    const info = getTechniqueProficiencyInfo(item.proficiency || 0)
    item.owned = true
    if (!item.proficiencyName) {
      item.proficiency = 0
      item.proficiencyName = info.name
      item.proficiencyEffect = info.effect
      item.proficiencyLabel = formatTechniqueProficiencyLabel(0)
      item.proficiencyProgress = info.progressText
      item.powerBonus = info.powerBonus
    }
    techniques.value.forEach((tech) => {
      tech.active = tech.id === id
    })
    return true
  }

  /** 在已收录功法中改修（仍只能一门生效） */
  function setActiveTechnique(id: string) {
    const item = techniques.value.find((tech) => tech.id === id)
    if (!item || !item.owned) return false
    techniques.value.forEach((tech) => {
      tech.active = tech.id === id
    })
    return true
  }

  /** 法术可同时修习多门 */
  function learnSpell(id: string) {
    const item = spells.value.find((spell) => spell.id === id)
    if (!item || item.owned) return false
    const info = getSpellProficiencyInfo(0)
    item.owned = true
    item.proficiency = 0
    item.level = info.tier
    item.proficiencyName = info.name
    item.proficiencyEffect = info.effect
    item.proficiencyLabel = formatSpellProficiencyLabel(0)
    item.proficiencyProgress = info.progressText
    return true
  }

  /** 坊市招收弟子：写入名录并推进任务进度；返回新弟子 */
  function recruitMarketDisciples(count = 3) {
    if (!joined.value || !sectId.value) return null
    const mission = activeMission.value
    if (!mission || mission.objective?.kind !== 'recruit_disciples') return null
    if (isMissionObjectiveMet(mission)) return null

    const existingNames = members.value.map((item) => item.name)
    const created = rollRecruitDisciples(sectId.value, count, existingNames)
    const sid = sectId.value
    const prev = recruitedBySect.value[sid] || []
    recruitedBySect.value = {
      ...recruitedBySect.value,
      [sid]: [...prev, ...created]
    }
    members.value = [...members.value, ...created]
    disciples.value = Math.max(disciples.value, members.value.length + 100)
    persistRecruited()
    reportMissionProgress('recruit_disciples', 1)
    return created
  }

  function clearJoinedSect() {
    joined.value = false
    sectId.value = ''
    name.value = '无'
    tag.value = ''
    desc.value = '尚未加入任何宗门'
    base.value = ''
    tier.value = ''
    faction.value = ''
    level.value = 1
    disciples.value = 0
    veinLevel.value = 1
    prestige.value = 0
    caveLevel.value = 1
    spiritDensity.value = 30
    cultivateBonus.value = 0
    gatherSpeed.value = 1
    members.value = []
    visitTargetId.value = ''
    missions.value = []
    missionDate.value = ''
    missionsCompletedToday.value = 0
    persistMissions()
  }

  function applyJoinedSect(idOrName: string) {
    const option = getSectOption(idOrName)
    if (!option) return
    joined.value = true
    sectId.value = option.id
    name.value = option.name
    tag.value = option.tag
    desc.value = option.desc
    base.value = option.base
    tier.value = option.tier
    faction.value = option.faction
    level.value = 1
    const catalog = getSectMembers(option.id)
    members.value = mergeMembersWithRecruited(catalog)
    disciples.value = Math.max(128, members.value.length + 100)
    veinLevel.value = 2
    prestige.value = 100
    caveLevel.value = 1
    spiritDensity.value = 45
    cultivateBonus.value = 5
    gatherSpeed.value = 1.1
    visitTargetId.value = members.value[0]?.id || ''
    ensureDailyMissions()
  }

  hydrateRecruited()
  hydrateMissions()

  return {
    joined,
    sectId,
    name,
    tag,
    desc,
    base,
    tier,
    faction,
    level,
    disciples,
    veinLevel,
    prestige,
    caveLevel,
    spiritDensity,
    cultivateBonus,
    gatherSpeed,
    facilities,
    missions,
    missionDate,
    missionsCompletedToday,
    missionStats,
    activeMission,
    hasActiveMission,
    members,
    memberStats,
    visitTargetId,
    techniques,
    spells,
    activeTechniqueId,
    activeTechnique,
    ownedSpellCount,
    hasOwnedSpell,
    getSpellLevel,
    getSpellProficiency,
    applySpellProficiency,
    applySpellLevels,
    applyTechniqueProficiency,
    learnTechnique,
    setActiveTechnique,
    learnSpell,
    syncLearnedFromBag,
    pills,
    sellPills,
    buyPills,
    mines,
    gardens,
    towerFloors,
    setVisitTarget,
    ensureDailyMissions,
    hydrateMissions,
    acceptMission,
    completeMission,
    cancelMission,
    claimMission,
    reportMissionProgress,
    advanceEscortPhase,
    recruitMarketDisciples,
    resetOwnedTechniques,
    clearJoinedSect,
    applyJoinedSect
  }
})
