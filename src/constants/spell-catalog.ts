import type { RealmMajor } from './realm'
import { TECHNIQUE_GRADE_TIERS, type TechniqueGradeTier } from './technique-catalog'
import { getRealmMajorIndex } from './treasure'

/** 法术品阶与功法一致：黄 / 玄 / 地 / 天 / 仙 */
export type SpellGradeTier = TechniqueGradeTier

export interface CatalogSpell {
  id: string
  name: string
  /** 展示品阶，如：黄阶 */
  grade: string
  gradeTier: SpellGradeTier
  /** 属性，如：火、空间/剑道 */
  attr: string
  /** 类型：单体 / 群体 / 控制 … */
  type: string
  effect: string
  /** 最低可习境界 */
  realm: RealmMajor
  /** 贡献兑换消耗 */
  cost: number
}

const COST_BY_TIER: Record<SpellGradeTier, number> = {
  黄阶: 60,
  玄阶: 220,
  地阶: 800,
  天阶: 2800,
  仙阶: 12000
}

const REALM_BY_TIER: Record<SpellGradeTier, RealmMajor> = {
  黄阶: '炼气',
  玄阶: '筑基',
  地阶: '金丹',
  天阶: '元婴',
  仙阶: '渡劫'
}

function parseGradeTier(grade: string): SpellGradeTier {
  for (const tier of TECHNIQUE_GRADE_TIERS) {
    if (grade.startsWith(tier) || grade === tier) return tier
  }
  return '黄阶'
}

function spell(
  id: string,
  grade: string,
  name: string,
  attr: string,
  effect: string,
  type: string
): CatalogSpell {
  const gradeTier = parseGradeTier(grade)
  return {
    id,
    name,
    grade: gradeTier,
    gradeTier,
    attr,
    type,
    effect,
    realm: REALM_BY_TIER[gradeTier],
    cost: COST_BY_TIER[gradeTier]
  }
}

