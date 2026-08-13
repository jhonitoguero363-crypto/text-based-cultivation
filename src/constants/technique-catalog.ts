import type { RealmMajor } from './realm'
import { REALM_MAJORS } from './realm'
import { getRealmMajorIndex } from './treasure'

/** 功法流派（来自 功法流派.txt） */
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
  '天道'
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
  { school: '天道', core: '无上天道经', attrs: '法则', playStyle: '终极流派' }
]

/** 品阶大类：黄 / 玄 / 地 / 天 / 仙 */
export const TECHNIQUE_GRADE_TIERS = ['黄阶', '玄阶', '地阶', '天阶', '仙阶'] as const

export type TechniqueGradeTier = (typeof TECHNIQUE_GRADE_TIERS)[number]

export interface CatalogTechnique {
  id: string
  name: string
  /** 展示品阶，如：黄阶下品、仙阶上品 */
  grade: string
  /** 品阶大类：黄阶 / 玄阶 / 地阶 / 天阶 / 仙阶 */
  gradeTier: TechniqueGradeTier
  type: string
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
  type: string,
  school: TechniqueSchool,
  realmRaw: string,
  effect: string,
  origin: string
): CatalogTechnique {
  const realmLabel = normalizeRealmLabel(realmRaw)
  return {
    id,
    name,
    grade,
    gradeTier: parseGradeTier(grade),
    type,
    school,
    realmLabel,
    realm: parseMinRealm(realmLabel),
    effect,
    origin,
    cost: costOf(grade)
  }
}

/**
 * 功法阁目录
 * 品阶仅保留：黄 / 玄 / 地 / 天 / 仙（各含下/中/上品）
 * 按境界与强度重新分配，约每阶 8～9 部
 */
