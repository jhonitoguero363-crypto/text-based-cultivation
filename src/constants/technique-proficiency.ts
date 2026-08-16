/**
 * 功法熟练度：阶位阈值与法术相同，加成侧重战力与修为获取。
 */
import {
  formatSpellProficiencyLabel,
  getSpellProficiencyInfo,
  getSpellProficiencyTierDef,
  rollSpellProficiencyGain,
  SPELL_PROFICIENCY_CAP,
  SPELL_PROFICIENCY_TIER_MAX,
  type SpellProficiencyInfo
} from './spell-proficiency'

export {
  SPELL_PROFICIENCY_CAP as TECHNIQUE_PROFICIENCY_CAP,
  SPELL_PROFICIENCY_TIER_MAX as TECHNIQUE_PROFICIENCY_TIER_MAX,
  rollSpellProficiencyGain as rollTechniqueProficiencyGain
}

/** 各阶修为获取加成（洞府吐纳） */
const EXP_GAIN_BONUS = [0, 0.05, 0.1, 0.15, 0.25, 0.4] as const

/** 各阶展示文案（战力对齐法术威力档；修为对齐 EXP_GAIN_BONUS） */
const TECHNIQUE_EFFECTS = [
  '功法基础效果',
  '战力 +5%，修为获取 +5%',
  '战力 +10%，修为获取 +10%',
  '战力 +18%，修为获取 +15%',
  '战力 +30%，修为获取 +25%',
  '战力 +50%，修为获取 +40%'
] as const

export interface TechniqueProficiencyInfo extends SpellProficiencyInfo {
  /** 洞府修为获取加成 */
  expGainBonus: number
}

export function getTechniqueProficiencyInfo(points: number): TechniqueProficiencyInfo {
  const base = getSpellProficiencyInfo(points)
  const def = getSpellProficiencyTierDef(points)
  const expGainBonus = EXP_GAIN_BONUS[Math.max(0, def.tier - 1)] || 0
  return {
    ...base,
    effect: TECHNIQUE_EFFECTS[Math.max(0, def.tier - 1)] || TECHNIQUE_EFFECTS[0],
    expGainBonus
  }
}

export function formatTechniqueProficiencyLabel(points: number) {
  return formatSpellProficiencyLabel(points)
}
