import type { RealmMajor } from './realm'
import { REALM_MAJORS } from './realm'
import type { SectFaction } from './sects'
import { getRealmMajorIndex } from './treasure'

/** 功法流派（含派系专属：魔修 / 妖族） */
export const TECHNIQUE_SCHOOLS = [
  '剑修',
  '炼体',
  '法修',
  '雷修',
  '魂修',
  '驭兽',
  '丹修',
  '阵修',
  '空间',
  '时间',
  '混沌',
  '天道',
  '魔修',
  '妖族'
] as const

export type TechniqueSchool = (typeof TECHNIQUE_SCHOOLS)[number]

export interface TechniqueSchoolDef {
  school: TechniqueSchool
  core: string
  attrs: string
  playStyle: string
}

export const TECHNIQUE_SCHOOL_DEFS: TechniqueSchoolDef[] = [
  { school: '剑修', core: '太虚剑诀', attrs: '攻击、暴击', playStyle: '高爆发' },
  { school: '炼体', core: '九转炼体诀', attrs: '生命、防御', playStyle: '肉盾' },
  { school: '法修', core: '太玄功', attrs: '灵力、法伤', playStyle: '技能输出' },
  { school: '雷修', core: '九天雷皇诀', attrs: '雷伤、暴击', playStyle: '爆发' },
  { school: '魂修', core: '九幽魂诀', attrs: '神魂、控制', playStyle: '控制' },
  { school: '驭兽', core: '万兽灵诀', attrs: '灵宠属性', playStyle: '灵宠战斗' },
  { school: '丹修', core: '青帝长生诀', attrs: '恢复、炼丹', playStyle: '辅助' },
  { school: '阵修', core: '阴阳造化诀', attrs: '阵法、控制', playStyle: '策略' },
  { school: '空间', core: '虚空经', attrs: '闪避、空间', playStyle: '高机动' },
  { school: '时间', core: '岁月诀', attrs: '时间减速', playStyle: '后期玩法' },
  { school: '混沌', core: '混沌炼气诀', attrs: '全属性', playStyle: '全能' },
  { school: '天道', core: '无上天道经', attrs: '法则', playStyle: '终极流派' },
  { school: '魔修', core: '太古天魔经', attrs: '血气、神魂', playStyle: '魔门专属' },
  { school: '妖族', core: '太古妖神经', attrs: '血脉、肉身', playStyle: '妖族专属' }
]

/** 品阶大类：黄 / 玄 / 地 / 天 / 仙 */
export const TECHNIQUE_GRADE_TIERS = ['黄阶', '玄阶', '地阶', '天阶', '仙阶'] as const

export type TechniqueGradeTier = (typeof TECHNIQUE_GRADE_TIERS)[number]

/**
 * 功法灵根属性（九种）：五行 + 风冰雷 + 无属性。
 * 与洞府修炼亲和、异灵根战力判定对齐。
 */
export const TECHNIQUE_ATTRS = [
  '金',
  '木',
  '水',
  '火',
  '土',
  '风',
  '冰',
  '雷',
  '无属性'
] as const

export type TechniqueAttr = (typeof TECHNIQUE_ATTRS)[number]

export interface CatalogTechnique {
  id: string
  name: string
  /** 展示品阶，如：黄阶下品、仙阶上品 */
  grade: string
  /** 品阶大类：黄阶 / 玄阶 / 地阶 / 天阶 / 仙阶 */
  gradeTier: TechniqueGradeTier
  /**
   * 灵根属性（九种之一）。
   * 兼容旧字段名 `type`：UI / 存档仍读 type。
   */
  type: TechniqueAttr
  /** 同 type，语义更清晰 */
  attr: TechniqueAttr
  /** 流派 */
  school: TechniqueSchool
  /** 适合境界原文，如：炼气～筑基 */
  realmLabel: string
  /** 最低可习境界 */
  realm: RealmMajor
  effect: string
  origin: string
  /** 贡献兑换消耗 */
  cost: number
  /**
   * 功法阁可见派系；缺省 = 各宗通用。
   * 例：魔修仅 `['魔门']`，妖族仅 `['妖族']`；剑修 / 炼体通传为空。
   */
  factionsAccess?: SectFaction[]
}

