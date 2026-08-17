import type { CatalogPill } from './pill-catalog'
import type { PillEffectCategory, PillMechanic } from './pill-system'
import type { RealmMajor } from './realm'
import { getRealmMajorIndex } from './treasure'

/** 黄 / 玄 / 地 / 天 / 仙 → 建议境界（用于坊市境界过滤） */
const GRADE_REALM: Record<string, RealmMajor> = {
  黄阶: '炼气',
  玄阶: '筑基',
  地阶: '金丹',
  天阶: '元婴',
  仙阶: '化神'
}

const GRADE_DIFF: Record<string, number> = {
  黄阶: 1,
  玄阶: 3,
  地阶: 5,
  天阶: 7,
  仙阶: 10
}

/** 基础标价（灵根 / 悟性 / 保命 再乘溢价） */
const GRADE_PRICE: Record<string, number> = {
  黄阶: 900,
  玄阶: 3200,
  地阶: 14000,
  天阶: 52000,
  仙阶: 210000
}

/** 品阶越高出现权重越低 */
export const MARKET_RARE_GRADE_WEIGHT: Record<string, number> = {
  黄阶: 1,
  玄阶: 0.5,
  地阶: 0.22,
  天阶: 0.08,
  仙阶: 0.025
}

/** 灵根 / 悟性 / 保命：售价倍率、出现权重倍率 */
export const MARKET_RARE_PREMIUM_TYPES = new Set<PillEffectCategory>([
  '灵根丹',
  '悟性丹',
  '保命丹'
])
export const MARKET_RARE_PREMIUM_PRICE_MULT = 7
export const MARKET_RARE_PREMIUM_WEIGHT_MULT = 0.12

/** 坊市货架：极小概率额外上架 1 枚稀有丹 */
export const MARKET_RARE_PILL_SHELF_CHANCE = 0.035
/** 商人抽到「丹药」槽时，改抽稀有丹的概率（仍受品阶权重） */
export const MERCHANT_RARE_PILL_CHANCE = 0.14

function hours(n: number) {
  return Math.round(n * 60 * 60 * 1000)
}
function minutes(n: number) {
  return Math.round(n * 60 * 1000)
}

function priceOf(grade: string, type: PillEffectCategory) {
  const base = GRADE_PRICE[grade] || 1000
  return MARKET_RARE_PREMIUM_TYPES.has(type)
    ? Math.round(base * MARKET_RARE_PREMIUM_PRICE_MULT)
    : base
}

function rare(
  id: string,
  name: string,
  grade: string,
  type: PillEffectCategory,
  effect: string,
  special: string,
  story: string
): CatalogPill {
  return {
    id,
    name,
    grade,
    type,
    effect,
    special,
    story,
    realm: GRADE_REALM[grade] || '炼气',
    price: priceOf(grade, type),
    craftDifficulty: GRADE_DIFF[grade] || 1,
    marketOnly: true
  }
}

/**
 * 坊市 / 商人稀有丹药（不可炼制，不进丹阁）。
 * 注：与丹阁已有「金刚丹」重名的条目未收录，避免背包冲突。
 */
