import type { RealmMajor } from './realm'
import { REALM_MAJORS } from './realm'
import { getRealmMajorIndex } from './treasure'

export interface CatalogBeast {
  id: string
  name: string
  race: string
  rarity: string
  element: string
  ability: string
  drops: string
  realm: RealmMajor
  weight: number
  tone: string
}

/** 历练可遭遇妖兽总表 */
export const BEAST_CATALOG: CatalogBeast[] = [
  {
    "id": "beast-1",
    "name": "青风狼",
    "race": "狼族",
    "rarity": "普通",
    "element": "风",
    "ability": "疾风撕咬",
    "drops": "狼牙、妖丹",
    "realm": "炼气",
    "weight": 50,
    "tone": "muted"
  },
  {
    "id": "beast-2",
    "name": "赤焰兔",
    "race": "兔族",
    "rarity": "普通",
    "element": "火",
    "ability": "火球",
    "drops": "火灵草、妖丹",
    "realm": "炼气",
    "weight": 50,
    "tone": "muted"
  },
  {
    "id": "beast-3",
    "name": "黑纹蛇",
    "race": "蛇族",
    "rarity": "普通",
    "element": "毒",
    "ability": "毒牙",
    "drops": "蛇胆、毒囊",
    "realm": "炼气",
    "weight": 50,
    "tone": "muted"
  },
  {
    "id": "beast-4",
    "name": "青灵狐",
    "race": "狐族",
    "rarity": "稀有",
    "element": "木",
    "ability": "寻灵",
    "drops": "狐皮、灵草",
    "realm": "炼气",
    "weight": 28,
    "tone": "jade"
  },
  {
    "id": "beast-5",
    "name": "铁甲熊",
    "race": "熊族",
    "rarity": "普通",
    "element": "土",
    "ability": "铁甲",
    "drops": "熊胆、妖丹",
    "realm": "炼气",
    "weight": 50,
    "tone": "muted"
  },
  {
    "id": "beast-6",
    "name": "月影猫",
    "race": "猫族",
    "rarity": "稀有",
    "element": "阴",
    "ability": "潜行",
    "drops": "月影石、猫灵",
    "realm": "炼气",
    "weight": 28,
    "tone": "jade"
  },
  {
    "id": "beast-7",
    "name": "赤炎狼王",
    "race": "狼族",
    "rarity": "稀有",
    "element": "火",
    "ability": "烈焰领域",
    "drops": "狼王妖丹、火灵晶",
    "realm": "筑基",
    "weight": 28,
    "tone": "jade"
  },
  {
    "id": "beast-8",
    "name": "紫电貂",
    "race": "貂族",
    "rarity": "稀有",
    "element": "雷",
    "ability": "雷闪",
    "drops": "雷灵石、妖丹",
    "realm": "筑基",
    "weight": 28,
    "tone": "jade"
  },
  {
    "id": "beast-9",
    "name": "玄甲龟",
    "race": "龟族",
    "rarity": "稀有",
    "element": "土",
    "ability": "玄甲护盾",
    "drops": "玄甲、龟灵丹",
    "realm": "筑基",
    "weight": 28,
    "tone": "jade"
  },
  {
    "id": "beast-10",
    "name": "碧水蛇王",
    "race": "蛇族",
    "rarity": "稀有",
    "element": "水",
    "ability": "水牢",
    "drops": "蛇胆、水灵晶",
    "realm": "筑基",
    "weight": 28,
    "tone": "jade"
  },
  {
    "id": "beast-11",
    "name": "狂暴猿",
    "race": "猿族",
    "rarity": "普通",
    "element": "土",
    "ability": "狂暴",
    "drops": "猿骨、妖丹",
    "realm": "筑基",
    "weight": 50,
    "tone": "muted"
  },
  {
    "id": "beast-12",
    "name": "风翼雕",
    "race": "鸟族",
    "rarity": "稀有",
    "element": "风",
    "ability": "极速俯冲",
    "drops": "雕羽、风灵石",
    "realm": "筑基",
    "weight": 28,
    "tone": "jade"
  },
  {
    "id": "beast-13",
    "name": "金翅妖鹰",
    "race": "鹰族",
    "rarity": "稀有",
    "element": "金",
    "ability": "金羽斩",
    "drops": "金翅、妖丹",
    "realm": "金丹",
    "weight": 28,
    "tone": "jade"
  },
  {
    "id": "beast-14",
    "name": "寒月狐王",
    "race": "狐族",
    "rarity": "稀有",
    "element": "冰",
    "ability": "月华幻术",
    "drops": "月魄石、狐尾",
    "realm": "金丹",
    "weight": 28,
    "tone": "jade"
  },
  {
    "id": "beast-15",
    "name": "炎麟兽",
    "race": "麒麟血脉",
    "rarity": "史诗",
    "element": "火",
    "ability": "麒麟真火",
    "drops": "麒麟血、炎麟晶",
    "realm": "金丹",
    "weight": 14,
    "tone": "mp"
  },
  {
    "id": "beast-16",
    "name": "九尾灵猫",
    "race": "猫族",
    "rarity": "史诗",
    "element": "阴",
    "ability": "九影幻杀",
    "drops": "猫魂、月华晶",
    "realm": "金丹",
    "weight": 14,
    "tone": "mp"
  },
  {
    "id": "beast-17",
    "name": "黑水蛟",
    "race": "蛟族",
    "rarity": "史诗",
    "element": "水",
    "ability": "黑水领域",
    "drops": "蛟龙鳞、蛟丹",
    "realm": "金丹",
    "weight": 14,
    "tone": "mp"
  },
  {
    "id": "beast-18",
    "name": "大地魔熊",
    "race": "熊族",
    "rarity": "稀有",
    "element": "土",
    "ability": "大地震击",
    "drops": "熊胆、地脉石",
    "realm": "金丹",
    "weight": 28,
    "tone": "jade"
  },
  {
    "id": "beast-19",
    "name": "青木龙",
    "race": "龙族",
    "rarity": "史诗",
    "element": "木",
    "ability": "青木回春",
    "drops": "龙鳞、木灵髓",
    "realm": "元婴",
    "weight": 14,
    "tone": "mp"
  },
  {
    "id": "beast-20",
    "name": "玄冰蛟",
    "race": "蛟族",
    "rarity": "史诗",
    "element": "冰",
    "ability": "极寒冰封",
    "drops": "玄冰晶、蛟丹",
    "realm": "元婴",
    "weight": 14,
    "tone": "mp"
  },
  {
    "id": "beast-21",
    "name": "雷霆虎王",
    "race": "虎族",
    "rarity": "史诗",
    "element": "雷",
    "ability": "九天雷爪",
    "drops": "雷晶、虎骨",
    "realm": "元婴",
    "weight": 14,
    "tone": "mp"
  },
  {
    "id": "beast-22",
    "name": "九幽狼王",
    "race": "狼族",
    "rarity": "传说",
    "element": "阴",
    "ability": "噬魂",
    "drops": "魂晶、幽冥狼牙",
    "realm": "元婴",
    "weight": 6,
    "tone": "gold"
  },
  {
    "id": "beast-23",
    "name": "赤金狮王",
    "race": "狮族",
    "rarity": "史诗",
    "element": "金火",
    "ability": "狮王咆哮",
    "drops": "赤金、狮心",
    "realm": "元婴",
    "weight": 14,
    "tone": "mp"
  },
  {
    "id": "beast-24",
    "name": "龙血猿",
    "race": "猿族",
    "rarity": "传说",
    "element": "金",
    "ability": "龙血狂化",
    "drops": "龙血、猿骨",
    "realm": "元婴",
    "weight": 6,
    "tone": "gold"
  },
  {
    "id": "beast-25",
    "name": "赤焰真龙",
    "race": "真龙",
    "rarity": "传说",
    "element": "火",
    "ability": "真龙吐息",
    "drops": "龙魂、真龙鳞",
    "realm": "化神",
    "weight": 6,
    "tone": "gold"
  },
  {
    "id": "beast-26",
    "name": "太阴玉兔",
    "race": "神兽",
    "rarity": "传说",
    "element": "月",
    "ability": "太阴月华",
    "drops": "月魄玉、太阴晶",
    "realm": "化神",
    "weight": 6,
    "tone": "gold"
  },
  {
    "id": "beast-27",
    "name": "九天鹏王",
    "race": "鲲鹏血脉",
    "rarity": "传说",
    "element": "风雷",
    "ability": "扶摇九天",
    "drops": "鲲鹏羽、风雷晶",
    "realm": "化神",
    "weight": 6,
    "tone": "gold"
  },
  {
    "id": "beast-28",
    "name": "幽冥凤凰",
    "race": "凤凰",
    "rarity": "神话",
    "element": "阴火",
    "ability": "幽冥涅槃",
    "drops": "凤凰羽、涅槃石",
    "realm": "化神",
    "weight": 2,
    "tone": "hp"
  },
  {
    "id": "beast-29",
    "name": "万毒蛛皇",
    "race": "蛛族",
    "rarity": "传说",
    "element": "毒",
    "ability": "万毒领域",
    "drops": "皇毒囊、毒晶",
    "realm": "化神",
    "weight": 6,
    "tone": "gold"
  },
  {
    "id": "beast-30",
    "name": "山岳巨猿",
    "race": "猿族",
    "rarity": "传说",
    "element": "土",
    "ability": "山岳镇压",
    "drops": "山岳神骨、土灵晶",
    "realm": "化神",
    "weight": 6,
    "tone": "gold"
  },
  {
    "id": "beast-31",
    "name": "虚空兽",
    "race": "虚空族",
    "rarity": "神话",
    "element": "空间",
    "ability": "虚空穿梭",
    "drops": "虚空晶、空间灵髓",
    "realm": "炼虚",
    "weight": 2,
    "tone": "hp"
  },
  {
    "id": "beast-32",
    "name": "星辰龙",
    "race": "星龙",
    "rarity": "神话",
    "element": "星辰",
    "ability": "星陨",
    "drops": "星辰晶、龙骨",
    "realm": "炼虚",
    "weight": 2,
    "tone": "hp"
  },
  {
    "id": "beast-33",
    "name": "轮回蝶",
    "race": "灵蝶",
    "rarity": "神话",
    "element": "轮回",
    "ability": "轮回印",
    "drops": "轮回玉、魂晶",
    "realm": "炼虚",
    "weight": 2,
    "tone": "hp"
  },
  {
    "id": "beast-34",
    "name": "太虚鲲",
    "race": "鲲鹏",
    "rarity": "神话",
    "element": "虚空",
    "ability": "吞界",
    "drops": "太虚骨、虚空晶",
    "realm": "炼虚",
    "weight": 2,
    "tone": "hp"
  },
  {
    "id": "beast-35",
    "name": "岁月兽",
    "race": "时间兽",
    "rarity": "神话",
    "element": "时间",
    "ability": "岁月倒流",
    "drops": "时光石、岁月晶",
    "realm": "炼虚",
    "weight": 2,
    "tone": "hp"
  },
  {
    "id": "beast-36",
    "name": "九幽冥龙",
    "race": "冥龙",
    "rarity": "神话",
    "element": "阴冥",
    "ability": "九幽龙息",
    "drops": "冥龙鳞、幽冥晶",
    "realm": "炼虚",
    "weight": 2,
    "tone": "hp"
  },
  {
    "id": "beast-37",
    "name": "混沌麒麟",
    "race": "麒麟",
    "rarity": "神话",
    "element": "混沌",
    "ability": "混沌领域",
    "drops": "混沌石、麒麟本源",
    "realm": "合体",
    "weight": 2,
    "tone": "hp"
  },
  {
    "id": "beast-38",
    "name": "阴阳神凰",
    "race": "神凰",
    "rarity": "神话",
    "element": "阴阳",
    "ability": "阴阳逆转",
    "drops": "阴阳玉、神凰羽",
    "realm": "合体",
    "weight": 2,
    "tone": "hp"
  },
  {
    "id": "beast-39",
    "name": "九天应龙",
    "race": "应龙",
    "rarity": "神话",
    "element": "风雷水火",
    "ability": "四象神通",
    "drops": "应龙角、四象晶",
    "realm": "合体",
    "weight": 2,
    "tone": "hp"
  },
  {
    "id": "beast-40",
    "name": "万灵树妖",
    "race": "灵植",
    "rarity": "神话",
    "element": "木",
    "ability": "万灵复苏",
    "drops": "世界木心、生命晶",
    "realm": "合体",
    "weight": 2,
    "tone": "hp"
  },
  {
    "id": "beast-41",
    "name": "饕餮",
    "race": "上古凶兽",
    "rarity": "神话",
    "element": "吞噬",
    "ability": "万物吞噬",
    "drops": "饕餮骨、吞噬晶",
    "realm": "合体",
    "weight": 2,
    "tone": "hp"
  },
  {
    "id": "beast-42",
    "name": "穷奇",
    "race": "上古凶兽",
    "rarity": "神话",
    "element": "杀伐",
    "ability": "凶煞领域",
    "drops": "穷奇骨、杀戮晶",
    "realm": "合体",
    "weight": 2,
    "tone": "hp"
  },
  {
    "id": "beast-43",
    "name": "鸿蒙祖龙",
    "race": "祖龙",
    "rarity": "神话",
    "element": "鸿蒙",
    "ability": "鸿蒙龙息",
    "drops": "鸿蒙龙鳞、祖龙精血",
    "realm": "大乘",
    "weight": 2,
    "tone": "hp"
  },
  {
    "id": "beast-44",
    "name": "造化神蝶",
    "race": "神蝶",
    "rarity": "神话",
    "element": "造化",
    "ability": "造化万物",
    "drops": "造化晶、神蝶翅",
    "realm": "大乘",
    "weight": 2,
    "tone": "hp"
  },
  {
    "id": "beast-45",
    "name": "九尾天狐",
    "race": "天狐",
    "rarity": "神话",
    "element": "幻道",
    "ability": "九尾幻界",
    "drops": "天狐尾、幻道晶",
    "realm": "大乘",
    "weight": 2,
    "tone": "hp"
  },
  {
    "id": "beast-46",
    "name": "太初玄龟",
    "race": "神龟",
    "rarity": "神话",
    "element": "太初",
    "ability": "太初玄甲",
    "drops": "太初龟甲、本源晶",
    "realm": "大乘",
    "weight": 2,
    "tone": "hp"
  },
  {
    "id": "beast-47",
    "name": "混沌魔猿",
    "race": "魔猿",
    "rarity": "神话",
    "element": "混沌",
    "ability": "混沌神拳",
    "drops": "混沌魔骨、神血",
    "realm": "大乘",
    "weight": 2,
    "tone": "hp"
  },
  {
    "id": "beast-48",
    "name": "鲲鹏祖兽",
    "race": "鲲鹏",
    "rarity": "神话",
    "element": "空间",
    "ability": "吞天化鹏",
    "drops": "鲲鹏祖羽、空间晶",
    "realm": "大乘",
    "weight": 2,
    "tone": "hp"
  },
  {
    "id": "beast-49",
    "name": "九天雷龙",
    "race": "雷龙",
    "rarity": "神话",
    "element": "雷劫",
    "ability": "天劫雷域",
    "drops": "雷劫石、雷龙精血",
    "realm": "渡劫",
    "weight": 2,
    "tone": "hp"
  },
  {
    "id": "beast-50",
    "name": "轮回神凰",
    "race": "神凰",
    "rarity": "神话",
    "element": "轮回",
    "ability": "九死轮回",
    "drops": "轮回神羽、轮回晶",
    "realm": "渡劫",
    "weight": 2,
    "tone": "hp"
  },
  {
    "id": "beast-51",
    "name": "天命麒麟",
    "race": "麒麟",
    "rarity": "神话",
    "element": "天命",
    "ability": "天命改写",
    "drops": "天命石、麒麟本源",
    "realm": "渡劫",
    "weight": 2,
    "tone": "hp"
  },
  {
    "id": "beast-52",
    "name": "虚无神鲲",
    "race": "神鲲",
    "rarity": "神话",
    "element": "虚无",
    "ability": "虚无吞噬",
    "drops": "虚无道石、神鲲骨",
    "realm": "渡劫",
    "weight": 2,
    "tone": "hp"
  },
  {
    "id": "beast-53",
    "name": "九幽魔龙",
    "race": "魔龙",
    "rarity": "神话",
    "element": "魔道",
    "ability": "九幽魔域",
    "drops": "魔龙晶、魔道本源",
    "realm": "渡劫",
    "weight": 2,
    "tone": "hp"
  },
  {
    "id": "beast-54",
    "name": "混沌凶兽",
    "race": "混沌兽",
    "rarity": "神话",
    "element": "混沌",
    "ability": "混沌吞噬",
    "drops": "混沌本源、凶兽精血",
    "realm": "渡劫",
    "weight": 2,
    "tone": "hp"
  },
  {
    "id": "beast-55",
    "name": "鸿蒙神龙",
    "race": "神龙",
    "rarity": "至高",
    "element": "鸿蒙",
    "ability": "鸿蒙法则",
    "drops": "鸿蒙神晶、神龙本源",
    "realm": "飞升",
    "weight": 1,
    "tone": "gold"
  },
  {
    "id": "beast-56",
    "name": "混沌凤凰",
    "race": "祖凰",
    "rarity": "至高",
    "element": "混沌",
    "ability": "混沌涅槃",
    "drops": "混沌神羽、凤凰本源",
    "realm": "飞升",
    "weight": 1,
    "tone": "gold"
  },
  {
    "id": "beast-57",
    "name": "无极天狐",
    "race": "天狐",
    "rarity": "至高",
    "element": "无极",
    "ability": "无极幻境",
    "drops": "无极晶、天狐本源",
    "realm": "飞升",
    "weight": 1,
    "tone": "gold"
  },
  {
    "id": "beast-58",
    "name": "世界树灵",
    "race": "世界灵",
    "rarity": "至高",
    "element": "世界",
    "ability": "世界法则",
    "drops": "世界本源、世界树心",
    "realm": "飞升",
    "weight": 1,
    "tone": "gold"
  },
  {
    "id": "beast-59",
    "name": "太初麒麟",
    "race": "祖麒麟",
    "rarity": "至高",
    "element": "太初",
    "ability": "太初本源",
    "drops": "太初神晶、麒麟本源",
    "realm": "飞升",
    "weight": 1,
    "tone": "gold"
  },
  {
    "id": "beast-60",
    "name": "万道祖兽",
    "race": "祖兽",
    "rarity": "至高",
    "element": "万道",
    "ability": "万道归一",
    "drops": "万道晶、祖兽本源",
    "realm": "飞升",
    "weight": 1,
    "tone": "gold"
  }
] as CatalogBeast[]