const COST_BY_GRADE: Record<string, number> = {
  黄阶下品: 80,
  黄阶中品: 120,
  黄阶上品: 180,
  玄阶下品: 280,
  玄阶中品: 400,
  玄阶上品: 560,
  地阶下品: 900,
  地阶中品: 1300,
  地阶上品: 1800,
  天阶下品: 3000,
  天阶中品: 4500,
  天阶上品: 6500,
  仙阶下品: 12000,
  仙阶中品: 20000,
  仙阶上品: 35000
}

/** 品阶序位（越低越小）；用于改修升阶损失修为 */
const GRADE_RANK: Record<string, number> = {
  黄阶下品: 0,
  黄阶中品: 1,
  黄阶上品: 2,
  玄阶下品: 3,
  玄阶中品: 4,
  玄阶上品: 5,
  地阶下品: 6,
  地阶中品: 7,
  地阶上品: 8,
  天阶下品: 9,
  天阶中品: 10,
  天阶上品: 11,
  仙阶下品: 12,
  仙阶中品: 13,
  仙阶上品: 14
}

function normalizeRealmLabel(raw: string) {
  return raw.replace(/练气/g, '炼气').trim()
}

function parseMinRealm(label: string): RealmMajor {
  const text = normalizeRealmLabel(label)
  const cleaned = text.replace(/后期|前期|中期|大圆满/g, '')
  for (const major of REALM_MAJORS) {
    if (major === '无修为') continue
    if (cleaned.includes(major)) return major
  }
  return '炼气'
}

function parseGradeTier(grade: string): TechniqueGradeTier {
  for (const tier of TECHNIQUE_GRADE_TIERS) {
    if (grade.startsWith(tier) || grade === tier) return tier
  }
  return '黄阶'
}

function costOf(grade: string) {
  return COST_BY_GRADE[grade] || 500
}

function tech(
  id: string,
  grade: string,
  name: string,
  attr: TechniqueAttr,
  school: TechniqueSchool,
  realmRaw: string,
  effect: string,
  origin: string,
  factionsAccess?: SectFaction[]
): CatalogTechnique {
  const realmLabel = normalizeRealmLabel(realmRaw)
  return {
    id,
    name,
    grade,
    gradeTier: parseGradeTier(grade),
    type: attr,
    attr,
    school,
    realmLabel,
    realm: parseMinRealm(realmLabel),
    effect,
    origin,
    cost: costOf(grade),
    ...(factionsAccess?.length ? { factionsAccess } : {})
  }
}

/** 该功法是否可在指定派系宗门的功法阁出现（不含「已拥有」兜底） */
export function isTechniqueAvailableInFaction(
  item: CatalogTechnique,
  faction: SectFaction | string | null | undefined
) {
  if (!item.factionsAccess?.length) return true
  if (!faction) return false
  return item.factionsAccess.includes(faction as SectFaction)
}

/** 坊市等非宗门渠道：仅通用功法（剑修 / 炼体通传 / 原通用目录） */
export function isTechniqueMarketEligible(item: CatalogTechnique) {
  return !item.factionsAccess?.length
}

/**
 * 功法阁目录
 * 品阶仅保留：黄 / 玄 / 地 / 天 / 仙（各含下/中/上品）
 * 属性九种：金木水火土 / 风冰雷 / 无属性
 * 派系专属：魔修→魔门；妖族→妖族；剑修与炼体（体修）通传各宗
 */
