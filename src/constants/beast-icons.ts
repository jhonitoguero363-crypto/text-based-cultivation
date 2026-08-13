/** 妖兽图标：由 scripts/slice-beast-icons.mjs 自图鉴切片生成 */

export const BEAST_ICON_FILES: Record<string, string> = {
  '青风狼': 'beast-001.png',
  '赤焰兔': 'beast-002.png',
  '黑纹蛇': 'beast-003.png',
  '青灵狐': 'beast-004.png',
  '铁甲熊': 'beast-005.png',
  '月影猫': 'beast-006.png',
  '赤炎狼王': 'beast-007.png',
  '紫电貂': 'beast-008.png',
  '玄甲龟': 'beast-009.png',
  '碧水蛇王': 'beast-010.png',
  '狂暴猿': 'beast-011.png',
  '风翼雕': 'beast-012.png',
  '金翅妖鹰': 'beast-013.png',
  '寒月狐王': 'beast-014.png',
  '炎麟兽': 'beast-015.png',
  '九尾灵猫': 'beast-016.png',
  '黑水蛟': 'beast-017.png',
  '大地魔熊': 'beast-018.png',
  '青木龙': 'beast-019.png',
  '玄冰蛟': 'beast-020.png',
  '雷霆虎王': 'beast-021.png',
  '九幽狼王': 'beast-022.png',
  '赤金狮王': 'beast-023.png',
  '龙血猿': 'beast-024.png',
  '赤焰真龙': 'beast-025.png',
  '太阴玉兔': 'beast-026.png',
  '九天鹏王': 'beast-027.png',
  '幽冥凤凰': 'beast-028.png',
  '万毒蛛皇': 'beast-029.png',
  '山岳巨猿': 'beast-030.png',
  '虚空兽': 'beast-031.png',
  '星辰龙': 'beast-032.png',
  '轮回蝶': 'beast-033.png',
  '太虚鲲': 'beast-034.png',
  '岁月兽': 'beast-035.png',
  '九幽冥龙': 'beast-036.png',
  '混沌麒麟': 'beast-037.png',
  '阴阳神凰': 'beast-038.png',
  '九天应龙': 'beast-039.png',
  '万灵树妖': 'beast-040.png',
  '饕餮': 'beast-041.png',
  '穷奇': 'beast-042.png',
  '鸿蒙祖龙': 'beast-043.png',
  '造化神蝶': 'beast-044.png',
  '九尾天狐': 'beast-045.png',
  '太初玄龟': 'beast-046.png',
  '混沌魔猿': 'beast-047.png',
  '鲲鹏祖兽': 'beast-048.png',
  '九天雷龙': 'beast-049.png',
  '轮回神凰': 'beast-050.png',
  '天命麒麟': 'beast-051.png',
  '虚无神鲲': 'beast-052.png',
  '九幽魔龙': 'beast-053.png',
  '混沌凶兽': 'beast-054.png',
  '鸿蒙神龙': 'beast-055.png',
  '混沌凤凰': 'beast-056.png',
  '无极天狐': 'beast-057.png',
  '世界树灵': 'beast-058.png',
  '太初麒麟': 'beast-059.png',
  '万道祖兽': 'beast-060.png',
}

export const BEAST_ICON_ALIASES: Record<string, string> = {
  '炎鳞兽': '炎麟兽',
  '空空兽': '虚空兽',
  '阴阳神凤': '阴阳神凰',
  '吞噬': '万灵树妖',
}

export const BEAST_REALM_ICON_FALLBACK: Record<string, string> = {
  '炼气': '青风狼',
  '筑基': '赤炎狼王',
  '金丹': '金翅妖鹰',
  '元婴': '青木龙',
  '化神': '赤焰真龙',
  '炼虚': '虚空兽',
  '合体': '混沌麒麟',
  '大乘': '鸿蒙祖龙',
  '渡劫': '九天雷龙',
  '飞升': '鸿蒙神龙',
}

export function resolveBeastIconName(name: string, realm?: string): string | null {
  if (BEAST_ICON_FILES[name]) return name
  const alias = BEAST_ICON_ALIASES[name]
  if (alias && BEAST_ICON_FILES[alias]) return alias
  if (realm) {
    const fb = BEAST_REALM_ICON_FALLBACK[realm]
    if (fb && BEAST_ICON_FILES[fb]) return fb
  }
  return null
}
