/** 丹药图标：由 scripts/slice-pill-icons.mjs 自图鉴切片生成 */

/** 图鉴切片名 → 文件名 */
export const PILL_ICON_FILES: Record<string, string> = {
  '聚气丹': 'pill-001.png',
  '回灵丹': 'pill-002.png',
  '凝血丹': 'pill-003.png',
  '洗髓丹': 'pill-004.png',
  '筑基丹': 'pill-005.png',
  '养魂丹': 'pill-006.png',
  '紫灵丹': 'pill-007.png',
  '金刚丹': 'pill-008.png',
  '结金丹': 'pill-009.png',
  '赤阳丹': 'pill-010.png',
  '太阴丹': 'pill-011.png',
  '九转回元丹': 'pill-012.png',
  '婴灵丹': 'pill-013.png',
  '九窍养神丹': 'pill-014.png',
  '天魂丹': 'pill-015.png',
  '万灵丹': 'pill-016.png',
  '化神丹': 'pill-017.png',
  '天元丹': 'pill-018.png',
  '涅槃丹': 'pill-019.png',
  '九转玄丹': 'pill-020.png',
  '虚空丹': 'pill-021.png',
  '太虚悟道丹': 'pill-022.png',
  '逆命丹': 'pill-023.png',
  '九转轮回丹': 'pill-024.png',
  '合道丹': 'pill-025.png',
  '混元丹': 'pill-026.png',
  '阴阳造化丹': 'pill-027.png',
  '天命丹': 'pill-028.png',
  '大乘丹': 'pill-029.png',
  '万道丹': 'pill-030.png',
  '造化神丹': 'pill-031.png',
  '九天玄丹': 'pill-032.png',
  '渡劫丹': 'pill-033.png',
  '雷元丹': 'pill-034.png',
  '九死还魂丹': 'pill-035.png',
  '偷天丹': 'pill-036.png',
  '飞升丹': 'pill-037.png',
  '九转仙丹': 'pill-038.png',
  '鸿蒙悟道丹': 'pill-039.png',
  '太初神丹': 'pill-040.png',
  '无极道丹': 'pill-041.png',
}

export const PILL_ICON_ALIASES: Record<string, string> = {
  '回元丹': '九转回元丹',
  '九转丹': '九转回元丹',
}

export function resolvePillIconName(name: string): string | null {
  if (PILL_ICON_FILES[name]) return name
  const alias = PILL_ICON_ALIASES[name]
  if (alias && PILL_ICON_FILES[alias]) return alias
  return null
}