export function getBeastsByRealm(realm: RealmMajor | string) {
  return BEAST_CATALOG.filter((item) => item.realm === realm)
}

export function getBeastByName(name: string) {
  return BEAST_CATALOG.find((item) => item.name === name) || null
}

/** 抓捕成功率（按稀有度） */
export function captureChanceOf(beast: CatalogBeast) {
  const table: Record<string, number> = {
    普通: 0.72,
    稀有: 0.55,
    史诗: 0.38,
    传说: 0.24,
    神话: 0.14,
    至高: 0.08
  }
  return table[beast.rarity] ?? 0.4
}

/** 抓捕成功后的灵宠字段 */
export function beastToPetFields(beast: CatalogBeast) {
  return {
    name: beast.name,
    grade: beast.rarity,
    type: `${beast.race} · ${beast.element}`,
    bonus: beast.ability,
    source: 'capture' as const
  }
}

/** 抓捕妖兽回售兽阁估价 */
export function estimateBeastSellPrice(beast: CatalogBeast) {
  const realmBonus = Math.max(0, getRealmMajorIndex(beast.realm))
  const rarityMul: Record<string, number> = {
    普通: 1,
    稀有: 1.45,
    史诗: 2.1,
    传说: 3.2,
    神话: 4.8,
    至高: 7.5
  }
  const mul = rarityMul[beast.rarity] || 1
  return Math.max(40, Math.round((70 + realmBonus * 110 + beast.weight) * mul))
}

