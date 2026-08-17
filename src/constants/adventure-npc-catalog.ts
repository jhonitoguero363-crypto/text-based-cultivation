import type { RealmMajor } from './realm'
import { REALM_MAJORS } from './realm'
import { getRealmMajorIndex } from './treasure'
import {
  estimateCombatPowerByArchetype,
  type CombatPowerArchetype
} from './combat-power'
import {
  getSectMembers,
  type CatalogMember,
  type MemberGroup
} from './member-catalog'
import { getSectOption, areFactionsHostile, SECT_OPTIONS, type SectFaction, type SectId } from './sects'

/** 秘境偶遇含宗门弟子/正道/魔道/妖族/隐世/奇遇；坊市侧重商人/正道/魔道/散修 */
export type AdventureNpcKind =
  | '宗门弟子'
  | '正道修士'
  | '散修'
  | '商人'
  | '魔道修士'
  | '妖族'
  | '隐世'
  | '奇遇'

/** 坊市人物四类 */
export const MARKET_NPC_KINDS = ['商人', '正道修士', '魔道修士', '散修'] as const
export type MarketNpcKind = (typeof MARKET_NPC_KINDS)[number]

export function isDemonicNpcKind(kind: string | undefined | null) {
  return kind === '魔道修士' || kind === '魔修'
}

/** 历练人物类型对应的派系（用于敌对判定） */
export function factionOfNpcKind(kind: string | undefined | null): SectFaction | null {
  if (isDemonicNpcKind(kind)) return '魔门'
  if (kind === '正道修士') return '正道'
  if (kind === '妖族') return '妖族'
  return null
}

/**
 * 是否相对玩家宗门为敌对势力人物。
 * 无宗时：魔道 / 妖族计为敌对。
 */
export function isHostileNpcToPlayer(
  npcKind: string | undefined | null,
  playerSectId: string | null | undefined
) {
  const npcFaction = factionOfNpcKind(npcKind)
  if (!npcFaction) return false
  const playerFaction = getSectOption(playerSectId)?.faction || null
  if (!playerFaction) return npcFaction === '魔门' || npcFaction === '妖族'
  return areFactionsHostile(playerFaction, npcFaction)
}

export function normalizeAdventureNpcKind(kind: string | undefined | null): AdventureNpcKind {
  if (kind === '魔修') return '魔道修士'
  if (
    kind === '宗门弟子' ||
    kind === '正道修士' ||
    kind === '散修' ||
    kind === '商人' ||
    kind === '魔道修士' ||
    kind === '妖族' ||
    kind === '隐世' ||
    kind === '奇遇'
  ) {
    return kind
  }
  return '散修'
}

export function normalizeAdventureNpc(npc: AdventureNpc): AdventureNpc {
  return { ...npc, kind: normalizeAdventureNpcKind(npc.kind) }
}

export interface AdventureNpc {
  id: string
  name: string
  title: string
  realm: RealmMajor
  personality: string
  /** 常出没地点；各地表示流浪可遇 */
  place: string
  /** 可能事件 / 特点 / 商品 / 隐世身份 */
  event: string
  avatar: string
  kind: AdventureNpcKind
}

