export type MissionTag = '每日' | '悬赏' | '周常' | '随机' | '奇遇'

export type MissionTagTone = 'jade' | 'hp' | 'gold' | 'mp' | 'muted'

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
}

export interface DailyMission extends CatalogMission {
  /** 已完成并领取奖励 */
  done: boolean
  /** 已接取、进行中（同时最多一个） */
  accepted: boolean
  /** 当日实例 id，避免跨日冲突 */
  instanceId: string
}

/** 每日展示任务数量 */
export const DAILY_MISSION_COUNT = 5

/** 历练探索触发奇遇的概率 */
export const ADVENTURE_ENCOUNTER_CHANCE = 0.28

/** 宗门任务 + 历练奇遇总库（奇遇不进任务堂） */
export const MISSION_CATALOG: CatalogMission[] = [
  {
    "id": "ms-1",
    "name": "挖掘灵矿",
    "tag": "每日",
    "tagTone": "jade",
    "desc": "前往青云矿洞挖掘灵矿 ×5",
    "reward": "贡献 +30 · 灵石 ×50",
    "action": "完成",
    "playStyle": ""
  },
  {
    "id": "ms-2",
    "name": "修复护宗大阵",
    "tag": "每日",
    "tagTone": "jade",
    "desc": "收集阵法材料并修复宗门阵眼",
    "reward": "贡献 +40 · 灵石 ×60",
    "action": "完成",
    "playStyle": ""
  },
  {
    "id": "ms-3",
    "name": "饲养灵兽",
    "tag": "每日",
    "tagTone": "jade",
    "desc": "前往灵兽峰喂养灵宠 ×3",
    "reward": "贡献 +25 · 灵宠经验 +100",
    "action": "完成",
    "playStyle": ""
  },
  {
    "id": "ms-4",
    "name": "灌溉灵田",
    "tag": "每日",
    "tagTone": "jade",
    "desc": "为宗门灵田灌溉灵泉 ×5",
    "reward": "贡献 +25 · 灵草 ×5",
    "action": "完成",
    "playStyle": ""
  },
  {
    "id": "ms-5",
    "name": "炼器试炼",
    "tag": "每日",
    "tagTone": "jade",
    "desc": "炼制一件低阶法器",
    "reward": "贡献 +50 · 炼器熟练度 +20",
    "action": "完成",
    "playStyle": ""
  },
  {
    "id": "ms-6",
    "name": "护送灵材",
    "tag": "每日",
    "tagTone": "jade",
    "desc": "将宗门灵材安全送往丹峰",
    "reward": "贡献 +40 · 灵石 ×50",
    "action": "完成",
    "playStyle": ""
  },
  {
    "id": "ms-7",
    "name": "清剿魔修",
    "tag": "悬赏",
    "tagTone": "hp",
    "desc": "前往黑风谷击杀魔修 ×3",
    "reward": "贡献 +80 · 灵石 ×150",
    "action": "领取",
    "playStyle": ""
  },
  {
    "id": "ms-8",
    "name": "营救弟子",
    "tag": "悬赏",
    "tagTone": "hp",
    "desc": "救出被妖兽困住的宗门弟子",
    "reward": "贡献 +100 · 声望 +20",
    "action": "领取",
    "playStyle": ""
  },
  {
    "id": "ms-9",
    "name": "探索秘境",
    "tag": "周常",
    "tagTone": "mp",
    "desc": "进入青云秘境探索并寻找宝物",
    "reward": "贡献 +150 · 灵石 ×300",
    "action": "前往",
    "playStyle": ""
  },
  {
    "id": "ms-10",
    "name": "宗门斗法",
    "tag": "周常",
    "tagTone": "mp",
    "desc": "与其他弟子进行切磋并取得胜利",
    "reward": "贡献 +100 · 声望 +30",
    "action": "前往",
    "playStyle": ""
  },
  {
    "id": "ms-11",
    "name": "灵兽捕捉",
    "tag": "周常",
    "tagTone": "mp",
    "desc": "前往妖兽山脉捕捉一只灵宠",
    "reward": "贡献 +120 · 灵兽蛋 ×1",
    "action": "前往",
    "playStyle": ""
  },
  {
    "id": "ms-12",
    "name": "寻找失物",
    "tag": "周常",
    "tagTone": "mp",
    "desc": "找回长老遗失的法宝",
    "reward": "贡献 +100 · 灵石 ×200",
    "action": "前往",
    "playStyle": ""
  },
  {
    "id": "ms-13",
    "name": "镇守矿洞",
    "tag": "周常",
    "tagTone": "mp",
    "desc": "镇守宗门矿洞，抵御妖兽袭击",
    "reward": "贡献 +120 · 灵矿 ×10",
    "action": "前往",
    "playStyle": ""
  },
  {
    "id": "ms-14",
    "name": "丹峰送药",
    "tag": "每日",
    "tagTone": "jade",
    "desc": "将丹药送到各峰指定地点",
    "reward": "贡献 +30 · 丹药 ×3",
    "action": "完成",
    "playStyle": ""
  },
  {
    "id": "ms-15",
    "name": "藏经阁抄录",
    "tag": "每日",
    "tagTone": "jade",
    "desc": "抄录宗门基础功法",
    "reward": "贡献 +30 · 修为 +80",
    "action": "完成",
    "playStyle": ""
  },
  {
    "id": "ms-16",
    "name": "灵脉巡查",
    "tag": "每日",
    "tagTone": "jade",
    "desc": "检查宗门灵脉是否出现异常",
    "reward": "贡献 +40 · 灵石 ×80",
    "action": "完成",
    "playStyle": ""
  },
  {
    "id": "ms-17",
    "name": "寻访散修",
    "tag": "随机",
    "tagTone": "gold",
    "desc": "前往坊市寻找潜在宗门弟子",
    "reward": "贡献 +50 · 招募令 ×1",
    "action": "接取",
    "playStyle": ""
  },
  {
    "id": "ms-18",
    "name": "处理凡俗事务",
    "tag": "每日",
    "tagTone": "jade",
    "desc": "帮助宗门附属城镇解决妖兽问题",
    "reward": "贡献 +35 · 声望 +10",
    "action": "完成",
    "playStyle": ""
  },
  {
    "id": "ms-19",
    "name": "宗门押运",
    "tag": "悬赏",
    "tagTone": "hp",
    "desc": "护送一批珍贵灵矿返回宗门",
    "reward": "贡献 +100 · 灵石 ×200",
    "action": "领取",
    "playStyle": ""
  },
  {
    "id": "ms-20",
    "name": "调查禁地",
    "tag": "悬赏",
    "tagTone": "hp",
    "desc": "调查后山禁地出现的异常灵气",
    "reward": "贡献 +150 · 神秘宝箱 ×1",
    "action": "领取",
    "playStyle": ""
  },
  {
    "id": "ms-21",
    "name": "夜间守山",
    "tag": "每日",
    "tagTone": "jade",
    "desc": "夜间镇守山门，防止魔修潜入",
    "reward": "贡献 +45 · 灵石 ×70",
    "action": "完成",
    "playStyle": ""
  },
  {
    "id": "ms-22",
    "name": "采集灵泉",
    "tag": "每日",
    "tagTone": "jade",
    "desc": "前往寒潭收集灵泉 ×3",
    "reward": "贡献 +30 · 灵泉 ×5",
    "action": "完成",
    "playStyle": ""
  },
  {
    "id": "ms-23",
    "name": "寻找矿灵",
    "tag": "周常",
    "tagTone": "mp",
    "desc": "在矿洞中寻找拥有灵性的矿石",
    "reward": "贡献 +100 · 灵矿 ×5",
    "action": "前往",
    "playStyle": ""
  },
  {
    "id": "ms-24",
    "name": "试炼妖塔",
    "tag": "周常",
    "tagTone": "mp",
    "desc": "挑战宗门妖塔并达到指定层数",
    "reward": "贡献 +150 · 修为 +300",
    "action": "前往",
    "playStyle": ""
  },
  {
    "id": "ms-25",
    "name": "长老委托",
    "tag": "随机",
    "tagTone": "gold",
    "desc": "完成长老发布的特殊任务",
    "reward": "贡献 +50～200 · 随机奖励",
    "action": "接取",
    "playStyle": ""
  },
  {
    "id": "ms-26",
    "name": "长老的秘密",
    "tag": "奇遇",
    "tagTone": "muted",
    "desc": "长老突然让你去后山取一样东西",
    "reward": "奇遇 · AI 对话",
    "action": "探查",
    "playStyle": "AI 对话"
  },
  {
    "id": "ms-27",
    "name": "失控的灵宠",
    "tag": "奇遇",
    "tagTone": "muted",
    "desc": "宗门灵宠突然暴走",
    "reward": "奇遇 · AI 决策",
    "action": "探查",
    "playStyle": "AI 决策"
  },
  {
    "id": "ms-28",
    "name": "神秘访客",
    "tag": "奇遇",
    "tagTone": "muted",
    "desc": "一名陌生修士深夜拜访宗门",
    "reward": "奇遇 · AI 推理",
    "action": "探查",
    "playStyle": "AI 推理"
  },
  {
    "id": "ms-29",
    "name": "禁地的声音",
    "tag": "奇遇",
    "tagTone": "muted",
    "desc": "后山禁地传来呼救声",
    "reward": "奇遇 · AI 探索",
    "action": "探查",
    "playStyle": "AI 探索"
  },
  {
    "id": "ms-30",
    "name": "师兄的请求",
    "tag": "奇遇",
    "tagTone": "muted",
    "desc": "师兄请你帮忙完成一件私事",
    "reward": "奇遇 · AI 对话",
    "action": "探查",
    "playStyle": "AI 对话"
  },
  {
    "id": "ms-31",
    "name": "灵石失窃案",
    "tag": "奇遇",
    "tagTone": "muted",
    "desc": "宗门仓库灵石大量失窃",
    "reward": "奇遇 · AI 调查",
    "action": "探查",
    "playStyle": "AI 调查"
  },
  {
    "id": "ms-32",
    "name": "新弟子入门",
    "tag": "奇遇",
    "tagTone": "muted",
    "desc": "一名特殊资质弟子前来拜师",
    "reward": "奇遇 · AI 判断",
    "action": "探查",
    "playStyle": "AI 判断"
  },
  {
    "id": "ms-33",
    "name": "妖兽求助",
    "tag": "奇遇",
    "tagTone": "muted",
    "desc": "一只受伤妖兽出现在山门前",
    "reward": "奇遇 · AI 选择",
    "action": "探查",
    "playStyle": "AI 选择"
  },
  {
    "id": "ms-34",
    "name": "老祖召见",
    "tag": "奇遇",
    "tagTone": "muted",
    "desc": "沉睡多年的老祖突然召见你",
    "reward": "奇遇 · AI 剧情",
    "action": "探查",
    "playStyle": "AI 剧情"
  },
  {
    "id": "ms-35",
    "name": "天降异象",
    "tag": "奇遇",
    "tagTone": "muted",
    "desc": "宗门上空出现神秘天象",
    "reward": "奇遇 · AI 世界事件",
    "action": "探查",
    "playStyle": "AI 世界事件"
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

/** 从宗门任务库随机抽取（不含奇遇） */
export function rollDailyMissions(count = DAILY_MISSION_COUNT): DailyMission[] {
  const pool = SECT_MISSION_CATALOG
  const picked = shuffle(pool).slice(0, Math.min(count, pool.length))
  const stamp = Date.now()
  return picked.map((item, index) => ({
    ...item,
    instanceId: `${item.id}-${stamp}-${index}`,
    done: false,
    accepted: false
  }))
}

/** 补一条新的可领取任务（可排除当前板上已有模板 id） */
export function rollOneMission(excludeCatalogIds: string[] = []): DailyMission {
  const exclude = new Set(excludeCatalogIds)
  const pool = SECT_MISSION_CATALOG.filter((item) => !exclude.has(item.id))
  const source = pool.length ? pool : SECT_MISSION_CATALOG
  const item = source[Math.floor(Math.random() * source.length)]
  return {
    ...item,
    instanceId: `${item.id}-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    done: false,
    accepted: false
  }
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

/** 解析奇遇即时奖励（尚无 AI 时用数值掉落） */
export function rollEncounterResolveReward() {
  return {
    exp: 40 + Math.floor(Math.random() * 80),
    stones: 30 + Math.floor(Math.random() * 70)
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
