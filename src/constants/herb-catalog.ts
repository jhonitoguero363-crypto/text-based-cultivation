export interface HerbMaterial {
  id: string
  name: string
  level: string
  attr: string
  origin: string
  /** 可用于炼制的丹药 */
  pills: string[]
  /** 药园兑换所需灵石 */
  exchangeCost: number
}

export interface PillRecipeMaterial {
  name: string
  count: number
}

export interface PillRecipe {
  pillName: string
  grade: string
  spiritStones: number
  materials: PillRecipeMaterial[]
}

/** 全部药材 */
export const HERB_MATERIALS: HerbMaterial[] = [
  {
    "id": "herb-1",
    "name": "聚灵草",
    "level": "灵草",
    "attr": "灵气",
    "origin": "灵田、灵脉",
    "pills": [
      "聚气丹"
    ],
    "exchangeCost": 40
  },
  {
    "id": "herb-2",
    "name": "凝气花",
    "level": "灵草",
    "attr": "灵气",
    "origin": "山谷、灵田",
    "pills": [
      "聚气丹"
    ],
    "exchangeCost": 40
  },
  {
    "id": "herb-3",
    "name": "青灵叶",
    "level": "灵草",
    "attr": "木",
    "origin": "森林",
    "pills": [
      "聚气丹"
    ],
    "exchangeCost": 40
  },
  {
    "id": "herb-4",
    "name": "月光藤",
    "level": "灵草",
    "attr": "月华",
    "origin": "夜间森林",
    "pills": [
      "聚气丹"
    ],
    "exchangeCost": 40
  },
  {
    "id": "herb-5",
    "name": "回灵草",
    "level": "灵草",
    "attr": "灵气",
    "origin": "灵泉附近",
    "pills": [
      "回灵丹"
    ],
    "exchangeCost": 40
  },
  {
    "id": "herb-6",
    "name": "清心花",
    "level": "灵草",
    "attr": "神魂",
    "origin": "山谷",
    "pills": [
      "回灵丹",
      "养魂丹"
    ],
    "exchangeCost": 40
  },
  {
    "id": "herb-7",
    "name": "灵泉水",
    "level": "灵液",
    "attr": "水",
    "origin": "灵泉",
    "pills": [
      "回灵丹",
      "洗髓丹"
    ],
    "exchangeCost": 40
  },
  {
    "id": "herb-8",
    "name": "凝血草",
    "level": "灵草",
    "attr": "气血",
    "origin": "山林",
    "pills": [
      "凝血丹"
    ],
    "exchangeCost": 40
  },
  {
    "id": "herb-9",
    "name": "赤根花",
    "level": "灵草",
    "attr": "火",
    "origin": "赤岩地",
    "pills": [
      "凝血丹"
    ],
    "exchangeCost": 40
  },
  {
    "id": "herb-10",
    "name": "血玉藤",
    "level": "灵草",
    "attr": "气血",
    "origin": "阴暗洞穴",
    "pills": [
      "凝血丹"
    ],
    "exchangeCost": 40
  },
  {
    "id": "herb-11",
    "name": "百年黄精",
    "level": "灵药",
    "attr": "木",
    "origin": "深山",
    "pills": [
      "凝血丹"
    ],
    "exchangeCost": 80
  },
  {
    "id": "herb-12",
    "name": "洗髓草",
    "level": "灵草",
    "attr": "木",
    "origin": "灵山",
    "pills": [
      "洗髓丹"
    ],
    "exchangeCost": 40
  },
  {
    "id": "herb-13",
    "name": "玉骨花",
    "level": "灵草",
    "attr": "土",
    "origin": "灵矿附近",
    "pills": [
      "洗髓丹"
    ],
    "exchangeCost": 40
  },
  {
    "id": "herb-14",
    "name": "地灵根",
    "level": "灵药",
    "attr": "土",
    "origin": "灵脉",
    "pills": [
      "洗髓丹"
    ],
    "exchangeCost": 80
  },
  {
    "id": "herb-15",
    "name": "青木果",
    "level": "灵果",
    "attr": "木",
    "origin": "灵木森林",
    "pills": [
      "洗髓丹"
    ],
    "exchangeCost": 80
  },
  {
    "id": "herb-16",
    "name": "筑基草",
    "level": "灵药",
    "attr": "灵气",
    "origin": "灵脉",
    "pills": [
      "筑基丹"
    ],
    "exchangeCost": 80
  },
  {
    "id": "herb-17",
    "name": "紫猴花",
    "level": "灵草",
    "attr": "紫气",
    "origin": "山谷",
    "pills": [
      "筑基丹"
    ],
    "exchangeCost": 40
  },
  {
    "id": "herb-18",
    "name": "金灵果",
    "level": "灵果",
    "attr": "金",
    "origin": "金属性灵脉",
    "pills": [
      "筑基丹",
      "结金丹"
    ],
    "exchangeCost": 80
  },
  {
    "id": "herb-19",
    "name": "凝神花",
    "level": "灵药",
    "attr": "神魂",
    "origin": "静谧山谷",
    "pills": [
      "筑基丹"
    ],
    "exchangeCost": 80
  },
  {
    "id": "herb-20",
    "name": "地心莲",
    "level": "灵药",
    "attr": "土火",
    "origin": "地底熔岩",
    "pills": [
      "筑基丹"
    ],
    "exchangeCost": 80
  },
  {
    "id": "herb-21",
    "name": "养魂草",
    "level": "灵药",
    "attr": "神魂",
    "origin": "阴灵之地",
    "pills": [
      "养魂丹",
      "九窍养神丹"
    ],
    "exchangeCost": 80
  },
  {
    "id": "herb-22",
    "name": "魂灵木",
    "level": "灵木",
    "attr": "神魂",
    "origin": "古战场",
    "pills": [
      "养魂丹"
    ],
    "exchangeCost": 80
  },
  {
    "id": "herb-23",
    "name": "月魂花",
    "level": "灵药",
    "attr": "月华",
    "origin": "月光秘境",
    "pills": [
      "养魂丹",
      "太阴丹"
    ],
    "exchangeCost": 80
  },
  {
    "id": "herb-24",
    "name": "紫灵草",
    "level": "灵草",
    "attr": "紫灵",
    "origin": "灵山",
    "pills": [
      "紫灵丹"
    ],
    "exchangeCost": 40
  },
  {
    "id": "herb-25",
    "name": "紫云花",
    "level": "灵药",
    "attr": "紫气",
    "origin": "高山",
    "pills": [
      "紫灵丹"
    ],
    "exchangeCost": 80
  },
  {
    "id": "herb-26",
    "name": "聚灵藤",
    "level": "灵藤",
    "attr": "灵气",
    "origin": "灵脉森林",
    "pills": [
      "紫灵丹"
    ],
    "exchangeCost": 80
  },
  {
    "id": "herb-27",
    "name": "青灵果",
    "level": "灵果",
    "attr": "木",
    "origin": "森林",
    "pills": [
      "紫灵丹"
    ],
    "exchangeCost": 80
  },
  {
    "id": "herb-28",
    "name": "金刚藤",
    "level": "灵藤",
    "attr": "金",
    "origin": "金属性矿区",
    "pills": [
      "金刚丹"
    ],
    "exchangeCost": 80
  },
  {
    "id": "herb-29",
    "name": "铁骨草",
    "level": "灵草",
    "attr": "金土",
    "origin": "矿山",
    "pills": [
      "金刚丹"
    ],
    "exchangeCost": 40
  },
  {
    "id": "herb-30",
    "name": "赤铜花",
    "level": "灵花",
    "attr": "金火",
    "origin": "赤铜矿区",
    "pills": [
      "金刚丹"
    ],
    "exchangeCost": 40
  },
  {
    "id": "herb-31",
    "name": "龙筋草",
    "level": "灵草",
    "attr": "气血",
    "origin": "龙族遗迹",
    "pills": [
      "金刚丹"
    ],
    "exchangeCost": 40
  },
  {
    "id": "herb-32",
    "name": "地火莲",
    "level": "灵药",
    "attr": "火",
    "origin": "火山",
    "pills": [
      "结金丹"
    ],
    "exchangeCost": 80
  },
  {
    "id": "herb-33",
    "name": "紫金参",
    "level": "灵参",
    "attr": "金",
    "origin": "金属性灵脉",
    "pills": [
      "结金丹"
    ],
    "exchangeCost": 80
  },
  {
    "id": "herb-34",
    "name": "凝丹草",
    "level": "灵药",
    "attr": "灵气",
    "origin": "灵山",
    "pills": [
      "结金丹"
    ],
    "exchangeCost": 80
  },
  {
    "id": "herb-35",
    "name": "玄阳花",
    "level": "灵药",
    "attr": "阳",
    "origin": "阳脉之地",
    "pills": [
      "结金丹"
    ],
    "exchangeCost": 80
  },
  {
    "id": "herb-36",
    "name": "金丝灵芝",
    "level": "灵芝",
    "attr": "金",
    "origin": "灵木洞府",
    "pills": [
      "结金丹"
    ],
    "exchangeCost": 80
  },
  {
    "id": "herb-37",
    "name": "赤阳花",
    "level": "灵药",
    "attr": "火阳",
    "origin": "火山",
    "pills": [
      "赤阳丹"
    ],
    "exchangeCost": 80
  },
  {
    "id": "herb-38",
    "name": "火灵果",
    "level": "灵果",
    "attr": "火",
    "origin": "火灵脉",
    "pills": [
      "赤阳丹"
    ],
    "exchangeCost": 80
  },
  {
    "id": "herb-39",
    "name": "炎心草",
    "level": "灵草",
    "attr": "火",
    "origin": "地火区域",
    "pills": [
      "赤阳丹"
    ],
    "exchangeCost": 40
  },
  {
    "id": "herb-40",
    "name": "朱雀藤",
    "level": "灵藤",
    "attr": "火",
    "origin": "朱雀遗迹",
    "pills": [
      "赤阳丹"
    ],
    "exchangeCost": 80
  },
  {
    "id": "herb-41",
    "name": "太阴花",
    "level": "灵花",
    "attr": "阴",
    "origin": "月宫遗迹",
    "pills": [
      "太阴丹"
    ],
    "exchangeCost": 40
  },
  {
    "id": "herb-42",
    "name": "月魂草",
    "level": "灵草",
    "attr": "阴魂",
    "origin": "月光秘境",
    "pills": [
      "太阴丹"
    ],
    "exchangeCost": 40
  },
  {
    "id": "herb-43",
    "name": "寒月莲",
    "level": "灵莲",
    "attr": "冰阴",
    "origin": "寒潭",
    "pills": [
      "太阴丹"
    ],
    "exchangeCost": 80
  },
  {
    "id": "herb-44",
    "name": "玄冰果",
    "level": "灵果",
    "attr": "冰",
    "origin": "极寒之地",
    "pills": [
      "太阴丹"
    ],
    "exchangeCost": 80
  },
  {
    "id": "herb-45",
    "name": "幽冥藤",
    "level": "灵藤",
    "attr": "阴",
    "origin": "幽冥之地",
    "pills": [
      "太阴丹",
      "天魂丹"
    ],
    "exchangeCost": 80
  },
  {
    "id": "herb-46",
    "name": "九转灵芝",
    "level": "灵芝",
    "attr": "生命",
    "origin": "灵药秘境",
    "pills": [
      "九转回元丹",
      "涅槃丹"
    ],
    "exchangeCost": 80
  },
  {
    "id": "herb-47",
    "name": "回元草",
    "level": "灵草",
    "attr": "生命",
    "origin": "灵泉",
    "pills": [
      "九转回元丹"
    ],
    "exchangeCost": 40
  },
  {
    "id": "herb-48",
    "name": "生命果",
    "level": "灵果",
    "attr": "生命",
    "origin": "生命灵脉",
    "pills": [
      "九转回元丹"
    ],
    "exchangeCost": 80
  },
  {
    "id": "herb-49",
    "name": "青木莲",
    "level": "灵莲",
    "attr": "木",
    "origin": "青木秘境",
    "pills": [
      "九转回元丹"
    ],
    "exchangeCost": 80
  },
  {
    "id": "herb-50",
    "name": "地灵参",
    "level": "灵参",
    "attr": "土",
    "origin": "灵脉",
    "pills": [
      "九转回元丹"
    ],
    "exchangeCost": 80
  },
  {
    "id": "herb-51",
    "name": "紫玉花",
    "level": "灵花",
    "attr": "玉灵",
    "origin": "玉石山脉",
    "pills": [
      "九转回元丹"
    ],
    "exchangeCost": 40
  },
  {
    "id": "herb-52",
    "name": "婴灵草",
    "level": "灵药",
    "attr": "元婴",
    "origin": "灵婴秘境",
    "pills": [
      "婴灵丹"
    ],
    "exchangeCost": 80
  },
  {
    "id": "herb-53",
    "name": "元婴果",
    "level": "灵果",
    "attr": "元婴",
    "origin": "元婴秘境",
    "pills": [
      "婴灵丹"
    ],
    "exchangeCost": 80
  },
  {
    "id": "herb-54",
    "name": "九窍莲",
    "level": "灵莲",
    "attr": "神魂",
    "origin": "灵湖",
    "pills": [
      "婴灵丹",
      "九窍养神丹"
    ],
    "exchangeCost": 80
  },
  {
    "id": "herb-55",
    "name": "紫府参",
    "level": "灵参",
    "attr": "神魂",
    "origin": "紫府秘境",
    "pills": [
      "婴灵丹"
    ],
    "exchangeCost": 80
  },
  {
    "id": "herb-56",
    "name": "九窍花",
    "level": "灵花",
    "attr": "神魂",
    "origin": "神魂秘境",
    "pills": [
      "九窍养神丹"
    ],
    "exchangeCost": 40
  },
  {
    "id": "herb-57",
    "name": "神识果",
    "level": "灵果",
    "attr": "神识",
    "origin": "神识秘境",
    "pills": [
      "九窍养神丹"
    ],
    "exchangeCost": 80
  },
  {
    "id": "herb-58",
    "name": "天魂藤",
    "level": "神藤",
    "attr": "神魂",
    "origin": "天魂谷",
    "pills": [
      "九窍养神丹"
    ],
    "exchangeCost": 400
  },
  {
    "id": "herb-59",
    "name": "月灵芝",
    "level": "灵芝",
    "attr": "月华",
    "origin": "月宫遗迹",
    "pills": [
      "九窍养神丹"
    ],
    "exchangeCost": 80
  },
  {
    "id": "herb-60",
    "name": "天魂草",
    "level": "神草",
    "attr": "神魂",
    "origin": "魂界",
    "pills": [
      "天魂丹"
    ],
    "exchangeCost": 400
  },
  {
    "id": "herb-61",
    "name": "魂玉花",
    "level": "灵花",
    "attr": "灵魂",
    "origin": "古战场",
    "pills": [
      "天魂丹"
    ],
    "exchangeCost": 40
  },
  {
    "id": "herb-62",
    "name": "九幽莲",
    "level": "神莲",
    "attr": "幽冥",
    "origin": "九幽之地",
    "pills": [
      "天魂丹"
    ],
    "exchangeCost": 400
  },
  {
    "id": "herb-63",
    "name": "幽冥果",
    "level": "灵果",
    "attr": "幽冥",
    "origin": "幽冥界",
    "pills": [
      "天魂丹"
    ],
    "exchangeCost": 80
  },
  {
    "id": "herb-64",
    "name": "养神木",
    "level": "神木",
    "attr": "神魂",
    "origin": "神魂秘境",
    "pills": [
      "天魂丹"
    ],
    "exchangeCost": 400
  },
  {
    "id": "herb-65",
    "name": "轮回藤",
    "level": "神藤",
    "attr": "轮回",
    "origin": "轮回遗迹",
    "pills": [
      "天魂丹",
      "九转轮回丹"
    ],
    "exchangeCost": 400
  },
  {
    "id": "herb-66",
    "name": "万灵花",
    "level": "神花",
    "attr": "万灵",
    "origin": "万灵秘境",
    "pills": [
      "万灵丹"
    ],
    "exchangeCost": 400
  },
  {
    "id": "herb-67",
    "name": "五行果",
    "level": "灵果",
    "attr": "五行",
    "origin": "五行秘境",
    "pills": [
      "万灵丹"
    ],
    "exchangeCost": 80
  },
  {
    "id": "herb-68",
    "name": "百兽血莲",
    "level": "灵莲",
    "attr": "气血",
    "origin": "妖兽秘境",
    "pills": [
      "万灵丹"
    ],
    "exchangeCost": 80
  },
  {
    "id": "herb-69",
    "name": "天灵芝",
    "level": "神芝",
    "attr": "灵气",
    "origin": "天灵秘境",
    "pills": [
      "万灵丹",
      "天元丹"
    ],
    "exchangeCost": 400
  },
  {
    "id": "herb-70",
    "name": "生命藤",
    "level": "神藤",
    "attr": "生命",
    "origin": "生命秘境",
    "pills": [
      "万灵丹"
    ],
    "exchangeCost": 400
  },
  {
    "id": "herb-71",
    "name": "九色莲",
    "level": "神莲",
    "attr": "五行",
    "origin": "彩虹秘境",
    "pills": [
      "万灵丹"
    ],
    "exchangeCost": 400
  },
  {
    "id": "herb-72",
    "name": "化神草",
    "level": "神草",
    "attr": "神魂",
    "origin": "化神秘境",
    "pills": [
      "化神丹"
    ],
    "exchangeCost": 400
  },
  {
    "id": "herb-73",
    "name": "神魂果",
    "level": "神果",
    "attr": "神魂",
    "origin": "魂界",
    "pills": [
      "化神丹"
    ],
    "exchangeCost": 400
  },
  {
    "id": "herb-74",
    "name": "紫府莲",
    "level": "神莲",
    "attr": "神魂",
    "origin": "紫府秘境",
    "pills": [
      "化神丹"
    ],
    "exchangeCost": 400
  },
  {
    "id": "herb-75",
    "name": "天灵花",
    "level": "神花",
    "attr": "灵气",
    "origin": "天界遗迹",
    "pills": [
      "化神丹"
    ],
    "exchangeCost": 400
  },
  {
    "id": "herb-76",
    "name": "九窍神芝",
    "level": "神芝",
    "attr": "神魂",
    "origin": "神魂秘境",
    "pills": [
      "化神丹"
    ],
    "exchangeCost": 400
  },
  {
    "id": "herb-77",
    "name": "悟道藤",
    "level": "神藤",
    "attr": "悟道",
    "origin": "悟道崖",
    "pills": [
      "化神丹",
      "太虚悟道丹"
    ],
    "exchangeCost": 400
  },
  {
    "id": "herb-78",
    "name": "天元果",
    "level": "神果",
    "attr": "元气",
    "origin": "天元秘境",
    "pills": [
      "天元丹"
    ],
    "exchangeCost": 400
  },
  {
    "id": "herb-79",
    "name": "灵源草",
    "level": "神草",
    "attr": "灵气",
    "origin": "灵源之地",
    "pills": [
      "天元丹"
    ],
    "exchangeCost": 400
  },
  {
    "id": "herb-80",
    "name": "九天灵芝",
    "level": "神芝",
    "attr": "灵气",
    "origin": "九天秘境",
    "pills": [
      "天元丹",
      "九转玄丹"
    ],
    "exchangeCost": 400
  },
  {
    "id": "herb-81",
    "name": "聚灵神木",
    "level": "神木",
    "attr": "灵气",
    "origin": "灵脉核心",
    "pills": [
      "天元丹"
    ],
    "exchangeCost": 400
  },
  {
    "id": "herb-82",
    "name": "涅槃花",
    "level": "神花",
    "attr": "火/生命",
    "origin": "凤凰遗迹",
    "pills": [
      "涅槃丹"
    ],
    "exchangeCost": 400
  },
  {
    "id": "herb-83",
    "name": "凤凰血藤",
    "level": "神藤",
    "attr": "凤凰血脉",
    "origin": "凤凰秘境",
    "pills": [
      "涅槃丹"
    ],
    "exchangeCost": 400
  },
  {
    "id": "herb-84",
    "name": "不死草",
    "level": "神草",
    "attr": "生命",
    "origin": "不死禁地",
    "pills": [
      "涅槃丹",
      "九转仙丹"
    ],
    "exchangeCost": 400
  },
  {
    "id": "herb-85",
    "name": "赤焰莲",
    "level": "神莲",
    "attr": "火",
    "origin": "火海",
    "pills": [
      "涅槃丹"
    ],
    "exchangeCost": 400
  },
  {
    "id": "herb-86",
    "name": "凤凰羽灵",
    "level": "神材",
    "attr": "凤凰",
    "origin": "凤凰遗迹",
    "pills": [
      "涅槃丹"
    ],
    "exchangeCost": 400
  },
  {
    "id": "herb-87",
    "name": "九转玄草",
    "level": "神草",
    "attr": "玄",
    "origin": "玄天秘境",
    "pills": [
      "九转玄丹"
    ],
    "exchangeCost": 400
  },
  {
    "id": "herb-88",
    "name": "玄天果",
    "level": "神果",
    "attr": "玄",
    "origin": "玄天秘境",
    "pills": [
      "九转玄丹"
    ],
    "exchangeCost": 400
  },
  {
    "id": "herb-89",
    "name": "造化莲",
    "level": "神莲",
    "attr": "造化",
    "origin": "造化秘境",
    "pills": [
      "九转玄丹"
    ],
    "exchangeCost": 400
  },
  {
    "id": "herb-90",
    "name": "阴阳花",
    "level": "神花",
    "attr": "阴阳",
    "origin": "阴阳秘境",
    "pills": [
      "九转玄丹",
      "混元丹"
    ],
    "exchangeCost": 400
  },
  {
    "id": "herb-91",
    "name": "太虚芝",
    "level": "神芝",
    "attr": "虚空",
    "origin": "太虚秘境",
    "pills": [
      "九转玄丹"
    ],
    "exchangeCost": 400
  },
  {
    "id": "herb-92",
    "name": "太虚藤",
    "level": "神藤",
    "attr": "虚空",
    "origin": "太虚秘境",
    "pills": [
      "九转玄丹"
    ],
    "exchangeCost": 400
  },
  {
    "id": "herb-93",
    "name": "混沌露",
    "level": "神液",
    "attr": "混沌",
    "origin": "混沌秘境",
    "pills": [
      "九转玄丹"
    ],
    "exchangeCost": 400
  },
  {
    "id": "herb-94",
    "name": "虚空草",
    "level": "仙草",
    "attr": "空间",
    "origin": "虚空裂隙",
    "pills": [
      "虚空丹"
    ],
    "exchangeCost": 800
  },
  {
    "id": "herb-95",
    "name": "空间花",
    "level": "仙花",
    "attr": "空间",
    "origin": "空间秘境",
    "pills": [
      "虚空丹"
    ],
    "exchangeCost": 800
  },
  {
    "id": "herb-96",
    "name": "裂界藤",
    "level": "仙藤",
    "attr": "空间",
    "origin": "世界裂隙",
    "pills": [
      "虚空丹"
    ],
    "exchangeCost": 800
  },
  {
    "id": "herb-97",
    "name": "星辰果",
    "level": "仙果",
    "attr": "星辰",
    "origin": "星空秘境",
    "pills": [
      "虚空丹"
    ],
    "exchangeCost": 800
  },
  {
    "id": "herb-98",
    "name": "虚空石髓",
    "level": "仙材",
    "attr": "空间",
    "origin": "虚空矿脉",
    "pills": [
      "虚空丹"
    ],
    "exchangeCost": 800
  },
  {
    "id": "herb-99",
    "name": "太虚草",
    "level": "仙草",
    "attr": "悟道",
    "origin": "太虚秘境",
    "pills": [
      "太虚悟道丹"
    ],
    "exchangeCost": 800
  },
  {
    "id": "herb-100",
    "name": "悟道花",
    "level": "仙花",
    "attr": "悟道",
    "origin": "悟道秘境",
    "pills": [
      "太虚悟道丹"
    ],
    "exchangeCost": 800
  },
  {
    "id": "herb-101",
    "name": "菩提果",
    "level": "仙果",
    "attr": "悟道",
    "origin": "菩提古树",
    "pills": [
      "太虚悟道丹"
    ],
    "exchangeCost": 800
  },
  {
    "id": "herb-102",
    "name": "星魂藤",
    "level": "仙藤",
    "attr": "星魂",
    "origin": "星空",
    "pills": [
      "太虚悟道丹"
    ],
    "exchangeCost": 800
  },
  {
    "id": "herb-103",
    "name": "天机叶",
    "level": "仙材",
    "attr": "天机",
    "origin": "天机谷",
    "pills": [
      "太虚悟道丹",
      "偷天丹"
    ],
    "exchangeCost": 800
  },
  {
    "id": "herb-104",
    "name": "灵悟芝",
    "level": "仙芝",
    "attr": "悟道",
    "origin": "悟道崖",
    "pills": [
      "太虚悟道丹"
    ],
    "exchangeCost": 800
  },
  {
    "id": "herb-105",
    "name": "逆命花",
    "level": "仙花",
    "attr": "命运",
    "origin": "命运长河",
    "pills": [
      "逆命丹"
    ],
    "exchangeCost": 800
  },
  {
    "id": "herb-106",
    "name": "因果藤",
    "level": "仙藤",
    "attr": "因果",
    "origin": "因果秘境",
    "pills": [
      "逆命丹"
    ],
    "exchangeCost": 800
  },
  {
    "id": "herb-107",
    "name": "天命果",
    "level": "仙果",
    "attr": "天命",
    "origin": "天命秘境",
    "pills": [
      "逆命丹",
      "天命丹"
    ],
    "exchangeCost": 800
  },
  {
    "id": "herb-108",
    "name": "命魂芝",
    "level": "仙芝",
    "attr": "命魂",
    "origin": "魂界",
    "pills": [
      "逆命丹"
    ],
    "exchangeCost": 800
  },
  {
    "id": "herb-109",
    "name": "时光砂",
    "level": "仙材",
    "attr": "时间",
    "origin": "时间长河",
    "pills": [
      "逆命丹"
    ],
    "exchangeCost": 800
  },
  {
    "id": "herb-110",
    "name": "九转轮回草",
    "level": "仙草",
    "attr": "轮回",
    "origin": "轮回秘境",
    "pills": [
      "九转轮回丹"
    ],
    "exchangeCost": 800
  },
  {
    "id": "herb-111",
    "name": "六道花",
    "level": "仙花",
    "attr": "六道",
    "origin": "六道轮回",
    "pills": [
      "九转轮回丹"
    ],
    "exchangeCost": 800
  },
  {
    "id": "herb-112",
    "name": "轮回果",
    "level": "仙果",
    "attr": "轮回",
    "origin": "轮回树",
    "pills": [
      "九转轮回丹"
    ],
    "exchangeCost": 800
  },
  {
    "id": "herb-113",
    "name": "幽冥莲",
    "level": "仙莲",
    "attr": "幽冥",
    "origin": "幽冥界",
    "pills": [
      "九转轮回丹"
    ],
    "exchangeCost": 800
  },
  {
    "id": "herb-114",
    "name": "忘川藤",
    "level": "仙藤",
    "attr": "忘川",
    "origin": "忘川河",
    "pills": [
      "九转轮回丹"
    ],
    "exchangeCost": 800
  },
  {
    "id": "herb-115",
    "name": "黄泉花",
    "level": "仙花",
    "attr": "黄泉",
    "origin": "黄泉之地",
    "pills": [
      "九转轮回丹"
    ],
    "exchangeCost": 800
  },
  {
    "id": "herb-116",
    "name": "魂玉",
    "level": "仙材",
    "attr": "灵魂",
    "origin": "魂界",
    "pills": [
      "九转轮回丹"
    ],
    "exchangeCost": 800
  },
  {
    "id": "herb-117",
    "name": "合道花",
    "level": "道药",
    "attr": "大道",
    "origin": "合道秘境",
    "pills": [
      "合道丹"
    ],
    "exchangeCost": 2000
  },
  {
    "id": "herb-118",
    "name": "道韵草",
    "level": "道药",
    "attr": "道韵",
    "origin": "道韵山",
    "pills": [
      "合道丹"
    ],
    "exchangeCost": 2000
  },
  {
    "id": "herb-119",
    "name": "悟道果",
    "level": "道果",
    "attr": "悟道",
    "origin": "悟道树",
    "pills": [
      "合道丹"
    ],
    "exchangeCost": 2000
  },
  {
    "id": "herb-120",
    "name": "天人参",
    "level": "道参",
    "attr": "天人",
    "origin": "天人秘境",
    "pills": [
      "合道丹"
    ],
    "exchangeCost": 2000
  },
  {
    "id": "herb-121",
    "name": "阴阳莲",
    "level": "道莲",
    "attr": "阴阳",
    "origin": "阴阳界",
    "pills": [
      "合道丹"
    ],
    "exchangeCost": 2000
  },
  {
    "id": "herb-122",
    "name": "法则藤",
    "level": "道藤",
    "attr": "法则",
    "origin": "法则之地",
    "pills": [
      "合道丹"
    ],
    "exchangeCost": 2000
  },
  {
    "id": "herb-123",
    "name": "混元草",
    "level": "道草",
    "attr": "混元",
    "origin": "混元秘境",
    "pills": [
      "混元丹"
    ],
    "exchangeCost": 2000
  },
  {
    "id": "herb-124",
    "name": "五行神果",
    "level": "神果",
    "attr": "五行",
    "origin": "五行神域",
    "pills": [
      "混元丹"
    ],
    "exchangeCost": 400
  },
  {
    "id": "herb-125",
    "name": "混沌莲",
    "level": "道莲",
    "attr": "混沌",
    "origin": "混沌海",
    "pills": [
      "混元丹"
    ],
    "exchangeCost": 2000
  },
  {
    "id": "herb-126",
    "name": "阴阳神花",
    "level": "道花",
    "attr": "阴阳",
    "origin": "阴阳神域",
    "pills": [
      "阴阳造化丹"
    ],
    "exchangeCost": 2000
  },
  {
    "id": "herb-127",
    "name": "造化果",
    "level": "道果",
    "attr": "造化",
    "origin": "造化神树",
    "pills": [
      "阴阳造化丹"
    ],
    "exchangeCost": 2000
  },
  {
    "id": "herb-128",
    "name": "生死草",
    "level": "道药",
    "attr": "生死",
    "origin": "生死界",
    "pills": [
      "阴阳造化丹"
    ],
    "exchangeCost": 2000
  },
  {
    "id": "herb-129",
    "name": "九转神芝",
    "level": "神芝",
    "attr": "生命",
    "origin": "神域",
    "pills": [
      "阴阳造化丹"
    ],
    "exchangeCost": 400
  },
  {
    "id": "herb-130",
    "name": "凤凰血莲",
    "level": "神莲",
    "attr": "凤凰",
    "origin": "凤凰神域",
    "pills": [
      "阴阳造化丹"
    ],
    "exchangeCost": 400
  },
  {
    "id": "herb-131",
    "name": "太初露",
    "level": "神液",
    "attr": "太初",
    "origin": "太初秘境",
    "pills": [
      "阴阳造化丹"
    ],
    "exchangeCost": 400
  },
  {
    "id": "herb-132",
    "name": "气运花",
    "level": "道花",
    "attr": "气运",
    "origin": "气运之地",
    "pills": [
      "天命丹"
    ],
    "exchangeCost": 2000
  },
  {
    "id": "herb-133",
    "name": "紫微果",
    "level": "道果",
    "attr": "星命",
    "origin": "紫微星域",
    "pills": [
      "天命丹"
    ],
    "exchangeCost": 2000
  },
  {
    "id": "herb-134",
    "name": "天机藤",
    "level": "道藤",
    "attr": "天机",
    "origin": "天机神域",
    "pills": [
      "天命丹"
    ],
    "exchangeCost": 2000
  },
  {
    "id": "herb-135",
    "name": "福缘莲",
    "level": "道莲",
    "attr": "福缘",
    "origin": "福地",
    "pills": [
      "天命丹"
    ],
    "exchangeCost": 2000
  },
  {
    "id": "herb-136",
    "name": "星辰芝",
    "level": "道芝",
    "attr": "星辰",
    "origin": "星空神域",
    "pills": [
      "天命丹"
    ],
    "exchangeCost": 2000
  },
  {
    "id": "herb-137",
    "name": "鸿运石",
    "level": "道材",
    "attr": "气运",
    "origin": "鸿运秘境",
    "pills": [
      "天命丹"
    ],
    "exchangeCost": 2000
  },
  {
    "id": "herb-138",
    "name": "大乘花",
    "level": "道花",
    "attr": "大乘",
    "origin": "大乘秘境",
    "pills": [
      "大乘丹"
    ],
    "exchangeCost": 2000
  },
  {
    "id": "herb-139",
    "name": "九天神果",
    "level": "神果",
    "attr": "九天",
    "origin": "九天神域",
    "pills": [
      "大乘丹"
    ],
    "exchangeCost": 400
  },
  {
    "id": "herb-140",
    "name": "道心草",
    "level": "道药",
    "attr": "道心",
    "origin": "道心山",
    "pills": [
      "大乘丹"
    ],
    "exchangeCost": 2000
  },
  {
    "id": "herb-141",
    "name": "天人莲",
    "level": "道莲",
    "attr": "天人",
    "origin": "天人秘境",
    "pills": [
      "大乘丹"
    ],
    "exchangeCost": 2000
  },
  {
    "id": "herb-142",
    "name": "万道芝",
    "level": "道芝",
    "attr": "万道",
    "origin": "万道神域",
    "pills": [
      "大乘丹"
    ],
    "exchangeCost": 2000
  },
  {
    "id": "herb-143",
    "name": "紫府神参",
    "level": "神参",
    "attr": "神魂",
    "origin": "紫府神域",
    "pills": [
      "大乘丹"
    ],
    "exchangeCost": 400
  },
  {
    "id": "herb-144",
    "name": "万道花",
    "level": "道花",
    "attr": "万道",
    "origin": "万道神域",
    "pills": [
      "万道丹"
    ],
    "exchangeCost": 2000
  },
  {
    "id": "herb-145",
    "name": "法则果",
    "level": "道果",
    "attr": "法则",
    "origin": "法则神域",
    "pills": [
      "万道丹"
    ],
    "exchangeCost": 2000
  },
  {
    "id": "herb-146",
    "name": "道韵藤",
    "level": "道藤",
    "attr": "道韵",
    "origin": "道韵神域",
    "pills": [
      "万道丹"
    ],
    "exchangeCost": 2000
  },
  {
    "id": "herb-147",
    "name": "悟道神芝",
    "level": "神芝",
    "attr": "悟道",
    "origin": "悟道神域",
    "pills": [
      "万道丹"
    ],
    "exchangeCost": 400
  },
  {
    "id": "herb-148",
    "name": "三千叶",
    "level": "道材",
    "attr": "三千大道",
    "origin": "三千道山",
    "pills": [
      "万道丹"
    ],
    "exchangeCost": 2000
  },
  {
    "id": "herb-149",
    "name": "混沌花",
    "level": "道花",
    "attr": "混沌",
    "origin": "混沌海",
    "pills": [
      "万道丹"
    ],
    "exchangeCost": 2000
  },
  {
    "id": "herb-150",
    "name": "造化神花",
    "level": "神花",
    "attr": "造化",
    "origin": "造化神域",
    "pills": [
      "造化神丹"
    ],
    "exchangeCost": 400
  },
  {
    "id": "herb-151",
    "name": "鸿蒙果",
    "level": "鸿蒙灵果",
    "attr": "鸿蒙",
    "origin": "鸿蒙秘境",
    "pills": [
      "造化神丹",
      "鸿蒙悟道丹"
    ],
    "exchangeCost": 5000
  },
  {
    "id": "herb-152",
    "name": "不死神草",
    "level": "神草",
    "attr": "不死",
    "origin": "不死神域",
    "pills": [
      "造化神丹"
    ],
    "exchangeCost": 400
  },
  {
    "id": "herb-153",
    "name": "九转神莲",
    "level": "神莲",
    "attr": "造化",
    "origin": "神域",
    "pills": [
      "造化神丹"
    ],
    "exchangeCost": 400
  },
  {
    "id": "herb-154",
    "name": "生命神树枝",
    "level": "神材",
    "attr": "生命",
    "origin": "生命神域",
    "pills": [
      "造化神丹"
    ],
    "exchangeCost": 400
  },
  {
    "id": "herb-155",
    "name": "太初灵液",
    "level": "神液",
    "attr": "太初",
    "origin": "太初神域",
    "pills": [
      "造化神丹",
      "鸿蒙悟道丹"
    ],
    "exchangeCost": 400
  },
  {
    "id": "herb-156",
    "name": "九天玄花",
    "level": "神花",
    "attr": "九天",
    "origin": "九天神域",
    "pills": [
      "九天玄丹"
    ],
    "exchangeCost": 400
  },
  {
    "id": "herb-157",
    "name": "玄天神果",
    "level": "神果",
    "attr": "玄天",
    "origin": "玄天神域",
    "pills": [
      "九天玄丹"
    ],
    "exchangeCost": 400
  },
  {
    "id": "herb-158",
    "name": "太虚莲",
    "level": "神莲",
    "attr": "虚空",
    "origin": "太虚神域",
    "pills": [
      "九天玄丹"
    ],
    "exchangeCost": 400
  },
  {
    "id": "herb-159",
    "name": "星辰神芝",
    "level": "神芝",
    "attr": "星辰",
    "origin": "星空神域",
    "pills": [
      "九天玄丹"
    ],
    "exchangeCost": 400
  }
]

