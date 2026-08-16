import { memberGroupFromTitle, type MemberGroup } from './member-catalog'

/** 宗门月俸：按身份发放灵石（天元历每月一次） */
export const SECT_MONTHLY_STIPEND: Record<MemberGroup, number> = {
  杂役弟子: 10,
  外门弟子: 50,
  内门弟子: 150,
  亲传弟子: 500,
  执事: 800,
  长老: 1500,
  宗主: 3000
}

export function resolveSectStipendGroup(rank: string): MemberGroup | null {
  const text = (rank || '').trim()
  if (!text || text === '散修') return null
  return memberGroupFromTitle(text)
}

export function getSectMonthlyStipend(rank: string): number {
  const group = resolveSectStipendGroup(rank)
  if (!group) return 0
  return SECT_MONTHLY_STIPEND[group] || 0
}

export function formatSectStipendHint(rank: string): string {
  const group = resolveSectStipendGroup(rank)
  if (!group) return '入宗后方可领取月俸'
  const amount = SECT_MONTHLY_STIPEND[group] || 0
  return `${group}月俸 ${amount.toLocaleString()} 灵石 · 每月初一发放`
}
