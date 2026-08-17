/** 超时 / 无 Key 时的兜底对白 */
const FALLBACK_LINES = [
  '对方沉默片刻，只淡淡点了点头。',
  '对方抚袖一笑：「改日再议。」',
  '对方目光微凝，却未多言。',
  '对方略一颔首，话锋已转。',
  '对方道：「时机未至，不必多言。」'
]

export function pickFallbackReply(seed = '') {
  const text = String(seed || '')
  let hash = 0
  for (let i = 0; i < text.length; i++) {
    hash = (hash * 31 + text.charCodeAt(i)) >>> 0
  }
  return FALLBACK_LINES[hash % FALLBACK_LINES.length]
}
