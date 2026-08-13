import type { RealmMajor } from './realm'
import type { TreasureCategory, TreasureGrade } from './treasure'

export interface CatalogTreasure {
  id: string
  name: string
  /** 展示品阶，如：下品法器、极品灵器、先天至宝 */
  gradeLabel: string
  /** 系统品阶，用于境界校验 */
  grade: TreasureGrade
  /** 攻击类 / 防御类 / 辅助类 / 特殊类 */
  type: TreasureCategory
  effect: string
  special: string
  story: string
  realm: RealmMajor
  price: number
}

/** 器阁售卖法宝目录 */
export const FORGE_SHOP_CATALOG: CatalogTreasure[] = [
  // 炼气
  {
    id: 'shop-qingzhujian',
    name: '青竹剑',
    gradeLabel: '下品法器',
    grade: '法器',
    type: '攻击类',
    effect: '攻击+8%',
    special: '10%概率触发破气',
    story: '初入修仙界的基础佩剑',
    realm: '炼气',
    price: 120
  },
  {
    id: 'shop-julinghu',
    name: '聚灵葫',
    gradeLabel: '下品法器',
    grade: '法器',
    type: '辅助类',
    effect: '修炼速度+10%',
    special: '储存并释放灵气',
    story: '可陪伴玩家成长',
    realm: '炼气',
    price: 150
  },
  {
    id: 'shop-zhenhunling',
    name: '镇魂铃',
    gradeLabel: '中品法器',
    grade: '法器',
    type: '辅助类',
    effect: '心魔抗性+10%',
    special: '概率打断敌方施法',
    story: '铃中疑似封印着神秘魂魄',
    realm: '炼气',
    price: 220
  },
  // 筑基
  {
    id: 'shop-ziyunjian',
    name: '紫云剑',
    gradeLabel: '中品法器',
    grade: '法器',
    type: '攻击类',
    effect: '攻击+18%',
    special: '连续攻击3次触发剑气',
    story: '可进阶为紫霄剑',
    realm: '筑基',
    price: 480
  },
  {
    id: 'shop-jiuzhuanlingzhu',
    name: '九转灵珠',
    gradeLabel: '中品法器',
    grade: '法器',
    type: '辅助类',
    effect: '灵力恢复+20%',
    special: '致命伤害后保留1点生命',
    story: '每日可触发一次',
    realm: '筑基',
    price: 560
  },
  {
    id: 'shop-shanheyin',
    name: '山河印',
    gradeLabel: '上品法器',
    grade: '法器',
    type: '防御类',
    effect: '防御+25%',
    special: '镇山：敌方速度-30%',
    story: '山地战斗效果增强',
    realm: '筑基',
    price: 720
  },
  // 金丹
  {
    id: 'shop-jinwuyu',
    name: '金乌羽',
    gradeLabel: '灵器',
    grade: '灵器',
    type: '攻击类',
    effect: '火系伤害+35%',
    special: '金乌焚天',
    story: '消耗大量灵力换取爆发伤害',
    realm: '金丹',
    price: 1600
  },
  {
    id: 'shop-taiyinjing',
    name: '太阴镜',
    gradeLabel: '灵器',
    grade: '灵器',
    type: '防御类',
    effect: '防御+20%',
    special: '概率复制敌方技能',
    story: '夜晚能力增强',
    realm: '金丹',
    price: 1800
  },
  {
    id: 'shop-wuxinglun',
    name: '五行轮',
    gradeLabel: '灵器',
    grade: '灵器',
    type: '攻击类',
    effect: '五行攻击+15%',
    special: '自动切换克制属性',
    story: '可根据敌人属性改变形态',
    realm: '金丹',
    price: 2000
  },
  // 元婴
  {
    id: 'shop-tongtianjianxia',
    name: '通天剑匣',
    gradeLabel: '极品灵器',
    grade: '灵器',
    type: '攻击类',
    effect: '攻击+50%',
    special: '万剑归宗',
    story: '剑匣拥有独立器灵',
    realm: '元婴',
    price: 4200
  },
  {
    id: 'shop-jiulongshenhuozhao',
    name: '九龙神火罩',
    gradeLabel: '极品灵器',
    grade: '灵器',
    type: '防御类',
    effect: '防御+40%',
    special: '九龙焚天',
    story: '可召唤九条火龙',
    realm: '元婴',
    price: 4500
  },
  {
    id: 'shop-xuanmingzhu',
    name: '玄冥珠',
    gradeLabel: '极品灵器',
    grade: '灵器',
    type: '攻击类',
    effect: '水系伤害+50%',
    special: '冰封敌人',
    story: '死亡时自动冻结自身3秒',
    realm: '元婴',
    price: 4800
  },
  // 化神
  {
    id: 'shop-zhanxianfeidao',
    name: '斩仙飞刀',
    gradeLabel: '仙器',
    grade: '仙器',
    type: '攻击类',
    effect: '无视30%防御',
    special: '斩神：概率斩杀低境界敌人',
    story: '使用过度可能损伤神魂',
    realm: '化神',
    price: 8800
  },
  {
    id: 'shop-taixushenzhou',
    name: '太虚神舟',
    gradeLabel: '仙器',
    grade: '仙器',
    type: '辅助类',
    effect: '移动速度大幅提升',
    special: '跨越禁区、探索秘境',
    story: '后期可跨越世界',
    realm: '化神',
    price: 9200
  },
  {
    id: 'shop-wanhunfan',
    name: '万魂幡',
    gradeLabel: '仙器',
    grade: '仙器',
    type: '特殊类',
    effect: '吸收敌人残魂',
    special: '获取残魂技能与记忆',
    story: '残魂拥有独立意识和怨念',
    realm: '化神',
    price: 9600
  },
  // 炼虚
  {
    id: 'shop-xukongjing',
    name: '虚空镜',
    gradeLabel: '仙器',
    grade: '仙器',
    type: '特殊类',
    effect: '空间能力提升',
    special: '瞬移、镜像、镜中世界',
    story: '可困敌于虚幻空间',
    realm: '炼虚',
    price: 14000
  },
  {
    id: 'shop-shisha',
    name: '时砂',
    gradeLabel: '仙器',
    grade: '仙器',
    type: '特殊类',
    effect: '时间抗性提升',
    special: '逆时：回到5秒前',
    story: '使用会产生时间债',
    realm: '炼虚',
    price: 15000
  },
  {
    id: 'shop-yinguobi',
    name: '因果笔',
    gradeLabel: '仙器',
    grade: '仙器',
    type: '特殊类',
    effect: '因果能力提升',
    special: '修改 NPC 因果关系',
    story: '可改变 NPC 的记忆与命运',
    realm: '炼虚',
    price: 16000
  },
  // 合体
  {
    id: 'shop-yinyangtianpan',
    name: '阴阳天盘',
    gradeLabel: '道器',
    grade: '道器',
    type: '特殊类',
    effect: '阴阳属性强化',
    special: '改变生死、阴阳规则',
    story: '可影响整个战场',
    realm: '合体',
    price: 28000
  },
  {
    id: 'shop-hundunzhong',
    name: '混沌钟',
    gradeLabel: '道器',
    grade: '道器',
    type: '特殊类',
    effect: '全属性强化',
    special: '混沌领域：限制法术与灵力',
    story: '可改变局部战斗规则',
    realm: '合体',
    price: 32000
  },
  {
    id: 'shop-zhuxianjianzhen',
    name: '诛仙剑阵',
    gradeLabel: '道器',
    grade: '道器',
    type: '攻击类',
    effect: '大幅提升攻击',
    special: '诛仙剑阵',
    story: '四剑+阵图，可长期收集',
    realm: '合体',
    price: 36000
  },
  // 大乘
  {
    id: 'shop-shanheshejitu',
    name: '山河社稷图',
    gradeLabel: '镇界神器',
    grade: '镇界神器',
    type: '特殊类',
    effect: '大幅提升领域能力',
    special: '收纳城池、宗门、秘境',
    story: '可创造属于玩家的小世界',
    realm: '大乘',
    price: 68000
  },
  {
    id: 'shop-liudaolunhuipan',
    name: '六道轮回盘',
    gradeLabel: '镇界神器',
    grade: '镇界神器',
    type: '特殊类',
    effect: '生死能力强化',
    special: '控制六道轮回',
    story: '可开启转生系统',
    realm: '大乘',
    price: 72000
  },
  {
    id: 'shop-tianjibang',
    name: '天机榜',
    gradeLabel: '镇界神器',
    grade: '镇界神器',
    type: '辅助类',
    effect: '洞察世界信息',
    special: '查看修士命运',
    story: '可预测 NPC 未来',
    realm: '大乘',
    price: 76000
  },
  // 渡劫
  {
    id: 'shop-jiutianleiyin',
    name: '九天雷印',
    gradeLabel: '道器',
    grade: '道器',
    type: '攻击类',
    effect: '雷系伤害+100%',
    special: '吸收天劫雷霆',
    story: '每次渡劫后永久成长',
    realm: '渡劫',
    price: 52000
  },
  {
    id: 'shop-nimingjian',
    name: '逆命剑',
    gradeLabel: '道器',
    grade: '道器',
    type: '特殊类',
    effect: '无视部分规则',
    special: '修改一次死亡结局',
    story: '可用境界、记忆或关系换命',
    realm: '渡劫',
    price: 58000
  },
  {
    id: 'shop-tianjiesan',
    name: '天劫伞',
    gradeLabel: '道器',
    grade: '道器',
    type: '防御类',
    effect: '雷劫伤害大幅降低',
    special: '抵挡天劫',
    story: '使用次数越多越接近破碎',
    realm: '渡劫',
    price: 54000
  },
  // 飞升
  {
    id: 'shop-hongmengzhu',
    name: '鸿蒙珠',
    gradeLabel: '先天至宝',
    grade: '先天至宝',
    type: '特殊类',
    effect: '全属性极大提升',
    special: '创造局部世界规则',
    story: '玩家开始拥有自己的仙界',
    realm: '飞升',
    price: 120000
  },
  {
    id: 'shop-tiandaoshu',
    name: '天道书',
    gradeLabel: '先天至宝',
    grade: '先天至宝',
    type: '辅助类',
    effect: '洞察世界规则',
    special: '查看过去、现在与未来',
    story: '可生成世界级预言',
    realm: '飞升',
    price: 130000
  },
  {
    id: 'shop-wumingdaobei',
    name: '无名道碑',
    gradeLabel: '先天至宝',
    grade: '先天至宝',
    type: '特殊类',
    effect: '无固定属性',
    special: '创造属于自己的大道',
    story: '可由玩家定义全新规则',
    realm: '飞升',
    price: 150000
  }
]

export const FORGE_SHOP_REALMS: RealmMajor[] = [
  '炼气',
  '筑基',
  '金丹',
  '元婴',
  '化神',
  '炼虚',
  '合体',
  '大乘',
  '渡劫',
  '飞升'
]