/** 历练可偶遇人物 */
export const ADVENTURE_NPC_CATALOG: AdventureNpc[] = [
  {
    "id": "adv-npc-1",
    "avatar": "林",
    "name": "林青竹",
    "title": "青竹剑宗弟子",
    "realm": "炼气",
    "personality": "正直",
    "place": "青云山",
    "event": "与玩家切磋",
    "kind": "宗门弟子"
  },
  {
    "id": "adv-npc-2",
    "avatar": "苏",
    "name": "苏晚晴",
    "title": "天音宗弟子",
    "realm": "筑基",
    "personality": "温柔",
    "place": "落霞谷",
    "event": "请求玩家寻找灵药",
    "kind": "宗门弟子"
  },
  {
    "id": "adv-npc-3",
    "avatar": "李",
    "name": "李玄风",
    "title": "太虚剑宗弟子",
    "realm": "筑基",
    "personality": "高傲",
    "place": "断剑谷",
    "event": "争夺剑修传承",
    "kind": "宗门弟子"
  },
  {
    "id": "adv-npc-4",
    "avatar": "顾",
    "name": "顾少陵",
    "title": "金刚宗弟子",
    "realm": "金丹",
    "personality": "豪爽",
    "place": "百兽岭",
    "event": "联手猎杀妖王",
    "kind": "宗门弟子"
  },
  {
    "id": "adv-npc-5",
    "avatar": "沈",
    "name": "沈月璃",
    "title": "广寒宫弟子",
    "realm": "金丹",
    "personality": "清冷",
    "place": "寒潭洞",
    "event": "交换冰属性材料",
    "kind": "宗门弟子"
  },
  {
    "id": "adv-npc-6",
    "avatar": "赵",
    "name": "赵天河",
    "title": "烈阳宗弟子",
    "realm": "元婴",
    "personality": "自负",
    "place": "赤炎山脉",
    "event": "争夺地火",
    "kind": "宗门弟子"
  },
  {
    "id": "adv-npc-7",
    "avatar": "慕",
    "name": "慕容雪",
    "title": "天机阁弟子",
    "realm": "元婴",
    "personality": "神秘",
    "place": "紫云秘境",
    "event": "提供未来情报",
    "kind": "宗门弟子"
  },
  {
    "id": "adv-npc-8",
    "avatar": "楚",
    "name": "楚狂歌",
    "title": "剑阁弟子",
    "realm": "化神",
    "personality": "狂傲",
    "place": "古剑冢",
    "event": "邀请玩家比剑",
    "kind": "宗门弟子"
  },
  {
    "id": "adv-npc-9",
    "avatar": "洛",
    "name": "洛神音",
    "title": "天音圣地弟子",
    "realm": "化神",
    "personality": "温柔",
    "place": "万魂古墓",
    "event": "共同镇压魂兽",
    "kind": "宗门弟子"
  },
  {
    "id": "adv-npc-10",
    "avatar": "白",
    "name": "白无涯",
    "title": "太虚宗弟子",
    "realm": "炼虚",
    "personality": "淡漠",
    "place": "虚空裂谷",
    "event": "争夺空间晶",
    "kind": "宗门弟子"
  },
  {
    "id": "adv-npc-11",
    "avatar": "王",
    "name": "王老三",
    "title": "采药散修",
    "realm": "炼气",
    "personality": "油滑",
    "place": "各地",
    "event": "出售药材",
    "kind": "散修"
  },
  {
    "id": "adv-npc-12",
    "avatar": "陈",
    "name": "陈平",
    "title": "猎妖散修",
    "realm": "筑基",
    "personality": "豪爽",
    "place": "各地",
    "event": "可以组队",
    "kind": "散修"
  },
  {
    "id": "adv-npc-13",
    "avatar": "柳",
    "name": "柳如烟",
    "title": "女散修",
    "realm": "筑基",
    "personality": "聪慧",
    "place": "各地",
    "event": "擅长交易",
    "kind": "散修"
  },
  {
    "id": "adv-npc-14",
    "avatar": "周",
    "name": "周青",
    "title": "矿洞散修",
    "realm": "金丹",
    "personality": "贪财",
    "place": "各地",
    "event": "出售矿石",
    "kind": "散修"
  },
  {
    "id": "adv-npc-15",
    "avatar": "魏",
    "name": "魏无忌",
    "title": "独行散修",
    "realm": "金丹",
    "personality": "冷漠",
    "place": "各地",
    "event": "战斗力强",
    "kind": "散修"
  },
  {
    "id": "adv-npc-16",
    "avatar": "赵",
    "name": "赵老鬼",
    "title": "老散修",
    "realm": "元婴",
    "personality": "狡猾",
    "place": "各地",
    "event": "掌握秘境情报",
    "kind": "散修"
  },
  {
    "id": "adv-npc-17",
    "avatar": "宁",
    "name": "宁道远",
    "title": "隐居散修",
    "realm": "元婴",
    "personality": "淡泊",
    "place": "各地",
    "event": "可以传授功法",
    "kind": "散修"
  },
  {
    "id": "adv-npc-18",
    "avatar": "魏",
    "name": "魏长生",
    "title": "苦修士",
    "realm": "化神",
    "personality": "沉默",
    "place": "各地",
    "event": "寻找突破契机",
    "kind": "散修"
  },
  {
    "id": "adv-npc-19",
    "avatar": "莫",
    "name": "莫天行",
    "title": "游历散修",
    "realm": "炼虚",
    "personality": "神秘",
    "place": "各地",
    "event": "掌握诸界情报",
    "kind": "散修"
  },
  {
    "id": "adv-npc-20",
    "avatar": "老",
    "name": "老乞丐",
    "title": "神秘散修",
    "realm": "飞升",
    "personality": "疯癫",
    "place": "各地",
    "event": "实际可能是大能",
    "kind": "散修"
  },
  {
    "id": "adv-npc-21",
    "avatar": "钱",
    "name": "钱多多",
    "title": "流动商人",
    "realm": "炼气",
    "personality": "精明",
    "place": "各地",
    "event": "出售丹药、灵草",
    "kind": "商人"
  },
  {
    "id": "adv-npc-22",
    "avatar": "铁",
    "name": "铁算盘",
    "title": "矿石商",
    "realm": "筑基",
    "personality": "精明",
    "place": "各地",
    "event": "出售灵矿、矿石",
    "kind": "商人"
  },
  {
    "id": "adv-npc-23",
    "avatar": "百",
    "name": "百宝道人",
    "title": "法宝商",
    "realm": "金丹",
    "personality": "精明",
    "place": "各地",
    "event": "出售法器、法宝",
    "kind": "商人"
  },
  {
    "id": "adv-npc-24",
    "avatar": "灵",
    "name": "灵兽商人",
    "title": "灵宠商",
    "realm": "金丹",
    "personality": "精明",
    "place": "各地",
    "event": "出售灵兽蛋",
    "kind": "商人"
  },
  {
    "id": "adv-npc-25",
    "avatar": "鬼",
    "name": "鬼市商人",
    "title": "黑市商人",
    "realm": "元婴",
    "personality": "精明",
    "place": "各地",
    "event": "出售稀有材料",
    "kind": "商人"
  },
  {
    "id": "adv-npc-26",
    "avatar": "天",
    "name": "天机商人",
    "title": "秘境商人",
    "realm": "化神",
    "personality": "精明",
    "place": "各地",
    "event": "出售秘境情报",
    "kind": "商人"
  },
  {
    "id": "adv-npc-27",
    "avatar": "万",
    "name": "万界商客",
    "title": "诸界商人",
    "realm": "炼虚",
    "personality": "精明",
    "place": "各地",
    "event": "出售世界级材料",
    "kind": "商人"
  },
  {
    "id": "adv-npc-28",
    "avatar": "血",
    "name": "血刀客",
    "title": "血魔宗弟子",
    "realm": "筑基",
    "personality": "凶狠",
    "place": "各地",
    "event": "魔功 · 血刀术",
    "kind": "魔道修士"
  },
  {
    "id": "adv-npc-29",
    "avatar": "黑",
    "name": "黑煞",
    "title": "魔道修士",
    "realm": "金丹",
    "personality": "阴狠",
    "place": "各地",
    "event": "魔功 · 毒煞",
    "kind": "魔道修士"
  },
  {
    "id": "adv-npc-30",
    "avatar": "血",
    "name": "血无痕",
    "title": "血魔宗弟子",
    "realm": "金丹",
    "personality": "疯狂",
    "place": "各地",
    "event": "魔功 · 嗜血",
    "kind": "魔道修士"
  },
  {
    "id": "adv-npc-31",
    "avatar": "鬼",
    "name": "鬼面道人",
    "title": "鬼道魔修",
    "realm": "元婴",
    "personality": "冷漠",
    "place": "各地",
    "event": "魔功 · 魂术",
    "kind": "魔道修士"
  },
  {
    "id": "adv-npc-32",
    "avatar": "赤",
    "name": "赤炼老魔",
    "title": "魔道长老",
    "realm": "元婴",
    "personality": "残忍",
    "place": "各地",
    "event": "魔功 · 炼魂",
    "kind": "魔道修士"
  },
  {
    "id": "adv-npc-33",
    "avatar": "黑",
    "name": "黑袍道人",
    "title": "神秘魔修",
    "realm": "化神",
    "personality": "神秘",
    "place": "各地",
    "event": "魔功 · 傀儡术",
    "kind": "魔道修士"
  },
  {
    "id": "adv-npc-34",
    "avatar": "血",
    "name": "血海老祖",
    "title": "魔宗长老",
    "realm": "炼虚",
    "personality": "疯狂",
    "place": "各地",
    "event": "魔功 · 血海领域",
    "kind": "魔道修士"
  },
  {
    "id": "adv-npc-35",
    "avatar": "无",
    "name": "无心魔君",
    "title": "魔道强者",
    "realm": "合体",
    "personality": "淡漠",
    "place": "各地",
    "event": "魔功 · 心魔术",
    "kind": "魔道修士"
  },
  {
    "id": "adv-npc-36",
    "avatar": "天",
    "name": "天魔子",
    "title": "天魔宗圣子",
    "realm": "大乘",
    "personality": "傲慢",
    "place": "各地",
    "event": "魔功 · 天魔变",
    "kind": "魔道修士"
  },
  {
    "id": "adv-npc-37",
    "avatar": "无",
    "name": "无相魔尊",
    "title": "魔界强者",
    "realm": "渡劫",
    "personality": "平静",
    "place": "各地",
    "event": "魔功 · 无相魔功",
    "kind": "魔道修士"
  },
  {
    "id": "adv-npc-38",
    "avatar": "卖",
    "name": "卖酒老人",
    "title": "酒馆老板",
    "realm": "飞升",
    "personality": "深藏不露",
    "place": "各地",
    "event": "隐世身份 · 隐世剑仙",
    "kind": "隐世"
  },
  {
    "id": "adv-npc-39",
    "avatar": "瘸",
    "name": "瘸腿老人",
    "title": "猎人",
    "realm": "飞升",
    "personality": "深藏不露",
    "place": "各地",
    "event": "隐世身份 · 前代妖皇",
    "kind": "隐世"
  },
  {
    "id": "adv-npc-40",
    "avatar": "白",
    "name": "白发道人",
    "title": "游方道士",
    "realm": "飞升",
    "personality": "深藏不露",
    "place": "各地",
    "event": "隐世身份 · 上古大能",
    "kind": "隐世"
  },
  {
    "id": "adv-npc-41",
    "avatar": "乞",
    "name": "老乞少女",
    "title": "乞丐",
    "realm": "飞升",
    "personality": "深藏不露",
    "place": "各地",
    "event": "隐世身份 · 天机阁老祖",
    "kind": "隐世"
  },
  {
    "id": "adv-npc-42",
    "avatar": "守",
    "name": "守墓人",
    "title": "墓地老人",
    "realm": "化神",
    "personality": "深藏不露",
    "place": "各地",
    "event": "隐世身份 · 上古宗门遗民",
    "kind": "隐世"
  },
  {
    "id": "adv-npc-43",
    "avatar": "钓",
    "name": "钓鱼老翁",
    "title": "渔夫",
    "realm": "飞升",
    "personality": "深藏不露",
    "place": "各地",
    "event": "隐世身份 · 水道圣人",
    "kind": "隐世"
  },
  {
    "id": "adv-npc-44",
    "avatar": "采",
    "name": "采药少女",
    "title": "普通村民",
    "realm": "飞升",
    "personality": "深藏不露",
    "place": "各地",
    "event": "隐世身份 · 灵药化形",
    "kind": "隐世"
  },
  {
    "id": "adv-npc-45",
    "avatar": "黑",
    "name": "黑猫少年",
    "title": "少年",
    "realm": "飞升",
    "personality": "深藏不露",
    "place": "各地",
    "event": "隐世身份 · 九命妖王",
    "kind": "隐世"
  },
  {
    "id": "adv-npc-46",
    "avatar": "无",
    "name": "无名剑客",
    "title": "流浪剑客",
    "realm": "飞升",
    "personality": "深藏不露",
    "place": "各地",
    "event": "隐世身份 · 剑道大能",
    "kind": "隐世"
  },
  {
    "id": "adv-npc-47",
    "avatar": "棋",
    "name": "棋盘老人",
    "title": "老者",
    "realm": "飞升",
    "personality": "深藏不露",
    "place": "各地",
    "event": "隐世身份 · 因果道祖",
    "kind": "隐世"
  },
  {
    "id": "adv-npc-48",
    "avatar": "失",
    "name": "失忆少女",
    "title": "神秘修士",
    "realm": "炼气",
    "personality": "机缘",
    "place": "各地",
    "event": "玩家帮助她寻找记忆",
    "kind": "奇遇"
  },
  {
    "id": "adv-npc-49",
    "avatar": "受",
    "name": "受伤剑客",
    "title": "其他宗门弟子",
    "realm": "炼气",
    "personality": "机缘",
    "place": "各地",
    "event": "护送任务",
    "kind": "奇遇"
  },
  {
    "id": "adv-npc-50",
    "avatar": "被",
    "name": "被追杀少年",
    "title": "神秘血脉",
    "realm": "炼气",
    "personality": "机缘",
    "place": "各地",
    "event": "收为弟子/触发剧情",
    "kind": "奇遇"
  },
  {
    "id": "adv-npc-51",
    "avatar": "灵",
    "name": "灵宠少女",
    "title": "妖族化形",
    "realm": "炼气",
    "personality": "机缘",
    "place": "各地",
    "event": "灵宠相关剧情",
    "kind": "奇遇"
  },
  {
    "id": "adv-npc-52",
    "avatar": "神",
    "name": "神秘商队",
    "title": "商队",
    "realm": "炼气",
    "personality": "机缘",
    "place": "各地",
    "event": "护送/抢劫",
    "kind": "奇遇"
  },
  {
    "id": "adv-npc-53",
    "avatar": "宗",
    "name": "宗门叛徒",
    "title": "逃亡修士",
    "realm": "炼气",
    "personality": "机缘",
    "place": "各地",
    "event": "提供宗门秘密",
    "kind": "奇遇"
  },
  {
    "id": "adv-npc-54",
    "avatar": "妖",
    "name": "妖族使者",
    "title": "妖族",
    "realm": "炼气",
    "personality": "机缘",
    "place": "各地",
    "event": "开启妖族声望",
    "kind": "奇遇"
  },
  {
    "id": "adv-npc-55",
    "avatar": "魔",
    "name": "魔宗卧底",
    "title": "假装散修",
    "realm": "炼气",
    "personality": "机缘",
    "place": "各地",
    "event": "潜伏在玩家身边",
    "kind": "奇遇"
  },
  {
    "id": "adv-npc-56",
    "avatar": "上",
    "name": "上古残魂",
    "title": "古代修士",
    "realm": "炼气",
    "personality": "机缘",
    "place": "各地",
    "event": "传授功法",
    "kind": "奇遇"
  },
  {
    "id": "adv-npc-57",
    "avatar": "天",
    "name": "天外来客",
    "title": "异界修士",
    "realm": "炼气",
    "personality": "机缘",
    "place": "各地",
    "event": "开启跨界地图",
    "kind": "奇遇"
  }
] as AdventureNpc[]

