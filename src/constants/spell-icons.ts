/** 法术图标：由 scripts/slice-spell-icons.mjs 自图鉴切片生成 */

export const SPELL_ICON_FILES: Record<string, string> = {
  '炼丹术': 'spell-001.png',
  '炼器术': 'spell-002.png',
  '火球术': 'spell-003.png',
  '水箭术': 'spell-004.png',
  '风刃术': 'spell-005.png',
  '地刺术': 'spell-006.png',
  '木藤术': 'spell-007.png',
  '冰箭术': 'spell-008.png',
  '雷光术': 'spell-009.png',
  '灵盾术': 'spell-010.png',
  '疾风步': 'spell-011.png',
  '灵目术': 'spell-012.png',
  '赤炎掌': 'spell-013.png',
  '寒冰刺': 'spell-014.png',
  '紫雷击': 'spell-015.png',
  '狂风刃': 'spell-016.png',
  '地裂术': 'spell-017.png',
  '青木缠绕': 'spell-018.png',
  '烈焰风暴': 'spell-019.png',
  '雷火爆': 'spell-020.png',
  '五行剑气': 'spell-021.png',
  '金刚护体': 'spell-022.png',
  '九霄雷法': 'spell-023.png',
  '玄冰领域': 'spell-024.png',
  '青帝回春术': 'spell-025.png',
  '赤炎天火': 'spell-026.png',
  '大地镇压': 'spell-027.png',
  '万剑归宗': 'spell-028.png',
  '雷狱': 'spell-029.png',
  '九幽魂刺': 'spell-030.png',
  '五行逆转': 'spell-031.png',
  '天罡护体': 'spell-032.png',
  '太虚剑气': 'spell-033.png',
  '九天神雷': 'spell-034.png',
  '凤凰涅槃': 'spell-035.png',
  '万魂噬天': 'spell-036.png',
  '星陨术': 'spell-037.png',
  '虚空大手印': 'spell-038.png',
  '天剑降世': 'spell-039.png',
  '九幽冥火': 'spell-040.png',
  '万雷天牢': 'spell-041.png',
  '乾坤挪移': 'spell-042.png',
  '九天仙雷': 'spell-043.png',
  '太阴仙光': 'spell-044.png',
  '太阳真火': 'spell-045.png',
  '仙剑斩天': 'spell-046.png',
  '万界传送': 'spell-047.png',
  '时间回溯': 'spell-048.png',
  '六道仙轮': 'spell-049.png',
  '鸿蒙神雷': 'spell-050.png',
  '混沌仙火': 'spell-051.png',
  '万道归墟': 'spell-052.png',
}

export const SPELL_ICON_ALIASES: Record<string, string> = {
  '疾风术': '疾风步',
  '灵目': '灵目术',
  '火球': '火球术',
  '水箭': '水箭术',
}

export function resolveSpellIconName(name: string): string | null {
  if (SPELL_ICON_FILES[name]) return name
  const alias = SPELL_ICON_ALIASES[name]
  if (alias && SPELL_ICON_FILES[alias]) return alias
  return null
}
