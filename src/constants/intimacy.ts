import { factionOfNpcKind } from './adventure-npc-catalog'
import { areFactionsHostile, getSectOption } from './sects'

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

/**
 * 敌对派系首次接触：在态度种子上再压低。
 * 本宗 / 同派非敌对：不启用。
 */
export const INTIMACY_HOSTILE_SEED_MULT = 0.25
/** 敌对派系初始亲密上限（即使态度友善也不超过此值） */
export const INTIMACY_HOSTILE_SEED_MAX = 3

export interface IntimacySeedOptions {
  /** 相对玩家为敌对派系人物 */
  hostile?: boolean
}

export function clampIntimacy(value: number) {
  return Math.max(0, Math.min(INTIMACY_MAX, Math.floor(value)))
}

/** 由态度文案推算初始亲密（首次接触时） */
export function seedIntimacyFromAttitude(
  attitude: string | undefined | null,
  options?: IntimacySeedOptions
) {
  const text = (attitude || '').trim()
  let base = 0
  if (text.includes('冲突') || text.includes('敌视')) base = 0
  else if (text.includes('冷淡') || text.includes('严格')) base = 5
  else if (text.includes('友善') || text.includes('友好')) base = 25
  else if (text.includes('中立')) base = 10
  else base = 0

  if (options?.hostile) {
    base = Math.min(INTIMACY_HOSTILE_SEED_MAX, Math.floor(base * INTIMACY_HOSTILE_SEED_MULT))
  }
  return clampIntimacy(base)
}

/**
 * 是否应对该目标使用「敌对派系」低初始亲密。
 * 本宗同门恒为 false；派系互为敌对（正道/魔门/妖族）为 true。
 */
export function isHostileIntimacyTarget(
  playerSectId: string | null | undefined,
  target: {
    sectId?: string | null
    kind?: string | null
    source?: string | null
  }
) {
  const pid = String(playerSectId || '').trim()
  const tid = String(target.sectId || '').trim()
  if (pid && tid && pid === tid) return false

  const playerFaction = getSectOption(pid)?.faction || null
  if (tid) {
    const npcFaction = getSectOption(tid)?.faction || null
    if (playerFaction && npcFaction) return areFactionsHostile(playerFaction, npcFaction)
  }

  const kindFaction = factionOfNpcKind(target.kind)
  if (playerFaction && kindFaction) return areFactionsHostile(playerFaction, kindFaction)
  if (!playerFaction && kindFaction) {
    return kindFaction === '魔门' || kindFaction === '妖族'
  }
  return false
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