function pickOne<T>(list: T[]): T | null {
  if (!list.length) return null
  return list[Math.floor(Math.random() * list.length)]
}

function pickUnique(pool: AdventureNpc[], count: number): AdventureNpc[] {
  const result: AdventureNpc[] = []
  const used = new Set<string>()
  const unique = new Set(pool.map((item) => item.id)).size
  const times = Math.min(count, unique)
  for (let i = 0; i < times; i += 1) {
    const available = pool.filter((item) => !used.has(item.id))
    const picked = pickOne(available)
    if (!picked) break
    used.add(picked.id)
    result.push(picked)
  }
  return result
}

/** 历练人物类型 → 战力档位（无明确剑修/异灵根标记时按派系） */
export function combatArchetypeFromNpcKind(
  kind: AdventureNpcKind | string | undefined | null
): CombatPowerArchetype {
  if (kind === '妖族') return 'yaozu'
  if (isDemonicNpcKind(kind)) return 'demon'
  return 'righteous'
}

/** 由境界估算展示 / 对战战力（与战斗结算同量级，不再打折） */
export function estimateNpcPower(
  realm: RealmMajor,
  seed = '',
  archetype: CombatPowerArchetype = 'righteous'
) {
  return estimateCombatPowerByArchetype(realm, archetype, seed)
}

