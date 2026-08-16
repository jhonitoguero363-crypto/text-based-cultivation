import { HERB_MATERIALS } from './herb-catalog'
import {
  LOOT_MATERIALS,
  resolveMaterialBagCategory,
  type LootMaterial
} from './loot-material-catalog'
import { getOresByLevel, ORE_MATERIALS } from './ore-catalog'
import { PILL_SHOP_CATALOG } from './pill-catalog'
import type { RealmMajor } from './realm'
import { REALM_MAJORS } from './realm'
import { getSpellByName } from './spell-catalog'
import { canLearnTechnique, getTechniqueByName, TECHNIQUE_CATALOG } from './technique-catalog'
import { FORGE_SHOP_CATALOG } from './treasure-catalog'
import { getRealmMajorIndex } from './treasure'

export type MarketCategory = '丹药' | '功法' | '法宝' | '药材' | '矿石' | '材料'

/** 坊市回收价倍率（相对售价） */
export const MARKET_RECYCLE_RATE = 0.8

export function calcMarketRecyclePrice(buyPrice: number) {
  return Math.max(1, Math.floor(Math.max(0, buyPrice) * MARKET_RECYCLE_RATE))
}

/**
 * 背包可回收分类（统一回收区）
 * 不含功法 / 法术：宗门功法阁可兑换项一律不可回收（见 canMarketRecycleBagItem）
 */
export const MARKET_RECYCLE_BAG_CATEGORIES = ['丹药', '药材', '矿石', '材料'] as const

export type MarketRecycleBagCategory = (typeof MARKET_RECYCLE_BAG_CATEGORIES)[number]

export function isMarketRecycleBagCategory(
  category: string
): category is MarketRecycleBagCategory {
  return (MARKET_RECYCLE_BAG_CATEGORIES as readonly string[]).includes(category)
}

/** 宗门功法阁可贡献兑换的功法 / 法术（坊市统一回收排除） */
export function isSectExchangeableTechniqueOrSpell(name: string, category: string) {
  if (category === '功法') return !!getTechniqueByName(name)
  if (category === '法术') return !!getSpellByName(name)
  return false
}

export function canMarketRecycleBagItem(name: string, category: string) {
  if (isSectExchangeableTechniqueOrSpell(name, category)) return false
  return isMarketRecycleBagCategory(category)
}

export interface MarketOffer {
  /** 货架唯一 id（含日期随机） */
  id: string
  catalogId: string
  category: MarketCategory
  name: string
  price: number
  /** 列表副标题 */
  meta: string
  /** 效果 / 说明 */
  effect: string
  tag: string
  tagTone: 'jade' | 'gold' | 'mp' | 'hp'
  /** @deprecated 坊市不再限制库存；旧存档可能仍有 */
  stock?: number
  /** 材料图标类型 */
  materialKind?: 'herb' | 'ore' | 'loot'
  /** 法宝购买用 */
  treasure?: {
    grade: string
    gradeLabel: string
    type: string
    special: string
    story: string
  }
}

function withinRealm(playerMajor: RealmMajor, itemRealm: RealmMajor) {
  return getRealmMajorIndex(playerMajor) >= getRealmMajorIndex(itemRealm)
}

function shuffle<T>(list: T[]) {
  const arr = [...list]
  for (let i = arr.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[arr[i], arr[j]] = [arr[j], arr[i]]
  }
  return arr
}

function pickRandom<T>(list: T[], count: number) {
  if (!list.length) return [] as T[]
  return shuffle(list).slice(0, Math.min(count, list.length))
}

function randInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

/** 售价浮动 85%～125% */
function jitterPrice(base: number) {
  const mul = 0.85 + Math.random() * 0.4
  return Math.max(10, Math.round(base * mul))
}

function lootMaxRealmIndex(item: LootMaterial) {
  if (!item.realms.length) return 1
  return Math.max(...item.realms.map((realm) => getRealmMajorIndex(realm)))
}

function lootBasePrice(item: LootMaterial) {
  return 45 + lootMaxRealmIndex(item) * 28
}

/** 历练材料参考售价（用于回收计价；坊市材料区不零售） */
export function estimateLootMarketPrice(name: string) {
  const loot = LOOT_MATERIALS.find((item) => item.name === name)
  if (loot) return lootBasePrice(loot)
  return 80
}

