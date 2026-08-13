import fs from 'fs'

const src = fs.readFileSync('c:/Users/64209/Desktop/妖兽列表.txt', 'utf8')
const lines = src.split(/\r?\n/).map((l) => l.trim()).filter(Boolean)

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

const RARITY_WEIGHT = {
  普通: 50,
  稀有: 28,
  史诗: 14,
  传说: 6,
  神话: 2,
  至高: 1
}

const RARITY_TONE = {
  普通: 'muted',
  稀有: 'jade',
  史诗: 'mp',
  传说: 'gold',
  神话: 'hp',
  至高: 'gold'
}

const beasts = []
for (const line of lines) {
  if (line.includes('妖兽名称') || line.includes('---')) continue
  const cols = line
    .split('|')
    .map((c) => c.trim())
    .filter(Boolean)
  if (cols.length < 7) continue
  const [realmRaw, name, race, rarity, element, ability, drops] = cols
  if (!name || name === '妖兽名称') continue
  const realm = REALM_MAP[realmRaw] || realmRaw
  beasts.push({
    id: `beast-${beasts.length + 1}`,
    name,
    race,
    rarity,
    element,
    ability,
    drops,
    realm,
    weight: RARITY_WEIGHT[rarity] || 10,
    tone: RARITY_TONE[rarity] || 'muted'
  })
}

const content = `import type { RealmMajor } from './realm'
import { REALM_MAJORS } from './realm'
import { getRealmMajorIndex } from './treasure'

export interface CatalogBeast {
  id: string
  name: string
  race: string
  rarity: string
  element: string
  ability: string
  drops: string
  realm: RealmMajor
  weight: number
  tone: string
}

/** 历练可遭遇妖兽总表 */
export const BEAST_CATALOG: CatalogBeast[] = ${JSON.stringify(beasts, null, 2)} as CatalogBeast[]

export function getBeastsByRealm(realm: RealmMajor | string) {
  return BEAST_CATALOG.filter((item) => item.realm === realm)
}

function pickWeighted<T extends { weight: number }>(entries: T[]): T {
  const total = entries.reduce((sum, item) => sum + Math.max(0, item.weight), 0)
  let roll = Math.random() * total
  for (const item of entries) {
    roll -= Math.max(0, item.weight)
    if (roll <= 0) return item
  }
  return entries[entries.length - 1]
}

function shuffleUnique<T>(list: T[]) {
  const arr = [...list]
  for (let i = arr.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[arr[i], arr[j]] = [arr[j], arr[i]]
  }
  return arr
}

/**
 * 依地点境界随机遭遇妖兽：
 * - 优先本境妖兽
 * - 可少量混入低一境
 * - 稀有度加权，普通更常见
 */
export function rollEncounterBeasts(locationRealm: RealmMajor, count = 1): CatalogBeast[] {
  const idx = getRealmMajorIndex(locationRealm)
  const pool: CatalogBeast[] = []
  const primary = getBeastsByRealm(locationRealm)
  pool.push(...primary)
  if (idx > 0) {
    const lower = getBeastsByRealm(REALM_MAJORS[idx - 1])
    pool.push(...lower)
  }
  if (!pool.length) return []

  const result: CatalogBeast[] = []
  const used = new Set<string>()
  const times = Math.min(count, pool.length)
  for (let i = 0; i < times; i += 1) {
    const available = pool.filter((item) => !used.has(item.id))
    if (!available.length) break
    // 本境权重翻倍
    const weighted = available.map((item) => ({
      ...item,
      weight: item.realm === locationRealm ? item.weight * 2 : item.weight
    }))
    const picked = pickWeighted(weighted)
    used.add(picked.id)
    result.push(picked)
  }
  return shuffleUnique(result)
}

/** 估算妖兽等级（展示用） */
export function estimateBeastLevel(beast: CatalogBeast) {
  const base = 8 + getRealmMajorIndex(beast.realm) * 12
  const rarityBonus: Record<string, number> = {
    普通: 0,
    稀有: 3,
    史诗: 6,
    传说: 10,
    神话: 14,
    至高: 20
  }
  return base + (rarityBonus[beast.rarity] || 0) + Math.floor(Math.random() * 4)
}
`

fs.writeFileSync(
  'd:/project/text-based-cultivation/src/constants/beast-catalog.ts',
  content,
  'utf8'
)
console.log('ok', beasts.length)
