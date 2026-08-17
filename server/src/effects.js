const STANCES = new Set(['refuse', 'reluctant', 'normal', 'eager'])

function asStance(value, fallback = 'normal') {
  const s = String(value || '').trim().toLowerCase()
  return STANCES.has(s) ? s : fallback
}

function asDelta(value) {
  const n = Math.round(Number(value))
  if (!Number.isFinite(n)) return 0
  return Math.max(-3, Math.min(5, n))
}

/** 从模型正文中抽出 JSON 对象 */
export function extractJsonObject(text) {
  const raw = String(text || '').trim()
  if (!raw) return null
  const fence = raw.match(/```(?:json)?\s*([\s\S]*?)```/i)
  const candidate = fence ? fence[1].trim() : raw
  const start = candidate.indexOf('{')
  const end = candidate.lastIndexOf('}')
  if (start < 0 || end <= start) return null
  try {
    return JSON.parse(candidate.slice(start, end + 1))
  } catch {
    return null
  }
}

export function sanitizeChatEffects(raw, replyFallback = '') {
  const obj = raw && typeof raw === 'object' ? raw : {}
  const reply = String(obj.reply || replyFallback || '')
    .trim()
    .replace(/^["「]|["」]$/g, '')
    .slice(0, 400)

  return {
    reply,
    effects: {
      intimacyDelta: asDelta(obj.intimacyDelta),
      invite: asStance(obj.invite),
      spar: asStance(obj.spar),
      gift: asStance(obj.gift)
    }
  }
}

export function neutralEffects(reply) {
  return sanitizeChatEffects(
    {
      reply,
      intimacyDelta: 0,
      invite: 'normal',
      spar: 'normal',
      gift: 'normal'
    },
    reply
  )
}