function pickWeighted<T extends { weight: number }>(entries: T[]): T {
  const total = entries.reduce((sum, item) => sum + Math.max(0, item.weight), 0)
  let roll = Math.random() * total
  for (const item of entries) {
    roll -= Math.max(0, item.weight)
    if (roll <= 0) return item
  }
  return entries[entries.length - 1]
}

function shuffleUnique<T>(list: T[]) {
  const arr = [...list]
  for (let i = arr.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[arr[i], arr[j]] = [arr[j], arr[i]]
  }
  return arr
}

/**
 * 依地点境界随机遭遇妖兽：
 * - 优先本境妖兽
 * - 可少量混入低一境
 * - 稀有度加权，普通更常见
 */
export function rollEncounterBeasts(locationRealm: RealmMajor, count = 1): CatalogBeast[] {
  const idx = getRealmMajorIndex(locationRealm)
  const pool: CatalogBeast[] = []
  const primary = getBeastsByRealm(locationRealm)
  pool.push(...primary)
  if (idx > 0) {
    const lower = getBeastsByRealm(REALM_MAJORS[idx - 1])
    pool.push(...lower)
  }
  if (!pool.length) return []

  const result: CatalogBeast[] = []
  const used = new Set<string>()
  const times = Math.min(count, pool.length)
  for (let i = 0; i < times; i += 1) {
    const available = pool.filter((item) => !used.has(item.id))
    if (!available.length) break
    // 本境权重翻倍
    const weighted = available.map((item) => ({
      ...item,
      weight: item.realm === locationRealm ? item.weight * 2 : item.weight
    }))
    const picked = pickWeighted(weighted)
    used.add(picked.id)
    result.push(picked)
  }
  return shuffleUnique(result)
}

/** 估算妖兽等级（展示用） */
export function estimateBeastLevel(beast: CatalogBeast) {
  const base = 8 + getRealmMajorIndex(beast.realm) * 12
  const rarityBonus: Record<string, number> = {
    普通: 0,
    稀有: 3,
    史诗: 6,
    传说: 10,
    神话: 14,
    至高: 20
  }
  return base + (rarityBonus[beast.rarity] || 0) + Math.floor(Math.random() * 4)
}

/** 估算妖兽战力（与玩家战力同量级，用于出战灵兽阵亡判定） */
export function estimateBeastPower(beast: CatalogBeast, level?: number) {
  const idx = Math.max(0, getRealmMajorIndex(beast.realm))
  const rarityMul: Record<string, number> = {
    普通: 1,
    稀有: 1.35,
    史诗: 1.85,
    传说: 2.55,
    神话: 3.5,
    至高: 4.9
  }
  const lv = typeof level === 'number' && level > 0 ? level : 8 + idx * 12
  const base = 620 + idx * 920 + lv * 36 + Math.max(0, beast.weight || 0) * 6
  return Math.max(200, Math.round(base * (rarityMul[beast.rarity] || 1)))
}
