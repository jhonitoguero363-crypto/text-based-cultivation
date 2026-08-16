export type MissionTag = '每日' | '悬赏' | '周常' | '随机' | '奇遇'

export type MissionTagTone = 'jade' | 'hp' | 'gold' | 'mp' | 'muted'

/** 任务完成条件类型（程序判定） */
export type MissionObjectiveKind =
  | 'mine_dig'
  | 'collect_ore'
  | 'feed_pet'
  | 'irrigate'
  | 'forge_success'
  | 'escort_deliver'
  | 'pill_deliver'
  | 'technique_copy'
  | 'defeat_mo_xiu'
  | 'rescue_talk'
  | 'kill_beast'
  | 'spar'
  | 'capture_turn_in'
  | 'tower_guard'
  | 'market_talk'

export interface MissionObjective {
  kind: MissionObjectiveKind
  /** 目标次数 / 秒数等 */
  target: number
  /** 玩家可见的条件说明 */
  hint: string
  /** 推荐秘境地点名（用于刷怪 / 提示） */
  locationHint?: string
}

export interface CatalogMission {
  id: string
  name: string
  tag: MissionTag | string
  tagTone: MissionTagTone
  desc: string
  reward: string
  action: string
  /** 奇遇玩法说明 */
  playStyle?: string
  /**
   * 奇遇了结可能掉落的材料（顿号分隔，等概率抽 1 种）。
   * 空字符串表示待补充；补全后写入如「残卷、灵草」。
   */
  drops?: string
  /** 完成条件；奇遇可无 */
  objective?: MissionObjective
}

export interface DailyMission extends CatalogMission {
  /** 已完成并领取奖励 */
  done: boolean
  /** 已接取、进行中（同时最多一个） */
  accepted: boolean
  /** 当日实例 id，避免跨日冲突 */
  instanceId: string
  /** 当前进度 */
  progress?: number
  /** 护送/交谈等额外状态 */
  meta?: Record<string, string | number | boolean>
}

/** 每日展示任务数量 */
export const DAILY_MISSION_COUNT = 5

/** 历练探索触发奇遇的概率 */
export const ADVENTURE_ENCOUNTER_CHANCE = 0.28

function obj(
  kind: MissionObjectiveKind,
  target: number,
  hint: string,
  locationHint?: string
): MissionObjective {
  return locationHint ? { kind, target, hint, locationHint } : { kind, target, hint }
}