export const TECHNIQUE_CATALOG: CatalogTechnique[] = [
  // —— 黄阶：炼气入门 ——
  tech('tech-1', '黄阶下品', '纳气诀', '无属性', '法修', '练气', '修炼速度 +5%', '外门藏经阁'),
  tech('tech-2', '黄阶下品', '青木诀', '木', '法修', '练气', '木属性伤害 +5%', '青云山历练'),
  tech('tech-3', '黄阶中品', '烈火诀', '火', '法修', '练气', '火属性伤害 +8%', '炼丹峰'),
  tech('tech-4', '黄阶中品', '凝水诀', '水', '法修', '练气', '水属性伤害 +8%', '寒潭洞'),
  tech('tech-5', '黄阶上品', '玄铁炼体诀', '金', '炼体', '练气', '防御 +10%', '器峰'),
  tech('tech-6', '黄阶上品', '疾风决', '风', '空间', '练气', '闪避 +8%', '宗门任务'),
  tech('tech-7', '黄阶上品', '青云心法', '无属性', '法修', '练气～筑基', '修炼速度 +12%', '青云宗传承'),
  tech('tech-8', '黄阶上品', '金刚诀', '金', '炼体', '练气～筑基', '防御 +15%', '金刚宗'),

  // —— 玄阶：筑基～金丹 ——
  tech('tech-9', '玄阶下品', '赤炎真诀', '火', '法修', '筑基', '火伤 +15%', '赤炎山脉'),
  tech('tech-10', '玄阶下品', '寒月诀', '冰', '法修', '筑基', '冰伤 +15%', '寒潭秘境'),
  tech('tech-11', '玄阶中品', '紫雷诀', '雷', '雷修', '筑基～金丹', '雷伤 +20%', '天雷崖'),
  tech('tech-12', '玄阶中品', '影遁术', '风', '空间', '筑基', '闪避 +15%', '黑风林奇遇'),
  tech('tech-13', '玄阶中品', '太玄功', '无属性', '法修', '筑基～金丹', '修炼速度 +25%', '秘境传承'),
  tech('tech-14', '玄阶上品', '厚土神诀', '土', '炼体', '筑基～金丹', '防御 +25%', '大地秘境'),
  tech('tech-15', '玄阶上品', '青冥剑诀', '金', '剑修', '金丹', '剑伤 +30%', '古剑冢'),
  tech('tech-16', '玄阶上品', '九转炼体诀', '土', '炼体', '金丹', '生命 +30%', '妖兽山脉'),

  // —— 地阶：金丹～化神 ——
  tech('tech-17', '地阶下品', '九霄雷法', '雷', '雷修', '金丹～元婴', '雷伤 +35%', '天雷秘境'),
  tech('tech-18', '地阶下品', '万兽灵诀', '木', '驭兽', '金丹', '灵宠属性 +30%', '万妖森林'),
  tech('tech-19', '地阶下品', '太虚剑诀', '金', '剑修', '元婴', '剑伤 +45%', '太虚秘境'),
  tech('tech-20', '地阶中品', '九幽魂诀', '冰', '魂修', '元婴', '神魂伤害 +40%', '九幽谷'),
  tech('tech-21', '地阶中品', '青帝长生诀', '木', '丹修', '元婴～化神', '生命恢复 +50%', '青木秘境'),
  tech('tech-22', '地阶中品', '玄冰神诀', '冰', '法修', '元婴～化神', '冰伤 +50%', '玄冰宫'),
  tech('tech-23', '地阶上品', '九天雷皇诀', '雷', '雷修', '化神', '雷伤 +65%', '九天雷域'),
  tech('tech-24', '地阶上品', '天妖炼体诀', '土', '炼体', '化神', '生命、防御 +60%', '万妖古境'),
  tech('tech-25', '地阶上品', '太阴炼魂诀', '冰', '魂修', '化神～炼虚', '神魂 +70%', '万魂古墓'),

  // —— 天阶：化神～渡劫 ——
  tech('tech-26', '天阶下品', '星辰炼体术', '土', '炼体', '化神～炼虚', '全属性 +50%', '星陨海'),
  tech('tech-27', '天阶下品', '虚空经', '风', '空间', '炼虚', '空间伤害 +70%', '虚空裂谷'),
  tech('tech-28', '天阶下品', '岁月诀', '无属性', '时间', '炼虚', '时间类技能效果 +50%', '岁月长河'),
  tech('tech-29', '天阶中品', '六道轮回经', '无属性', '魂修', '炼虚～合体', '死亡后有概率复生', '轮回古境'),
  tech('tech-30', '天阶中品', '混沌炼气诀', '无属性', '混沌', '合体', '全属性 +80%', '混沌海'),
  tech('tech-31', '天阶中品', '阴阳造化诀', '无属性', '阵修', '合体', '攻防同时提升', '阴阳天池'),
  tech('tech-32', '天阶上品', '万界归元诀', '无属性', '天道', '合体～大乘', '全属性 +100%', '万界战场'),
  tech('tech-33', '天阶上品', '世界树经', '木', '天道', '大乘', '生命、灵力大幅提升', '世界树海'),
  tech('tech-34', '天阶上品', '鸿蒙紫气诀', '无属性', '混沌', '大乘～渡劫', '修炼速度 +150%', '鸿蒙秘境'),

  // —— 仙阶：渡劫～飞升 ——
  tech('tech-35', '仙阶下品', '太初神诀', '无属性', '混沌', '渡劫', '全属性 +180%', '太初神域'),
  tech('tech-36', '仙阶下品', '诸天帝经', '无属性', '天道', '渡劫～飞升', '掌控多种法则', '诸天古战场'),
  tech('tech-37', '仙阶下品', '九转仙经', '无属性', '法修', '飞升', '仙力 +200%', '南天仙域'),
  tech('tech-38', '仙阶中品', '混沌仙经', '无属性', '混沌', '飞升', '混沌属性 +250%', '混沌天墟'),
  tech('tech-39', '仙阶中品', '鸿蒙神典', '无属性', '混沌', '飞升', '全属性 +300%', '鸿蒙神域'),
  tech('tech-40', '仙阶上品', '万道神诀', '无属性', '天道', '飞升', '可融合不同功法', '万道神域'),
  tech('tech-41', '仙阶上品', '太初道经', '无属性', '混沌', '飞升后期', '掌控太初本源', '太初神域'),
  tech('tech-42', '仙阶上品', '无上天道经', '无属性', '天道', '飞升后期', '改变部分世界规则', '天道遗迹'),

  // —— 魔修（仅魔门宗门功法阁；来源 功法信息2.txt）——
  tech('tech-43', '黄阶下品', '血煞诀', '火', '魔修', '炼气', '吸收血气提升自身', '魔门藏经', ['魔门']),
  tech('tech-44', '黄阶上品', '噬魂诀', '冰', '魔修', '炼气', '吞噬残魂增强神识', '魔门藏经', ['魔门']),
  tech('tech-45', '玄阶下品', '赤血魔功', '火', '魔修', '筑基', '以精血淬炼魔躯', '魔门秘传', ['魔门']),
  tech('tech-46', '玄阶上品', '九幽炼魂诀', '冰', '魔修', '筑基～金丹', '强化神魂与魂力', '魔门秘传', ['魔门']),
  tech('tech-47', '地阶下品', '万魂魔典', '冰', '魔修', '金丹～元婴', '凝聚万魂，召唤魂灵作战', '魔渊古卷', ['魔门']),
  tech('tech-48', '地阶上品', '天魔噬灵功', '无属性', '魔修', '元婴～化神', '吞噬敌人灵力转化为自身修为', '魔渊古卷', [
    '魔门'
  ]),
  tech('tech-49', '天阶下品', '六欲天魔诀', '无属性', '魔修', '化神～炼虚', '操控七情六欲，侵蚀敌人心神', '天魔遗卷', [
    '魔门'
  ]),
  tech('tech-50', '天阶上品', '血海魔经', '火', '魔修', '炼虚～合体', '化身血海，拥有极强恢复能力', '天魔遗卷', [
    '魔门'
  ]),
  tech('tech-51', '仙阶下品', '太古天魔经', '无属性', '魔修', '渡劫～飞升', '修炼天魔之躯，掌控魔道法则', '太古魔域', [
    '魔门'
  ]),
  tech('tech-52', '仙阶上品', '万古魔神诀', '无属性', '魔修', '飞升', '凝聚魔神真身，吞噬万法', '太古魔域', ['魔门']),

  // —— 妖族（仅妖族宗门功法阁）——
  tech('tech-53', '黄阶下品', '妖灵炼体诀', '土', '妖族', '炼气', '吸收妖气强化肉身', '妖族血脉殿', ['妖族']),
  tech('tech-54', '黄阶上品', '百兽化形诀', '木', '妖族', '炼气', '提升妖族化形能力', '妖族血脉殿', ['妖族']),
  tech('tech-55', '玄阶下品', '狼王啸月诀', '火', '妖族', '筑基', '吸收月华强化血脉', '万兽宗祠', ['妖族']),
  tech('tech-56', '玄阶上品', '金刚妖体诀', '金', '妖族', '筑基～金丹', '强化防御与力量', '万兽宗祠', ['妖族']),
  tech('tech-57', '地阶下品', '万兽吞天诀', '无属性', '妖族', '金丹～元婴', '吞噬妖兽精血强化自身', '古妖遗冢', ['妖族']),
  tech('tech-58', '地阶上品', '九尾天狐诀', '冰', '妖族', '元婴～化神', '强化神魂与幻术能力', '古妖遗冢', ['妖族']),
  tech('tech-59', '天阶下品', '真龙炼体诀', '金', '妖族', '化神～炼虚', '激活真龙血脉，凝聚龙威', '龙脉圣地', ['妖族']),
  tech('tech-60', '天阶上品', '鲲鹏逍遥诀', '风', '妖族', '炼虚～合体', '大幅提升速度与空间能力', '龙脉圣地', ['妖族']),
  tech('tech-61', '仙阶下品', '太古妖神经', '无属性', '妖族', '渡劫～飞升', '凝聚妖神真身，统御万妖', '太古妖墟', ['妖族']),
  tech('tech-62', '仙阶上品', '混沌祖妖诀', '无属性', '妖族', '飞升', '返祖混沌妖血，掌控混沌之力', '太古妖墟', [
    '妖族'
  ]),

  // —— 剑修（各宗通用）——
  tech('tech-63', '黄阶下品', '基础剑诀', '金', '剑修', '炼气', '凝聚最基础的剑气', '剑修通传'),
  tech('tech-64', '黄阶上品', '青锋剑诀', '金', '剑修', '炼气', '提升剑气攻击力', '剑修通传'),
  tech('tech-65', '玄阶下品', '流云剑诀', '金', '剑修', '筑基', '以速度形成连续剑气', '剑冢残篇'),
  tech('tech-66', '玄阶上品', '烈阳剑诀', '火', '剑修', '筑基～金丹', '剑气蕴含烈阳之力', '剑冢残篇'),
  tech('tech-67', '地阶下品', '万剑诀', '金', '剑修', '金丹～元婴', '一念化出万道剑气', '万剑遗迹'),
  tech('tech-68', '地阶上品', '无影剑诀', '风', '剑修', '元婴～化神', '剑出无影，提升爆发与闪避', '万剑遗迹'),
  tech('tech-69', '天阶下品', '天罡剑典', '金', '剑修', '化神～炼虚', '凝聚强大剑势压制敌人', '天罡剑域'),
  tech('tech-70', '天阶上品', '太虚剑经', '风', '剑修', '炼虚～合体', '剑气撕裂空间', '天罡剑域'),
  tech('tech-71', '仙阶下品', '一剑通天诀', '金', '剑修', '渡劫～飞升', '一剑破万法，凝聚通天剑意', '通天剑冢'),
  tech('tech-72', '仙阶上品', '万古无极剑典', '金', '剑修', '飞升', '剑意化域，万法皆可斩', '通天剑冢'),

  // —— 体修 → 炼体流派（各宗通用）——
  tech('tech-73', '黄阶下品', '锻骨诀', '土', '炼体', '炼气', '强化筋骨，提高生命与防御', '体修通传'),
  tech('tech-74', '黄阶上品', '铁身功', '金', '炼体', '炼气', '强化肉身防御', '体修通传'),
  tech('tech-75', '玄阶下品', '金刚炼体诀', '金', '炼体', '筑基', '肉身如金刚，提升抗性', '体修秘卷'),
  tech('tech-76', '玄阶上品', '巨力诀', '土', '炼体', '筑基～金丹', '大幅强化攻击力量', '体修秘卷'),
  tech('tech-77', '地阶下品', '九转金身诀', '金', '炼体', '金丹～元婴', '九次淬炼肉身，全面提升属性', '金身古殿'),
  tech('tech-78', '地阶上品', '龙象镇狱功', '土', '炼体', '元婴～化神', '获得龙象之力，近战爆发极强', '金身古殿'),
  tech('tech-79', '天阶下品', '不灭战体诀', '土', '炼体', '化神～炼虚', '强化恢复能力与肉身韧性', '战体遗境'),
  tech('tech-80', '天阶上品', '霸体真经', '金', '炼体', '炼虚～合体', '凝聚无敌战体，大幅提升攻防', '战体遗境'),
  tech('tech-81', '仙阶下品', '荒古圣体诀', '土', '炼体', '渡劫～飞升', '凝聚荒古圣体，肉身可抗法宝', '荒古圣墟'),
  tech('tech-82', '仙阶上品', '万劫不灭体', '无属性', '炼体', '飞升', '经历万劫淬炼，肉身近乎不灭', '荒古圣墟')
]

