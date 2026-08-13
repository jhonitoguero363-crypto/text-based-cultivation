/** 灵宠图标：由 scripts/slice-pet-icons.mjs 自图鉴切片生成 */

export const PET_ICON_FILES: Record<string, string> = {
  '青灵狐': 'pet-001.png',
  '赤焰兔': 'pet-002.png',
  '金羽雀': 'pet-003.png',
  '月影猫': 'pet-004.png',
  '紫电貂': 'pet-005.png',
  '玄甲龟': 'pet-006.png',
  '碧水蛇': 'pet-007.png',
  '赤炎狼': 'pet-008.png',
  '金翅鹰': 'pet-009.png',
  '寒月狐': 'pet-010.png',
  '炎麟兽': 'pet-011.png',
  '九尾灵猫': 'pet-012.png',
  '青木龙': 'pet-013.png',
  '玄冰蛟': 'pet-014.png',
  '雷霆虎': 'pet-015.png',
  '九幽狼': 'pet-016.png',
  '赤焰真龙': 'pet-017.png',
  '太阴玉兔': 'pet-018.png',
  '九天鹏': 'pet-019.png',
  '幽冥凤凰': 'pet-020.png',
  '虚空兽': 'pet-021.png',
  '星辰龙': 'pet-022.png',
  '轮回蝶': 'pet-023.png',
  '太虚鲲': 'pet-024.png',
  '混沌麒麟': 'pet-025.png',
  '阴阳神凰': 'pet-026.png',
  '九天应龙': 'pet-027.png',
  '万灵树妖': 'pet-028.png',
  '鸿蒙祖龙': 'pet-029.png',
  '造化神蝶': 'pet-030.png',
  '九尾天狐': 'pet-031.png',
  '太初玄龟': 'pet-032.png',
  '九天雷龙': 'pet-033.png',
  '轮回神凰': 'pet-034.png',
  '天命麒麟': 'pet-035.png',
  '虚无神鲲': 'pet-036.png',
  '鸿蒙神龙': 'pet-037.png',
  '混沌凤凰': 'pet-038.png',
  '无极天狐': 'pet-039.png',
  '世界树灵': 'pet-040.png',
  '太初麒麟': 'pet-041.png',
}

export const PET_ICON_ALIASES: Record<string, string> = {
  '碧水蛇王': '碧水蛇',
  '赤炎狼王': '赤炎狼',
  '金翅妖鹰': '金翅鹰',
  '寒月狐王': '寒月狐',
  '炎鳞兽': '炎麟兽',
  '雷霆虎王': '雷霆虎',
  '九幽狼王': '九幽狼',
  '九天鹏王': '九天鹏',
  '空空兽': '虚空兽',
  '阴阳神凤': '阴阳神凰',
}

export const PET_REALM_ICON_FALLBACK: Record<string, string> = {
  '炼气': '青灵狐',
  '筑基': '紫电貂',
  '金丹': '金翅鹰',
  '元婴': '青木龙',
  '化神': '赤焰真龙',
  '炼虚': '虚空兽',
  '合体': '混沌麒麟',
  '大乘': '鸿蒙祖龙',
  '渡劫': '九天雷龙',
  '飞升': '鸿蒙神龙',
}

export function resolvePetIconName(name: string, realm?: string): string | null {
  if (PET_ICON_FILES[name]) return name
  const alias = PET_ICON_ALIASES[name]
  if (alias && PET_ICON_FILES[alias]) return alias
  if (realm) {
    const fb = PET_REALM_ICON_FALLBACK[realm]
    if (fb && PET_ICON_FILES[fb]) return fb
  }
  return null
}