/** 宗门任务 + 历练奇遇总库（奇遇不进任务堂） */
export const MISSION_CATALOG: CatalogMission[] = [
  {
    id: 'ms-1',
    name: '挖掘灵矿',
    tag: '每日',
    tagTone: 'jade',
    desc: '前往青云矿洞挖掘灵矿 ×5',
    reward: '贡献 +30 · 灵石 ×50',
    action: '完成',
    objective: obj('mine_dig', 20, '矿洞挖矿次数 ≥20')
  },
  {
    id: 'ms-2',
    name: '修复护宗大阵',
    tag: '每日',
    tagTone: 'jade',
    desc: '收集阵法材料并修复宗门阵眼',
    reward: '贡献 +40 · 灵石 ×60',
    action: '完成',
    objective: obj('collect_ore', 5, '挖矿获得矿石材料 ≥5')
  },
  {
    id: 'ms-3',
    name: '饲养灵兽',
    tag: '每日',
    tagTone: 'jade',
    desc: '前往灵兽峰喂养灵宠 ×3',
    reward: '贡献 +25 · 灵宠经验 +100',
    action: '完成',
    objective: obj('feed_pet', 15, '灵兽阁喂养次数 ≥15（每 5 秒可喂一次）')
  },
  {
    id: 'ms-4',
    name: '灌溉灵田',
    tag: '每日',
    tagTone: 'jade',
    desc: '为宗门灵田灌溉灵泉 ×5',
    reward: '贡献 +25 · 灵草 ×5',
    action: '完成',
    objective: obj('irrigate', 15, '药园灌溉次数 ≥15（每 5 秒可灌一次）')
  },
  {
    id: 'ms-5',
    name: '炼器试炼',
    tag: '每日',
    tagTone: 'jade',
    desc: '炼制一件低阶法器',
    reward: '贡献 +50 · 炼器熟练度 +20',
    action: '完成',
    objective: obj('forge_success', 1, '器阁炼制成功 ≥1')
  },
  {
    id: 'ms-6',
    name: '护送灵材',
    tag: '每日',
    tagTone: 'jade',
    desc: '随机拜访一名弟子领取灵材，再送往另一名弟子',
    reward: '贡献 +20 · 灵石 ×50',
    action: '完成',
    objective: obj('escort_deliver', 2, '随机弟子领取 → 随机弟子送达（接取后显示人名）')
  },
  {
    id: 'ms-7',
    name: '清剿魔修',
    tag: '悬赏',
    tagTone: 'hp',
    desc: '前往黑风林击杀魔修 ×3',
    reward: '贡献 +150 · 灵石 ×150',
    action: '领取',
    objective: obj('defeat_mo_xiu', 3, '秘境击败「魔道修士」≥3', '黑风林')
  },
  {
    id: 'ms-8',
    name: '营救弟子',
    tag: '悬赏',
    tagTone: 'hp',
    desc: '救出被妖兽困住的宗门弟子',
    reward: '贡献 +100 · 声望 +20',
    action: '领取',
    objective: obj('rescue_talk', 1, '秘境偶遇被困弟子并交谈', '百兽岭')
  },
  {
    id: 'ms-9',
    name: '清剿妖兽',
    tag: '周常',
    tagTone: 'mp',
    desc: '前往秘境击杀妖兽 ×3',
    reward: '贡献 +50 · 灵石 ×200',
    action: '前往',
    objective: obj('kill_beast', 3, '秘境击杀妖兽 ≥3', '百兽岭')
  },
  {
    id: 'ms-10',
    name: '宗门斗法',
    tag: '周常',
    tagTone: 'mp',
    desc: '与其他弟子进行切磋并取得胜利',
    reward: '贡献 +100 · 声望 +30',
    action: '前往',
    objective: obj('spar', 1, '拜访宗门弟子并切磋比武 ≥1')
  },
  {
    id: 'ms-11',
    name: '灵兽捕捉',
    tag: '周常',
    tagTone: 'mp',
    desc: '前往百兽岭捕捉一只灵宠',
    reward: '贡献 +120 · 灵兽蛋 ×1',
    action: '前往',
    objective: obj('capture_turn_in', 1, '秘境抓捕妖兽后，于灵兽阁上交', '百兽岭')
  },
  {
    id: 'ms-14',
    name: '丹峰送药',
    tag: '每日',
    tagTone: 'jade',
    desc: '随机拜访一名弟子领取丹药，再送往另一名弟子',
    reward: '贡献 +30 · 丹药 ×3',
    action: '完成',
    objective: obj('pill_deliver', 2, '随机弟子领取 → 随机弟子送达（接取后显示人名）')
  },
  {
    id: 'ms-15',
    name: '藏经阁抄录',
    tag: '每日',
    tagTone: 'jade',
    desc: '抄录宗门基础功法',
    reward: '贡献 +30 · 修为 +80',
    action: '完成',
    objective: obj('technique_copy', 1, '功法阁抄录持续 45 秒成功')
  },
  {
    id: 'ms-17',
    name: '寻访散修',
    tag: '随机',
    tagTone: 'gold',
    desc: '前往坊市寻找潜在宗门弟子',
    reward: '贡献 +50 · 灵石 ×100',
    action: '接取',
    objective: obj('market_talk', 1, '坊市拜访指定散修并交谈')
  },
  {
    id: 'ms-24',
    name: '试炼妖塔',
    tag: '周常',
    tagTone: 'mp',
    desc: '挑战宗门妖塔并达到指定层数',
    reward: '贡献 +100 · 修为 +10',
    action: '前往',
    objective: obj('tower_guard', 60, '镇妖塔镇守指定层数持续 60 秒')
  },
  // —— 奇遇（不进任务堂）——
  {
    id: 'ms-26',
    name: '长老的秘密',
    tag: '奇遇',
    tagTone: 'muted',
    desc: '长老突然让你去后山取一样东西',
    reward: '奇遇 · AI 对话',
    action: '探查',
    playStyle: 'AI 对话',
    drops: ''
  },
  {
    id: 'ms-27',
    name: '失控的灵宠',
    tag: '奇遇',
    tagTone: 'muted',
    desc: '宗门灵宠突然暴走',
    reward: '奇遇 · AI 决策',
    action: '探查',
    playStyle: 'AI 决策',
    drops: ''
  },
  {
    id: 'ms-28',
    name: '神秘访客',
    tag: '奇遇',
    tagTone: 'muted',
    desc: '一名陌生修士深夜拜访宗门',
    reward: '奇遇 · AI 推理',
    action: '探查',
    playStyle: 'AI 推理',
    drops: ''
  },
  {
    id: 'ms-29',
    name: '禁地的声音',
    tag: '奇遇',
    tagTone: 'muted',
    desc: '后山禁地传来呼救声',
    reward: '奇遇 · AI 探索',
    action: '探查',
    playStyle: 'AI 探索',
    drops: ''
  },
  {
    id: 'ms-30',
    name: '师兄的请求',
    tag: '奇遇',
    tagTone: 'muted',
    desc: '师兄请你帮忙完成一件私事',
    reward: '奇遇 · AI 对话',
    action: '探查',
    playStyle: 'AI 对话',
    drops: ''
  },
  {
    id: 'ms-31',
    name: '灵石失窃案',
    tag: '奇遇',
    tagTone: 'muted',
    desc: '宗门仓库灵石大量失窃',
    reward: '奇遇 · AI 调查',
    action: '探查',
    playStyle: 'AI 调查',
    drops: ''
  },
  {
    id: 'ms-32',
    name: '新弟子入门',
    tag: '奇遇',
    tagTone: 'muted',
    desc: '一名特殊资质弟子前来拜师',
    reward: '奇遇 · AI 判断',
    action: '探查',
    playStyle: 'AI 判断',
    drops: ''
  },
  {
    id: 'ms-33',
    name: '妖兽求助',
    tag: '奇遇',
    tagTone: 'muted',
    desc: '一只受伤妖兽出现在山门前',
    reward: '奇遇 · AI 选择',
    action: '探查',
    playStyle: 'AI 选择',
    drops: ''
  },
  {
    id: 'ms-34',
    name: '老祖召见',
    tag: '奇遇',
    tagTone: 'muted',
    desc: '沉睡多年的老祖突然召见你',
    reward: '奇遇 · AI 剧情',
    action: '探查',
    playStyle: 'AI 剧情',
    drops: ''
  },
  {
    id: 'ms-35',
    name: '天降异象',
    tag: '奇遇',
    tagTone: 'muted',
    desc: '宗门上空出现神秘天象',
    reward: '奇遇 · AI 世界事件',
    action: '探查',
    playStyle: 'AI 世界事件',
    drops: ''
  }
] as CatalogMission[]

