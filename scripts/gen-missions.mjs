import fs from 'fs'

const src = fs.readFileSync('c:/Users/64209/Desktop/任务.txt', 'utf8')
const lines = src.split(/\r?\n/).map((l) => l.trim()).filter(Boolean)

const TONE = {
  每日: 'jade',
  悬赏: 'hp',
  周常: 'mp',
  随机: 'gold',
  奇遇: 'muted'
}

const ACTION = {
  每日: '完成',
  悬赏: '领取',
  周常: '前往',
  随机: '接取',
  奇遇: '探查'
}

const missions = []
let mode = 'reward' // reward | encounter

for (const line of lines) {
  if (line.includes('任务名称') && line.includes('类型')) {
    mode = line.includes('AI玩法') ? 'encounter' : 'reward'
    continue
  }
  if (line.includes('---')) continue
  const cols = line
    .split('|')
    .map((c) => c.trim())
    .filter(Boolean)
  if (cols.length < 4) continue
  const [name, type, desc, extra] = cols
  if (!name || name === '任务名称') continue
  const tag = type
  const reward = mode === 'encounter' ? `奇遇 · ${extra}` : extra
  missions.push({
    id: `ms-${missions.length + 1}`,
    name,
    tag,
    tagTone: TONE[tag] || 'muted',
    desc,
    reward,
    action: ACTION[tag] || '完成',
    playStyle: mode === 'encounter' ? extra : ''
  })
}

const content = `export type MissionTag = '每日' | '悬赏' | '周常' | '随机' | '奇遇'

export type MissionTagTone = 'jade' | 'hp' | 'gold' | 'mp' | 'muted'

export interface CatalogMission {
  id: string
  name: string
  tag: MissionTag | string
  tagTone: MissionTagTone
  desc: string
  reward: string
  action: string
  /** 奇遇玩法说明 */
  playStyle?: string
}

export interface DailyMission extends CatalogMission {
  done: boolean
  /** 当日实例 id，避免跨日冲突 */
  instanceId: string
}

/** 每日展示任务数量 */
export const DAILY_MISSION_COUNT = 5

/** 宗门任务总库 */
export const MISSION_CATALOG: CatalogMission[] = ${JSON.stringify(missions, null, 2)} as CatalogMission[]

function shuffle<T>(list: T[]) {
  const arr = [...list]
  for (let i = arr.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[arr[i], arr[j]] = [arr[j], arr[i]]
  }
  return arr
}

/** 从总库随机抽取指定数量任务 */
export function rollDailyMissions(count = DAILY_MISSION_COUNT): DailyMission[] {
  const picked = shuffle(MISSION_CATALOG).slice(0, Math.min(count, MISSION_CATALOG.length))
  const stamp = Date.now()
  return picked.map((item, index) => ({
    ...item,
    instanceId: \`\${item.id}-\${stamp}-\${index}\`,
    done: false
  }))
}

export interface ParsedMissionReward {
  contribution: number
  spiritStones: number
  exp: number
  prestige: number
  extra: string[]
}

/** 解析奖励文案，供领取时发放 */
export function parseMissionReward(reward: string): ParsedMissionReward {
  const result: ParsedMissionReward = {
    contribution: 0,
    spiritStones: 0,
    exp: 0,
    prestige: 0,
    extra: []
  }

  const contribRange = reward.match(/贡献\\s*\\+(\\d+)\\s*[～~-]\\s*(\\d+)/)
  if (contribRange) {
    const min = Number(contribRange[1])
    const max = Number(contribRange[2])
    result.contribution = Math.floor(Math.random() * (max - min + 1)) + min
  } else {
    const contrib = reward.match(/贡献\\s*\\+(\\d+)/)
    if (contrib) result.contribution = Number(contrib[1])
  }

  const stones = reward.match(/灵石\\s*[×xX*]\\s*(\\d+)/)
  if (stones) result.spiritStones = Number(stones[1])

  const exp = reward.match(/修为\\s*\\+(\\d+)/)
  if (exp) result.exp = Number(exp[1])

  const prestige = reward.match(/声望\\s*\\+(\\d+)/)
  if (prestige) result.prestige = Number(prestige[1])

  const known = /贡献|灵石|修为|声望|奇遇/
  reward.split(/[·・]/g).forEach((part) => {
    const text = part.trim()
    if (!text || known.test(text)) return
    result.extra.push(text)
  })

  return result
}
`

fs.writeFileSync(
  'd:/project/text-based-cultivation/src/constants/mission-catalog.ts',
  content,
  'utf8'
)
console.log('ok', missions.length)