/** 按名称与背包分类估算参考售价，供统一回收计价 */
export function estimateBagItemBuyPrice(name: string, category: string) {
  if (category === '药材') {
    return HERB_MATERIALS.find((item) => item.name === name)?.exchangeCost || 40
  }
  if (category === '矿石') {
    const ore = ORE_MATERIALS.find((item) => item.name === name)
    if (!ore) return 50
    if (ore.level === '灵矿') return 50
    if (ore.level === '高阶灵矿') return 120
    if (ore.level === '神矿') return 220
    if (ore.level === '仙矿') return 400
    if (ore.level === '道矿') return 700
    return 1200
  }
  if (category === '材料') {
    return estimateLootMarketPrice(name)
  }
  if (category === '丹药') {
    return PILL_SHOP_CATALOG.find((item) => item.name === name)?.price || 80
  }
  if (category === '功法') {
    const tech = TECHNIQUE_CATALOG.find((item) => item.name === name)
    return tech ? Math.max(60, Math.round(tech.cost * 1.2)) : 100
  }
  return 50
}

/** 按玩家境界从总库随机抽取今日坊市货架 */
export function rollDailyMarket(playerMajor: RealmMajor): MarketOffer[] {
  const stamp = `${Date.now().toString(36)}-${Math.floor(Math.random() * 1000)}`
  const offers: MarketOffer[] = []

  const pills = pickRandom(
    PILL_SHOP_CATALOG.filter((item) => withinRealm(playerMajor, item.realm)),
    randInt(4, 8)
  )
  for (const item of pills) {
    offers.push({
      id: `m-pill-${item.id}-${stamp}`,
      catalogId: item.id,
      category: '丹药',
      name: item.name,
      price: jitterPrice(item.price),
      meta: `${item.realm} · ${item.type}`,
      effect: item.effect,
      tag: item.grade,
      tagTone: 'jade'
    })
  }

  const techs = pickRandom(
    TECHNIQUE_CATALOG.filter((item) => canLearnTechnique(playerMajor, item.realm)),
    randInt(3, 6)
  )
  for (const item of techs) {
    const base = Math.max(60, Math.round(item.cost * 1.2))
    offers.push({
      id: `m-tech-${item.id}-${stamp}`,
      catalogId: item.id,
      category: '功法',
      name: item.name,
      price: jitterPrice(base),
      meta: `${item.grade} · ${item.realmLabel}`,
      effect: item.effect,
      tag: item.school,
      tagTone: 'gold'
    })
  }

  const treasures = pickRandom(
    FORGE_SHOP_CATALOG.filter((item) => withinRealm(playerMajor, item.realm)),
    randInt(3, 6)
  )
  for (const item of treasures) {
    offers.push({
      id: `m-tre-${item.id}-${stamp}`,
      catalogId: item.id,
      category: '法宝',
      name: item.name,
      price: jitterPrice(item.price),
      meta: `${item.gradeLabel} · ${item.realm}`,
      effect: item.effect,
      tag: item.type,
      tagTone: 'jade',
      treasure: {
        grade: item.grade,
        gradeLabel: item.gradeLabel,
        type: item.type,
        special: item.special,
        story: item.story
      }
    })
  }

  const herbPool = HERB_MATERIALS.filter(
    (item) => item.level === '灵草' || item.level === '灵药' || item.level === '灵果'
  )
  const orePool = ORE_MATERIALS.filter(
    (item) => item.level === '灵矿' || item.level === '高阶灵矿'
  )
  const herbs = pickRandom(herbPool, randInt(3, 6)).map((item) => ({
    id: `m-herb-${item.id}-${stamp}`,
    catalogId: item.id,
    category: '药材' as const,
    name: item.name,
    price: jitterPrice(item.exchangeCost),
    meta: `${item.level} · ${item.attr}`,
    effect: item.origin,
    tag: '药材',
    tagTone: 'jade' as const,
    materialKind: 'herb' as const
  }))
  const ores = pickRandom(orePool, randInt(3, 6)).map((item) => ({
    id: `m-ore-${item.id}-${stamp}`,
    catalogId: item.id,
    category: '矿石' as const,
    name: item.name,
    price: jitterPrice(item.level === '灵矿' ? 50 : 120),
    meta: `${item.level} · ${item.attr}`,
    effect: item.origin,
    tag: '矿石',
    tagTone: 'mp' as const,
    materialKind: 'ore' as const
  }))
  // 「材料」分类仅回收背包持有，不进货架零售
  offers.push(...herbs, ...ores)

  return offers
}