export const PILL_MARKET_RARE_CATALOG: CatalogPill[] = [
  rare(
    'm-pill-wuxing-xisui',
    '五行洗髓丹',
    '黄阶',
    '灵根丹',
    '五行灵根各 +1',
    '永久',
    '坊市偶见的洗髓奇丹，不可炼制'
  ),
  rare(
    'm-pill-root-mu',
    '青木灵根丹',
    '玄阶',
    '灵根丹',
    '木灵根 +3',
    '永久',
    '青木灵气凝成，专润木灵根'
  ),
  rare(
    'm-pill-root-huo',
    '赤炎灵根丹',
    '玄阶',
    '灵根丹',
    '火灵根 +3',
    '永久',
    '赤炎淬骨，专润火灵根'
  ),
  rare(
    'm-pill-root-tu',
    '厚土灵根丹',
    '玄阶',
    '灵根丹',
    '土灵根 +3',
    '永久',
    '厚土载物，专润土灵根'
  ),
  rare(
    'm-pill-root-jin',
    '庚金灵根丹',
    '玄阶',
    '灵根丹',
    '金灵根 +3',
    '永久',
    '庚金锐气，专润金灵根'
  ),
  rare(
    'm-pill-root-shui',
    '寒水灵根丹',
    '玄阶',
    '灵根丹',
    '水灵根 +3',
    '永久',
    '寒水凝髓，专润水灵根'
  ),
  rare(
    'm-pill-wuxing-guiyuan',
    '五行归元丹',
    '地阶',
    '灵根丹',
    '五行灵根各 +2',
    '永久',
    '归元归一，五行同进'
  ),
  rare(
    'm-pill-wuxing-shengling',
    '五行圣灵丹',
    '天阶',
    '灵根丹',
    '五行灵根各 +4',
    '极低概率觉醒风/冰/雷异灵根',
    '圣灵荡涤，偶可启异根'
  ),
  rare(
    'm-pill-kaiwu',
    '开悟丹',
    '黄阶',
    '悟性丹',
    '悟性 +2',
    '持续 30 分钟',
    '启迪灵台，短暂开窍'
  ),
  rare(
    'm-pill-mingxin',
    '明心丹',
    '玄阶',
    '悟性丹',
    '悟性 +5',
    '持续 1 小时',
    '明心见性，悟性暂增'
  ),
  rare(
    'm-pill-wudao',
    '悟道丹',
    '地阶',
    '悟性丹',
    '悟性 +10',
    '持续 2 小时',
    '悟道有感，灵台澄明'
  ),
  rare(
    'm-pill-tianwu',
    '天悟丹',
    '天阶',
    '悟性丹',
    '悟性 +15',
    '持续 4 小时',
    '天机入窍，悟性大涨'
  ),
  rare(
    'm-pill-taichu-wudao',
    '太初悟道丹',
    '仙阶',
    '悟性丹',
    '悟性 +25',
    '持续 8 小时',
    '太初余韵，悟性暴涨'
  ),
  rare(
    'm-pill-juling',
    '聚灵丹',
    '黄阶',
    '聚灵丹',
    '修炼速度 +20%',
    '持续 30 分钟',
    '聚拢灵气，加速吐纳'
  ),
  rare(
    'm-pill-juyuan',
    '聚元丹',
    '玄阶',
    '聚灵丹',
    '修炼速度 +35%',
    '持续 1 小时',
    '聚元化气，闭关更速'
  ),
  rare(
    'm-pill-tianling',
    '天灵丹',
    '地阶',
    '聚灵丹',
    '修炼速度 +60%',
    '持续 2 小时',
    '天灵灌注，吐纳如潮'
  ),
  rare(
    'm-pill-wudao-ling',
    '悟道灵丹',
    '天阶',
    '聚灵丹',
    '修炼速度 +100%，悟性 +5',
    '持续 4 小时',
    '悟道兼聚灵，双管齐下'
  ),
  rare(
    'm-pill-hongmeng-juling',
    '鸿蒙聚灵丹',
    '仙阶',
    '聚灵丹',
    '修炼速度 +200%，悟性 +15',
    '持续 8 小时',
    '鸿蒙之气，闭关如飞'
  ),
  rare(
    'm-pill-baoxue',
    '暴血丹',
    '黄阶',
    '战斗丹',
    '战力 +5%',
    '持续 10 分钟',
    '血气贲张，短时增战'
  ),
  // 丹阁已有「金刚丹」，此处不重复收录
  rare(
    'm-pill-kuangling',
    '狂灵丹',
    '玄阶',
    '战斗丹',
    '战力 +5%',
    '持续 15 分钟',
    '灵力狂涌，战力微升'
  ),
  rare(
    'm-pill-zhanshen',
    '战神丹',
    '地阶',
    '战斗丹',
    '战力 +5%',
    '持续 20 分钟',
    '战意加持，锋芒更盛'
  ),
  rare(
    'm-pill-jiuzhuan-zhanhun',
    '九转战魂丹',
    '天阶',
    '战斗丹',
    '战力 +5%',
    '持续 30 分钟',
    '战魂九转，杀机不散'
  ),
  rare(
    'm-pill-xianmo-zhanshen',
    '仙魔战神丹',
    '仙阶',
    '战斗丹',
    '战力 +5%',
    '持续 30 分钟',
    '仙魔战意，短暂加身'
  )
]

