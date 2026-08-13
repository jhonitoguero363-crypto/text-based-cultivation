import { getSpellByName, SPELL_CATALOG } from './spell-catalog'
import type { SectId } from './sects'
import { getTechniqueByName, TECHNIQUE_CATALOG } from './technique-catalog'

/** 入门免费赠送：基础功法 + 基础法术（按宗门略作区分） */
export const SECT_STARTER_GIFTS: Record<
  SectId,
  { techniqueId: string; spellId: string }
> = {
  qingyun: { techniqueId: 'tech-7', spellId: 'spell-3' }, // 青云心法 · 风刃术
  tianmo: { techniqueId: 'tech-1', spellId: 'spell-1' }, // 纳气诀 · 火球术
  wanjian: { techniqueId: 'tech-1', spellId: 'spell-3' }, // 纳气诀 · 风刃术
  yaozu: { techniqueId: 'tech-5', spellId: 'spell-5' } // 玄铁炼体诀 · 木藤术
}

export function getStarterGift(sectId: SectId | string) {
  const gift = SECT_STARTER_GIFTS[sectId as SectId] || SECT_STARTER_GIFTS.qingyun
  const technique =
    TECHNIQUE_CATALOG.find((item) => item.id === gift.techniqueId) ||
    getTechniqueByName('纳气诀')
  const spell =
    SPELL_CATALOG.find((item) => item.id === gift.spellId) || getSpellByName('火球术')
  return { technique, spell }
}
