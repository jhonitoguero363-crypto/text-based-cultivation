import fs from 'fs'

const src = fs.readFileSync('c:/Users/64209/Desktop/历练人物.txt', 'utf8')
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
  飞升: '飞升',
  不明: '飞升',
  化神以上: '化神'
}

/** @type {string | null} */
let mode = null
const people = []

function pushPerson(item) {
  people.push({
    id: `adv-npc-${people.length + 1}`,
    avatar: item.name.slice(0, 1),
    ...item
  })
}

for (const line of lines) {
  if (line.includes('人物') && (line.includes('身份') || line.includes('表面身份') || line.includes('可能触发'))) {
    if (line.includes('遭遇地点')) mode = 'local'
    else if (line.includes('主要商品')) mode = 'merchant'
    else if (line.includes('特点')) mode = 'wander'
    else if (line.includes('特殊能力')) mode = 'demon'
    else if (line.includes('表面身份') || line.includes('实际身份')) mode = 'hidden'
    else if (line.includes('可能触发')) mode = 'event'
    else mode = null
    continue
  }
  if (line.includes('---') || !mode) continue

  const cols = line
    .split('|')
    .map((c) => c.trim())
    .filter(Boolean)
  if (!cols.length || cols[0] === '人物') continue

  if (mode === 'local' && cols.length >= 6) {
    const [name, title, realmRaw, personality, place, event] = cols
    pushPerson({
      name,
      title,
      realm: REALM_MAP[realmRaw] || realmRaw,
      personality,
      place,
      event,
      kind: '宗门弟子'
    })
  } else if (mode === 'wander' && cols.length >= 5) {
    const [name, title, realmRaw, personality, trait] = cols
    pushPerson({
      name,
      title,
      realm: REALM_MAP[realmRaw] || realmRaw,
      personality,
      place: '各地',
      event: trait,
      kind: '散修'
    })
  } else if (mode === 'merchant' && cols.length >= 4) {
    const [name, title, realmRaw, goods] = cols
    pushPerson({
      name,
      title,
      realm: REALM_MAP[realmRaw] || realmRaw,
      personality: '精明',
      place: '各地',
      event: `出售${goods}`,
      kind: '商人'
    })
  } else if (mode === 'demon' && cols.length >= 5) {
    const [name, title, realmRaw, personality, ability] = cols
    pushPerson({
      name,
      title,
      realm: REALM_MAP[realmRaw] || realmRaw,
      personality,
      place: '各地',
      event: `魔功 · ${ability}`,
      kind: '魔修'
    })
  } else if (mode === 'hidden' && cols.length >= 4) {
    const [name, surface, real, realmRaw] = cols
    pushPerson({
      name,
      title: surface,
      realm: REALM_MAP[realmRaw] || REALM_MAP['不明'],
      personality: '深藏不露',
      place: '各地',
      event: `隐世身份 · ${real}`,
      kind: '隐世'
    })
  } else if (mode === 'event' && cols.length >= 3) {
    const [name, title, trigger] = cols
    pushPerson({
      name,
      title,
      realm: '炼气',
      personality: '机缘',
      place: '各地',
      event: trigger,
      kind: '奇遇'
    })
  }
}

const content = `import type { RealmMajor } from './realm'
import { getRealmMajorIndex } from './treasure'

export type AdventureNpcKind = '宗门弟子' | '散修' | '商人' | '魔修' | '隐世' | '奇遇'

export interface AdventureNpc {
  id: string
  name: string
  title: string
  realm: RealmMajor
  personality: string
  /** 常出没地点；各地表示流浪可遇 */
  place: string
  /** 可能事件 / 特点 / 商品 / 隐世身份 */
  event: string
  avatar: string
  kind: AdventureNpcKind
}

/** 历练可偶遇人物 */
export const ADVENTURE_NPC_CATALOG: AdventureNpc[] = ${JSON.stringify(
  people,
  null,
  2
)} as AdventureNpc[]

function pickOne<T>(list: T[]): T | null {
  if (!list.length) return null
  return list[Math.floor(Math.random() * list.length)]
}

/**
 * 依当前历练地点随机偶遇人物：
 * - 优先该地点宗门弟子
 * - 混入同境界散修/商人/魔修
 * - 少量隐世与奇遇（各地）
 */
export function rollEncounterNpcs(
  locationName: string,
  locationRealm: RealmMajor,
  count = 1
): AdventureNpc[] {
  const local = ADVENTURE_NPC_CATALOG.filter((item) => item.place === locationName)
  const sameRealm = ADVENTURE_NPC_CATALOG.filter(
    (item) =>
      item.place === '各地' &&
      item.realm === locationRealm &&
      (item.kind === '散修' || item.kind === '商人' || item.kind === '魔修')
  )
  const near = ADVENTURE_NPC_CATALOG.filter((item) => {
    if (item.place !== '各地') return false
    if (!(item.kind === '散修' || item.kind === '商人' || item.kind === '魔修')) return false
    const diff = Math.abs(getRealmMajorIndex(item.realm) - getRealmMajorIndex(locationRealm))
    return diff === 1
  })
  const special = ADVENTURE_NPC_CATALOG.filter(
    (item) => item.kind === '隐世' || item.kind === '奇遇'
  )
  const discipleSame = ADVENTURE_NPC_CATALOG.filter(
    (item) =>
      item.kind === '宗门弟子' &&
      item.place !== locationName &&
      item.realm === locationRealm
  )

  const pool: AdventureNpc[] = []
  pool.push(...local, ...local, ...local)
  pool.push(...sameRealm, ...sameRealm)
  pool.push(...near)
  pool.push(...discipleSame)
  // 隐世/奇遇低权重，但各地都可能刷到
  pool.push(...special)

  if (!pool.length) {
    return ADVENTURE_NPC_CATALOG.slice(0, Math.min(count, ADVENTURE_NPC_CATALOG.length))
  }

  const result: AdventureNpc[] = []
  const used = new Set<string>()
  const unique = new Set(pool.map((item) => item.id)).size
  const times = Math.min(count, unique)
  for (let i = 0; i < times; i += 1) {
    const available = pool.filter((item) => !used.has(item.id))
    const picked = pickOne(available)
    if (!picked) break
    used.add(picked.id)
    result.push(picked)
  }
  return result
}
`

fs.writeFileSync(
  'd:/project/text-based-cultivation/src/constants/adventure-npc-catalog.ts',
  content,
  'utf8'
)

const byKind = {}
for (const p of people) {
  byKind[p.kind] = (byKind[p.kind] || 0) + 1
}
console.log('ok', people.length, byKind)