/** 稀有丹服用机制（按名） */
export const PILL_MARKET_RARE_MECHANICS: Record<string, PillMechanic> = {
  五行洗髓丹: { category: '灵根丹', rootBonus: 1, rootTargets: 'wuxing' },
  青木灵根丹: { category: '灵根丹', rootBonus: 3, rootTargets: ['木'] },
  赤炎灵根丹: { category: '灵根丹', rootBonus: 3, rootTargets: ['火'] },
  厚土灵根丹: { category: '灵根丹', rootBonus: 3, rootTargets: ['土'] },
  庚金灵根丹: { category: '灵根丹', rootBonus: 3, rootTargets: ['金'] },
  寒水灵根丹: { category: '灵根丹', rootBonus: 3, rootTargets: ['水'] },
  五行归元丹: { category: '灵根丹', rootBonus: 2, rootTargets: 'wuxing' },
  五行圣灵丹: {
    category: '灵根丹',
    rootBonus: 4,
    rootTargets: 'wuxing',
    rareRootAwakenChance: 0.03
  },
  开悟丹: { category: '悟性丹', comprehensionFlat: 2, comprehensionMs: minutes(30) },
  明心丹: { category: '悟性丹', comprehensionFlat: 5, comprehensionMs: hours(1) },
  悟道丹: { category: '悟性丹', comprehensionFlat: 10, comprehensionMs: hours(2) },
  天悟丹: { category: '悟性丹', comprehensionFlat: 15, comprehensionMs: hours(4) },
  太初悟道丹: { category: '悟性丹', comprehensionFlat: 25, comprehensionMs: hours(8) },
  聚灵丹: { category: '聚灵丹', cultivateMult: 1.2, cultivateMs: minutes(30) },
  聚元丹: { category: '聚灵丹', cultivateMult: 1.35, cultivateMs: hours(1) },
  天灵丹: { category: '聚灵丹', cultivateMult: 1.6, cultivateMs: hours(2) },
  悟道灵丹: {
    category: '聚灵丹',
    cultivateMult: 2,
    cultivateMs: hours(4),
    comprehensionFlat: 5,
    comprehensionMs: hours(4)
  },
  鸿蒙聚灵丹: {
    category: '聚灵丹',
    cultivateMult: 3,
    cultivateMs: hours(8),
    comprehensionFlat: 15,
    comprehensionMs: hours(8)
  },
  暴血丹: { category: '战斗丹', battleMult: 1.05, battleMs: minutes(10) },
  狂灵丹: { category: '战斗丹', battleMult: 1.05, battleMs: minutes(15) },
  战神丹: { category: '战斗丹', battleMult: 1.05, battleMs: minutes(20) },
  九转战魂丹: { category: '战斗丹', battleMult: 1.05, battleMs: minutes(30) },
  仙魔战神丹: { category: '战斗丹', battleMult: 1.05, battleMs: minutes(30) }
}

export function getMarketRarePillByName(name: string) {
  return PILL_MARKET_RARE_CATALOG.find((item) => item.name === name) || null
}

export function isMarketOnlyPill(name: string) {
  return !!getMarketRarePillByName(name)
}

export function marketRareSpawnWeight(pill: CatalogPill) {
  let w = MARKET_RARE_GRADE_WEIGHT[pill.grade] ?? 0.2
  if (MARKET_RARE_PREMIUM_TYPES.has(pill.type as PillEffectCategory)) {
    w *= MARKET_RARE_PREMIUM_WEIGHT_MULT
  }
  return Math.max(0.001, w)
}

function pickWeighted<T>(entries: Array<{ item: T; weight: number }>): T | null {
  const total = entries.reduce((sum, e) => sum + Math.max(0, e.weight), 0)
  if (total <= 0 || !entries.length) return null
  let roll = Math.random() * total
  for (const entry of entries) {
    roll -= Math.max(0, entry.weight)
    if (roll <= 0) return entry.item
  }
  return entries[entries.length - 1]?.item ?? null
}

/** 按境界与权重抽取一枚稀有丹；无货返回 null */
export function rollMarketRarePill(
  playerMajor: RealmMajor,
  opts?: { chance?: number }
): CatalogPill | null {
  const chance = opts?.chance ?? 1
  if (Math.random() >= chance) return null
  const pIdx = getRealmMajorIndex(playerMajor === '无修为' ? '炼气' : playerMajor)
  const pool = PILL_MARKET_RARE_CATALOG.filter(
    (item) => getRealmMajorIndex(item.realm) <= pIdx
  )
  if (!pool.length) return null
  return pickWeighted(pool.map((item) => ({ item, weight: marketRareSpawnWeight(item) })))
}