/** 相对玩家境界抬高若干大境界（封顶飞升） */
export function bumpRealmMajor(major: RealmMajor, steps = 1): RealmMajor {
  const idx = getRealmMajorIndex(major)
  return REALM_MAJORS[Math.min(REALM_MAJORS.length - 1, Math.max(0, idx + steps))]
}

const MERCHANT_ORE_TIERS = ['灵矿', '高阶灵矿', '神矿', '仙矿', '道矿', '镇界神材'] as const

function merchantHerbLevels(realmIndex: number): string[] {
  if (realmIndex <= 0) return ['灵药', '灵果', '灵液']
  if (realmIndex <= 2) return ['灵药', '灵果', '灵液', '灵藤', '灵木']
  if (realmIndex <= 5) {
    return ['仙草', '仙花', '仙果', '仙藤', '仙材', '仙芝', '灵藤', '灵木']
  }
  return ['仙草', '仙花', '仙果', '仙藤', '仙材', '仙芝']
}

function merchantOreTier(realmIndex: number) {
  const maxTier = Math.min(MERCHANT_ORE_TIERS.length - 1, Math.floor(realmIndex / 2) + 1)
  return MERCHANT_ORE_TIERS[Math.max(1, maxTier)]
}

function poolAtRealmOrBelow<T extends { realm: RealmMajor }>(catalog: T[], realm: RealmMajor) {
  // 无修为尚无对应货池，按炼气档向下取
  let idx = getRealmMajorIndex(realm === '无修为' ? '炼气' : realm)
  for (let i = idx; i >= 0; i -= 1) {
    const major = REALM_MAJORS[i]
    if (major === '无修为') continue
    const pool = catalog.filter((item) => item.realm === major)
    if (pool.length) return pool
  }
  return catalog.slice()
}

function buildMerchantOffer(
  category: '丹药' | '功法' | '法宝' | '药材' | '矿石',
  targetRealm: RealmMajor,
  stamp: string
): MarketOffer | null {
  if (category === '丹药') {
    const item = pickRandom(poolAtRealmOrBelow(PILL_SHOP_CATALOG, targetRealm), 1)[0]
    if (!item) return null
    return {
      id: `mer-pill-${item.id}-${stamp}`,
      catalogId: item.id,
      category: '丹药',
      name: item.name,
      price: jitterPrice(Math.round(item.price * 1.15)),
      meta: `${item.realm} · ${item.type}`,
      effect: item.effect,
      tag: item.grade,
      tagTone: 'jade'
    }
  }
  if (category === '功法') {
    const pool = TECHNIQUE_CATALOG.filter((item) => canLearnTechnique(targetRealm, item.realm))
    const prefer = pool.filter((item) => item.realm === targetRealm)
    const item = pickRandom(prefer.length ? prefer : pool, 1)[0]
    if (!item) return null
    const base = Math.max(60, Math.round(item.cost * 1.35))
    return {
      id: `mer-tech-${item.id}-${stamp}`,
      catalogId: item.id,
      category: '功法',
      name: item.name,
      price: jitterPrice(base),
      meta: `${item.grade} · ${item.realmLabel}`,
      effect: item.effect,
      tag: item.school,
      tagTone: 'gold'
    }
  }
  if (category === '法宝') {
    const item = pickRandom(poolAtRealmOrBelow(FORGE_SHOP_CATALOG, targetRealm), 1)[0]
    if (!item) return null
    return {
      id: `mer-tre-${item.id}-${stamp}`,
      catalogId: item.id,
      category: '法宝',
      name: item.name,
      price: jitterPrice(Math.round(item.price * 1.15)),
      meta: `${item.gradeLabel} · ${item.realm}`,
      effect: item.effect,
      tag: item.type,
      tagTone: 'jade',
      treasure: {
        grade: item.grade,
        gradeLabel: item.gradeLabel,
        type: item.type,
        special: item.special,
        story: item.story
      }
    }
  }
  if (category === '药材') {
    const levels = merchantHerbLevels(getRealmMajorIndex(targetRealm))
    const pool = HERB_MATERIALS.filter((item) => levels.includes(item.level))
    const item = pickRandom(pool.length ? pool : HERB_MATERIALS, 1)[0]
    if (!item) return null
    return {
      id: `mer-herb-${item.id}-${stamp}`,
      catalogId: item.id,
      category: '药材',
      name: item.name,
      price: jitterPrice(Math.round(item.exchangeCost * 1.2)),
      meta: `${item.level} · ${item.attr}`,
      effect: item.origin,
      tag: '药材',
      tagTone: 'jade',
      materialKind: 'herb'
    }
  }
  const tier = merchantOreTier(getRealmMajorIndex(targetRealm))
  let orePool = getOresByLevel(tier)
  if (!orePool.length) orePool = ORE_MATERIALS
  const ore = pickRandom(orePool, 1)[0]
  if (!ore) return null
  const orePrice =
    ore.level === '灵矿'
      ? 50
      : ore.level === '高阶灵矿'
        ? 120
        : ore.level === '神矿'
          ? 220
          : ore.level === '仙矿'
            ? 400
            : ore.level === '道矿'
              ? 700
              : 1200
  return {
    id: `mer-ore-${ore.id}-${stamp}`,
    catalogId: ore.id,
    category: '矿石',
    name: ore.name,
    price: jitterPrice(Math.round(orePrice * 1.2)),
    meta: `${ore.level} · ${ore.attr}`,
    effect: ore.origin,
    tag: '矿石',
    tagTone: 'mp',
    materialKind: 'ore'
  }
}

