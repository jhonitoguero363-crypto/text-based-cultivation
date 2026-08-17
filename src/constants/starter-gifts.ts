import { getSpellByName, SPELL_CATALOG } from './spell-catalog'
import type { SectId } from './sects'
import { getTechniqueByName, TECHNIQUE_CATALOG } from './technique-catalog'

/**
 * 入门免费赠送：宗门特色功法（黄阶下品/青云传承）+ 基础法术
 * - 青云宗：青云心法（正道传承）
 * - 天魔宗：血煞诀（魔修）
 * - 万剑宗：基础剑诀（剑修）
 * - 妖族：妖灵炼体诀（妖族）
 */
export const SECT_STARTER_GIFTS: Record<
  SectId,
  { techniqueId: string; spellId: string }
> = {
  qingyun: { techniqueId: 'tech-7', spellId: 'spell-3' }, // 青云心法 · 风刃术
  tianmo: { techniqueId: 'tech-43', spellId: 'spell-1' }, // 血煞诀 · 火球术
  wanjian: { techniqueId: 'tech-63', spellId: 'spell-3' }, // 基础剑诀 · 风刃术
  yaozu: { techniqueId: 'tech-53', spellId: 'spell-5' } // 妖灵炼体诀 · 木藤术
}

export function getStarterGift(sectId: SectId | string) {
  const gift = SECT_STARTER_GIFTS[sectId as SectId] || SECT_STARTER_GIFTS.qingyun
  const technique =
    TECHNIQUE_CATALOG.find((item) => item.id === gift.techniqueId) ||
    getTechniqueByName('青云心法')
  const spell =
    SPELL_CATALOG.find((item) => item.id === gift.spellId) || getSpellByName('火球术')
  return { technique, spell }
}