/** 估算人物战斗战力（与玩家 / 名录同量级） */
export function estimateNpcBattlePower(
  realm: RealmMajor,
  seed = '',
  archetype: CombatPowerArchetype = 'righteous'
) {
  return estimateCombatPowerByArchetype(realm, archetype, seed)
}

/** 从宗门人物境界文案解析大境界 */
export function parseMemberRealmMajor(realmText: string): RealmMajor {
  const text = realmText || ''
  for (let i = REALM_MAJORS.length - 1; i >= 0; i -= 1) {
    if (text.includes(REALM_MAJORS[i])) return REALM_MAJORS[i]
  }
  return '炼气'
}

const DISCIPLE_GROUPS: MemberGroup[] = [
  '执事',
  '亲传弟子',
  '内门弟子',
  '外门弟子',
  '杂役弟子'
]

function isEncounterDiscipleGroup(group: MemberGroup, locationRealm: RealmMajor) {
  if (DISCIPLE_GROUPS.includes(group)) return true
  // 高危秘境偶可遇长老
  if (group === '长老' && getRealmMajorIndex(locationRealm) >= getRealmMajorIndex('元婴')) {
    return true
  }
  return false
}

function eventForMember(member: CatalogMember, kind: AdventureNpcKind) {
  if (member.note) return member.note
  if (kind === '宗门弟子') return `同门偶遇 · ${member.specialty || '叙旧切磋'}`
  if (kind === '正道修士') return `正道同道 · ${member.specialty || '论道切磋'}`
  if (kind === '魔道修士') return `魔修际会 · ${member.specialty || '杀机暗藏'}`
  if (kind === '妖族') return `妖族化形 · ${member.specialty || '血脉感应'}`
  return member.specialty || '偶遇'
}

