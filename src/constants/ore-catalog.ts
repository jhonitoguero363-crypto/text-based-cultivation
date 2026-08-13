import type { RealmMajor, RealmState } from './realm'
import { getStagesForMajor, REALM_MAJORS } from './realm'
import type { TreasureGrade } from './treasure'

export interface OreMaterial {
  id: string
  name: string
  level: string
  attr: string
  origin: string
  /** 可用于炼制的法宝 */
  treasures: string[]
  exchangeCost: number
}

export interface TreasureRecipeMaterial {
  name: string
  count: number
}

export interface TreasureRecipe {
  treasureName: string
  grade: TreasureGrade | string
  realm: RealmMajor | string
  spiritStones: number
  materials: TreasureRecipeMaterial[]
}

export type MineReward =
  | { kind: 'empty' }
  | { kind: 'ore'; name: string; level: string; count: number }
  | { kind: 'spirit'; amount: number }

/** @deprecated 挖矿已无每日次数上限，保留常量以免旧引用报错 */
export const DAILY_MINE_LIMIT = Number.POSITIVE_INFINITY

/** 全部矿石 */
export const ORE_MATERIALS: OreMaterial[] = [
  {
    "id": "ore-1",
    "name": "青云铁",
    "level": "灵矿",
    "attr": "木",
    "origin": "青云山脉",
    "treasures": [
      "青竹剑"
    ],
    "exchangeCost": 40
  },
  {
    "id": "ore-2",
    "name": "青灵石",
    "level": "灵矿",
    "attr": "木",
    "origin": "灵脉",
    "treasures": [
      "青竹剑"
    ],
    "exchangeCost": 40
  },
  {
    "id": "ore-3",
    "name": "寒铁矿",
    "level": "灵矿",
    "attr": "冰",
    "origin": "寒潭矿洞",
    "treasures": [
      "青竹剑"
    ],
    "exchangeCost": 40
  },
  {
    "id": "ore-4",
    "name": "聚灵石",
    "level": "灵矿",
    "attr": "灵气",
    "origin": "灵脉核心",
    "treasures": [
      "聚灵葫"
    ],
    "exchangeCost": 40
  },
  {
    "id": "ore-5",
    "name": "温玉矿",
    "level": "灵矿",
    "attr": "火/土",
    "origin": "地热矿脉",
    "treasures": [
      "聚灵葫"
    ],
    "exchangeCost": 40
  },
  {
    "id": "ore-6",
    "name": "灵晶砂",
    "level": "灵矿",
    "attr": "灵气",
    "origin": "灵河河床",
    "treasures": [
      "聚灵葫"
    ],
    "exchangeCost": 40
  },
  {
    "id": "ore-7",
    "name": "青木灵石",
    "level": "灵矿",
    "attr": "木",
    "origin": "青木森林",
    "treasures": [
      "聚灵葫"
    ],
    "exchangeCost": 40
  },
  {
    "id": "ore-8",
    "name": "镇魂石",
    "level": "灵矿",
    "attr": "魂",
    "origin": "古战场",
    "treasures": [
      "镇魂铃"
    ],
    "exchangeCost": 40
  },
  {
    "id": "ore-9",
    "name": "玄铜矿",
    "level": "灵矿",
    "attr": "金",
    "origin": "铜矿山",
    "treasures": [
      "镇魂铃"
    ],
    "exchangeCost": 40
  },
  {
    "id": "ore-10",
    "name": "幽冥砂",
    "level": "灵矿",
    "attr": "阴",
    "origin": "幽冥洞窟",
    "treasures": [
      "镇魂铃"
    ],
    "exchangeCost": 40
  },
  {
    "id": "ore-11",
    "name": "月影石",
    "level": "灵矿",
    "attr": "月华",
    "origin": "月影谷",
    "treasures": [
      "镇魂铃"
    ],
    "exchangeCost": 40
  },
  {
    "id": "ore-12",
    "name": "寒魄石",
    "level": "灵矿",
    "attr": "冰魂",
    "origin": "极寒之地",
    "treasures": [
      "镇魂铃"
    ],
    "exchangeCost": 40
  },
  {
    "id": "ore-13",
    "name": "紫云铁",
    "level": "高阶灵矿",
    "attr": "紫气",
    "origin": "紫云山",
    "treasures": [
      "紫云剑"
    ],
    "exchangeCost": 120
  },
  {
    "id": "ore-14",
    "name": "天青石",
    "level": "高阶灵矿",
    "attr": "木",
    "origin": "天青矿脉",
    "treasures": [
      "紫云剑"
    ],
    "exchangeCost": 120
  },
  {
    "id": "ore-15",
    "name": "星纹铁",
    "level": "高阶灵矿",
    "attr": "星辰",
    "origin": "星空陨石带",
    "treasures": [
      "紫云剑"
    ],
    "exchangeCost": 120
  },
  {
    "id": "ore-16",
    "name": "紫灵晶",
    "level": "高阶灵矿",
    "attr": "灵气",
    "origin": "紫灵矿洞",
    "treasures": [
      "紫云剑"
    ],
    "exchangeCost": 120
  },
  {
    "id": "ore-17",
    "name": "九转灵晶",
    "level": "高阶灵矿",
    "attr": "灵气",
    "origin": "九转灵脉",
    "treasures": [
      "九转灵珠"
    ],
    "exchangeCost": 120
  },
  {
    "id": "ore-18",
    "name": "聚灵玉",
    "level": "高阶灵矿",
    "attr": "灵气",
    "origin": "聚灵矿区",
    "treasures": [
      "九转灵珠"
    ],
    "exchangeCost": 120
  },
  {
    "id": "ore-19",
    "name": "青木晶",
    "level": "高阶灵矿",
    "attr": "木",
    "origin": "青木矿脉",
    "treasures": [
      "九转灵珠"
    ],
    "exchangeCost": 120
  },
  {
    "id": "ore-20",
    "name": "灵髓石",
    "level": "高阶灵矿",
    "attr": "灵气",
    "origin": "灵髓矿洞",
    "treasures": [
      "九转灵珠"
    ],
    "exchangeCost": 120
  },
  {
    "id": "ore-21",
    "name": "月华石",
    "level": "高阶灵矿",
    "attr": "月华",
    "origin": "月华矿脉",
    "treasures": [
      "九转灵珠"
    ],
    "exchangeCost": 120
  },
  {
    "id": "ore-22",
    "name": "山岳玄铁",
    "level": "高阶灵矿",
    "attr": "土",
    "origin": "巨山矿脉",
    "treasures": [
      "山河印"
    ],
    "exchangeCost": 120
  },
  {
    "id": "ore-23",
    "name": "厚土晶",
    "level": "神矿",
    "attr": "土",
    "origin": "大地矿脉",
    "treasures": [
      "山河印",
      "五行轮"
    ],
    "exchangeCost": 500
  },
  {
    "id": "ore-24",
    "name": "镇山石",
    "level": "高阶灵矿",
    "attr": "土",
    "origin": "灵山核心",
    "treasures": [
      "山河印"
    ],
    "exchangeCost": 120
  },
  {
    "id": "ore-25",
    "name": "玄黄玉",
    "level": "高阶灵矿",
    "attr": "土",
    "origin": "玄黄矿脉",
    "treasures": [
      "山河印"
    ],
    "exchangeCost": 120
  },
  {
    "id": "ore-26",
    "name": "地脉石",
    "level": "高阶灵矿",
    "attr": "土",
    "origin": "地脉深处",
    "treasures": [
      "山河印"
    ],
    "exchangeCost": 120
  },
  {
    "id": "ore-27",
    "name": "青铜灵矿",
    "level": "高阶灵矿",
    "attr": "金",
    "origin": "古矿区",
    "treasures": [
      "山河印"
    ],
    "exchangeCost": 120
  },
  {
    "id": "ore-28",
    "name": "赤金矿",
    "level": "神矿",
    "attr": "金火",
    "origin": "赤金矿山",
    "treasures": [
      "金乌羽"
    ],
    "exchangeCost": 500
  },
  {
    "id": "ore-29",
    "name": "炎阳晶",
    "level": "神矿",
    "attr": "火",
    "origin": "太阳岩洞",
    "treasures": [
      "金乌羽"
    ],
    "exchangeCost": 500
  },
  {
    "id": "ore-30",
    "name": "火云石",
    "level": "神矿",
    "attr": "火",
    "origin": "火云山",
    "treasures": [
      "金乌羽"
    ],
    "exchangeCost": 500
  },
  {
    "id": "ore-31",
    "name": "金乌灵晶",
    "level": "神矿",
    "attr": "火",
    "origin": "金乌遗迹",
    "treasures": [
      "金乌羽"
    ],
    "exchangeCost": 500
  },
  {
    "id": "ore-32",
    "name": "熔岩精金",
    "level": "神矿",
    "attr": "火金",
    "origin": "地火熔岩",
    "treasures": [
      "金乌羽"
    ],
    "exchangeCost": 500
  },
  {
    "id": "ore-33",
    "name": "太阴石",
    "level": "神矿",
    "attr": "阴",
    "origin": "太阴矿脉",
    "treasures": [
      "太阴镜"
    ],
    "exchangeCost": 500
  },
  {
    "id": "ore-34",
    "name": "玄冰晶",
    "level": "神矿",
    "attr": "冰",
    "origin": "万年冰原",
    "treasures": [
      "太阴镜"
    ],
    "exchangeCost": 500
  },
  {
    "id": "ore-35",
    "name": "月魄玉",
    "level": "神矿",
    "attr": "月华",
    "origin": "月宫遗迹",
    "treasures": [
      "太阴镜"
    ],
    "exchangeCost": 500
  },
  {
    "id": "ore-36",
    "name": "幽月银",
    "level": "神矿",
    "attr": "阴",
    "origin": "幽月矿区",
    "treasures": [
      "太阴镜"
    ],
    "exchangeCost": 500
  },
  {
    "id": "ore-37",
    "name": "寒星石",
    "level": "神矿",
    "attr": "星辰/冰",
    "origin": "寒星秘境",
    "treasures": [
      "太阴镜"
    ],
    "exchangeCost": 500
  },
  {
    "id": "ore-38",
    "name": "金灵晶",
    "level": "神矿",
    "attr": "金",
    "origin": "金灵矿脉",
    "treasures": [
      "五行轮"
    ],
    "exchangeCost": 500
  },
  {
    "id": "ore-39",
    "name": "玄水晶",
    "level": "神矿",
    "attr": "水",
    "origin": "深海矿脉",
    "treasures": [
      "五行轮"
    ],
    "exchangeCost": 500
  },
  {
    "id": "ore-40",
    "name": "赤炎晶",
    "level": "神矿",
    "attr": "火",
    "origin": "火山矿脉",
    "treasures": [
      "五行轮"
    ],
    "exchangeCost": 500
  },
  {
    "id": "ore-41",
    "name": "五行灵玉",
    "level": "神矿",
    "attr": "五行",
    "origin": "五行秘境",
    "treasures": [
      "五行轮"
    ],
    "exchangeCost": 500
  },
  {
    "id": "ore-42",
    "name": "通天玄铁",
    "level": "神矿",
    "attr": "金",
    "origin": "通天山",
    "treasures": [
      "通天剑匣"
    ],
    "exchangeCost": 500
  },
  {
    "id": "ore-43",
    "name": "星陨铁",
    "level": "神矿",
    "attr": "星辰",
    "origin": "星陨之地",
    "treasures": [
      "通天剑匣"
    ],
    "exchangeCost": 500
  },
  {
    "id": "ore-44",
    "name": "天青神石",
    "level": "神矿",
    "attr": "木",
    "origin": "天青神山",
    "treasures": [
      "通天剑匣"
    ],
    "exchangeCost": 500
  },
  {
    "id": "ore-45",
    "name": "剑魂晶",
    "level": "神矿",
    "attr": "剑意",
    "origin": "剑冢",
    "treasures": [
      "通天剑匣"
    ],
    "exchangeCost": 500
  },
  {
    "id": "ore-46",
    "name": "庚金精魄",
    "level": "神矿",
    "attr": "金",
    "origin": "庚金矿脉",
    "treasures": [
      "通天剑匣"
    ],
    "exchangeCost": 500
  },
  {
    "id": "ore-47",
    "name": "紫霄铁",
    "level": "神矿",
    "attr": "雷",
    "origin": "紫霄天域",
    "treasures": [
      "通天剑匣"
    ],
    "exchangeCost": 500
  },
  {
    "id": "ore-48",
    "name": "九龙炎晶",
    "level": "神矿",
    "attr": "火",
    "origin": "九龙火域",
    "treasures": [
      "九龙神火罩"
    ],
    "exchangeCost": 500
  },
  {
    "id": "ore-49",
    "name": "赤炎神铁",
    "level": "神矿",
    "attr": "火",
    "origin": "神火矿脉",
    "treasures": [
      "九龙神火罩"
    ],
    "exchangeCost": 500
  },
  {
    "id": "ore-50",
    "name": "火龙玉",
    "level": "神矿",
    "attr": "火龙",
    "origin": "火龙遗迹",
    "treasures": [
      "九龙神火罩"
    ],
    "exchangeCost": 500
  },
  {
    "id": "ore-51",
    "name": "太阳精金",
    "level": "道矿",
    "attr": "阳",
    "origin": "太阳神域",
    "treasures": [
      "九龙神火罩",
      "阴阳天盘"
    ],
    "exchangeCost": 3000
  },
  {
    "id": "ore-52",
    "name": "熔天石",
    "level": "神矿",
    "attr": "火",
    "origin": "熔天火山",
    "treasures": [
      "九龙神火罩"
    ],
    "exchangeCost": 500
  },
  {
    "id": "ore-53",
    "name": "朱雀晶",
    "level": "神矿",
    "attr": "火",
    "origin": "朱雀遗迹",
    "treasures": [
      "九龙神火罩"
    ],
    "exchangeCost": 500
  },
  {
    "id": "ore-54",
    "name": "玄冥寒晶",
    "level": "神矿",
    "attr": "冰/阴",
    "origin": "玄冥秘境",
    "treasures": [
      "玄冥珠"
    ],
    "exchangeCost": 500
  },
  {
    "id": "ore-55",
    "name": "万年玄冰",
    "level": "神矿",
    "attr": "冰",
    "origin": "极北冰原",
    "treasures": [
      "玄冥珠"
    ],
    "exchangeCost": 500
  },
  {
    "id": "ore-56",
    "name": "幽水玉",
    "level": "神矿",
    "attr": "水/阴",
    "origin": "幽冥水域",
    "treasures": [
      "玄冥珠"
    ],
    "exchangeCost": 500
  },
  {
    "id": "ore-57",
    "name": "寒魄精金",
    "level": "神矿",
    "attr": "冰金",
    "origin": "寒魄矿脉",
    "treasures": [
      "玄冥珠"
    ],
    "exchangeCost": 500
  },
  {
    "id": "ore-58",
    "name": "北冥石",
    "level": "神矿",
    "attr": "水",
    "origin": "北冥海",
    "treasures": [
      "玄冥珠"
    ],
    "exchangeCost": 500
  },
  {
    "id": "ore-59",
    "name": "斩仙神铁",
    "level": "仙矿",
    "attr": "杀伐",
    "origin": "斩仙遗迹",
    "treasures": [
      "斩仙飞刀"
    ],
    "exchangeCost": 1200
  },
  {
    "id": "ore-60",
    "name": "庚金神晶",
    "level": "仙矿",
    "attr": "金",
    "origin": "庚金神域",
    "treasures": [
      "斩仙飞刀"
    ],
    "exchangeCost": 1200
  },
  {
    "id": "ore-61",
    "name": "太白精金",
    "level": "仙矿",
    "attr": "金",
    "origin": "太白星",
    "treasures": [
      "斩仙飞刀"
    ],
    "exchangeCost": 1200
  },
  {
    "id": "ore-62",
    "name": "天外陨铁",
    "level": "仙矿",
    "attr": "星辰",
    "origin": "天外陨石",
    "treasures": [
      "斩仙飞刀"
    ],
    "exchangeCost": 1200
  },
  {
    "id": "ore-63",
    "name": "杀伐晶",
    "level": "仙矿",
    "attr": "杀伐",
    "origin": "古战场",
    "treasures": [
      "斩仙飞刀"
    ],
    "exchangeCost": 1200
  },
  {
    "id": "ore-64",
    "name": "仙纹铁",
    "level": "仙矿",
    "attr": "法则",
    "origin": "仙界遗迹",
    "treasures": [
      "斩仙飞刀"
    ],
    "exchangeCost": 1200
  },
  {
    "id": "ore-65",
    "name": "太虚石",
    "level": "仙矿",
    "attr": "虚空",
    "origin": "太虚秘境",
    "treasures": [
      "太虚神舟"
    ],
    "exchangeCost": 1200
  },
  {
    "id": "ore-66",
    "name": "虚空晶",
    "level": "仙矿",
    "attr": "空间",
    "origin": "虚空裂隙",
    "treasures": [
      "太虚神舟"
    ],
    "exchangeCost": 1200
  },
  {
    "id": "ore-67",
    "name": "星辰铁",
    "level": "仙矿",
    "attr": "星辰",
    "origin": "星空",
    "treasures": [
      "太虚神舟"
    ],
    "exchangeCost": 1200
  },
  {
    "id": "ore-68",
    "name": "空冥石",
    "level": "仙矿",
    "attr": "空间",
    "origin": "空冥矿区",
    "treasures": [
      "太虚神舟"
    ],
    "exchangeCost": 1200
  },
  {
    "id": "ore-69",
    "name": "天河神砂",
    "level": "仙矿",
    "attr": "星河",
    "origin": "天河",
    "treasures": [
      "太虚神舟"
    ],
    "exchangeCost": 1200
  },
  {
    "id": "ore-70",
    "name": "空间灵髓",
    "level": "仙矿",
    "attr": "空间",
    "origin": "空间矿脉",
    "treasures": [
      "太虚神舟"
    ],
    "exchangeCost": 1200
  },
  {
    "id": "ore-71",
    "name": "星界晶",
    "level": "仙矿",
    "attr": "世界",
    "origin": "星界",
    "treasures": [
      "太虚神舟"
    ],
    "exchangeCost": 1200
  },
  {
    "id": "ore-72",
    "name": "万魂石",
    "level": "仙矿",
    "attr": "魂",
    "origin": "万魂窟",
    "treasures": [
      "万魂幡"
    ],
    "exchangeCost": 1200
  },
  {
    "id": "ore-73",
    "name": "幽冥铁",
    "level": "仙矿",
    "attr": "阴",
    "origin": "幽冥矿山",
    "treasures": [
      "万魂幡"
    ],
    "exchangeCost": 1200
  },
  {
    "id": "ore-74",
    "name": "魂晶",
    "level": "仙矿",
    "attr": "灵魂",
    "origin": "魂矿",
    "treasures": [
      "万魂幡"
    ],
    "exchangeCost": 1200
  },
  {
    "id": "ore-75",
    "name": "阴煞石",
    "level": "仙矿",
    "attr": "阴",
    "origin": "阴煞之地",
    "treasures": [
      "万魂幡"
    ],
    "exchangeCost": 1200
  },
  {
    "id": "ore-76",
    "name": "九幽玄晶",
    "level": "仙矿",
    "attr": "幽冥",
    "origin": "九幽矿脉",
    "treasures": [
      "万魂幡"
    ],
    "exchangeCost": 1200
  },
  {
    "id": "ore-77",
    "name": "冥河砂",
    "level": "仙矿",
    "attr": "冥",
    "origin": "冥河",
    "treasures": [
      "万魂幡"
    ],
    "exchangeCost": 1200
  },
  {
    "id": "ore-78",
    "name": "空冥玉",
    "level": "仙矿",
    "attr": "空间",
    "origin": "空冥秘境",
    "treasures": [
      "虚空镜"
    ],
    "exchangeCost": 1200
  },
  {
    "id": "ore-79",
    "name": "空间神石",
    "level": "仙矿",
    "attr": "空间",
    "origin": "空间裂隙",
    "treasures": [
      "虚空镜"
    ],
    "exchangeCost": 1200
  },
  {
    "id": "ore-80",
    "name": "镜魂晶",
    "level": "仙矿",
    "attr": "神魂",
    "origin": "镜界",
    "treasures": [
      "虚空镜"
    ],
    "exchangeCost": 1200
  },
  {
    "id": "ore-81",
    "name": "太虚银",
    "level": "仙矿",
    "attr": "虚空",
    "origin": "太虚矿脉",
    "treasures": [
      "虚空镜"
    ],
    "exchangeCost": 1200
  },
  {
    "id": "ore-82",
    "name": "界石",
    "level": "仙矿",
    "attr": "世界",
    "origin": "世界裂隙",
    "treasures": [
      "虚空镜"
    ],
    "exchangeCost": 1200
  },
  {
    "id": "ore-83",
    "name": "时光石",
    "level": "道矿",
    "attr": "时间",
    "origin": "时间秘境",
    "treasures": [
      "时砂"
    ],
    "exchangeCost": 3000
  },
  {
    "id": "ore-84",
    "name": "岁月晶",
    "level": "道矿",
    "attr": "时间",
    "origin": "岁月长河",
    "treasures": [
      "时砂"
    ],
    "exchangeCost": 3000
  },
  {
    "id": "ore-85",
    "name": "星河砂",
    "level": "道矿",
    "attr": "星辰",
    "origin": "星河",
    "treasures": [
      "时砂"
    ],
    "exchangeCost": 3000
  },
  {
    "id": "ore-86",
    "name": "时间神砂",
    "level": "道矿",
    "attr": "时间",
    "origin": "时间长河",
    "treasures": [
      "时砂"
    ],
    "exchangeCost": 3000
  },
  {
    "id": "ore-87",
    "name": "轮回玉",
    "level": "道矿",
    "attr": "轮回",
    "origin": "轮回秘境",
    "treasures": [
      "时砂"
    ],
    "exchangeCost": 3000
  },
  {
    "id": "ore-88",
    "name": "因果石",
    "level": "道矿",
    "attr": "因果",
    "origin": "因果秘境",
    "treasures": [
      "因果笔"
    ],
    "exchangeCost": 3000
  },
  {
    "id": "ore-89",
    "name": "天命晶",
    "level": "道矿",
    "attr": "天命",
    "origin": "天命矿脉",
    "treasures": [
      "因果笔"
    ],
    "exchangeCost": 3000
  },
  {
    "id": "ore-90",
    "name": "玄天玉",
    "level": "道矿",
    "attr": "玄",
    "origin": "玄天秘境",
    "treasures": [
      "因果笔"
    ],
    "exchangeCost": 3000
  },
  {
    "id": "ore-91",
    "name": "道纹金",
    "level": "道矿",
    "attr": "道韵",
    "origin": "道纹山",
    "treasures": [
      "因果笔"
    ],
    "exchangeCost": 3000
  },
  {
    "id": "ore-92",
    "name": "命运神砂",
    "level": "道矿",
    "attr": "命运",
    "origin": "命运长河",
    "treasures": [
      "因果笔"
    ],
    "exchangeCost": 3000
  },
  {
    "id": "ore-93",
    "name": "因果神铁",
    "level": "道矿",
    "attr": "因果",
    "origin": "因果神域",
    "treasures": [
      "因果笔"
    ],
    "exchangeCost": 3000
  },
  {
    "id": "ore-94",
    "name": "阴阳玉",
    "level": "道矿",
    "attr": "阴阳",
    "origin": "阴阳界",
    "treasures": [
      "阴阳天盘"
    ],
    "exchangeCost": 3000
  },
  {
    "id": "ore-95",
    "name": "乾坤石",
    "level": "道矿",
    "attr": "乾坤",
    "origin": "乾坤秘境",
    "treasures": [
      "阴阳天盘"
    ],
    "exchangeCost": 3000
  },
  {
    "id": "ore-96",
    "name": "两仪晶",
    "level": "道矿",
    "attr": "阴阳",
    "origin": "两仪山",
    "treasures": [
      "阴阳天盘"
    ],
    "exchangeCost": 3000
  },
  {
    "id": "ore-97",
    "name": "道韵金",
    "level": "道矿",
    "attr": "道韵",
    "origin": "道韵神域",
    "treasures": [
      "阴阳天盘"
    ],
    "exchangeCost": 3000
  },
  {
    "id": "ore-98",
    "name": "混沌石",
    "level": "道矿",
    "attr": "混沌",
    "origin": "混沌海",
    "treasures": [
      "混沌钟"
    ],
    "exchangeCost": 3000
  },
  {
    "id": "ore-99",
    "name": "混沌神晶",
    "level": "道矿",
    "attr": "混沌",
    "origin": "混沌神域",
    "treasures": [
      "混沌钟"
    ],
    "exchangeCost": 3000
  },
  {
    "id": "ore-100",
    "name": "鸿蒙玄铁",
    "level": "道矿",
    "attr": "鸿蒙",
    "origin": "鸿蒙矿脉",
    "treasures": [
      "混沌钟"
    ],
    "exchangeCost": 3000
  },
  {
    "id": "ore-101",
    "name": "太初金",
    "level": "道矿",
    "attr": "太初",
    "origin": "太初矿区",
    "treasures": [
      "混沌钟"
    ],
    "exchangeCost": 3000
  },
  {
    "id": "ore-102",
    "name": "虚无石",
    "level": "道矿",
    "attr": "虚无",
    "origin": "虚无之地",
    "treasures": [
      "混沌钟"
    ],
    "exchangeCost": 3000
  },
  {
    "id": "ore-103",
    "name": "道源晶",
    "level": "道矿",
    "attr": "道源",
    "origin": "道源秘境",
    "treasures": [
      "混沌钟"
    ],
    "exchangeCost": 3000
  },
  {
    "id": "ore-104",
    "name": "混元神金",
    "level": "道矿",
    "attr": "混元",
    "origin": "混元矿脉",
    "treasures": [
      "混沌钟"
    ],
    "exchangeCost": 3000
  },
  {
    "id": "ore-105",
    "name": "诛仙神铁",
    "level": "道矿",
    "attr": "杀伐",
    "origin": "诛仙遗迹",
    "treasures": [
      "诛仙剑阵"
    ],
    "exchangeCost": 3000
  },
  {
    "id": "ore-106",
    "name": "戮仙玄金",
    "level": "道矿",
    "attr": "杀戮",
    "origin": "戮仙遗迹",
    "treasures": [
      "诛仙剑阵"
    ],
    "exchangeCost": 3000
  },
  {
    "id": "ore-107",
    "name": "陷仙寒晶",
    "level": "道矿",
    "attr": "寒杀",
    "origin": "陷仙遗迹",
    "treasures": [
      "诛仙剑阵"
    ],
    "exchangeCost": 3000
  },
  {
    "id": "ore-108",
    "name": "绝仙石",
    "level": "道矿",
    "attr": "绝灭",
    "origin": "绝仙遗迹",
    "treasures": [
      "诛仙剑阵"
    ],
    "exchangeCost": 3000
  },
  {
    "id": "ore-109",
    "name": "杀戮晶",
    "level": "道矿",
    "attr": "杀戮",
    "origin": "杀戮战场",
    "treasures": [
      "诛仙剑阵"
    ],
    "exchangeCost": 3000
  },
  {
    "id": "ore-110",
    "name": "剑魂神玉",
    "level": "道矿",
    "attr": "剑魂",
    "origin": "剑道神域",
    "treasures": [
      "诛仙剑阵"
    ],
    "exchangeCost": 3000
  },
  {
    "id": "ore-111",
    "name": "阵纹石",
    "level": "道矿",
    "attr": "阵道",
    "origin": "阵道遗迹",
    "treasures": [
      "诛仙剑阵"
    ],
    "exchangeCost": 3000
  },
  {
    "id": "ore-112",
    "name": "山河神石",
    "level": "镇界神材",
    "attr": "山河",
    "origin": "山河界",
    "treasures": [
      "山河社稷图"
    ],
    "exchangeCost": 8000
  },
  {
    "id": "ore-113",
    "name": "乾坤玉",
    "level": "镇界神材",
    "attr": "乾坤",
    "origin": "乾坤界",
    "treasures": [
      "山河社稷图"
    ],
    "exchangeCost": 8000
  },
  {
    "id": "ore-114",
    "name": "世界晶",
    "level": "镇界神材",
    "attr": "世界",
    "origin": "世界核心",
    "treasures": [
      "山河社稷图"
    ],
    "exchangeCost": 8000
  },
  {
    "id": "ore-115",
    "name": "地脉神髓",
    "level": "镇界神材",
    "attr": "大地",
    "origin": "世界地脉",
    "treasures": [
      "山河社稷图"
    ],
    "exchangeCost": 8000
  },
  {
    "id": "ore-116",
    "name": "五行神石",
    "level": "镇界神材",
    "attr": "五行",
    "origin": "五行神域",
    "treasures": [
      "山河社稷图"
    ],
    "exchangeCost": 8000
  },
  {
    "id": "ore-117",
    "name": "空间道晶",
    "level": "镇界神材",
    "attr": "空间",
    "origin": "空间神域",
    "treasures": [
      "山河社稷图"
    ],
    "exchangeCost": 8000
  },
  {
    "id": "ore-118",
    "name": "六道石",
    "level": "镇界神材",
    "attr": "六道",
    "origin": "六道轮回",
    "treasures": [
      "六道轮回盘"
    ],
    "exchangeCost": 8000
  },
  {
    "id": "ore-119",
    "name": "轮回神晶",
    "level": "镇界神材",
    "attr": "轮回",
    "origin": "轮回神域",
    "treasures": [
      "六道轮回盘"
    ],
    "exchangeCost": 8000
  },
  {
    "id": "ore-120",
    "name": "幽冥神晶",
    "level": "镇界神材",
    "attr": "幽冥",
    "origin": "幽冥神域",
    "treasures": [
      "六道轮回盘"
    ],
    "exchangeCost": 8000
  },
  {
    "id": "ore-121",
    "name": "黄泉石",
    "level": "镇界神材",
    "attr": "黄泉",
    "origin": "黄泉界",
    "treasures": [
      "六道轮回盘"
    ],
    "exchangeCost": 8000
  },
  {
    "id": "ore-122",
    "name": "生死玄金",
    "level": "镇界神材",
    "attr": "生死",
    "origin": "生死界",
    "treasures": [
      "六道轮回盘"
    ],
    "exchangeCost": 8000
  },
  {
    "id": "ore-123",
    "name": "轮回神砂",
    "level": "镇界神材",
    "attr": "轮回",
    "origin": "轮回长河",
    "treasures": [
      "六道轮回盘"
    ],
    "exchangeCost": 8000
  },
  {
    "id": "ore-124",
    "name": "魂道晶",
    "level": "镇界神材",
    "attr": "魂道",
    "origin": "魂界",
    "treasures": [
      "六道轮回盘"
    ],
    "exchangeCost": 8000
  },
  {
    "id": "ore-125",
    "name": "天机石",
    "level": "镇界神材",
    "attr": "天机",
    "origin": "天机山",
    "treasures": [
      "天机榜"
    ],
    "exchangeCost": 8000
  }
]

