import fs from 'fs'

const src = fs.readFileSync('c:/Users/64209/Desktop/人物信息.txt', 'utf8')
const lines = src.split(/\r?\n/).map((l) => l.trim()).filter(Boolean)

function powerOf(realm) {
  const map = [
    ['飞升', 900000],
    ['渡劫', 650000],
    ['大乘', 480000],
    ['合体', 360000],
    ['炼虚', 280000],
    ['化神', 220000],
    ['元婴', 120000],
    ['金丹', 72000],
    ['筑基', 28000],
    ['炼气', 6000],
    ['练气', 6000]
  ]
  let base = 5000
  for (const [key, val] of map) {
    if (realm.includes(key)) {
      base = val
      break
    }
  }
  if (realm.includes('大圆满')) return Math.round(base * 1.25)
  if (realm.includes('后期')) return Math.round(base * 1.15)
  if (realm.includes('中期')) return Math.round(base * 1.0)
  if (realm.includes('初期') || realm.includes('前期')) return Math.round(base * 0.85)
  return base
}

function toneOf(title) {
  if (/宗主|掌门|亲传/.test(title)) return 'gold'
  if (/长老|副宗主/.test(title)) return 'mp'
  if (/执法|执事|堂主/.test(title)) return 'hp'
  return 'jade'
}

function groupOf(title) {
  if (/杂役/.test(title)) return '杂役弟子'
  if (/亲传/.test(title)) return '亲传弟子'
  if (/内门/.test(title)) return '内门弟子'
  if (/外门/.test(title)) return '外门弟子'
  if (/执法弟子/.test(title)) return '内门弟子'
  if (/执事|堂主|管事/.test(title)) return '执事'
  if (/长老/.test(title)) return '长老'
  if (/宗主|掌门/.test(title)) return '宗主'
  return '外门弟子'
}

const members = []
let mode = 'secret' // first table has 隐藏设定, second has 对玩家态度

for (const line of lines) {
  if (line.includes('人物') && line.includes('身份')) {
    mode = line.includes('对玩家态度') ? 'attitude' : 'secret'
    continue
  }
  if (line.includes('---')) continue
  const cols = line
    .split('|')
    .map((c) => c.trim())
    .filter(Boolean)
  if (cols.length < 5) continue
  const [name, title, realm, personality, specialty, extra] = cols
  if (!name || name === '人物') continue
  members.push({
    id: `qy-${members.length + 1}`,
    name,
    title,
    realm,
    power: powerOf(realm),
    avatar: name.slice(0, 1),
    tone: toneOf(title),
    group: groupOf(title),
    personality,
    specialty,
    note: mode === 'secret' ? extra || '' : '',
    attitude: mode === 'attitude' ? extra || '中立' : '中立',
    sectId: 'qingyun'
  })
}

const content = `import type { SectId } from './sects'

export type MemberGroup =
  | '宗主'
  | '长老'
  | '执事'
  | '亲传弟子'
  | '内门弟子'
  | '外门弟子'
  | '杂役弟子'

export interface CatalogMember {
  id: string
  name: string
  title: string
  realm: string
  power: number
  avatar: string
  tone: string
  group: MemberGroup
  personality: string
  specialty: string
  /** 隐藏设定或补充说明 */
  note: string
  /** 对玩家态度 */
  attitude: string
  sectId: SectId
}

/** 各宗门人物名录（当前已录入青云宗） */
export const SECT_MEMBER_CATALOG: CatalogMember[] = ${JSON.stringify(members, null, 2)} as CatalogMember[]

export function getSectMembers(sectId: SectId | string | null | undefined) {
  if (!sectId) return []
  return SECT_MEMBER_CATALOG.filter((item) => item.sectId === sectId)
}

export function getMemberById(id: string) {
  return SECT_MEMBER_CATALOG.find((item) => item.id === id) || null
}

export const MEMBER_GROUP_ORDER: MemberGroup[] = [
  '宗主',
  '长老',
  '执事',
  '亲传弟子',
  '内门弟子',
  '外门弟子',
  '杂役弟子'
]

export const MEMBER_GROUPS: Array<MemberGroup | '全部'> = ['全部', ...MEMBER_GROUP_ORDER]

/** 由职位/身份文案推断分组 */
export function memberGroupFromTitle(title: string): MemberGroup {
  if (/杂役/.test(title)) return '杂役弟子'
  if (/亲传/.test(title)) return '亲传弟子'
  if (/内门/.test(title)) return '内门弟子'
  if (/外门/.test(title)) return '外门弟子'
  if (/执法弟子/.test(title)) return '内门弟子'
  if (/执事|堂主|管事/.test(title)) return '执事'
  if (/长老/.test(title)) return '长老'
  if (/宗主|掌门/.test(title)) return '宗主'
  return '外门弟子'
}
`

fs.writeFileSync(
  'd:/project/text-based-cultivation/src/constants/member-catalog.ts',
  content,
  'utf8'
)
console.log('ok', members.length, members.map((m) => m.name).join(','))