/** 宗门人物 → 历练偶遇人物 */
export function catalogMemberToAdventureNpc(
  member: CatalogMember,
  kind: AdventureNpcKind,
  place = '各地'
): AdventureNpc {
  const sectName = getSectOption(member.sectId)?.name || ''
  return {
    id: member.id,
    name: member.name,
    title: member.title.includes(sectName) ? member.title : `${sectName}${member.title}`,
    realm: parseMemberRealmMajor(member.realm),
    personality: member.personality,
    place,
    event: eventForMember(member, kind),
    avatar: member.avatar || member.name.slice(0, 1),
    kind
  }
}

function sectIdsOfFaction(faction: SectFaction, excludeSectId?: string | null): SectId[] {
  return SECT_OPTIONS.filter(
    (s) => s.faction === faction && (!excludeSectId || s.id !== excludeSectId)
  ).map((s) => s.id)
}

function membersNearRealm(list: CatalogMember[], locationRealm: RealmMajor, maxDiff = 1) {
  const idx = getRealmMajorIndex(locationRealm)
  const near = list.filter((m) => {
    const d = Math.abs(getRealmMajorIndex(parseMemberRealmMajor(m.realm)) - idx)
    return d <= maxDiff
  })
  return near.length ? near : list
}

/**
 * 按派系从「其他宗门」取人；若无其他同派宗门则回退该派全部（不含本宗弟子池时由调用方决定）。
 */
