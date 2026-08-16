/**
 * 切磋比武奖励与受伤风险
 * ——点到为止：任务进度与亲密照常；另有概率涨法术熟练 / 修为；极低概率受伤
 */

/** 受伤时战力倍率（战力缩减 30%） */
export const INJURY_POWER_MULT = 0.7

/** 切磋：增长法术熟练度概率 */
export const SPAR_SPELL_PROF_CHANCE = 0.5
/** 切磋：增长修为概率 */
export const SPAR_EXP_CHANCE = 0.55
/** 切磋：受伤概率（极低） */
export const SPAR_INJURY_CHANCE = 0.025

export interface SparOutcome {
  spellName: string | null
  spellProfGain: number
  expGain: number
  injured: boolean
}

function randRange(min: number, max: number) {
  return Math.round((min + Math.random() * (max - min)) * 10) / 10
}

/**
 * 掷切磋结果（不含亲密 / 任务进度）。
 * @param spellNames 已习法术名；空则不会涨熟练
 * @param realmExpBase 当前境界洞府吐纳基数，用于缩放修为奖励
 */
export function rollSparOutcome(
  spellNames: string[],
  realmExpBase: number
): SparOutcome {
  let spellName: string | null = null
  let spellProfGain = 0
  if (spellNames.length && Math.random() < SPAR_SPELL_PROF_CHANCE) {
    spellName = spellNames[Math.floor(Math.random() * spellNames.length)]
    spellProfGain = Math.round(randRange(1, 3) * 10) / 10
  }

  let expGain = 0
  if (Math.random() < SPAR_EXP_CHANCE) {
    const base = Math.max(0.2, realmExpBase)
    expGain = Math.round(randRange(0.4, 1.6) * base * 10) / 10
  }

  const injured = Math.random() < SPAR_INJURY_CHANCE

  return { spellName, spellProfGain, expGain, injured }
}