/** 法宝炼制配方（由矿石表反推） */
export const TREASURE_RECIPES: TreasureRecipe[] = [
  {
    "treasureName": "青竹剑",
    "grade": "法器",
    "realm": "炼气",
    "spiritStones": 80,
    "materials": [
      {
        "name": "青云铁",
        "count": 2
      },
      {
        "name": "青灵石",
        "count": 2
      },
      {
        "name": "寒铁矿",
        "count": 2
      }
    ]
  },
  {
    "treasureName": "聚灵葫",
    "grade": "法器",
    "realm": "炼气",
    "spiritStones": 80,
    "materials": [
      {
        "name": "聚灵石",
        "count": 2
      },
      {
        "name": "温玉矿",
        "count": 2
      },
      {
        "name": "灵晶砂",
        "count": 2
      },
      {
        "name": "青木灵石",
        "count": 2
      }
    ]
  },
  {
    "treasureName": "镇魂铃",
    "grade": "法器",
    "realm": "炼气",
    "spiritStones": 80,
    "materials": [
      {
        "name": "镇魂石",
        "count": 2
      },
      {
        "name": "玄铜矿",
        "count": 2
      },
      {
        "name": "幽冥砂",
        "count": 2
      },
      {
        "name": "月影石",
        "count": 2
      },
      {
        "name": "寒魄石",
        "count": 2
      }
    ]
  },
  {
    "treasureName": "紫云剑",
    "grade": "法器",
    "realm": "筑基",
    "spiritStones": 80,
    "materials": [
      {
        "name": "紫云铁",
        "count": 2
      },
      {
        "name": "天青石",
        "count": 2
      },
      {
        "name": "星纹铁",
        "count": 2
      },
      {
        "name": "紫灵晶",
        "count": 2
      }
    ]
  },
  {
    "treasureName": "九转灵珠",
    "grade": "法器",
    "realm": "筑基",
    "spiritStones": 80,
    "materials": [
      {
        "name": "九转灵晶",
        "count": 2
      },
      {
        "name": "聚灵玉",
        "count": 2
      },
      {
        "name": "青木晶",
        "count": 2
      },
      {
        "name": "灵髓石",
        "count": 2
      },
      {
        "name": "月华石",
        "count": 2
      }
    ]
  },
  {
    "treasureName": "山河印",
    "grade": "法器",
    "realm": "筑基",
    "spiritStones": 80,
    "materials": [
      {
        "name": "山岳玄铁",
        "count": 2
      },
      {
        "name": "厚土晶",
        "count": 1
      },
      {
        "name": "镇山石",
        "count": 2
      },
      {
        "name": "玄黄玉",
        "count": 2
      },
      {
        "name": "地脉石",
        "count": 2
      },
      {
        "name": "青铜灵矿",
        "count": 2
      }
    ]
  },
  {
    "treasureName": "金乌羽",
    "grade": "灵器",
    "realm": "金丹",
    "spiritStones": 500,
    "materials": [
      {
        "name": "赤金矿",
        "count": 1
      },
      {
        "name": "炎阳晶",
        "count": 1
      },
      {
        "name": "火云石",
        "count": 1
      },
      {
        "name": "金乌灵晶",
        "count": 1
      },
      {
        "name": "熔岩精金",
        "count": 1
      }
    ]
  },
  {
    "treasureName": "太阴镜",
    "grade": "灵器",
    "realm": "金丹",
    "spiritStones": 500,
    "materials": [
      {
        "name": "太阴石",
        "count": 1
      },
      {
        "name": "玄冰晶",
        "count": 1
      },
      {
        "name": "月魄玉",
        "count": 1
      },
      {
        "name": "幽月银",
        "count": 1
      },
      {
        "name": "寒星石",
        "count": 1
      }
    ]
  },
  {
    "treasureName": "五行轮",
    "grade": "灵器",
    "realm": "金丹",
    "spiritStones": 500,
    "materials": [
      {
        "name": "金灵晶",
        "count": 1
      },
      {
        "name": "玄水晶",
        "count": 1
      },
      {
        "name": "赤炎晶",
        "count": 1
      },
      {
        "name": "厚土晶",
        "count": 1
      },
      {
        "name": "五行灵玉",
        "count": 1
      }
    ]
  },
  {
    "treasureName": "通天剑匣",
    "grade": "灵器",
    "realm": "元婴",
    "spiritStones": 500,
    "materials": [
      {
        "name": "通天玄铁",
        "count": 1
      },
      {
        "name": "星陨铁",
        "count": 1
      },
      {
        "name": "天青神石",
        "count": 1
      },
      {
        "name": "剑魂晶",
        "count": 1
      },
      {
        "name": "庚金精魄",
        "count": 1
      },
      {
        "name": "紫霄铁",
        "count": 1
      }
    ]
  },
  {
    "treasureName": "九龙神火罩",
    "grade": "灵器",
    "realm": "元婴",
    "spiritStones": 500,
    "materials": [
      {
        "name": "九龙炎晶",
        "count": 1
      },
      {
        "name": "赤炎神铁",
        "count": 1
      },
      {
        "name": "火龙玉",
        "count": 1
      },
      {
        "name": "太阳精金",
        "count": 1
      },
      {
        "name": "熔天石",
        "count": 1
      },
      {
        "name": "朱雀晶",
        "count": 1
      }
    ]
  },
  {
    "treasureName": "玄冥珠",
    "grade": "灵器",
    "realm": "元婴",
    "spiritStones": 500,
    "materials": [
      {
        "name": "玄冥寒晶",
        "count": 1
      },
      {
        "name": "万年玄冰",
        "count": 1
      },
      {
        "name": "幽水玉",
        "count": 1
      },
      {
        "name": "寒魄精金",
        "count": 1
      },
      {
        "name": "北冥石",
        "count": 1
      }
    ]
  },
  {
    "treasureName": "斩仙飞刀",
    "grade": "仙器",
    "realm": "化神",
    "spiritStones": 3000,
    "materials": [
      {
        "name": "斩仙神铁",
        "count": 1
      },
      {
        "name": "庚金神晶",
        "count": 1
      },
      {
        "name": "太白精金",
        "count": 1
      },
      {
        "name": "天外陨铁",
        "count": 1
      },
      {
        "name": "杀伐晶",
        "count": 1
      },
      {
        "name": "仙纹铁",
        "count": 1
      }
    ]
  },
  {
    "treasureName": "太虚神舟",
    "grade": "仙器",
    "realm": "化神",
    "spiritStones": 3000,
    "materials": [
      {
        "name": "太虚石",
        "count": 1
      },
      {
        "name": "虚空晶",
        "count": 1
      },
      {
        "name": "星辰铁",
        "count": 1
      },
      {
        "name": "空冥石",
        "count": 1
      },
      {
        "name": "天河神砂",
        "count": 1
      },
      {
        "name": "空间灵髓",
        "count": 1
      },
      {
        "name": "星界晶",
        "count": 1
      }
    ]
  },
  {
    "treasureName": "万魂幡",
    "grade": "仙器",
    "realm": "化神",
    "spiritStones": 3000,
    "materials": [
      {
        "name": "万魂石",
        "count": 1
      },
      {
        "name": "幽冥铁",
        "count": 1
      },
      {
        "name": "魂晶",
        "count": 1
      },
      {
        "name": "阴煞石",
        "count": 1
      },
      {
        "name": "九幽玄晶",
        "count": 1
      },
      {
        "name": "冥河砂",
        "count": 1
      }
    ]
  },
  {
    "treasureName": "虚空镜",
    "grade": "仙器",
    "realm": "炼虚",
    "spiritStones": 3000,
    "materials": [
      {
        "name": "空冥玉",
        "count": 1
      },
      {
        "name": "空间神石",
        "count": 1
      },
      {
        "name": "镜魂晶",
        "count": 1
      },
      {
        "name": "太虚银",
        "count": 1
      },
      {
        "name": "界石",
        "count": 1
      }
    ]
  },
  {
    "treasureName": "时砂",
    "grade": "仙器",
    "realm": "炼虚",
    "spiritStones": 3000,
    "materials": [
      {
        "name": "时光石",
        "count": 1
      },
      {
        "name": "岁月晶",
        "count": 1
      },
      {
        "name": "星河砂",
        "count": 1
      },
      {
        "name": "时间神砂",
        "count": 1
      },
      {
        "name": "轮回玉",
        "count": 1
      }
    ]
  },
  {
    "treasureName": "因果笔",
    "grade": "仙器",
    "realm": "炼虚",
    "spiritStones": 3000,
    "materials": [
      {
        "name": "因果石",
        "count": 1
      },
      {
        "name": "天命晶",
        "count": 1
      },
      {
        "name": "玄天玉",
        "count": 1
      },
      {
        "name": "道纹金",
        "count": 1
      },
      {
        "name": "命运神砂",
        "count": 1
      },
      {
        "name": "因果神铁",
        "count": 1
      }
    ]
  },
  {
    "treasureName": "阴阳天盘",
    "grade": "道器",
    "realm": "合体",
    "spiritStones": 15000,
    "materials": [
      {
        "name": "太阳精金",
        "count": 1
      },
      {
        "name": "阴阳玉",
        "count": 1
      },
      {
        "name": "乾坤石",
        "count": 1
      },
      {
        "name": "两仪晶",
        "count": 1
      },
      {
        "name": "道韵金",
        "count": 1
      }
    ]
  },
  {
    "treasureName": "混沌钟",
    "grade": "道器",
    "realm": "合体",
    "spiritStones": 15000,
    "materials": [
      {
        "name": "混沌石",
        "count": 1
      },
      {
        "name": "混沌神晶",
        "count": 1
      },
      {
        "name": "鸿蒙玄铁",
        "count": 1
      },
      {
        "name": "太初金",
        "count": 1
      },
      {
        "name": "虚无石",
        "count": 1
      },
      {
        "name": "道源晶",
        "count": 1
      },
      {
        "name": "混元神金",
        "count": 1
      }
    ]
  },
  {
    "treasureName": "诛仙剑阵",
    "grade": "道器",
    "realm": "合体",
    "spiritStones": 15000,
    "materials": [
      {
        "name": "诛仙神铁",
        "count": 1
      },
      {
        "name": "戮仙玄金",
        "count": 1
      },
      {
        "name": "陷仙寒晶",
        "count": 1
      },
      {
        "name": "绝仙石",
        "count": 1
      },
      {
        "name": "杀戮晶",
        "count": 1
      },
      {
        "name": "剑魂神玉",
        "count": 1
      },
      {
        "name": "阵纹石",
        "count": 1
      }
    ]
  },
  {
    "treasureName": "山河社稷图",
    "grade": "镇界神器",
    "realm": "大乘",
    "spiritStones": 50000,
    "materials": [
      {
        "name": "山河神石",
        "count": 1
      },
      {
        "name": "乾坤玉",
        "count": 1
      },
      {
        "name": "世界晶",
        "count": 1
      },
      {
        "name": "地脉神髓",
        "count": 1
      },
      {
        "name": "五行神石",
        "count": 1
      },
      {
        "name": "空间道晶",
        "count": 1
      }
    ]
  },
  {
    "treasureName": "六道轮回盘",
    "grade": "镇界神器",
    "realm": "大乘",
    "spiritStones": 50000,
    "materials": [
      {
        "name": "六道石",
        "count": 1
      },
      {
        "name": "轮回神晶",
        "count": 1
      },
      {
        "name": "幽冥神晶",
        "count": 1
      },
      {
        "name": "黄泉石",
        "count": 1
      },
      {
        "name": "生死玄金",
        "count": 1
      },
      {
        "name": "轮回神砂",
        "count": 1
      },
      {
        "name": "魂道晶",
        "count": 1
      }
    ]
  },
  {
    "treasureName": "天机榜",
    "grade": "镇界神器",
    "realm": "大乘",
    "spiritStones": 50000,
    "materials": [
      {
        "name": "天机石",
        "count": 1
      }
    ]
  }
]