function factionMembersAsNpcs(
  faction: SectFaction,
  kind: AdventureNpcKind,
  locationRealm: RealmMajor,
  excludeSectId?: string | null,
  place = '各地'
): AdventureNpc[] {
  let ids = sectIdsOfFaction(faction, excludeSectId)
  if (!ids.length) ids = sectIdsOfFaction(faction, null)
  const raw = ids
    .flatMap((id) => getSectMembers(id))
    .filter((m) => isEncounterDiscipleGroup(m.group, locationRealm))
  return membersNearRealm(raw, locationRealm).map((m) =>
    catalogMemberToAdventureNpc(m, kind, place)
  )
}

/** 本宗弟子（偶遇「宗门弟子」） */
function ownSectDisciplesAsNpcs(
  playerSectId: string,
  locationRealm: RealmMajor,
  locationName: string
): AdventureNpc[] {
  const raw = getSectMembers(playerSectId).filter((m) =>
    isEncounterDiscipleGroup(m.group, locationRealm)
  )
  return membersNearRealm(raw, locationRealm).map((m) =>
    catalogMemberToAdventureNpc(m, '宗门弟子', locationName)
  )
}

/**
 * 坊市当日随机人物（随货架换日刷新）：
 * 商人 / 散修取目录；正道 / 魔道优先取其他宗门对应派系人物
 */
