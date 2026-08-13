import type { RealmMajor } from './realm'
import { getRealmMajorIndex } from './treasure'

export type AdventureNpcKind = '宗门弟子' | '散修' | '商人' | '魔修' | '隐世' | '奇遇'

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
    "kind": "魔修"
  },
  {
    "id": "adv-npc-29",
    "avatar": "黑",
    "name": "黑煞",
    "title": "魔修",
    "realm": "金丹",
    "personality": "阴狠",
    "place": "各地",
    "event": "魔功 · 毒煞",
    "kind": "魔修"
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
    "kind": "魔修"
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
    "kind": "魔修"
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
    "kind": "魔修"
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
    "kind": "魔修"
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
    "kind": "魔修"
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
    "kind": "魔修"
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
    "kind": "魔修"
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
    "kind": "魔修"
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
    "avatar": "老",
    "name": "老乞丐",
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

/**
 * 依当前历练地点随机偶遇人物：
 * - 优先该地点宗门弟子
 * - 混入同境界散修/商人/魔修
 * - 少量隐世与奇遇（各地）
 */
export function rollEncounterNpcs(
  locationName: string,
  locationRealm: RealmMajor,
  count = 1
): AdventureNpc[] {
  const local = ADVENTURE_NPC_CATALOG.filter((item) => item.place === locationName)
  const sameRealm = ADVENTURE_NPC_CATALOG.filter(
    (item) =>
      item.place === '各地' &&
      item.realm === locationRealm &&
      (item.kind === '散修' || item.kind === '商人' || item.kind === '魔修')
  )
  const near = ADVENTURE_NPC_CATALOG.filter((item) => {
    if (item.place !== '各地') return false
    if (!(item.kind === '散修' || item.kind === '商人' || item.kind === '魔修')) return false
    const diff = Math.abs(getRealmMajorIndex(item.realm) - getRealmMajorIndex(locationRealm))
    return diff === 1
  })
  const special = ADVENTURE_NPC_CATALOG.filter(
    (item) => item.kind === '隐世' || item.kind === '奇遇'
  )
  const discipleSame = ADVENTURE_NPC_CATALOG.filter(
    (item) =>
      item.kind === '宗门弟子' &&
      item.place !== locationName &&
      item.realm === locationRealm
  )

  const pool: AdventureNpc[] = []
  pool.push(...local, ...local, ...local)
  pool.push(...sameRealm, ...sameRealm)
  pool.push(...near)
  pool.push(...discipleSame)
  // 隐世/奇遇低权重，但各地都可能刷到
  pool.push(...special)

  if (!pool.length) {
    return ADVENTURE_NPC_CATALOG.slice(0, Math.min(count, ADVENTURE_NPC_CATALOG.length))
  }

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
