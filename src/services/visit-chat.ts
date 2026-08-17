import Taro from '@tarojs/taro'
import {
  CHAT_API_BASE_URL,
  CHAT_GATEWAY_TOKEN,
  CHAT_REQUEST_TIMEOUT_MS,
  VISIT_CHAT_HISTORY_KEY,
  VISIT_CHAT_HISTORY_MAX
} from '../constants/chat-api'
import {
  DEFAULT_CHAT_RELATION,
  getChatRelation,
  sanitizeChatEffects,
  setChatRelation,
  type ChatRelationEffects
} from '../constants/chat-relation'

export interface VisitChatMemberPayload {
  id?: string
  name: string
  title?: string
  realm?: string
  group?: string
  personality?: string
  specialty?: string
  note?: string
  attitude?: string
  intimacy?: number
  intimacyLabel?: string
  sectName?: string
  source?: string
  hostileFaction?: boolean
}

export interface VisitChatPlayerPayload {
  id?: string
  name: string
  realm?: string
  rank?: string
  sectName?: string
  faction?: string
}

export interface VisitChatTurn {
  role: 'user' | 'assistant'
  content: string
}

export interface VisitChatResult {
  ok: boolean
  reply: string
  fallback: boolean
  model?: string
  error?: string
  effects: ChatRelationEffects
}

type HistoryMap = Record<string, VisitChatTurn[]>

function loadHistoryMap(): HistoryMap {
  try {
    const raw = Taro.getStorageSync(VISIT_CHAT_HISTORY_KEY)
    if (raw && typeof raw === 'object' && !Array.isArray(raw)) return raw as HistoryMap
  } catch {
    // ignore
  }
  return {}
}

function saveHistoryMap(map: HistoryMap) {
  try {
    Taro.setStorageSync(VISIT_CHAT_HISTORY_KEY, map)
  } catch {
    // ignore
  }
}

export function getVisitChatHistory(memberId: string): VisitChatTurn[] {
  if (!memberId) return []
  return [...(loadHistoryMap()[memberId] || [])]
}

export function clearVisitChatHistory(memberId: string) {
  if (!memberId) return
  const map = loadHistoryMap()
  delete map[memberId]
  saveHistoryMap(map)
}

/** 清空全部拜访对白缓存（身死 / 创角） */
export function clearAllVisitChatHistory() {
  saveHistoryMap({})
}

function appendHistory(memberId: string, userText: string, assistantText: string) {
  if (!memberId) return
  const map = loadHistoryMap()
  const prev = map[memberId] || []
  const next = [
    ...prev,
    { role: 'user' as const, content: userText },
    { role: 'assistant' as const, content: assistantText }
  ].slice(-VISIT_CHAT_HISTORY_MAX * 2)
  map[memberId] = next
  saveHistoryMap(map)
}

export async function requestVisitChat(input: {
  utterance: string
  member: VisitChatMemberPayload
  player: VisitChatPlayerPayload
  sceneHint?: string
}): Promise<VisitChatResult> {
  const memberId = String(input.member.id || '')
  const history = getVisitChatHistory(memberId)
  const relation = getChatRelation(memberId)
  const headers: Record<string, string> = {
    'Content-Type': 'application/json'
  }
  if (CHAT_GATEWAY_TOKEN) {
    headers.Authorization = `Bearer ${CHAT_GATEWAY_TOKEN}`
  }

  const fail = (error: string, reply?: string): VisitChatResult => ({
    ok: false,
    reply: reply || '对方沉默片刻，只淡淡点了点头。',
    fallback: true,
    error,
    effects: { ...DEFAULT_CHAT_RELATION }
  })

  try {
    const res = await Taro.request({
      url: `${CHAT_API_BASE_URL.replace(/\/+$/, '')}/v1/chat/visit`,
      method: 'POST',
      timeout: CHAT_REQUEST_TIMEOUT_MS,
      header: headers,
      data: {
        playerId: input.player.id || input.player.name || 'player',
        utterance: String(input.utterance || '').slice(0, 80),
        member: input.member,
        player: input.player,
        relation: {
          invite: relation.invite,
          spar: relation.spar,
          gift: relation.gift
        },
        scene: {
          type: 'visit',
          hint: input.sceneHint || '宗门拜访闲聊'
        },
        history
      }
    })

      const data = (res.data || {}) as Partial<VisitChatResult>
    const status = Number((res as { statusCode?: number }).statusCode || 0)
    if (status === 401) return fail('unauthorized', '灵机受阻，网关未授权')
    if (status >= 400) return fail(`http_${status}`)
    const reply = String(data.reply || '').trim()
    if (!reply) return fail('empty')

    const effects = sanitizeChatEffects(data.effects)
    if (!data.fallback) {
      setChatRelation(memberId, effects)
    }
    appendHistory(memberId, String(input.utterance || '').slice(0, 80), reply)

    return {
      ok: !!data.ok,
      reply,
      fallback: !!data.fallback,
      model: data.model,
      error: data.error,
      effects
    }
  } catch (e: any) {
    return fail(e?.errMsg || e?.message || 'network')
  }
}
