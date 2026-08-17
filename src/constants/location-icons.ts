/** 历练地点图标：由 scripts/slice-location-icons.mjs 自 atlas 切片生成 */

export const LOCATION_ICON_FILES: Record<string, string> = {
  '青云山': 'loc-001.png',
  '黑风林': 'loc-002.png',
  '落霞谷': 'loc-003.png',
  '寒潭洞': 'loc-004.png',
  '赤炎山脉': 'loc-005.png',
  '百兽岭': 'loc-006.png',
  '青木秘境': 'loc-007.png',
  '断剑谷': 'loc-008.png',
  '万妖森林': 'loc-009.png',
  '地火洞': 'loc-010.png',
  '紫云秘境': 'loc-011.png',
  '古剑冢': 'loc-012.png',
  '九幽谷': 'loc-013.png',
  '天雷崖': 'loc-014.png',
  '沧海遗迹': 'loc-015.png',
  '龙骨荒原': 'loc-016.png',
  '太虚秘境': 'loc-017.png',
  '星陨海': 'loc-018.png',
  '凤凰遗墟': 'loc-019.png',
  '万魂古墓': 'loc-020.png',
  '虚空裂谷': 'loc-021.png',
  '岁月长河': 'loc-022.png',
  '轮回古境': 'loc-023.png',
  '无尽星域': 'loc-024.png',
  '混沌海': 'loc-025.png',
  '阴阳天池': 'loc-026.png',
}

export function resolveLocationIconName(name: string): string | null {
  if (LOCATION_ICON_FILES[name]) return name
  return null
}
