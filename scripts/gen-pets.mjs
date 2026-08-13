import fs from 'fs'

const src = fs.readFileSync('c:/Users/64209/Desktop/灵宠信息.txt', 'utf8')
const lines = src.split(/\r?\n/).filter((l) => l.trim() && !l.includes('灵宠名称') && !l.includes('---'))

const REALM_MAP = {
  练气: '炼气',
  炼气: '炼气',
  筑基: '筑基',
  金丹: '金丹',
  元婴: '元婴',
  化神: '化神',
  炼虚: '炼虚',
  合体: '合体',
  大乘: '大乘',
  渡劫: '渡劫',
  飞升: '飞升'
}

const PRICE_BY_REALM = {
  炼气: 200,
  筑基: 600,
  金丹: 1800,
  元婴: 4500,
  化神: 10000,
  炼虚: 22000,
  合体: 45000,
  大乘: 90000,
  渡劫: 180000,
  飞升: 360000
}

const SELL_RATIO = 0.4

function starCount(rarity) {
  return (rarity.match(/★/g) || []).length
}

function slug(name) {
  return `pet-${Buffer.from(name).toString('hex').slice(0, 12)}`
}

const pets = []
for (const line of lines) {
  const cols = line
    .split('|')
    .map((c) => c.trim())
    .filter(Boolean)
  if (cols.length < 6) continue
  const [realmRaw, name, race, rarity, ability, role] = cols
  const realm = REALM_MAP[realmRaw] || realmRaw
  const stars = starCount(rarity)
  const base = PRICE_BY_REALM[realm] || 200
  const price = Math.round(base * (0.7 + stars * 0.35))
  pets.push({
    id: slug(name),
    name,
    race,
    rarity,
    stars,
    ability,
    role,
    realm,
    price,
    sellPrice: Math.max(20, Math.round(price * SELL_RATIO))
  })
}

const content = `import type { RealmMajor } from './realm'
import { REALM_MAJORS } from './realm'

export interface CatalogPet {
  id: string
  name: string
  /** 种族 */
  race: string
  /** 稀有度星级展示 */
  rarity: string
  stars: number
  /** 核心能力 */
  ability: string
  /** 定位 */
  role: string
  realm: RealmMajor
  price: number
  sellPrice: number
}

/** 灵兽阁售卖灵宠目录 */
export const PET_SHOP_CATALOG: CatalogPet[] = ${JSON.stringify(pets, null, 2)} as CatalogPet[]

export const PET_SHOP_REALMS: RealmMajor[] = REALM_MAJORS.filter((realm) =>
  PET_SHOP_CATALOG.some((item) => item.realm === realm)
)

export function getPetByName(name: string) {
  return PET_SHOP_CATALOG.find((item) => item.name === name) || null
}
`

fs.writeFileSync(
  'd:/project/text-based-cultivation/src/constants/pet-catalog.ts',
  content,
  'utf8'
)
console.log('ok', pets.length)