/** 宗门任务堂可选（不含奇遇） */
export const SECT_MISSION_CATALOG = MISSION_CATALOG.filter((item) => item.tag !== '奇遇')

/** 历练随机奇遇池 */
export const ADVENTURE_ENCOUNTER_CATALOG = MISSION_CATALOG.filter((item) => item.tag === '奇遇')

export interface AdventureEncounter extends CatalogMission {
  encounterId: string
  resolved: boolean
}

function shuffle<T>(list: T[]) {
  const arr = [...list]
  for (let i = arr.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[arr[i], arr[j]] = [arr[j], arr[i]]
  }
  return arr
}

function withMissionDefaults(item: CatalogMission, instanceId: string): DailyMission {
  return {
    ...item,
    instanceId,
    done: false,
    accepted: false,
    progress: 0,
    meta: {}
  }
}

/** 从宗门任务库随机抽取（不含奇遇） */
export function rollDailyMissions(count = DAILY_MISSION_COUNT): DailyMission[] {
  const pool = SECT_MISSION_CATALOG
  const picked = shuffle(pool).slice(0, Math.min(count, pool.length))
  const stamp = Date.now()
  return picked.map((item, index) => withMissionDefaults(item, `${item.id}-${stamp}-${index}`))
}

/** 补一条新的可领取任务（可排除当前板上已有模板 id） */
export function rollOneMission(excludeCatalogIds: string[] = []): DailyMission {
  const exclude = new Set(excludeCatalogIds)
  const pool = SECT_MISSION_CATALOG.filter((item) => !exclude.has(item.id))
  const source = pool.length ? pool : SECT_MISSION_CATALOG
  const item = source[Math.floor(Math.random() * source.length)]
  return withMissionDefaults(item, `${item.id}-${Date.now()}-${Math.floor(Math.random() * 1000)}`)
}

/** 用最新目录定义回填旧存档任务（已移除的任务会被标记） */
export function hydrateMissionFromCatalog(raw: DailyMission): DailyMission | null {
  const def = SECT_MISSION_CATALOG.find((item) => item.id === raw.id)
  if (!def) return null
  return {
    ...def,
    instanceId: raw.instanceId || `${def.id}-${Date.now()}`,
    done: !!raw.done,
    accepted: !!raw.accepted && !raw.done,
    progress: Math.max(0, Number(raw.progress) || 0),
    meta: raw.meta && typeof raw.meta === 'object' ? { ...raw.meta } : {}
  }
}

export function isMissionObjectiveMet(mission: DailyMission | null | undefined) {
  if (!mission?.objective) return true
  const target = Math.max(1, mission.objective.target)
  return (mission.progress || 0) >= target
}

export function formatMissionProgress(mission: DailyMission | null | undefined) {
  if (!mission?.objective) return ''
  const cur = Math.min(mission.progress || 0, mission.objective.target)
  return `${cur} / ${mission.objective.target}`
}

