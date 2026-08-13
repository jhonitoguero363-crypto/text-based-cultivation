import type { RealmMajor } from './realm'

export interface CatalogPill {
  id: string
  name: string
  grade: string
  type: string
  effect: string
  special: string
  story: string
  realm: RealmMajor
  price: number
}

/** 丹阁售卖丹药目录 */
export const PILL_SHOP_CATALOG: CatalogPill[] = [
  // 炼气
  {
    id: 'pill-juqi',
    name: '聚气丹',
    grade: '一品',
    type: '修炼',
    effect: '灵气+500',
    special: '1小时内修炼速度+20%',
    story: '新手最常见的基础丹药',
    realm: '炼气',
    price: 80
  },
  {
    id: 'pill-huiling',
    name: '回灵丹',
    grade: '一品',
    type: '恢复',
    effect: '恢复30%灵力',
    special: '战斗中可使用',
    story: '炼气期修士常备丹药',
    realm: '炼气',
    price: 90
  },
  {
    id: 'pill-ningxue',
    name: '凝血丹',
    grade: '一品',
    type: '恢复',
    effect: '恢复30%生命',
    special: '持续恢复5秒',
    story: '可用于野外探索',
    realm: '炼气',
    price: 90
  },
  {
    id: 'pill-xisui',
    name: '洗髓丹',
    grade: '二品',
    type: '成长',
    effect: '根骨+5',
    special: '小概率获得隐藏属性',
    story: '有概率触发特殊体质',
    realm: '炼气',
    price: 220
  },
  // 筑基
  {
    id: 'pill-zhuji',
    name: '筑基丹',
    grade: '三品',
    type: '突破',
    effect: '提升筑基成功率',
    special: '突破失败率降低',
    story: '筑基期最核心丹药',
    realm: '筑基',
    price: 680
  },
  {
    id: 'pill-yanghun',
    name: '养魂丹',
    grade: '三品',
    type: '神魂',
    effect: '神魂+10%',
    special: '提高心魔抗性',
    story: '可降低突破时心魔出现概率',
    realm: '筑基',
    price: 520
  },
  {
    id: 'pill-ziling',
    name: '紫灵丹',
    grade: '三品',
    type: '修炼',
    effect: '修炼速度+30%',
    special: '持续12小时',
    story: '紫灵草炼制，较为稀有',
    realm: '筑基',
    price: 560
  },
  {
    id: 'pill-jingang',
    name: '金刚丹',
    grade: '三品',
    type: '防御',
    effect: '防御+20%',
    special: '持续30分钟',
    story: '临时提升肉身强度',
    realm: '筑基',
    price: 480
  },
  // 金丹
  {
    id: 'pill-jiejin',
    name: '结金丹',
    grade: '四品',
    type: '突破',
    effect: '提升结丹成功率',
    special: '金丹品质最低提升一档',
    story: '金丹修士争夺的珍贵资源',
    realm: '金丹',
    price: 1800
  },
  {
    id: 'pill-chiyang',
    name: '赤阳丹',
    grade: '四品',
    type: '火系',
    effect: '火系伤害+30%',
    special: '有概率领悟火属性神通',
    story: '火灵根修士效果翻倍',
    realm: '金丹',
    price: 1500
  },
  {
    id: 'pill-taiyin',
    name: '太阴丹',
    grade: '四品',
    type: '阴属性',
    effect: '神魂+20%',
    special: '夜间效果增强',
    story: '与太阴类功法存在特殊联动',
    realm: '金丹',
    price: 1600
  },
  {
    id: 'pill-jiuzhuanhuiyuan',
    name: '九转回元丹',
    grade: '五品',
    type: '恢复',
    effect: '生命、灵力各恢复50%',
    special: '清除部分负面状态',
    story: '战斗中的高级恢复丹',
    realm: '金丹',
    price: 2400
  },
  // 元婴
  {
    id: 'pill-yingling',
    name: '婴灵丹',
    grade: '五品',
    type: '突破',
    effect: '提升元婴凝聚成功率',
    special: '降低突破失败惩罚',
    story: '元婴期核心突破资源',
    realm: '元婴',
    price: 4200
  },
  {
    id: 'pill-jiuqiaoyangshen',
    name: '九窍养神丹',
    grade: '五品',
    type: '神魂',
    effect: '神魂+30%',
    special: '提高幻术和精神攻击',
    story: '有概率开启特殊感知能力',
    realm: '元婴',
    price: 3800
  },
  {
    id: 'pill-tianhun',
    name: '天魂丹',
    grade: '六品',
    type: '神魂',
    effect: '神魂大幅提升',
    special: '死亡后有极低概率保留部分意识',
    story: '可触发特殊灵魂剧情',
    realm: '元婴',
    price: 5600
  },
  {
    id: 'pill-wanling',
    name: '万灵丹',
    grade: '六品',
    type: '全能',
    effect: '全属性+15%',
    special: '短时间进入最佳状态',
    story: '多种灵兽材料炼制',
    realm: '元婴',
    price: 5200
  },
  // 化神
  {
    id: 'pill-huashen',
    name: '化神丹',
    grade: '六品',
    type: '突破',
    effect: '提升化神成功率',
    special: '突破时心魔伤害降低',
    story: '化神修士梦寐以求的丹药',
    realm: '化神',
    price: 8800
  },
  {
    id: 'pill-tianyuan',
    name: '天元丹',
    grade: '六品',
    type: '修炼',
    effect: '修炼速度+50%',
    special: '持续24小时',
    story: '可大幅缩短闭关时间',
    realm: '化神',
    price: 7600
  },
  {
    id: 'pill-niepan',
    name: '涅槃丹',
    grade: '七品',
    type: '重生',
    effect: '死亡后恢复30%生命',
    special: '每月仅可触发一次',
    story: '有概率觉醒特殊血脉',
    realm: '化神',
    price: 12000
  },
  {
    id: 'pill-jiuzhuanxuan',
    name: '九转玄丹',
    grade: '七品',
    type: '全能',
    effect: '全属性+25%',
    special: '清除大部分负面状态',
    story: '极其稀有',
    realm: '化神',
    price: 14000
  },
  // 炼虚
  {
    id: 'pill-xukong',
    name: '虚空丹',
    grade: '七品',
    type: '空间',
    effect: '空间感悟+30%',
    special: '可短暂感知空间裂隙',
    story: '有概率发现隐藏秘境',
    realm: '炼虚',
    price: 16000
  },
  {
    id: 'pill-taixuwudao',
    name: '太虚悟道丹',
    grade: '七品',
    type: '悟道',
    effect: '悟道速度+50%',
    special: '持续3小时',
    story: 'AI 可根据玩家选择生成悟道事件',
    realm: '炼虚',
    price: 17000
  },
  {
    id: 'pill-niming',
    name: '逆命丹',
    grade: '八品',
    type: '命运',
    effect: '获得一次死亡豁免',
    special: '使用后会产生因果债',
    story: '可能改变 NPC 对玩家的记忆',
    realm: '炼虚',
    price: 22000
  },
  {
    id: 'pill-jiuzhuanlunhui',
    name: '九转轮回丹',
    grade: '八品',
    type: '轮回',
    effect: '死亡后保留部分修为',
    special: '可选择转世方向',
    story: '可开启隐藏转生路线',
    realm: '炼虚',
    price: 24000
  },
  // 合体
  {
    id: 'pill-hedao',
    name: '合道丹',
    grade: '八品',
    type: '突破',
    effect: '提升合体成功率',
    special: '与本命功法产生特殊效果',
    story: '合体期核心资源',
    realm: '合体',
    price: 32000
  },
  {
    id: 'pill-hunyuan',
    name: '混元丹',
    grade: '八品',
    type: '全能',
    effect: '全属性+40%',
    special: '暂时免疫部分控制',
    story: '可作为顶级战斗丹',
    realm: '合体',
    price: 30000
  },
  {
    id: 'pill-yinyangzaohua',
    name: '阴阳造化丹',
    grade: '九品',
    type: '造化',
    effect: '修复肉身与神魂',
    special: '修复严重伤势',
    story: '可改变部分角色体质',
    realm: '合体',
    price: 42000
  },
  {
    id: 'pill-tianming',
    name: '天命丹',
    grade: '九品',
    type: '命运',
    effect: '幸运+50%',
    special: '大幅提高机缘事件概率',
    story: '可能触发隐藏 NPC 和秘境',
    realm: '合体',
    price: 45000
  },
  // 大乘
  {
    id: 'pill-dacheng',
    name: '大乘丹',
    grade: '九品',
    type: '突破',
    effect: '提升大乘突破成功率',
    special: '降低天道压制',
    story: '极少数顶级修士才能炼制',
    realm: '大乘',
    price: 68000
  },
  {
    id: 'pill-wandao',
    name: '万道丹',
    grade: '九品',
    type: '悟道',
    effect: '随机提升一种大道感悟',
    special: '有概率领悟稀有大道',
    story: '每颗丹药效果都可能不同',
    realm: '大乘',
    price: 72000
  },
  {
    id: 'pill-zaohuashen',
    name: '造化神丹',
    grade: '仙丹',
    type: '造化',
    effect: '肉身、神魂全面恢复',
    special: '可修复部分道伤',
    story: '传说中可逆转濒死状态',
    realm: '大乘',
    price: 88000
  },
  {
    id: 'pill-jiutianxuan',
    name: '九天玄丹',
    grade: '仙丹',
    type: '全能',
    effect: '全属性+60%',
    special: '短时间进入“天人合一”状态',
    story: '使用时可能触发天道注视',
    realm: '大乘',
    price: 96000
  },
  // 渡劫
  {
    id: 'pill-dujie',
    name: '渡劫丹',
    grade: '仙丹',
    type: '突破',
    effect: '渡劫成功率+20%',
    special: '雷劫伤害降低',
    story: '渡劫期最重要丹药之一',
    realm: '渡劫',
    price: 110000
  },
  {
    id: 'pill-leiyuan',
    name: '雷元丹',
    grade: '仙丹',
    type: '雷系',
    effect: '雷抗+50%',
    special: '吸收部分天雷转化为自身灵力',
    story: '可强化九天雷印',
    realm: '渡劫',
    price: 105000
  },
  {
    id: 'pill-jiusihuanhun',
    name: '九死还魂丹',
    grade: '仙丹',
    type: '复活',
    effect: '死亡后复活一次',
    special: '复活后境界暂时下降',
    story: '一生最多使用三次',
    realm: '渡劫',
    price: 128000
  },
  {
    id: 'pill-toutian',
    name: '偷天丹',
    grade: '仙丹',
    type: '天道',
    effect: '暂时隐藏自身气息',
    special: '降低天道锁定概率',
    story: '使用过多会增加天道敌意',
    realm: '渡劫',
    price: 118000
  },
  // 飞升
  {
    id: 'pill-feisheng',
    name: '飞升丹',
    grade: '神丹',
    type: '飞升',
    effect: '大幅提高飞升成功率',
    special: '降低飞升雷劫强度',
    story: '使用后开启仙界地图',
    realm: '飞升',
    price: 180000
  },
  {
    id: 'pill-jiuzhuanxian',
    name: '九转仙丹',
    grade: '神丹',
    type: '重塑',
    effect: '肉身与神魂彻底重塑',
    special: '获得仙体',
    story: '飞升后可继续进阶',
    realm: '飞升',
    price: 200000
  },
  {
    id: 'pill-hongmengwudao',
    name: '鸿蒙悟道丹',
    grade: '神丹',
    type: '大道',
    effect: '大幅提升大道感悟',
    special: '有概率领悟鸿蒙级大道',
    story: '每颗丹药生成不同悟道结果',
    realm: '飞升',
    price: 220000
  },
  {
    id: 'pill-taichushen',
    name: '太初神丹',
    grade: '神丹',
    type: '创世',
    effect: '全属性+100%',
    special: '可创造一种低级世界规则',
    story: '仙界顶级丹药',
    realm: '飞升',
    price: 250000
  },
  {
    id: 'pill-wujidao',
    name: '无极道丹',
    grade: '先天神丹',
    type: '大道',
    effect: '突破自身大道限制',
    special: '可创造全新修炼体系',
    story: '游戏终局级稀有道具',
    realm: '飞升',
    price: 360000
  }
]

export const PILL_SHOP_REALMS: RealmMajor[] = [
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