/** 法术目录（法术信息.txt）——与功法分开；可同时修习多门 */
export const SPELL_CATALOG: CatalogSpell[] = [
  // 黄阶
  spell('spell-1', '黄阶', '火球术', '火', '凝聚火球攻击单个目标', '单体'),
  spell('spell-2', '黄阶', '水箭术', '水', '凝聚水箭快速攻击目标', '单体'),
  spell('spell-3', '黄阶', '风刃术', '风', '释放风刃造成切割伤害', '单体'),
  spell('spell-4', '黄阶', '地刺术', '土', '从地面召唤尖刺攻击敌人', '单体'),
  spell('spell-5', '黄阶', '木藤术', '木', '召唤藤蔓束缚目标', '控制'),
  spell('spell-6', '黄阶', '冰箭术', '冰', '冰箭攻击目标并降低速度', '单体'),
  spell('spell-7', '黄阶', '雷光术', '雷', '释放雷电攻击目标', '单体'),
  spell('spell-8', '黄阶', '灵盾术', '灵力', '凝聚灵力护盾抵挡伤害', '防御'),
  spell('spell-9', '黄阶', '疾风步', '风', '短时间提升自身速度', '增益'),
  spell('spell-10', '黄阶', '灵目术', '神识', '看破部分隐藏目标与幻术', '辅助'),
  spell('spell-51', '黄阶', '炼丹术', '丹道', '掌握丹火与药材配伍，可于丹阁炼制丹药', '生活'),
  spell('spell-52', '黄阶', '炼器术', '器道', '掌握炉火与矿材淬炼，可于器阁打造法宝', '生活'),
  // 玄阶
  spell('spell-11', '玄阶', '赤炎掌', '火', '凝聚烈焰掌力，对目标造成高额伤害', '单体'),
  spell('spell-12', '玄阶', '寒冰刺', '冰', '凝聚巨大冰刺穿透目标', '单体'),
  spell('spell-13', '玄阶', '紫雷击', '雷', '从天空召唤紫色雷霆攻击敌人', '单体'),
  spell('spell-14', '玄阶', '狂风刃', '风', '释放大量风刃攻击范围内敌人', '群体'),
  spell('spell-15', '玄阶', '地裂术', '土', '震裂地面，对范围内敌人造成伤害', '群体'),
  spell('spell-16', '玄阶', '青木缠绕', '木', '大量藤蔓缠绕敌人并限制行动', '控制'),
  spell('spell-17', '玄阶', '烈焰风暴', '火风', '火焰与狂风融合形成持续风暴', '群体'),
  spell('spell-18', '玄阶', '雷火爆', '雷火', '将雷火之力融合后产生剧烈爆炸', '爆发'),
  spell('spell-19', '玄阶', '五行剑气', '五行', '五种属性剑气同时攻击敌人', '群体'),
  spell('spell-20', '玄阶', '金刚护体', '金', '凝聚金刚之力，大幅提升防御', '防御'),
  // 地阶
  spell('spell-21', '地阶', '九霄雷法', '雷', '引动九天雷霆轰击大片区域', '群体'),
  spell('spell-22', '地阶', '玄冰领域', '冰', '展开寒冰领域，持续降低敌人速度', '领域'),
  spell('spell-23', '地阶', '青帝回春术', '木', '借助木灵之力快速恢复生命', '治疗'),
  spell('spell-24', '地阶', '赤炎天火', '火', '召唤天火持续灼烧敌人', '持续'),
  spell('spell-25', '地阶', '大地镇压', '土', '调动大地之力镇压范围内目标', '控制'),
  spell('spell-26', '地阶', '万剑归宗', '剑道', '化出万道剑气攻击敌人', '群体'),
  spell('spell-27', '地阶', '雷狱', '雷', '形成雷霆牢笼困住敌人', '控制'),
  spell('spell-28', '地阶', '九幽魂刺', '魂道', '凝聚神魂之刺直接攻击敌人神魂', '神魂'),
  spell('spell-29', '地阶', '五行逆转', '五行', '改变战场五行力量并削弱敌人', '辅助'),
  spell('spell-30', '地阶', '天罡护体', '金', '凝聚天罡之气，大幅降低受到的伤害', '防御'),
  // 天阶
  spell('spell-31', '天阶', '太虚剑气', '空间/剑道', '剑气撕裂空间，对目标造成巨大伤害', '单体'),
  spell('spell-32', '天阶', '九天神雷', '雷', '引动九天神雷进行毁灭性打击', '群体'),
  spell('spell-33', '天阶', '凤凰涅槃', '火/生命', '受到致命伤害时浴火重生', '复活'),
  spell('spell-34', '天阶', '万魂噬天', '魂道', '召唤万千魂力吞噬敌人神魂', '群体'),
  spell('spell-35', '天阶', '星陨术', '星辰', '召唤巨大星辰从天而降', '群体'),
  spell('spell-36', '天阶', '虚空大手印', '空间', '跨越空间直接镇压目标', '单体'),
  spell('spell-37', '天阶', '天剑降世', '剑道', '召唤天剑从天而降，造成毁灭打击', '爆发'),
  spell('spell-38', '天阶', '九幽冥火', '阴火', '冥火同时灼烧肉身与神魂', '持续'),
  spell('spell-39', '天阶', '万雷天牢', '雷', '形成覆盖战场的雷霆牢笼', '控制'),
  spell('spell-40', '天阶', '乾坤挪移', '空间', '瞬间移动自身或交换目标位置', '位移'),
  // 仙阶
  spell('spell-41', '仙阶', '九天仙雷', '雷道', '召唤仙界雷霆，对目标造成毁灭伤害', '群体'),
  spell('spell-42', '仙阶', '太阴仙光', '太阴', '释放太阴仙光持续削弱敌人', '持续'),
  spell('spell-43', '仙阶', '太阳真火', '火道', '召唤太阳真火焚烧万物', '群体'),
  spell('spell-44', '仙阶', '仙剑斩天', '剑道', '一剑斩破天地，对目标造成巨额伤害', '单体'),
  spell('spell-45', '仙阶', '万界传送', '空间', '跨越世界进行远距离传送', '位移'),
  spell('spell-46', '仙阶', '时间回溯', '时间', '将自身状态短暂回溯至数息之前', '特殊'),
  spell('spell-47', '仙阶', '六道仙轮', '轮回', '召唤六道轮回之力攻击敌人', '群体'),
  spell('spell-48', '仙阶', '鸿蒙神雷', '鸿蒙', '引动鸿蒙雷霆毁灭目标及其法则', '群体'),
  spell('spell-49', '仙阶', '混沌仙火', '混沌', '混沌仙火焚烧肉身、神魂与法则', '持续'),
  spell('spell-50', '仙阶', '万道归墟', '万道', '融合万千法则，将目标归于虚无', '终极')
]

export const SPELL_GRADE_TABS: Array<SpellGradeTier | '全部'> = ['全部', ...TECHNIQUE_GRADE_TIERS]

export const SPELL_TYPES = [
  '单体',
  '群体',
  '控制',
  '防御',
  '增益',
  '辅助',
  '爆发',
  '领域',
  '治疗',
  '持续',
  '神魂',
  '复活',
  '位移',
  '特殊',
  '终极',
  '生活'
] as const

/** 生活类法术：炼丹 / 炼器门槛 */
export const SPELL_PILL_CRAFT_NAME = '炼丹术'
export const SPELL_FORGE_CRAFT_NAME = '炼器术'
export const SPELL_PILL_CRAFT_ID = 'spell-51'
export const SPELL_FORGE_CRAFT_ID = 'spell-52'

export function canLearnSpell(current: RealmMajor, spellRealm: RealmMajor) {
  return getRealmMajorIndex(current) >= getRealmMajorIndex(spellRealm)
}

export function filterSpellsByGrade(tab: string) {
  if (!tab || tab === '全部') return SPELL_CATALOG
  return SPELL_CATALOG.filter((item) => item.gradeTier === tab)
}

export function getSpellByName(name: string) {
  return SPELL_CATALOG.find((item) => item.name === name) || null
}

export function getSpellById(id: string) {
  return SPELL_CATALOG.find((item) => item.id === id) || null
}
