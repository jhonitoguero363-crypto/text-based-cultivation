import { extractJsonObject, neutralEffects, sanitizeChatEffects } from './effects.js'
import { buildVisitMessages } from './prompt.js'

function joinUrl(base, path) {
  const b = String(base || '').replace(/\/+$/, '')
  const p = path.startsWith('/') ? path : `/${path}`
  return `${b}${p}`
}

/**
 * 调用 OpenAI 兼容 Chat Completions，解析为对白 + 关系效果。
 * @returns {Promise<{ reply: string, effects: object, model: string }>}
 */
export async function chatCompletion(body, env) {
  const apiKey = env.LLM_API_KEY
  if (!apiKey) {
    const err = new Error('missing_api_key')
    err.code = 'missing_api_key'
    throw err
  }

  const baseUrl = env.LLM_BASE_URL || 'https://open.bigmodel.cn/api/paas/v4'
  const model = env.LLM_MODEL || 'glm-4-flash'
  const timeoutMs = Number(env.CHAT_TIMEOUT_MS) || 8000
  const temperature = Number(env.LLM_TEMPERATURE)
  const maxTokens = Number(env.LLM_MAX_TOKENS) || 280

  const messages = buildVisitMessages(body)
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), timeoutMs)

  try {
    const res = await fetch(joinUrl(baseUrl, '/chat/completions'), {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model,
        messages,
        temperature: Number.isFinite(temperature) ? temperature : 0.6,
        max_tokens: maxTokens
      }),
      signal: controller.signal
    })

    const raw = await res.text()
    let data
    try {
      data = raw ? JSON.parse(raw) : {}
    } catch {
      const err = new Error('invalid_json')
      err.code = 'upstream_error'
      err.status = res.status
      err.detail = raw.slice(0, 200)
      throw err
    }

    if (!res.ok) {
      const err = new Error(data?.error?.message || data?.msg || `http_${res.status}`)
      err.code = 'upstream_error'
      err.status = res.status
      err.detail = data
      throw err
    }

    const content = String(data?.choices?.[0]?.message?.content || '').trim()
    if (!content) {
      const err = new Error('empty_reply')
      err.code = 'empty_reply'
      throw err
    }

    const parsed = extractJsonObject(content)
    const sanitized = parsed
      ? sanitizeChatEffects(parsed, content)
      : neutralEffects(content.replace(/^["「]|["」]$/g, '').slice(0, 400))

    if (!sanitized.reply) {
      const err = new Error('empty_reply')
      err.code = 'empty_reply'
      throw err
    }

    return {
      reply: sanitized.reply,
      effects: sanitized.effects,
      model: data?.model || model
    }
  } catch (e) {
    if (e?.name === 'AbortError') {
      const err = new Error('timeout')
      err.code = 'timeout'
      throw err
    }
    throw e
  } finally {
    clearTimeout(timer)
  }
}
