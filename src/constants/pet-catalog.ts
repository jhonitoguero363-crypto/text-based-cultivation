import { estimateBeastSellPrice, getBeastByName } from './beast-catalog'
import type { RealmMajor } from './realm'
import { REALM_MAJORS } from './realm'

export interface CatalogPet {
  id: string
  name: string
  /** 种族 */
  race: string
  /** 稀有度星级展示 */
  rarity: string
  stars: number
  /** 核心能力 */
  ability: string
  /** 定位 */
  role: string
  realm: RealmMajor
  price: number
  sellPrice: number
}

/** 灵兽阁售卖灵宠目录 */
export const PET_SHOP_CATALOG: CatalogPet[] = [
  {
    "id": "pet-e99d92e781b5",
    "name": "青灵狐",
    "race": "灵狐",
    "rarity": "★",
    "stars": 1,
    "ability": "采药、寻宝",
    "role": "辅助",
    "realm": "炼气",
    "price": 210,
    "sellPrice": 84
  },
  {
    "id": "pet-e8b5a4e784b0",
    "name": "赤焰兔",
    "race": "灵兔",
    "rarity": "★",
    "stars": 1,
    "ability": "火焰攻击",
    "role": "输出",
    "realm": "炼气",
    "price": 210,
    "sellPrice": 84
  },
  {
    "id": "pet-e98791e7bebd",
    "name": "金羽雀",
    "race": "灵鸟",
    "rarity": "★★",
    "stars": 2,
    "ability": "侦查、寻路",
    "role": "探索",
    "realm": "炼气",
    "price": 280,
    "sellPrice": 112
  },
  {
    "id": "pet-e69c88e5bdb1",
    "name": "月影猫",
    "race": "灵猫",
    "rarity": "★★",
    "stars": 2,
    "ability": "夜视、潜行",
    "role": "刺客",
    "realm": "炼气",
    "price": 280,
    "sellPrice": 112
  },
  {
    "id": "pet-e7b4abe794b5",
    "name": "紫电貂",
    "race": "雷兽",
    "rarity": "★★",
    "stars": 2,
    "ability": "雷电攻击",
    "role": "输出",
    "realm": "筑基",
    "price": 840,
    "sellPrice": 336
  },
  {
    "id": "pet-e78e84e794b2",
    "name": "玄甲龟",
    "race": "灵龟",
    "rarity": "★★",
    "stars": 2,
    "ability": "防御、护主",
    "role": "坦克",
    "realm": "筑基",
    "price": 840,
    "sellPrice": 336
  },
  {
    "id": "pet-e7a2a7e6b0b4",
    "name": "碧水蛇",
    "race": "灵蛇",
    "rarity": "★★",
    "stars": 2,
    "ability": "水系法术",
    "role": "控制",
    "realm": "筑基",
    "price": 840,
    "sellPrice": 336
  },
  {
    "id": "pet-e8b5a4e7828e",
    "name": "赤炎狼",
    "race": "灵狼",
    "rarity": "★★★",
    "stars": 3,
    "ability": "火焰爆发",
    "role": "输出",
    "realm": "筑基",
    "price": 1050,
    "sellPrice": 420
  },
  {
    "id": "pet-e98791e7bf85",
    "name": "金翅鹰",
    "race": "灵禽",
    "rarity": "★★★",
    "stars": 3,
    "ability": "空战、追踪",
    "role": "输出",
    "realm": "金丹",
    "price": 3150,
    "sellPrice": 1260
  },
  {
    "id": "pet-e5af92e69c88",
    "name": "寒月狐",
    "race": "灵狐",
    "rarity": "★★★",
    "stars": 3,
    "ability": "冰系、幻术",
    "role": "控制",
    "realm": "金丹",
    "price": 3150,
    "sellPrice": 1260
  },
  {
    "id": "pet-e7828ee9ba9f",
    "name": "炎麟兽",
    "race": "麒麟血脉",
    "rarity": "★★★★",
    "stars": 4,
    "ability": "火焰、护主",
    "role": "战斗",
    "realm": "金丹",
    "price": 3780,
    "sellPrice": 1512
  },
  {
    "id": "pet-e4b99de5b0be",
    "name": "九尾灵猫",
    "race": "灵猫",
    "rarity": "★★★★",
    "stars": 4,
    "ability": "幻术、偷袭",
    "role": "刺客",
    "realm": "金丹",
    "price": 3780,
    "sellPrice": 1512
  },
  {
    "id": "pet-e99d92e69ca8",
    "name": "青木龙",
    "race": "龙族",
    "rarity": "★★★★",
    "stars": 4,
    "ability": "木系治疗",
    "role": "辅助",
    "realm": "元婴",
    "price": 9450,
    "sellPrice": 3780
  },
  {
    "id": "pet-e78e84e586b0",
    "name": "玄冰蛟",
    "race": "蛟龙",
    "rarity": "★★★★",
    "stars": 4,
    "ability": "冰封、控场",
    "role": "控制",
    "realm": "元婴",
    "price": 9450,
    "sellPrice": 3780
  },
  {
    "id": "pet-e99bb7e99c86",
    "name": "雷霆虎",
    "race": "雷兽",
    "rarity": "★★★★",
    "stars": 4,
    "ability": "雷法、爆发",
    "role": "输出",
    "realm": "元婴",
    "price": 9450,
    "sellPrice": 3780
  },
  {
    "id": "pet-e4b99de5b9bd",
    "name": "九幽狼",
    "race": "冥兽",
    "rarity": "★★★★★",
    "stars": 5,
    "ability": "灵魂攻击",
    "role": "刺客",
    "realm": "元婴",
    "price": 11025,
    "sellPrice": 4410
  },
  {
    "id": "pet-e8b5a4e784b0",
    "name": "赤焰真龙",
    "race": "真龙",
    "rarity": "★★★★★",
    "stars": 5,
    "ability": "真火、龙威",
    "role": "输出",
    "realm": "化神",
    "price": 24500,
    "sellPrice": 9800
  },
  {
    "id": "pet-e5a4aae998b4",
    "name": "太阴玉兔",
    "race": "太阴兽",
    "rarity": "★★★★★",
    "stars": 5,
    "ability": "月华、治疗",
    "role": "辅助",
    "realm": "化神",
    "price": 24500,
    "sellPrice": 9800
  },
  {
    "id": "pet-e4b99de5a4a9",
    "name": "九天鹏",
    "race": "神禽",
    "rarity": "★★★★★",
    "stars": 5,
    "ability": "极速、风雷",
    "role": "输出",
    "realm": "化神",
    "price": 24500,
    "sellPrice": 9800
  },
  {
    "id": "pet-e5b9bde586a5",
    "name": "幽冥凤凰",
    "race": "凤凰",
    "rarity": "★★★★★",
    "stars": 5,
    "ability": "死亡、重生",
    "role": "战斗",
    "realm": "化神",
    "price": 24500,
    "sellPrice": 9800
  },
  {
    "id": "pet-e8999ae7a9ba",
    "name": "虚空兽",
    "race": "虚空兽",
    "rarity": "★★★★★",
    "stars": 5,
    "ability": "空间穿梭",
    "role": "探索",
    "realm": "炼虚",
    "price": 53900,
    "sellPrice": 21560
  },
  {
    "id": "pet-e6989fe8beb0",
    "name": "星辰龙",
    "race": "星龙",
    "rarity": "★★★★★★",
    "stars": 6,
    "ability": "星辰法则",
    "role": "输出",
    "realm": "炼虚",
    "price": 61600,
    "sellPrice": 24640
  },
  {
    "id": "pet-e8bdaee59b9e",
    "name": "轮回蝶",
    "race": "轮回灵兽",
    "rarity": "★★★★★★",
    "stars": 6,
    "ability": "轮回、复活",
    "role": "辅助",
    "realm": "炼虚",
    "price": 61600,
    "sellPrice": 24640
  },
  {
    "id": "pet-e5a4aae8999a",
    "name": "太虚鲲",
    "race": "鲲鹏",
    "rarity": "★★★★★★",
    "stars": 6,
    "ability": "吞噬空间",
    "role": "坦克",
    "realm": "炼虚",
    "price": 61600,
    "sellPrice": 24640
  },
  {
    "id": "pet-e6b7b7e6b28c",
    "name": "混沌麒麟",
    "race": "麒麟",
    "rarity": "★★★★★★",
    "stars": 6,
    "ability": "混沌之力",
    "role": "全能",
    "realm": "合体",
    "price": 126000,
    "sellPrice": 50400
  },
  {
    "id": "pet-e998b4e998b3",
    "name": "阴阳神凰",
    "race": "凤凰",
    "rarity": "★★★★★★",
    "stars": 6,
    "ability": "阴阳法则",
    "role": "输出",
    "realm": "合体",
    "price": 126000,
    "sellPrice": 50400
  },
  {
    "id": "pet-e4b99de5a4a9",
    "name": "九天应龙",
    "race": "应龙",
    "rarity": "★★★★★★",
    "stars": 6,
    "ability": "风雷、水火",
    "role": "战斗",
    "realm": "合体",
    "price": 126000,
    "sellPrice": 50400
  },
  {
    "id": "pet-e4b887e781b5",
    "name": "万灵树妖",
    "race": "灵植",
    "rarity": "★★★★★★",
    "stars": 6,
    "ability": "治疗、召唤",
    "role": "辅助",
    "realm": "合体",
    "price": 126000,
    "sellPrice": 50400
  },
  {
    "id": "pet-e9b8bfe89299",
    "name": "鸿蒙祖龙",
    "race": "祖龙",
    "rarity": "★★★★★★★",
    "stars": 7,
    "ability": "鸿蒙之力",
    "role": "输出",
    "realm": "大乘",
    "price": 283500,
    "sellPrice": 113400
  },
  {
    "id": "pet-e980a0e58c96",
    "name": "造化神蝶",
    "race": "神蝶",
    "rarity": "★★★★★★★",
    "stars": 7,
    "ability": "造化法则",
    "role": "辅助",
    "realm": "大乘",
    "price": 283500,
    "sellPrice": 113400
  },
  {
    "id": "pet-e4b99de5b0be",
    "name": "九尾天狐",
    "race": "天狐",
    "rarity": "★★★★★★★",
    "stars": 7,
    "ability": "幻境、魅惑",
    "role": "控制",
    "realm": "大乘",
    "price": 283500,
    "sellPrice": 113400
  },
  {
    "id": "pet-e5a4aae5889d",
    "name": "太初玄龟",
    "race": "神龟",
    "rarity": "★★★★★★★",
    "stars": 7,
    "ability": "防御、镇界",
    "role": "坦克",
    "realm": "大乘",
    "price": 283500,
    "sellPrice": 113400
  },
  {
    "id": "pet-e4b99de5a4a9",
    "name": "九天雷龙",
    "race": "雷龙",
    "rarity": "★★★★★★★★",
    "stars": 8,
    "ability": "天劫雷霆",
    "role": "输出",
    "realm": "渡劫",
    "price": 630000,
    "sellPrice": 252000
  },
  {
    "id": "pet-e8bdaee59b9e",
    "name": "轮回神凰",
    "race": "神凰",
    "rarity": "★★★★★★★★",
    "stars": 8,
    "ability": "九死轮回",
    "role": "复活",
    "realm": "渡劫",
    "price": 630000,
    "sellPrice": 252000
  },
  {
    "id": "pet-e5a4a9e591bd",
    "name": "天命麒麟",
    "race": "麒麟",
    "rarity": "★★★★★★★★",
    "stars": 8,
    "ability": "气运、天命",
    "role": "辅助",
    "realm": "渡劫",
    "price": 630000,
    "sellPrice": 252000
  },
  {
    "id": "pet-e8999ae697a0",
    "name": "虚无神鲲",
    "race": "神鲲",
    "rarity": "★★★★★★★★",
    "stars": 8,
    "ability": "吞噬万物",
    "role": "坦克",
    "realm": "渡劫",
    "price": 630000,
    "sellPrice": 252000
  },
  {
    "id": "pet-e9b8bfe89299",
    "name": "鸿蒙神龙",
    "race": "神龙",
    "rarity": "★★★★★★★★★",
    "stars": 9,
    "ability": "鸿蒙法则",
    "role": "全能",
    "realm": "飞升",
    "price": 1386000,
    "sellPrice": 554400
  },
  {
    "id": "pet-e6b7b7e6b28c",
    "name": "混沌凤凰",
    "race": "祖凰",
    "rarity": "★★★★★★★★★",
    "stars": 9,
    "ability": "混沌涅槃",
    "role": "输出",
    "realm": "飞升",
    "price": 1386000,
    "sellPrice": 554400
  },
  {
    "id": "pet-e697a0e69e81",
    "name": "无极天狐",
    "race": "天狐",
    "rarity": "★★★★★★★★★",
    "stars": 9,
    "ability": "无极幻境",
    "role": "控制",
    "realm": "飞升",
    "price": 1386000,
    "sellPrice": 554400
  },
  {
    "id": "pet-e4b896e7958c",
    "name": "世界树灵",
    "race": "世界灵",
    "rarity": "★★★★★★★★★",
    "stars": 9,
    "ability": "世界法则",
    "role": "辅助",
    "realm": "飞升",
    "price": 1386000,
    "sellPrice": 554400
  },
  {
    "id": "pet-e5a4aae5889d",
    "name": "太初麒麟",
    "race": "祖麒麟",
    "rarity": "★★★★★★★★★★",
    "stars": 10,
    "ability": "太初本源",
    "role": "全能",
    "realm": "飞升",
    "price": 1512000,
    "sellPrice": 604800
  }
] as CatalogPet[]

export const PET_SHOP_REALMS: RealmMajor[] = REALM_MAJORS.filter((realm) =>
  PET_SHOP_CATALOG.some((item) => item.realm === realm)
)

export function getPetByName(name: string) {
  return PET_SHOP_CATALOG.find((item) => item.name === name) || null
}

/**
 * 兽阁回收价：
 * - 兽阁购买的灵宠 → 目录 sellPrice
 * - 秘境抓捕妖兽 → 按妖兽估价
 */
export function sellPriceOfOwnedPet(pet: {
  name: string
  source?: 'shop' | 'capture'
}) {
  const shop = getPetByName(pet.name)
  if (pet.source !== 'capture' && shop) return shop.sellPrice

  const beast = getBeastByName(pet.name)
  if (beast) return estimateBeastSellPrice(beast)
  if (shop) return shop.sellPrice
  return 40
}
