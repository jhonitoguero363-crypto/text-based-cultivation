import { getSectOption, type SectId } from './sects'

/** 任务文案用的宗门设施称呼 */
export interface SectMissionLabels {
  /** 青云宗 / 天魔宗 … */
  sect: string
  /** 青云 / 天魔 / 万剑 / 万妖 */
  short: string
  /** 青云山 / 天魔渊 … */
  base: string
  /** 青云矿洞 … */
  mine: string
  garden: string
  beast: string
  pill: string
  forge: string
  tech: string
}

function shortOf(sectId: SectId | string | null | undefined, sectName: string) {
  if (sectId === 'yaozu') return '万妖'
  if (sectId === 'qingyun') return '青云'
  if (sectId === 'tianmo') return '天魔'
  if (sectId === 'wanjian') return '万剑'
  const trimmed = sectName.replace(/宗$/, '')
  return trimmed || '宗门'
}

export function getSectMissionLabels(
  sectId: SectId | string | null | undefined
): SectMissionLabels {
  const opt = getSectOption(sectId)
  const sect = opt?.name || '本宗'
  const short = shortOf(opt?.id || sectId, sect)
  const base = (opt?.base || '').replace(/^驻地/, '') || '驻地'
  return {
    sect,
    short,
    base,
    mine: `${short}矿洞`,
    garden: '药园',
    beast: '灵兽阁',
    pill: '丹阁',
    forge: '器阁',
    tech: '功法阁'
  }
}

/**
 * 将任务文案按当前宗门本地化。
 * - 支持占位符：{sect}{short}{base}{mine}{garden}{beast}{pill}{forge}{tech}
 * - 兼容中性词「宗门矿洞」与旧稿「青云矿洞 / 灵兽峰 / 丹峰」
 */
export function localizeMissionText(
  text: string,
  sectId?: SectId | string | null
) {
  if (!text) return text
  const L = getSectMissionLabels(sectId)
  return text
    .replace(/\{sect\}/g, L.sect)
    .replace(/\{short\}/g, L.short)
    .replace(/\{base\}/g, L.base)
    .replace(/\{mine\}/g, L.mine)
    .replace(/\{garden\}/g, L.garden)
    .replace(/\{beast\}/g, L.beast)
    .replace(/\{pill\}/g, L.pill)
    .replace(/\{forge\}/g, L.forge)
    .replace(/\{tech\}/g, L.tech)
    .replace(/青云矿洞|天魔矿洞|万剑矿洞|万妖矿洞|宗门矿洞/g, L.mine)
    .replace(/灵兽峰/g, L.beast)
    .replace(/丹峰/g, L.pill)
}

export function localizeMissionCopy<
  T extends {
    name?: string
    desc?: string
    objective?: { hint?: string; locationHint?: string } | null
  }
>(mission: T, sectId?: SectId | string | null): T {
  if (!mission) return mission
  const next = { ...mission }
  if (typeof next.name === 'string') next.name = localizeMissionText(next.name, sectId)
  if (typeof next.desc === 'string') next.desc = localizeMissionText(next.desc, sectId)
  if (next.objective) {
    next.objective = { ...next.objective }
    if (typeof next.objective.hint === 'string') {
      next.objective.hint = localizeMissionText(next.objective.hint, sectId)
    }
  }
  return next
}