export function rollMarketNpcs(
  playerMajor: RealmMajor,
  count = 3,
  playerSectId: string | null | undefined = null
): AdventureNpc[] {
  const idx = getRealmMajorIndex(playerMajor)
  const n = Math.max(2, Math.min(4, count))

  const nearFilter = (item: AdventureNpc) => {
    const d = Math.abs(getRealmMajorIndex(item.realm) - idx)
    return d <= 1
  }

  const merchants = ADVENTURE_NPC_CATALOG.filter((item) => item.kind === '商人')
  const loose = ADVENTURE_NPC_CATALOG.filter((item) => item.kind === '散修')
  const demonicCatalog = ADVENTURE_NPC_CATALOG.filter((item) => item.kind === '魔道修士')

  const righteousSect = factionMembersAsNpcs('正道', '正道修士', playerMajor, playerSectId)
  const demonicSect = factionMembersAsNpcs('魔门', '魔道修士', playerMajor, playerSectId)

  function poolFor(kind: MarketNpcKind): AdventureNpc[] {
    let raw: AdventureNpc[]
    if (kind === '商人') raw = merchants
    else if (kind === '散修') raw = loose
    else if (kind === '魔道修士') {
      raw = demonicSect.length ? demonicSect : demonicCatalog
    } else {
      raw = righteousSect.length
        ? righteousSect
        : ADVENTURE_NPC_CATALOG.filter(
            (item) => item.kind === '正道修士' || item.kind === '宗门弟子'
          ).map((item) =>
            item.kind === '宗门弟子' ? { ...item, kind: '正道修士' as const } : item
          )
    }
    const near = raw.filter(nearFilter)
    return near.length ? near : raw
  }

  const kinds = [...MARKET_NPC_KINDS]
  for (let i = kinds.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[kinds[i], kinds[j]] = [kinds[j], kinds[i]]
  }

  const result: AdventureNpc[] = []
  const used = new Set<string>()
  for (const kind of kinds) {
    if (result.length >= n) break
    const available = poolFor(kind).filter((item) => !used.has(item.id))
    const picked = pickOne(available)
    if (!picked) continue
    used.add(picked.id)
    result.push(picked)
  }

  if (result.length < n) {
    const filler = [
      ...poolFor('商人'),
      ...poolFor('正道修士'),
      ...poolFor('魔道修士'),
      ...poolFor('散修')
    ].filter((item) => !used.has(item.id))
    result.push(...pickUnique(filler, n - result.length))
  }

  return result.map(normalizeAdventureNpc)
}

/**
 * 依当前历练地点随机偶遇人物：
 * - 宗门弟子：本宗弟子
 * - 正道 / 魔道 / 妖族：其他宗门对应派系人物
 * - 另混入散修 / 商人 / 隐世 / 奇遇
 */