/**
 * 商人私货：相对玩家高 1 大境界，随机 3 件（丹药/功法/法宝/药材/矿石）
 */
export function rollMerchantOffers(playerMajor: RealmMajor, npcId: string): MarketOffer[] {
  const target = bumpRealmMajor(playerMajor, 1)
  const stamp = `${npcId}-${Date.now().toString(36)}-${Math.floor(Math.random() * 1000)}`
  const cats: Array<'丹药' | '功法' | '法宝' | '药材' | '矿石'> = [
    '丹药',
    '功法',
    '法宝',
    '药材',
    '矿石'
  ]
  const pickedCats = pickRandom(cats, 3)
  // 若不足 3 类则允许重复抽满 3 件
  while (pickedCats.length < 3) {
    pickedCats.push(cats[Math.floor(Math.random() * cats.length)])
  }
  const offers: MarketOffer[] = []
  for (const cat of pickedCats) {
    const offer = buildMerchantOffer(cat, target, `${stamp}-${offers.length}`)
    if (offer) offers.push(offer)
  }
  // 补足失败抽空
  let guard = 0
  while (offers.length < 3 && guard < 12) {
    guard += 1
    const cat = cats[Math.floor(Math.random() * cats.length)]
    const offer = buildMerchantOffer(cat, target, `${stamp}-f${guard}`)
    if (offer && !offers.some((o) => o.name === offer.name && o.category === offer.category)) {
      offers.push(offer)
    }
  }
  return offers
}

/**
 * 将旧货架「材料」条目拆到 药材 / 矿石；历练材料零售条目移除（材料区仅回收）。
 */
export function normalizeMarketOffers(offers: MarketOffer[]): MarketOffer[] {
  const next: MarketOffer[] = []
  for (const item of offers) {
    if (item.category === '丹药' || item.category === '功法' || item.category === '法宝') {
      next.push(item)
      continue
    }

    let kind = item.materialKind
    if (!kind) {
      if (item.category === '药材') kind = 'herb'
      else if (item.category === '矿石') kind = 'ore'
      else {
        const resolved = resolveMaterialBagCategory(item.name)
        kind = resolved === '药材' ? 'herb' : resolved === '矿石' ? 'ore' : 'loot'
      }
    }

    if (kind === 'herb') {
      next.push({
        ...item,
        category: '药材',
        materialKind: 'herb',
        tag: item.tag === '材料' ? '药材' : item.tag || '药材',
        tagTone: item.tagTone || 'jade'
      })
      continue
    }
    if (kind === 'ore') {
      next.push({
        ...item,
        category: '矿石',
        materialKind: 'ore',
        tag: item.tag === '材料' ? '矿石' : item.tag || '矿石',
        tagTone: item.tagTone || 'mp'
      })
      continue
    }
    // loot：不再上架零售
  }
  return next
}

/** 零售货架是否具备药材 + 矿石（材料区不靠货架） */
export function hasSplitMaterialShelves(offers: MarketOffer[]) {
  const cats = new Set(offers.map((item) => item.category))
  return cats.has('药材') && cats.has('矿石')
}
