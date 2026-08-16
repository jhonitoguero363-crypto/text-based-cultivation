export type RootName = '金' | '木' | '水' | '火' | '土' | '风' | '冰' | '雷'
export type RootTone = 'gold' | 'jade' | 'mp' | 'hp'

export interface RootBone {
  name: RootName
  value: number
  color: RootTone
  grade: string
}

const ROOT_META: { name: RootName; color: RootTone; rare?: boolean }[] = [
  { name: '金', color: 'gold' },
  { name: '木', color: 'jade' },
  { name: '水', color: 'mp' },
  { name: '火', color: 'hp' },
  { name: '土', color: 'gold' },
  { name: '风', color: 'jade', rare: true },
  { name: '冰', color: 'mp', rare: true },
  { name: '雷', color: 'mp', rare: true }
]

export function gradeOf(value: number): string {
  if (value >= 90) return '天品'
  if (value >= 75) return '上品'
  if (value >= 55) return '中品'
  if (value >= 35) return '下品'
  if (value >= 15) return '劣品'
  return '无根'
}

function randInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

/** 五行：正常随机，偏中高 */
function rollCommonRoot(): number {
  const roll = Math.random()
  if (roll < 0.08) return randInt(10, 34)
  if (roll < 0.28) return randInt(35, 54)
  if (roll < 0.68) return randInt(55, 74)
  if (roll < 0.92) return randInt(75, 89)
  return randInt(90, 98)
}

/**
 * 冰 / 风 / 雷：大幅降低高数值概率
 * 约 88% ≤35，约 9% 36–55，约 2.5% 56–70，约 0.5% 71–88
 */
function rollRareRoot(): number {
  const roll = Math.random()
  if (roll < 0.88) return randInt(1, 35)
  if (roll < 0.97) return randInt(36, 55)
  if (roll < 0.995) return randInt(56, 70)
  return randInt(71, 88)
}

export function rollRootBones(): RootBone[] {
  return ROOT_META.map((item) => {
    const value = item.rare ? rollRareRoot() : rollCommonRoot()
    return {
      name: item.name,
      value,
      color: item.color,
      grade: gradeOf(value)
    }
  })
}

/** 默认隐藏的稀有灵根：仅当其为全灵根最高值时才展示 */
export const HIDDEN_UNLESS_PRIMARY_ROOTS: RootName[] = ['风', '冰', '雷']

export function isHiddenUnlessPrimaryRoot(name: RootName | string) {
  return HIDDEN_UNLESS_PRIMARY_ROOTS.includes(name as RootName)
}

/** 主灵根：取数值最高者 */
export function pickPrimaryRoot(roots: RootBone[]): RootBone {
  return roots.reduce((best, cur) => (cur.value > best.value ? cur : best), roots[0])
}

export function formatPrimaryRoot(root: RootBone): string {
  return `${root.name}（${root.grade}）`
}

/** 入宗可授身份（杂役～内门），依主灵根与宗门等级 */
export type JoinSectRank = '杂役弟子' | '外门弟子' | '内门弟子'

/**
 * 拜入宗门初始身份。
 * - 根骨越高 → 职位越高（主灵根：≥75 内门档、≥55 外门档）
 * - 宗门等级越高 → 入门门槛越高、职位越低（相对三流，每高一级阈值 +8）
 *   三流 shift0 · 二流 +8 · 一流 +16 · 圣地 +24
 */
export function resolveJoinRankFromRoots(
  roots: RootBone[],
  sectTierRank = 1
): JoinSectRank {
  if (!roots.length) return '杂役弟子'
  const primary = pickPrimaryRoot(roots)
  const value = Math.max(0, Number(primary?.value) || 0)
  const shift = Math.max(0, (Number(sectTierRank) || 1) - 1)
  const innerNeed = 75 + shift * 8
  const outerNeed = 55 + shift * 8
  if (value >= innerNeed) return '内门弟子'
  if (value >= outerNeed) return '外门弟子'
  return '杂役弟子'
}

/**
 * 界面展示用灵根列表。
 * 金木水火土始终显示；风/冰/雷仅当其数值等于全灵根最高值时显示。
 */
export function visibleRootBones(roots: RootBone[]): RootBone[] {
  if (!roots.length) return []
  const max = Math.max(...roots.map((item) => item.value))
  return roots.filter((item) => {
    if (!isHiddenUnlessPrimaryRoot(item.name)) return true
    return item.value === max
  })
}
