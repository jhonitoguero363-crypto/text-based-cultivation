import Taro from '@tarojs/taro'

/** 交谈带来的互动意愿 */
export type ChatStance = 'refuse' | 'reluctant' | 'normal' | 'eager'

export interface ChatRelationEffects {
  intimacyDelta: number
  invite: ChatStance
  spar: ChatStance
  gift: ChatStance
}

export interface ChatRelationState extends ChatRelationEffects {
  updatedAt: number
}

export const CHAT_RELATION_STORAGE_KEY = 'visit-chat-relation-v1'

/** 单次交谈亲密变化上限（与服务端一致） */
export const CHAT_INTIMACY_DELTA_MIN = -3
export const CHAT_INTIMACY_DELTA_MAX = 5

const STANCES: ChatStance[] = ['refuse', 'reluctant', 'normal', 'eager']

export function normalizeChatStance(value: unknown, fallback: ChatStance = 'normal'): ChatStance {
  const s = String(value || '').trim().toLowerCase()
  return (STANCES as string[]).includes(s) ? (s as ChatStance) : fallback
}

export function clampChatIntimacyDelta(value: unknown) {
  const n = Math.round(Number(value))
  if (!Number.isFinite(n)) return 0
  return Math.max(CHAT_INTIMACY_DELTA_MIN, Math.min(CHAT_INTIMACY_DELTA_MAX, n))
}

export function sanitizeChatEffects(raw: Partial<ChatRelationEffects> | null | undefined): ChatRelationEffects {
  return {
    intimacyDelta: clampChatIntimacyDelta(raw?.intimacyDelta),
    invite: normalizeChatStance(raw?.invite),
    spar: normalizeChatStance(raw?.spar),
    gift: normalizeChatStance(raw?.gift)
  }
}

export const DEFAULT_CHAT_RELATION: ChatRelationEffects = {
  intimacyDelta: 0,
  invite: 'normal',
  spar: 'normal',
  gift: 'normal'
}

type RelationMap = Record<string, ChatRelationState>

function loadMap(): RelationMap {
  try {
    const raw = Taro.getStorageSync(CHAT_RELATION_STORAGE_KEY)
    if (raw && typeof raw === 'object' && !Array.isArray(raw)) return raw as RelationMap
  } catch {
    // ignore
  }
  return {}
}

function saveMap(map: RelationMap) {
  try {
    Taro.setStorageSync(CHAT_RELATION_STORAGE_KEY, map)
  } catch {
    // ignore
  }
}

export function getChatRelation(memberId: string): ChatRelationEffects {
  if (!memberId) return { ...DEFAULT_CHAT_RELATION }
  const item = loadMap()[memberId]
  if (!item) return { ...DEFAULT_CHAT_RELATION }
  return sanitizeChatEffects(item)
}

export function setChatRelation(memberId: string, effects: Partial<ChatRelationEffects>) {
  if (!memberId) return getChatRelation(memberId)
  const next = sanitizeChatEffects({ ...getChatRelation(memberId), ...effects, intimacyDelta: effects.intimacyDelta ?? 0 })
  const map = loadMap()
  map[memberId] = { ...next, updatedAt: Date.now() }
  saveMap(map)
  return next
}

/** 清空全部交谈意愿（身死 / 创角） */
export function clearAllChatRelations() {
  saveMap({})
}

export function stanceLabel(stance: ChatStance) {
  if (stance === 'refuse') return '拒绝'
  if (stance === 'reluctant') return '勉强'
  if (stance === 'eager') return '乐意'
  return '平常'
}

/** 行动被拒绝时的提示 */
export function stanceRefuseToast(kind: 'invite' | 'spar' | 'gift') {
  if (kind === 'invite') return '对方不愿结伴历练'
  if (kind === 'spar') return '对方不愿与你切磋'
  return '对方不愿接受赠礼'
}

/**
 * 按意愿修正亲密收益。
 * refuse 不应走到这里；reluctant ×0.5；eager +1；normal 原值。
 */
export function applyStanceToIntimacyGain(base: number, stance: ChatStance) {
  const b = Math.max(0, Math.floor(Number(base) || 0))
  if (stance === 'refuse') return 0
  if (stance === 'reluctant') return Math.max(1, Math.floor(b * 0.5))
  if (stance === 'eager') return b + 1
  return b
}