/** 丹药炼制配方（由药材表反推） */
export const PILL_RECIPES: PillRecipe[] = [
  {
    "pillName": "聚气丹",
    "grade": "一品",
    "spiritStones": 50,
    "materials": [
      {
        "name": "聚灵草",
        "count": 2
      },
      {
        "name": "凝气花",
        "count": 2
      },
      {
        "name": "青灵叶",
        "count": 2
      },
      {
        "name": "月光藤",
        "count": 2
      }
    ]
  },
  {
    "pillName": "回灵丹",
    "grade": "一品",
    "spiritStones": 50,
    "materials": [
      {
        "name": "回灵草",
        "count": 2
      },
      {
        "name": "清心花",
        "count": 2
      },
      {
        "name": "灵泉水",
        "count": 2
      }
    ]
  },
  {
    "pillName": "养魂丹",
    "grade": "三品",
    "spiritStones": 200,
    "materials": [
      {
        "name": "清心花",
        "count": 2
      },
      {
        "name": "养魂草",
        "count": 1
      },
      {
        "name": "魂灵木",
        "count": 1
      },
      {
        "name": "月魂花",
        "count": 1
      }
    ]
  },
  {
    "pillName": "洗髓丹",
    "grade": "二品",
    "spiritStones": 100,
    "materials": [
      {
        "name": "灵泉水",
        "count": 2
      },
      {
        "name": "洗髓草",
        "count": 2
      },
      {
        "name": "玉骨花",
        "count": 2
      },
      {
        "name": "地灵根",
        "count": 1
      },
      {
        "name": "青木果",
        "count": 1
      }
    ]
  },
  {
    "pillName": "凝血丹",
    "grade": "一品",
    "spiritStones": 50,
    "materials": [
      {
        "name": "凝血草",
        "count": 2
      },
      {
        "name": "赤根花",
        "count": 2
      },
      {
        "name": "血玉藤",
        "count": 2
      },
      {
        "name": "百年黄精",
        "count": 1
      }
    ]
  },
  {
    "pillName": "筑基丹",
    "grade": "三品",
    "spiritStones": 200,
    "materials": [
      {
        "name": "筑基草",
        "count": 1
      },
      {
        "name": "紫猴花",
        "count": 2
      },
      {
        "name": "金灵果",
        "count": 1
      },
      {
        "name": "凝神花",
        "count": 1
      },
      {
        "name": "地心莲",
        "count": 1
      }
    ]
  },
  {
    "pillName": "结金丹",
    "grade": "四品",
    "spiritStones": 400,
    "materials": [
      {
        "name": "金灵果",
        "count": 1
      },
      {
        "name": "地火莲",
        "count": 1
      },
      {
        "name": "紫金参",
        "count": 1
      },
      {
        "name": "凝丹草",
        "count": 1
      },
      {
        "name": "玄阳花",
        "count": 1
      },
      {
        "name": "金丝灵芝",
        "count": 1
      }
    ]
  },
  {
    "pillName": "九窍养神丹",
    "grade": "五品",
    "spiritStones": 800,
    "materials": [
      {
        "name": "养魂草",
        "count": 1
      },
      {
        "name": "九窍莲",
        "count": 1
      },
      {
        "name": "九窍花",
        "count": 2
      },
      {
        "name": "神识果",
        "count": 1
      },
      {
        "name": "天魂藤",
        "count": 1
      },
      {
        "name": "月灵芝",
        "count": 1
      }
    ]
  },
  {
    "pillName": "太阴丹",
    "grade": "四品",
    "spiritStones": 400,
    "materials": [
      {
        "name": "月魂花",
        "count": 1
      },
      {
        "name": "太阴花",
        "count": 2
      },
      {
        "name": "月魂草",
        "count": 2
      },
      {
        "name": "寒月莲",
        "count": 1
      },
      {
        "name": "玄冰果",
        "count": 1
      },
      {
        "name": "幽冥藤",
        "count": 2
      }
    ]
  },
  {
    "pillName": "紫灵丹",
    "grade": "三品",
    "spiritStones": 200,
    "materials": [
      {
        "name": "紫灵草",
        "count": 2
      },
      {
        "name": "紫云花",
        "count": 1
      },
      {
        "name": "聚灵藤",
        "count": 2
      },
      {
        "name": "青灵果",
        "count": 1
      }
    ]
  },
  {
    "pillName": "金刚丹",
    "grade": "三品",
    "spiritStones": 200,
    "materials": [
      {
        "name": "金刚藤",
        "count": 2
      },
      {
        "name": "铁骨草",
        "count": 2
      },
      {
        "name": "赤铜花",
        "count": 2
      },
      {
        "name": "龙筋草",
        "count": 2
      }
    ]
  },
  {
    "pillName": "赤阳丹",
    "grade": "四品",
    "spiritStones": 400,
    "materials": [
      {
        "name": "赤阳花",
        "count": 1
      },
      {
        "name": "火灵果",
        "count": 1
      },
      {
        "name": "炎心草",
        "count": 2
      },
      {
        "name": "朱雀藤",
        "count": 2
      }
    ]
  },
  {
    "pillName": "天魂丹",
    "grade": "六品",
    "spiritStones": 1500,
    "materials": [
      {
        "name": "幽冥藤",
        "count": 2
      },
      {
        "name": "天魂草",
        "count": 1
      },
      {
        "name": "魂玉花",
        "count": 2
      },
      {
        "name": "九幽莲",
        "count": 1
      },
      {
        "name": "幽冥果",
        "count": 1
      },
      {
        "name": "养神木",
        "count": 1
      },
      {
        "name": "轮回藤",
        "count": 1
      }
    ]
  },
  {
    "pillName": "九转回元丹",
    "grade": "五品",
    "spiritStones": 800,
    "materials": [
      {
        "name": "九转灵芝",
        "count": 1
      },
      {
        "name": "回元草",
        "count": 2
      },
      {
        "name": "生命果",
        "count": 1
      },
      {
        "name": "青木莲",
        "count": 1
      },
      {
        "name": "地灵参",
        "count": 1
      },
      {
        "name": "紫玉花",
        "count": 2
      }
    ]
  },
  {
    "pillName": "涅槃丹",
    "grade": "七品",
    "spiritStones": 3000,
    "materials": [
      {
        "name": "九转灵芝",
        "count": 1
      },
      {
        "name": "涅槃花",
        "count": 1
      },
      {
        "name": "凤凰血藤",
        "count": 1
      },
      {
        "name": "不死草",
        "count": 1
      },
      {
        "name": "赤焰莲",
        "count": 1
      },
      {
        "name": "凤凰羽灵",
        "count": 1
      }
    ]
  },
  {
    "pillName": "婴灵丹",
    "grade": "五品",
    "spiritStones": 800,
    "materials": [
      {
        "name": "婴灵草",
        "count": 1
      },
      {
        "name": "元婴果",
        "count": 1
      },
      {
        "name": "九窍莲",
        "count": 1
      },
      {
        "name": "紫府参",
        "count": 1
      }
    ]
  },
  {
    "pillName": "九转轮回丹",
    "grade": "八品",
    "spiritStones": 6000,
    "materials": [
      {
        "name": "轮回藤",
        "count": 1
      },
      {
        "name": "九转轮回草",
        "count": 1
      },
      {
        "name": "六道花",
        "count": 1
      },
      {
        "name": "轮回果",
        "count": 1
      },
      {
        "name": "幽冥莲",
        "count": 1
      },
      {
        "name": "忘川藤",
        "count": 1
      },
      {
        "name": "黄泉花",
        "count": 1
      },
      {
        "name": "魂玉",
        "count": 1
      }
    ]
  },
  {
    "pillName": "万灵丹",
    "grade": "六品",
    "spiritStones": 1500,
    "materials": [
      {
        "name": "万灵花",
        "count": 1
      },
      {
        "name": "五行果",
        "count": 1
      },
      {
        "name": "百兽血莲",
        "count": 1
      },
      {
        "name": "天灵芝",
        "count": 1
      },
      {
        "name": "生命藤",
        "count": 1
      },
      {
        "name": "九色莲",
        "count": 1
      }
    ]
  },
  {
    "pillName": "天元丹",
    "grade": "六品",
    "spiritStones": 1500,
    "materials": [
      {
        "name": "天灵芝",
        "count": 1
      },
      {
        "name": "天元果",
        "count": 1
      },
      {
        "name": "灵源草",
        "count": 1
      },
      {
        "name": "九天灵芝",
        "count": 1
      },
      {
        "name": "聚灵神木",
        "count": 1
      }
    ]
  },
  {
    "pillName": "化神丹",
    "grade": "六品",
    "spiritStones": 1500,
    "materials": [
      {
        "name": "化神草",
        "count": 1
      },
      {
        "name": "神魂果",
        "count": 1
      },
      {
        "name": "紫府莲",
        "count": 1
      },
      {
        "name": "天灵花",
        "count": 1
      },
      {
        "name": "九窍神芝",
        "count": 1
      },
      {
        "name": "悟道藤",
        "count": 1
      }
    ]
  },
  {
    "pillName": "太虚悟道丹",
    "grade": "七品",
    "spiritStones": 3000,
    "materials": [
      {
        "name": "悟道藤",
        "count": 1
      },
      {
        "name": "太虚草",
        "count": 1
      },
      {
        "name": "悟道花",
        "count": 1
      },
      {
        "name": "菩提果",
        "count": 1
      },
      {
        "name": "星魂藤",
        "count": 1
      },
      {
        "name": "天机叶",
        "count": 1
      },
      {
        "name": "灵悟芝",
        "count": 1
      }
    ]
  },
  {
    "pillName": "九转玄丹",
    "grade": "七品",
    "spiritStones": 3000,
    "materials": [
      {
        "name": "九天灵芝",
        "count": 1
      },
      {
        "name": "九转玄草",
        "count": 1
      },
      {
        "name": "玄天果",
        "count": 1
      },
      {
        "name": "造化莲",
        "count": 1
      },
      {
        "name": "阴阳花",
        "count": 1
      },
      {
        "name": "太虚芝",
        "count": 1
      },
      {
        "name": "太虚藤",
        "count": 1
      },
      {
        "name": "混沌露",
        "count": 1
      }
    ]
  },
  {
    "pillName": "九转仙丹",
    "grade": "神丹",
    "spiritStones": 50000,
    "materials": [
      {
        "name": "不死草",
        "count": 1
      }
    ]
  },
  {
    "pillName": "混元丹",
    "grade": "八品",
    "spiritStones": 6000,
    "materials": [
      {
        "name": "阴阳花",
        "count": 1
      },
      {
        "name": "混元草",
        "count": 1
      },
      {
        "name": "五行神果",
        "count": 1
      },
      {
        "name": "混沌莲",
        "count": 1
      }
    ]
  },
  {
    "pillName": "虚空丹",
    "grade": "七品",
    "spiritStones": 3000,
    "materials": [
      {
        "name": "虚空草",
        "count": 1
      },
      {
        "name": "空间花",
        "count": 1
      },
      {
        "name": "裂界藤",
        "count": 1
      },
      {
        "name": "星辰果",
        "count": 1
      },
      {
        "name": "虚空石髓",
        "count": 1
      }
    ]
  },
  {
    "pillName": "偷天丹",
    "grade": "仙丹",
    "spiritStones": 25000,
    "materials": [
      {
        "name": "天机叶",
        "count": 1
      }
    ]
  },
  {
    "pillName": "逆命丹",
    "grade": "八品",
    "spiritStones": 6000,
    "materials": [
      {
        "name": "逆命花",
        "count": 1
      },
      {
        "name": "因果藤",
        "count": 1
      },
      {
        "name": "天命果",
        "count": 1
      },
      {
        "name": "命魂芝",
        "count": 1
      },
      {
        "name": "时光砂",
        "count": 1
      }
    ]
  },
  {
    "pillName": "天命丹",
    "grade": "九品",
    "spiritStones": 12000,
    "materials": [
      {
        "name": "天命果",
        "count": 1
      },
      {
        "name": "气运花",
        "count": 1
      },
      {
        "name": "紫微果",
        "count": 1
      },
      {
        "name": "天机藤",
        "count": 1
      },
      {
        "name": "福缘莲",
        "count": 1
      },
      {
        "name": "星辰芝",
        "count": 1
      },
      {
        "name": "鸿运石",
        "count": 1
      }
    ]
  },
  {
    "pillName": "合道丹",
    "grade": "八品",
    "spiritStones": 6000,
    "materials": [
      {
        "name": "合道花",
        "count": 1
      },
      {
        "name": "道韵草",
        "count": 1
      },
      {
        "name": "悟道果",
        "count": 1
      },
      {
        "name": "天人参",
        "count": 1
      },
      {
        "name": "阴阳莲",
        "count": 1
      },
      {
        "name": "法则藤",
        "count": 1
      }
    ]
  },
  {
    "pillName": "阴阳造化丹",
    "grade": "九品",
    "spiritStones": 12000,
    "materials": [
      {
        "name": "阴阳神花",
        "count": 1
      },
      {
        "name": "造化果",
        "count": 1
      },
      {
        "name": "生死草",
        "count": 1
      },
      {
        "name": "九转神芝",
        "count": 1
      },
      {
        "name": "凤凰血莲",
        "count": 1
      },
      {
        "name": "太初露",
        "count": 1
      }
    ]
  },
  {
    "pillName": "大乘丹",
    "grade": "九品",
    "spiritStones": 12000,
    "materials": [
      {
        "name": "大乘花",
        "count": 1
      },
      {
        "name": "九天神果",
        "count": 1
      },
      {
        "name": "道心草",
        "count": 1
      },
      {
        "name": "天人莲",
        "count": 1
      },
      {
        "name": "万道芝",
        "count": 1
      },
      {
        "name": "紫府神参",
        "count": 1
      }
    ]
  },
  {
    "pillName": "万道丹",
    "grade": "九品",
    "spiritStones": 12000,
    "materials": [
      {
        "name": "万道花",
        "count": 1
      },
      {
        "name": "法则果",
        "count": 1
      },
      {
        "name": "道韵藤",
        "count": 1
      },
      {
        "name": "悟道神芝",
        "count": 1
      },
      {
        "name": "三千叶",
        "count": 1
      },
      {
        "name": "混沌花",
        "count": 1
      }
    ]
  },
  {
    "pillName": "造化神丹",
    "grade": "仙丹",
    "spiritStones": 25000,
    "materials": [
      {
        "name": "造化神花",
        "count": 1
      },
      {
        "name": "鸿蒙果",
        "count": 1
      },
      {
        "name": "不死神草",
        "count": 1
      },
      {
        "name": "九转神莲",
        "count": 1
      },
      {
        "name": "生命神树枝",
        "count": 1
      },
      {
        "name": "太初灵液",
        "count": 1
      }
    ]
  },
  {
    "pillName": "鸿蒙悟道丹",
    "grade": "神丹",
    "spiritStones": 50000,
    "materials": [
      {
        "name": "鸿蒙果",
        "count": 1
      },
      {
        "name": "太初灵液",
        "count": 1
      }
    ]
  },
  {
    "pillName": "九天玄丹",
    "grade": "仙丹",
    "spiritStones": 25000,
    "materials": [
      {
        "name": "九天玄花",
        "count": 1
      },
      {
        "name": "玄天神果",
        "count": 1
      },
      {
        "name": "太虚莲",
        "count": 1
      },
      {
        "name": "星辰神芝",
        "count": 1
      }
    ]
  }
]

export function getRecipeByPillName(name: string) {
  return PILL_RECIPES.find((item) => item.pillName === name) || null
}

export const HERB_LEVEL_TABS = ['全部', '灵草', '灵药', '灵果', '神', '仙', '道'] as const

export function filterHerbsByTab(tab: string) {
  if (!tab || tab === '全部') return HERB_MATERIALS
  return HERB_MATERIALS.filter((item) => item.level.includes(tab))
}
