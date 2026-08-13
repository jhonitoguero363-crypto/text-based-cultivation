import fs from 'fs'

const src = fs.readFileSync('c:/Users/64209/Desktop/历练列表.txt', 'utf8')
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

const locations = []
for (const line of lines) {
  if (line.includes('历练地点') || line.includes('---')) continue
  const cols = line
    .split('|')
    .map((c) => c.trim())
    .filter(Boolean)
  if (cols.length < 4) continue
  const [realmRaw, name, danger, drops, feature = ''] = cols
  if (!name || name === '历练地点') continue
  const realm = REALM_MAP[realmRaw] || realmRaw
  const stars = (danger.match(/★/g) || []).length
  locations.push({
    id: `loc-${locations.length + 1}`,
    name,
    realm,
    danger,
    stars: Math.max(1, stars),
    drops: drops || '未知',
    feature: feature || '秘境历练'
  })
}

const content = `import type { RealmMajor } from './realm'
import { REALM_MAJORS } from './realm'
import { getRealmMajorIndex } from './treasure'

export interface AdventureLocation {
  id: string
  name: string
  realm: RealmMajor
  danger: string
  stars: number
  drops: string
  feature: string
}

/** 秘境历练地点总表 */
export const ADVENTURE_LOCATIONS: AdventureLocation[] = ${JSON.stringify(
  locations,
  null,
  2
)} as AdventureLocation[]

export const ADVENTURE_LOCATION_REALMS: RealmMajor[] = REALM_MAJORS.filter((realm) =>
  ADVENTURE_LOCATIONS.some((item) => item.realm === realm)
)

export function getLocationById(id: string | null | undefined) {
  if (!id) return null
  return ADVENTURE_LOCATIONS.find((item) => item.id === id) || null
}

export function filterLocationsByRealm(realm: string) {
  if (!realm || realm === '全部') return ADVENTURE_LOCATIONS
  return ADVENTURE_LOCATIONS.filter((item) => item.realm === realm)
}

/** 是否达到进入该地点的建议境界 */
export function canEnterLocation(playerMajor: RealmMajor, location: AdventureLocation) {
  return getRealmMajorIndex(playerMajor) >= getRealmMajorIndex(location.realm)
}

/** 依地点危险度估算单次探索收益 */
export function estimateExploreReward(location: AdventureLocation) {
  const realmBonus = Math.max(0, getRealmMajorIndex(location.realm))
  const exp = 30 + location.stars * 18 + realmBonus * 25
  const stones = 16 + location.stars * 10 + realmBonus * 14
  return { exp, stones }
}
`

fs.writeFileSync(
  'd:/project/text-based-cultivation/src/constants/adventure-locations.ts',
  content,
  'utf8'
)
console.log('ok', locations.length, locations.map((l) => l.name).join(','))