export function isEscortMissionKind(kind?: string | null) {
  return kind === 'escort_deliver' || kind === 'pill_deliver'
}

export function resolveEscortMembers(
  mission: DailyMission | null | undefined,
  members: Array<{ id: string; name: string }> = []
) {
  const pickupId = String(mission?.meta?.pickupMemberId || '')
  const deliverId = String(mission?.meta?.deliverMemberId || '')
  const pickupName =
    members.find((m) => m.id === pickupId)?.name ||
    String(mission?.meta?.pickupMemberName || '')
  const deliverName =
    members.find((m) => m.id === deliverId)?.name ||
    String(mission?.meta?.deliverMemberName || '')
  const phase = String(mission?.meta?.escortPhase || 'none')
  return { pickupId, deliverId, pickupName, deliverName, phase }
}

/** 任务条件文案：护送类接取后显示具体领取人 / 送达人 */
export function formatMissionConditionText(
  mission: DailyMission | null | undefined,
  members: Array<{ id: string; name: string }> = []
) {
  if (!mission?.objective) return ''
  if (isEscortMissionKind(mission.objective.kind) && mission.accepted) {
    const { pickupName, deliverName, phase } = resolveEscortMembers(mission, members)
    if (pickupName && deliverName) {
      const route = `领取 · ${pickupName} → 送达 · ${deliverName}`
      if (phase === 'holding') return `${route}（请拜访 ${deliverName} 送达）`
      if (phase === 'done') return `${route}（已送达）`
      return `${route}（请先拜访 ${pickupName} 领取）`
    }
  }
  return mission.objective.hint
}

/** 历练探索时随机抽取一条奇遇；未触发返回 null */
export function rollAdventureEncounter(chance = ADVENTURE_ENCOUNTER_CHANCE): AdventureEncounter | null {
  if (!ADVENTURE_ENCOUNTER_CATALOG.length) return null
  if (Math.random() >= chance) return null
  const item = ADVENTURE_ENCOUNTER_CATALOG[Math.floor(Math.random() * ADVENTURE_ENCOUNTER_CATALOG.length)]
  return {
    ...item,
    encounterId: `${item.id}-${Date.now()}`,
    resolved: false
  }
}

/** 解析奇遇 \`drops\` 字段为材料列表（过滤空与「待补充」占位） */
export function parseEncounterDrops(drops?: string): string[] {
  return (drops || '')
    .split(/[、,，]/)
    .map((part) => part.trim())
    .filter((part) => part && part !== '待补充')
}

/** 从奇遇掉落池等概率抽 1 种；未配置则返回 null */
export function rollEncounterMaterialDrop(drops?: string): string | null {
  const pool = parseEncounterDrops(drops)
  if (!pool.length) return null
  return pool[Math.floor(Math.random() * pool.length)] || null
}

/** 解析奇遇即时奖励（尚无 AI 时用数值 + 可选材料掉落） */
export function rollEncounterResolveReward(drops?: string) {
  return {
    exp: 40 + Math.floor(Math.random() * 80),
    stones: 30 + Math.floor(Math.random() * 70),
    drop: rollEncounterMaterialDrop(drops)
  }
}

export interface ParsedMissionReward {
  contribution: number
  spiritStones: number
  exp: number
  prestige: number
  extra: string[]
}

/** 解析奖励文案，供领取时发放 */
export function parseMissionReward(reward: string): ParsedMissionReward {
  const result: ParsedMissionReward = {
    contribution: 0,
    spiritStones: 0,
    exp: 0,
    prestige: 0,
    extra: []
  }

  const contribRange = reward.match(/贡献\s*\+(\d+)\s*[～~-]\s*(\d+)/)
  if (contribRange) {
    const min = Number(contribRange[1])
    const max = Number(contribRange[2])
    result.contribution = Math.floor(Math.random() * (max - min + 1)) + min
  } else {
    const contrib = reward.match(/贡献\s*\+(\d+)/)
    if (contrib) result.contribution = Number(contrib[1])
  }

  const stones = reward.match(/灵石\s*[×xX*]\s*(\d+)/)
  if (stones) result.spiritStones = Number(stones[1])

  const exp = reward.match(/修为\s*\+(\d+)/)
  if (exp) result.exp = Number(exp[1])

  const prestige = reward.match(/声望\s*\+(\d+)/)
  if (prestige) result.prestige = Number(prestige[1])

  const known = /贡献|灵石|修为|声望|奇遇/
  reward.split(/[·・]/g).forEach((part) => {
    const text = part.trim()
    if (!text || known.test(text)) return
    result.extra.push(text)
  })

  return result
}
