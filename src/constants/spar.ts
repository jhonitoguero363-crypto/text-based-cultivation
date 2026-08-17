/**
 * 切磋比武：低风险可负；任务进度无论胜负均由调用方上报。
 * 胜：亲密由调用方加；可涨法术熟练 / 修为。
 * 负：不涨亲密；奖励减半或无；仅负时有低概率受伤。
 */

/** 受伤时战力倍率（战力缩减 30%） */
export const INJURY_POWER_MULT = 0.7

/** 切磋：增长法术熟练度概率（胜） */
export const SPAR_SPELL_PROF_CHANCE = 0.5
/** 切磋：增长修为概率（胜） */
export const SPAR_EXP_CHANCE = 0.55
/** 切磋落败：熟练度概率 */
export const SPAR_LOSE_SPELL_PROF_CHANCE = 0.25
/** 切磋落败：修为概率 */
export const SPAR_LOSE_EXP_CHANCE = 0.28
/** 切磋落败时受伤概率 */
export const SPAR_LOSE_INJURY_CHANCE = 0.04
/** 落败时奖励倍率 */
export const SPAR_LOSE_REWARD_MULT = 0.5

export interface SparOutcome {
  won: boolean
  spellName: string | null
  spellProfGain: number
  expGain: number
  injured: boolean
}

function randRange(min: number, max: number) {
  return Math.round((min + Math.random() * (max - min)) * 10) / 10
}

/**
 * 掷切磋奖惩（不含亲密 / 任务进度）。
 * @param won 战力判定是否获胜
 * @param spellNames 已习法术名；空则不会涨熟练
 * @param realmExpBase 当前境界洞府吐纳基数，用于缩放修为奖励
 */
export function rollSparOutcome(
  won: boolean,
  spellNames: string[],
  realmExpBase: number
): SparOutcome {
  const spellChance = won ? SPAR_SPELL_PROF_CHANCE : SPAR_LOSE_SPELL_PROF_CHANCE
  const expChance = won ? SPAR_EXP_CHANCE : SPAR_LOSE_EXP_CHANCE
  const rewardMult = won ? 1 : SPAR_LOSE_REWARD_MULT

  let spellName: string | null = null
  let spellProfGain = 0
  if (spellNames.length && Math.random() < spellChance) {
    spellName = spellNames[Math.floor(Math.random() * spellNames.length)]
    spellProfGain = Math.round(randRange(1, 3) * rewardMult * 10) / 10
  }

  let expGain = 0
  if (Math.random() < expChance) {
    const base = Math.max(0.2, realmExpBase)
    expGain = Math.round(randRange(0.4, 1.6) * base * rewardMult * 10) / 10
  }

  const injured = !won && Math.random() < SPAR_LOSE_INJURY_CHANCE

  return { won, spellName, spellProfGain, expGain, injured }
}