export const TECHNIQUE_GRADE_TABS: Array<TechniqueGradeTier | '全部'> = [
  '全部',
  ...TECHNIQUE_GRADE_TIERS
]

/** @deprecated 功法阁已改按品阶筛选，保留以免旧引用报错 */
export const TECHNIQUE_REALM_TABS = TECHNIQUE_GRADE_TABS

export function canLearnTechnique(current: RealmMajor, techRealm: RealmMajor) {
  return getRealmMajorIndex(current) >= getRealmMajorIndex(techRealm)
}

export function filterTechniquesByGrade(tab: string) {
  if (!tab || tab === '全部') return TECHNIQUE_CATALOG
  return TECHNIQUE_CATALOG.filter((item) => item.gradeTier === tab)
}

export function filterTechniquesByRealm(tab: string) {
  return filterTechniquesByGrade(tab)
}

export function getTechniqueByName(name: string) {
  return TECHNIQUE_CATALOG.find((item) => item.name === name) || null
}

export function getSchoolDef(school: string) {
  return TECHNIQUE_SCHOOL_DEFS.find((item) => item.school === school) || null
}

export function getTechniqueGradeRank(grade: string) {
  if (GRADE_RANK[grade] != null) return GRADE_RANK[grade]
  const tier = parseGradeTier(grade)
  const tierIdx = TECHNIQUE_GRADE_TIERS.indexOf(tier)
  if (grade.includes('上品')) return tierIdx * 3 + 2
  if (grade.includes('中品')) return tierIdx * 3 + 1
  return tierIdx * 3
}

/**
 * 功法品阶 → 洞府修为获取倍率。
 * 黄阶下品 ≈ 0.85，仙阶上品 ≈ 3.1；与境界吐纳基数叠乘，高阶功法才能跟上高阶突破需求。
 */
export function getTechniqueGradeExpMult(grade: string) {
  const rank = getTechniqueGradeRank(grade)
  return Math.round((0.85 + rank * 0.16) * 100) / 100
}

/**
 * 本命功法由低品阶改修至更高品阶时的修为损失。
 * 每跨 1 小阶约损失当前修为 8%，上限 48%；同阶或降阶不损失。
 */
export function calcTechniqueSwitchExpLoss(input: {
  fromGrade: string
  toGrade: string
  exp: number
}) {
  const gap = getTechniqueGradeRank(input.toGrade) - getTechniqueGradeRank(input.fromGrade)
  if (gap <= 0 || input.exp <= 0) return 0
  const rate = Math.min(0.48, 0.08 * gap)
  return Math.round(input.exp * rate * 10) / 10
}
