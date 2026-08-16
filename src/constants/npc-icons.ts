/** 历练人物头像：由 scripts/slice-npc-icons.mjs 自图鉴切片生成 */

export const NPC_ICON_FILES: Record<string, string> = {
  '林青竹': 'npc-001.png',
  '苏晚晴': 'npc-002.png',
  '李玄风': 'npc-003.png',
  '顾少陵': 'npc-004.png',
  '沈月璃': 'npc-005.png',
  '赵天河': 'npc-006.png',
  '慕容雪': 'npc-007.png',
  '楚狂歌': 'npc-008.png',
  '洛神音': 'npc-009.png',
  '白无涯': 'npc-010.png',
  '王老三': 'npc-011.png',
  '陈平': 'npc-012.png',
  '柳如烟': 'npc-013.png',
  '周青': 'npc-014.png',
  '魏无忌': 'npc-015.png',
  '赵老鬼': 'npc-016.png',
  '宁道远': 'npc-017.png',
  '魏长生': 'npc-018.png',
  '莫天行': 'npc-019.png',
  '老乞丐': 'npc-020.png',
  '钱多多': 'npc-021.png',
  '铁算盘': 'npc-022.png',
  '百宝道人': 'npc-023.png',
  '灵兽商人': 'npc-024.png',
  '鬼市商人': 'npc-025.png',
  '天机商人': 'npc-026.png',
  '万界商客': 'npc-027.png',
  '血刀客': 'npc-028.png',
  '黑煞': 'npc-029.png',
  '血无痕': 'npc-030.png',
  '鬼面道人': 'npc-031.png',
  '赤炼老魔': 'npc-032.png',
  '黑袍道人': 'npc-033.png',
  '血海老祖': 'npc-034.png',
  '无心魔君': 'npc-035.png',
  '天魔子': 'npc-036.png',
  '无相魔尊': 'npc-037.png',
  '卖酒老人': 'npc-038.png',
  '瘸腿老人': 'npc-039.png',
  '白发道人': 'npc-040.png',
  '老乞少女': 'npc-041.png',
  '守墓人': 'npc-042.png',
  '钓鱼老翁': 'npc-043.png',
  '采药少女': 'npc-044.png',
  '黑猫少年': 'npc-045.png',
  '无名剑客': 'npc-046.png',
  '棋盘老人': 'npc-047.png',
  '失忆少女': 'npc-048.png',
  '受伤剑客': 'npc-049.png',
  '被追杀少年': 'npc-050.png',
  '灵宠少女': 'npc-051.png',
  '神秘商队': 'npc-052.png',
  '宗门叛徒': 'npc-053.png',
  '妖族使者': 'npc-054.png',
  '魔宗卧底': 'npc-055.png',
  '上古残魂': 'npc-056.png',
  '天外来客': 'npc-057.png',
}

export const NPC_ICON_ALIASES: Record<string, string> = {
  '李玄凤': '李玄风',
  '沈月琉': '沈月璃',
}

export function resolveNpcIconName(name: string): string | null {
  if (NPC_ICON_FILES[name]) return name
  const alias = NPC_ICON_ALIASES[name]
  if (alias && NPC_ICON_FILES[alias]) return alias
  return null
}
