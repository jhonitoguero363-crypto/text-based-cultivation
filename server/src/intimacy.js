/**
 * 亲密档与对白态度指引（与游戏 intimacyLabel 阈值一致）
 * 陌生 <5 · 面善 ≥5 · 相识 ≥20 · 熟识 ≥40 · 亲近 ≥60 · 莫逆 ≥80
 */
export function describeIntimacyAttitude(intimacy, labelHint = '') {
  const n = Math.max(0, Math.min(100, Math.floor(Number(intimacy) || 0)))
  let label = String(labelHint || '').trim()
  if (!label) {
    if (n >= 80) label = '莫逆'
    else if (n >= 60) label = '亲近'
    else if (n >= 40) label = '熟识'
    else if (n >= 20) label = '相识'
    else if (n >= 5) label = '面善'
    else label = '陌生'
  }

  /** @type {{ tier: string, label: string, value: number, hint: string }} */
  let tip
  if (n >= 80) {
    tip = {
      tier: 'bond',
      hint:
        '极熟：少客套、可调侃或真心相待；结伴/切磋/收礼默认更易 eager 或 normal；除非大冒犯，勿无故 refuse。intimacyDelta 平淡互动也可 0～+1。'
    }
  } else if (n >= 60) {
    tip = {
      tier: 'close',
      hint:
        '亲近：语气热络、愿分享近况；意愿偏 normal～eager；上位者架子明显软化，但仍可保留身份分寸。'
    }
  } else if (n >= 40) {
    tip = {
      tier: 'familiar',
      hint:
        '熟识：少见外、可商量事；意愿以 normal 为主，示好可 eager，冒犯才 reluctant。'
    }
  } else if (n >= 20) {
    tip = {
      tier: 'acquaint',
      hint:
        '相识：礼貌中带认识感；结伴/切磋可 normal，送礼视性格；生硬或失礼易扣亲密。'
    }
  } else if (n >= 5) {
    tip = {
      tier: 'known',
      hint:
        '面善：尚有距离，客套为主；结伴/切磋偏 reluctant～normal；热情过度或套近乎可能减亲密。'
    }
  } else {
    tip = {
      tier: 'stranger',
      hint:
        '陌生：戒备、简短、少交心；结伴/切磋/收礼更易 reluctant 或 refuse；上位者更冷，下位者更拘谨。示好得体才给 +1～+2。'
    }
  }

  return {
    value: n,
    label,
    tier: tip.tier,
    hint: tip.hint
  }
}
