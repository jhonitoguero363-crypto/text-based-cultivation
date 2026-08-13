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

/** 主灵根：取数值最高者 */
export function pickPrimaryRoot(roots: RootBone[]): RootBone {
  return roots.reduce((best, cur) => (cur.value > best.value ? cur : best), roots[0])
}

export function formatPrimaryRoot(root: RootBone): string {
  return `${root.name}（${root.grade}）`
}
