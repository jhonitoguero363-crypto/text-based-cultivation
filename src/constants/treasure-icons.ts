/** 法宝图标：由 scripts/slice-treasure-icons.mjs 自图鉴切片生成 */

/** 图鉴切片名 → 文件名 */
export const TREASURE_ICON_FILES: Record<string, string> = {
  '青竹剑': 'treasure-001.png',
  '聚灵葫': 'treasure-002.png',
  '镇魂铃': 'treasure-003.png',
  '紫云剑': 'treasure-004.png',
  '九转灵珠': 'treasure-005.png',
  '山河印': 'treasure-006.png',
  '金乌羽': 'treasure-007.png',
  '太阴镜': 'treasure-008.png',
  '五行轮': 'treasure-009.png',
  '通天剑匣': 'treasure-010.png',
  '九龙神火罩': 'treasure-011.png',
  '玄冥珠': 'treasure-012.png',
  '斩仙飞刀': 'treasure-013.png',
  '太虚神舟': 'treasure-014.png',
  '万魂幡': 'treasure-015.png',
  '虚空镜': 'treasure-016.png',
  '时砂': 'treasure-017.png',
  '因果笔': 'treasure-018.png',
  '阴阳天盘': 'treasure-019.png',
  '混沌钟': 'treasure-020.png',
  '诛仙剑阵': 'treasure-021.png',
  '山河社稷图': 'treasure-022.png',
  '六道轮回盘': 'treasure-023.png',
  '天机榜': 'treasure-024.png',
  '九天雷印': 'treasure-025.png',
  '逆命剑': 'treasure-026.png',
  '天劫伞': 'treasure-027.png',
  '鸿蒙珠': 'treasure-028.png',
  '天道书': 'treasure-029.png',
  '无名道碑': 'treasure-030.png',
  '无极道碑': 'treasure-031.png',
  '太初神剑': 'treasure-032.png',
}

export const TREASURE_ICON_ALIASES: Record<string, string> = {
  '青竹剑器': '青竹剑',
  '聚灵葫芦': '聚灵葫',
  '山河社稷图卷': '山河社稷图',
}

export const TREASURE_GRADE_ICON_FALLBACK: Record<string, string> = {
  '下品法器': '青竹剑',
  '中品法器': '紫云剑',
  '上品法器': '山河印',
  '法器': '青竹剑',
  '灵器': '金乌羽',
  '极品灵器': '通天剑匣',
  '仙器': '斩仙飞刀',
  '道器': '阴阳天盘',
  '镇界神器': '山河社稷图',
  '先天至宝': '鸿蒙珠',
}

export function resolveTreasureIconName(name: string, grade?: string): string | null {
  if (TREASURE_ICON_FILES[name]) return name
  const alias = TREASURE_ICON_ALIASES[name]
  if (alias && TREASURE_ICON_FILES[alias]) return alias
  if (grade) {
    const fb = TREASURE_GRADE_ICON_FALLBACK[grade]
    if (fb && TREASURE_ICON_FILES[fb]) return fb
  }
  return null
}