export const TECHNIQUE_CATALOG: CatalogTechnique[] = [
  // —— 黄阶：炼气入门 ——
  tech('tech-1', '黄阶下品', '纳气诀', '修炼', '法修', '练气', '修炼速度 +5%', '外门藏经阁'),
  tech('tech-2', '黄阶下品', '青木诀', '木系', '法修', '练气', '木属性伤害 +5%', '青云山历练'),
  tech('tech-3', '黄阶中品', '烈火诀', '火系', '法修', '练气', '火属性伤害 +8%', '炼丹峰'),
  tech('tech-4', '黄阶中品', '凝水诀', '水系', '法修', '练气', '水属性伤害 +8%', '寒潭洞'),
  tech('tech-5', '黄阶上品', '玄铁炼体诀', '炼体', '炼体', '练气', '防御 +10%', '器峰'),
  tech('tech-6', '黄阶上品', '疾风步', '身法', '空间', '练气', '闪避 +8%', '宗门任务'),
  tech('tech-7', '黄阶上品', '青云心法', '修炼', '法修', '练气～筑基', '修炼速度 +12%', '青云宗传承'),
  tech('tech-8', '黄阶上品', '金刚诀', '炼体', '炼体', '练气～筑基', '防御 +15%', '金刚宗'),

  // —— 玄阶：筑基～金丹 ——
  tech('tech-9', '玄阶下品', '赤炎真诀', '火系', '法修', '筑基', '火伤 +15%', '赤炎山脉'),
  tech('tech-10', '玄阶下品', '寒月诀', '冰系', '法修', '筑基', '冰伤 +15%', '寒潭秘境'),
  tech('tech-11', '玄阶中品', '紫雷诀', '雷系', '雷修', '筑基～金丹', '雷伤 +20%', '天雷崖'),
  tech('tech-12', '玄阶中品', '影遁术', '身法', '空间', '筑基', '闪避 +15%', '黑风林奇遇'),
  tech('tech-13', '玄阶中品', '太玄功', '修炼', '法修', '筑基～金丹', '修炼速度 +25%', '秘境传承'),
  tech('tech-14', '玄阶上品', '厚土神诀', '土系', '炼体', '筑基～金丹', '防御 +25%', '大地秘境'),
  tech('tech-15', '玄阶上品', '青冥剑诀', '剑道', '剑修', '金丹', '剑伤 +30%', '古剑冢'),
  tech('tech-16', '玄阶上品', '九转炼体诀', '炼体', '炼体', '金丹', '生命 +30%', '妖兽山脉'),

  // —— 地阶：金丹～化神 ——
  tech('tech-17', '地阶下品', '九霄雷法', '雷系', '雷修', '金丹～元婴', '雷伤 +35%', '天雷秘境'),
  tech('tech-18', '地阶下品', '万兽灵诀', '驭兽', '驭兽', '金丹', '灵宠属性 +30%', '万妖森林'),
  tech('tech-19', '地阶下品', '太虚剑诀', '剑道', '剑修', '元婴', '剑伤 +45%', '太虚秘境'),
  tech('tech-20', '地阶中品', '九幽魂诀', '魂道', '魂修', '元婴', '神魂伤害 +40%', '九幽谷'),
  tech('tech-21', '地阶中品', '青帝长生诀', '木系/恢复', '丹修', '元婴～化神', '生命恢复 +50%', '青木秘境'),
  tech('tech-22', '地阶中品', '玄冰神诀', '冰系', '法修', '元婴～化神', '冰伤 +50%', '玄冰宫'),
  tech('tech-23', '地阶上品', '九天雷皇诀', '雷系', '雷修', '化神', '雷伤 +65%', '九天雷域'),
  tech('tech-24', '地阶上品', '天妖炼体诀', '炼体', '炼体', '化神', '生命、防御 +60%', '万妖古境'),
  tech('tech-25', '地阶上品', '太阴炼魂诀', '魂道', '魂修', '化神～炼虚', '神魂 +70%', '万魂古墓'),

  // —— 天阶：炼虚～渡劫 ——
  tech('tech-26', '天阶下品', '星辰炼体术', '炼体', '炼体', '化神～炼虚', '全属性 +50%', '星陨海'),
  tech('tech-27', '天阶下品', '虚空经', '空间', '空间', '炼虚', '空间伤害 +70%', '虚空裂谷'),
  tech('tech-28', '天阶下品', '岁月诀', '时间', '时间', '炼虚', '时间类技能效果 +50%', '岁月长河'),
  tech('tech-29', '天阶中品', '六道轮回经', '轮回', '魂修', '炼虚～合体', '死亡后有概率复生', '轮回古境'),
  tech('tech-30', '天阶中品', '混沌炼气诀', '混沌', '混沌', '合体', '全属性 +80%', '混沌海'),
  tech('tech-31', '天阶中品', '阴阳造化诀', '阴阳', '阵修', '合体', '攻防同时提升', '阴阳天池'),
  tech('tech-32', '天阶上品', '万界归元诀', '法则', '天道', '合体～大乘', '全属性 +100%', '万界战场'),
  tech('tech-33', '天阶上品', '世界树经', '世界', '天道', '大乘', '生命、灵力大幅提升', '世界树海'),
  tech('tech-34', '天阶上品', '鸿蒙紫气诀', '鸿蒙', '混沌', '大乘～渡劫', '修炼速度 +150%', '鸿蒙秘境'),

  // —— 仙阶：渡劫～飞升终极 ——
  tech('tech-35', '仙阶下品', '太初神诀', '太初', '混沌', '渡劫', '全属性 +180%', '太初神域'),
  tech('tech-36', '仙阶下品', '诸天帝经', '万道', '天道', '渡劫～飞升', '掌控多种法则', '诸天古战场'),
  tech('tech-37', '仙阶下品', '九转仙经', '仙道', '法修', '飞升', '仙力 +200%', '南天仙域'),
  tech('tech-38', '仙阶中品', '混沌仙经', '混沌', '混沌', '飞升', '混沌属性 +250%', '混沌天墟'),
  tech('tech-39', '仙阶中品', '鸿蒙神典', '鸿蒙', '混沌', '飞升', '全属性 +300%', '鸿蒙神域'),
  tech('tech-40', '仙阶上品', '万道神诀', '万道', '天道', '飞升', '可融合不同功法', '万道神域'),
  tech('tech-41', '仙阶上品', '太初道经', '太初', '混沌', '飞升后期', '掌控太初本源', '太初神域'),
  tech('tech-42', '仙阶上品', '无上天道经', '天道', '天道', '飞升后期', '改变部分世界规则', '天道遗迹')
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
