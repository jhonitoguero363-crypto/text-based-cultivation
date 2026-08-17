/** 人物亲密值上限（宗门 / 坊市 / 历练共用） */
export const INTIMACY_MAX = 100

/** 邀请双修所需最低亲密 */
export const DUAL_CULTIVATION_INTIMACY_MIN = 80

/** 赠送药材/丹药亲密增量 */
export const INTIMACY_GIFT = 8
/** 邀请同行历练亲密增量 */
export const INTIMACY_INVITE_ADVENTURE = 2
/** 共同完成一次历练（结束时）每位同行亲密增量 */
export const INTIMACY_SHARED_ADVENTURE = 5

/** 退出宗门：对该宗人物亲密保留比例（大幅降低） */
export const INTIMACY_LEAVE_SECT_KEEP_RATIO = 0.2

export function clampIntimacy(value: number) {
  return Math.max(0, Math.min(INTIMACY_MAX, Math.floor(value)))
}

/** 由态度文案推算初始亲密（首次接触时） */
export function seedIntimacyFromAttitude(attitude: string | undefined | null) {
  const text = (attitude || '').trim()
  if (!text) return 0
  if (text.includes('冲突') || text.includes('敌视')) return 0
  if (text.includes('冷淡') || text.includes('严格')) return 5
  if (text.includes('友善') || text.includes('友好')) return 25
  if (text.includes('中立')) return 10
  return 0
}

/** 亲密档位文案 */
export function intimacyLabel(value: number) {
  const n = clampIntimacy(value)
  if (n >= 80) return '莫逆'
  if (n >= 60) return '亲近'
  if (n >= 40) return '熟识'
  if (n >= 20) return '相识'
  if (n >= 5) return '面善'
  return '陌生'
}

export function formatIntimacy(value: number) {
  const n = clampIntimacy(value)
  return `${n} · ${intimacyLabel(n)}`
}
