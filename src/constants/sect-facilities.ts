import type { SectId } from './sects'

export interface SectFacility {
  key: string
  name: string
  desc: string
  icon: string
  path: string
}

/** 各宗共用设施（不含特色建筑） */
export const SHARED_SECT_FACILITIES: SectFacility[] = [
  { key: 'pill', name: '丹阁', desc: '炼制金丹', icon: '🍵', path: '/pages/sect/pill' },
  { key: 'forge', name: '器阁', desc: '神兵锻造', icon: '⚒️', path: '/pages/sect/forge' },
  { key: 'tech', name: '功法阁', desc: '秘籍研习', icon: '📜', path: '/pages/sect/technique' },
  { key: 'cave', name: '洞府', desc: '闭关吐纳', icon: '🏡', path: '/pages/sect/cave' },
  { key: 'mission', name: '任务堂', desc: '宗门贡献', icon: '⚔️', path: '/pages/sect/mission' },
  { key: 'members', name: '人物', desc: '同门名录', icon: '👤', path: '/pages/sect/members' },
  { key: 'mine', name: '矿洞', desc: '挖矿取石', icon: '⛏️', path: '/pages/sect/mine' },
  { key: 'garden', name: '药园', desc: '培育灵草', icon: '🌿', path: '/pages/sect/garden' },
  { key: 'cliff', name: '思过崖', desc: '面壁受罚', icon: '⛰️', path: '/pages/sect/cliff' }
]

/** 各宗特色建筑（功能后续补充） */
export const SECT_LANDMARK_FACILITIES: Record<SectId, SectFacility> = {
  qingyun: {
    key: 'tower',
    name: '镇妖塔',
    desc: '镇压妖兽',
    icon: '🏯',
    path: '/pages/sect/tower'
  },
  tianmo: {
    key: 'demon_den',
    name: '魔窟',
    desc: '魔气杀伐',
    icon: '🕳️',
    path: '/pages/sect/demon-den'
  },
  wanjian: {
    key: 'sword_tomb',
    name: '剑冢',
    desc: '问剑悟道',
    icon: '⚔️',
    path: '/pages/sect/sword-tomb'
  },
  yaozu: {
    key: 'ancestor_pool',
    name: '返祖池',
    desc: '首次涨根骨 · 其后修为',
    icon: '🌀',
    path: '/pages/sect/ancestor-pool'
  }
}

const BEAST_FACILITY: SectFacility = {
  key: 'beast',
  name: '灵兽阁',
  desc: '售灵宠·收灵兽',
  icon: '🐉',
  path: '/pages/sect/beast'
}

/** 按宗门组装设施列表：共用 + 特色建筑 + 灵兽阁 */
export function getSectFacilities(sectId: SectId | string | null | undefined): SectFacility[] {
  const landmark =
    sectId && sectId in SECT_LANDMARK_FACILITIES
      ? SECT_LANDMARK_FACILITIES[sectId as SectId]
      : null
  return [...SHARED_SECT_FACILITIES, ...(landmark ? [landmark] : []), BEAST_FACILITY]
}

export function sectHasFacility(
  sectId: SectId | string | null | undefined,
  facilityKey: string
) {
  return getSectFacilities(sectId).some((item) => item.key === facilityKey)
}