export function getRecipeByTreasureName(name: string) {
  return TREASURE_RECIPES.find((item) => item.treasureName === name) || null
}

export const ORE_LEVEL_TABS = ['全部', '灵矿', '高阶灵矿', '神矿', '仙矿', '道矿', '镇界神材'] as const

export function filterOresByTab(tab: string) {
  if (!tab || tab === '全部') return ORE_MATERIALS
  return ORE_MATERIALS.filter((item) => item.level === tab)
}

export function getOresByLevel(level: string) {
  return ORE_MATERIALS.filter((item) => item.level === level)
}

/** 修为进度分：炼气一层≈0，飞升大圆满≈93 */
export function getCultivationScore(realm: RealmState) {
  const majorIdx = Math.max(0, REALM_MAJORS.indexOf(realm.major))
  const stages = getStagesForMajor(realm.major)
  const stageIdx = Math.max(0, stages.indexOf(realm.stage as never))
  return majorIdx * 10 + stageIdx
}

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n))
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

function randInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

const ORE_TIERS = ['灵矿', '高阶灵矿', '神矿', '仙矿', '道矿', '镇界神材'] as const

/** 境界越高，高阶矿石权重越大 */
function oreTierWeights(score: number) {
  const t = clamp(score / 93, 0, 1)
  return [
    { level: '灵矿', weight: Math.max(2, 42 - t * 36) },
    { level: '高阶灵矿', weight: 18 + t * 8 },
    { level: '神矿', weight: 6 + t * 16 },
    { level: '仙矿', weight: 2 + t * 18 },
    { level: '道矿', weight: t > 0.35 ? 1 + (t - 0.35) * 22 : 0.2 },
    { level: '镇界神材', weight: t > 0.55 ? (t - 0.55) * 28 : 0.05 }
  ]
}