export function rollEncounterNpcs(
  locationName: string,
  locationRealm: RealmMajor,
  count = 1,
  playerSectId: string | null | undefined = null
): AdventureNpc[] {
  const catalogLoose = ADVENTURE_NPC_CATALOG.filter(
    (item) =>
      item.place === '各地' &&
      (item.kind === '散修' || item.kind === '商人') &&
      Math.abs(getRealmMajorIndex(item.realm) - getRealmMajorIndex(locationRealm)) <= 1
  )
  const special = ADVENTURE_NPC_CATALOG.filter(
    (item) => item.kind === '隐世' || item.kind === '奇遇'
  )

  const pool: AdventureNpc[] = []

  if (playerSectId) {
    const own = ownSectDisciplesAsNpcs(playerSectId, locationRealm, locationName)
    const righteous = factionMembersAsNpcs(
      '正道',
      '正道修士',
      locationRealm,
      playerSectId,
      locationName
    )
    const demonic = factionMembersAsNpcs(
      '魔门',
      '魔道修士',
      locationRealm,
      playerSectId,
      locationName
    )
    const beastFolk = factionMembersAsNpcs(
      '妖族',
      '妖族',
      locationRealm,
      playerSectId,
      locationName
    )

    // 本宗加权最高
    pool.push(...own, ...own, ...own)
    pool.push(...righteous, ...righteous)
    pool.push(...demonic, ...demonic)
    pool.push(...beastFolk, ...beastFolk)

    // 无其他同派宗门时，魔道 / 正道回退目录
    if (!demonic.length) {
      const mo = ADVENTURE_NPC_CATALOG.filter(
        (item) =>
          item.kind === '魔道修士' &&
          Math.abs(getRealmMajorIndex(item.realm) - getRealmMajorIndex(locationRealm)) <= 1
      )
      pool.push(...mo, ...mo)
    }
  } else {
    // 未入宗：沿用目录宗门弟子 + 魔道
    const local = ADVENTURE_NPC_CATALOG.filter((item) => item.place === locationName)
    const disciples = ADVENTURE_NPC_CATALOG.filter(
      (item) => item.kind === '宗门弟子' && item.realm === locationRealm
    )
    const mo = ADVENTURE_NPC_CATALOG.filter(
      (item) =>
        item.kind === '魔道修士' &&
        Math.abs(getRealmMajorIndex(item.realm) - getRealmMajorIndex(locationRealm)) <= 1
    )
    pool.push(...local, ...local, ...local)
    pool.push(...disciples, ...disciples)
    pool.push(...mo, ...mo)
  }

  pool.push(...catalogLoose, ...catalogLoose)
  pool.push(...special)

  if (!pool.length) {
    return ADVENTURE_NPC_CATALOG.slice(0, Math.min(count, ADVENTURE_NPC_CATALOG.length)).map(
      normalizeAdventureNpc
    )
  }

  return pickUnique(pool, count).map(normalizeAdventureNpc)
}

/** 任务「清剿敌对势力」：优先塞入一名相对玩家派系的敌对人物（正道/魔门/妖族互为敌对） */
export function pickHostileEncounterNpc(
  locationRealm: RealmMajor,
  playerSectId: string | null | undefined = null
): AdventureNpc | null {
  const faction = playerSectId ? getSectOption(playerSectId)?.faction : null
  const pool: AdventureNpc[] = []
  if (faction !== '正道') {
    pool.push(...factionMembersAsNpcs('正道', '正道修士', locationRealm, playerSectId))
  }
  if (faction !== '魔门') {
    pool.push(...factionMembersAsNpcs('魔门', '魔道修士', locationRealm, playerSectId))
  }
  if (faction !== '妖族') {
    pool.push(...factionMembersAsNpcs('妖族', '妖族', locationRealm, playerSectId))
  }
  // 无宗：与 isHostileNpcToPlayer 一致，不计正道
  const candidates = faction
    ? pool
    : pool.filter((n) => n.kind === '魔道修士' || n.kind === '妖族')
  if (candidates.length) return pickOne(candidates)

  const catalogHostile = ADVENTURE_NPC_CATALOG.filter((n) =>
    isHostileNpcToPlayer(n.kind, playerSectId)
  )
  return pickOne(
    catalogHostile.length
      ? catalogHostile
      : ADVENTURE_NPC_CATALOG.filter((n) => n.kind === '魔道修士' || n.kind === '妖族')
  )
}

/** @deprecated 使用 pickHostileEncounterNpc */
export function pickDemonicEncounterNpc(
  locationRealm: RealmMajor,
  playerSectId: string | null | undefined = null
): AdventureNpc | null {
  return pickHostileEncounterNpc(locationRealm, playerSectId)
}
