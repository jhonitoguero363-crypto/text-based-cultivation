import { HERB_MATERIALS } from './herb-catalog'
import { ORE_MATERIALS } from './ore-catalog'
import { PILL_SHOP_CATALOG } from './pill-catalog'
import type { RealmMajor } from './realm'
import { canLearnTechnique, TECHNIQUE_CATALOG } from './technique-catalog'
import { FORGE_SHOP_CATALOG } from './treasure-catalog'
import { getRealmMajorIndex } from './treasure'

export type MarketCategory = '丹药' | '功法' | '法宝' | '材料'

export interface MarketOffer {
  /** 货架唯一 id（含日期随机） */
  id: string
  catalogId: string
  category: MarketCategory
  name: string
  price: number
  /** 剩余库存 */
  stock: number
  /** 列表副标题 */
  meta: string
  /** 效果 / 说明 */
  effect: string
  tag: string
  tagTone: 'jade' | 'gold' | 'mp' | 'hp'
  /** 材料图标类型 */
  materialKind?: 'herb' | 'ore'
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

function stockFor(category: MarketCategory) {
  if (category === '功法') return randInt(1, 2)
  if (category === '法宝') return randInt(1, 2)
  return randInt(1, 5)
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
      stock: stockFor('丹药'),
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
      stock: stockFor('功法'),
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
      stock: stockFor('法宝'),
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
    category: '材料' as const,
    name: item.name,
    price: jitterPrice(item.exchangeCost),
    stock: stockFor('材料'),
    meta: `${item.level} · ${item.attr}`,
    effect: item.origin,
    tag: '药材',
    tagTone: 'jade' as const,
    materialKind: 'herb' as const
  }))
  const ores = pickRandom(orePool, randInt(3, 6)).map((item) => ({
    id: `m-ore-${item.id}-${stamp}`,
    catalogId: item.id,
    category: '材料' as const,
    name: item.name,
    price: jitterPrice(item.level === '灵矿' ? 50 : 120),
    stock: stockFor('材料'),
    meta: `${item.level} · ${item.attr}`,
    effect: item.origin,
    tag: '矿石',
    tagTone: 'mp' as const,
    materialKind: 'ore' as const
  }))
  offers.push(...herbs, ...ores)

  return offers
}