/** 境界越高，单次灵石数量区间越高（不再区分下品/中品等） */
function spiritAmountByScore(score: number) {
  const t = clamp(score / 93, 0, 1)
  const min = Math.round(10 + t * 90)
  const max = Math.round(35 + t * 365)
  return randInt(min, Math.max(min, max))
}

/**
 * 依修为随机挖矿奖励：
 * - 成功率偏低：空手约 65%（高境界略降至约 55%）
 * - 有收获时：约 60% 矿石 / 40% 灵石（高境界略提高矿石）
 * - 矿石品阶随修为提升；灵石仅数量随修为提升
 */
export function rollMineReward(realm: RealmState): MineReward {
  const score = getCultivationScore(realm)
  const t = clamp(score / 93, 0, 1)
  // 空手概率再提高：低境界约 65%，高境界约 55%
  const emptyChance = 0.65 - t * 0.1
  if (Math.random() < emptyChance) {
    return { kind: 'empty' }
  }

  const oreChance = 0.55 + t * 0.1
  if (Math.random() < oreChance) {
    let tier = pickWeighted(oreTierWeights(score)).level
    let pool = getOresByLevel(tier)
    // 若该阶暂无矿（理论上不会），向下回退
    if (!pool.length) {
      for (let i = ORE_TIERS.indexOf(tier as (typeof ORE_TIERS)[number]); i >= 0; i -= 1) {
        pool = getOresByLevel(ORE_TIERS[i])
        if (pool.length) {
          tier = ORE_TIERS[i]
          break
        }
      }
    }
    const ore = pool[Math.floor(Math.random() * pool.length)]
    return { kind: 'ore', name: ore.name, level: ore.level, count: 1 }
  }
  return { kind: 'spirit', amount: spiritAmountByScore(score) }
}

export function formatMineReward(reward: MineReward) {
  if (reward.kind === 'empty') return '一无所获，矿脉空空'
  if (reward.kind === 'ore') return `挖到 ${reward.level}·${reward.name} ×${reward.count}`
  return `挖到 灵石 ×${reward.amount}`
}
