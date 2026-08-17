import cors from 'cors'
import dotenv from 'dotenv'
import express from 'express'
import path from 'path'
import { fileURLToPath } from 'url'
import { pickFallbackReply } from './fallback.js'
import { neutralEffects } from './effects.js'
import { chatCompletion } from './llm.js'
import { createDailyLimiter } from './rateLimit.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
dotenv.config({ path: path.join(__dirname, '..', '.env') })

const app = express()
const port = Number(process.env.PORT) || 8787
const gatewayToken = String(process.env.GATEWAY_TOKEN || '').trim()
const limiter = createDailyLimiter(process.env.DAILY_LIMIT)

app.use(cors())
app.use(express.json({ limit: '32kb' }))

function auth(req, res, next) {
  if (!gatewayToken) return next()
  const header = String(req.headers.authorization || '')
  const token = header.startsWith('Bearer ') ? header.slice(7).trim() : ''
  if (token !== gatewayToken) {
    return res.status(401).json({ ok: false, error: 'unauthorized' })
  }
  return next()
}

app.get('/v1/health', (_req, res) => {
  res.json({
    ok: true,
    service: 'cultivation-chat',
    model: process.env.LLM_MODEL || null,
    hasKey: Boolean(process.env.LLM_API_KEY),
    authRequired: Boolean(gatewayToken)
  })
})

app.post('/v1/chat/visit', auth, async (req, res) => {
  const body = req.body && typeof req.body === 'object' ? req.body : {}
  const playerId = body.playerId || body.player?.id || req.ip || 'anon'
  const seed = `${body.member?.name || ''}|${body.utterance || ''}`

  const quota = limiter.check(playerId)
  if (!quota.ok) {
    const fb = neutralEffects(pickFallbackReply(seed))
    return res.json({
      ok: false,
      reply: fb.reply,
      effects: fb.effects,
      fallback: true,
      error: 'rate_limited',
      remaining: 0
    })
  }

  try {
    const { reply, effects, model } = await chatCompletion(body, process.env)
    return res.json({
      ok: true,
      reply,
      effects,
      model,
      fallback: false,
      remaining: quota.remaining
    })
  } catch (e) {
    const code = e?.code || 'unknown'
    console.warn('[chat/visit]', code, e?.message || e)
    const fb = neutralEffects(pickFallbackReply(seed))
    return res.json({
      ok: false,
      reply: fb.reply,
      effects: fb.effects,
      fallback: true,
      error: code,
      remaining: quota.remaining
    })
  }
})

app.use((err, _req, res, next) => {
  if (err instanceof SyntaxError && 'body' in err) {
    return res.status(400).json({ ok: false, error: 'invalid_json' })
  }
  return next(err)
})

app.use((_req, res) => {
  res.status(404).json({ ok: false, error: 'not_found' })
})

const host = process.env.HOST || '0.0.0.0'
app.listen(port, host, () => {
  console.log(`[cultivation-chat] http://${host}:${port}`)
  console.log(`[cultivation-chat] model=${process.env.LLM_MODEL || '(unset)'} key=${process.env.LLM_API_KEY ? 'yes' : 'NO'}`)
})
