/** 拜访 LLM 对话网关（独立 server/） */

/**
 * 请求基址。本地默认本机网关；Docker / 正式 H5 构建时设
 * `TARO_APP_CHAT_API_BASE_URL=`（空字符串）走同域 `/v1/...`。
 * 须写静态 `process.env.TARO_APP_*`，构建期才能被内联。
 */
export const CHAT_API_BASE_URL =
  process.env.TARO_APP_CHAT_API_BASE_URL !== undefined &&
  process.env.TARO_APP_CHAT_API_BASE_URL !== null
    ? String(process.env.TARO_APP_CHAT_API_BASE_URL)
    : 'http://127.0.0.1:8787'

/** 与容器 / server 的 GATEWAY_TOKEN 一致；可留空 */
export const CHAT_GATEWAY_TOKEN =
  process.env.TARO_APP_CHAT_GATEWAY_TOKEN !== undefined &&
  process.env.TARO_APP_CHAT_GATEWAY_TOKEN !== null
    ? String(process.env.TARO_APP_CHAT_GATEWAY_TOKEN)
    : ''

export const CHAT_REQUEST_TIMEOUT_MS = 12000

/** 拜访页快捷用语 */
export const VISIT_CHAT_PRESETS = ['近日可有要事？', '道友近来可好？', '请教一二。', '告辞。'] as const

export const VISIT_CHAT_HISTORY_KEY = 'visit-chat-history-v1'
export const VISIT_CHAT_HISTORY_MAX = 6
