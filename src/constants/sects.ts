export type SectId = 'qingyun' | 'tianmo' | 'wanjian' | 'yaozu'

/** 势力等级（由低到高） */
export const SECT_TIERS = ['三流势力', '二流势力', '一流势力', '圣地'] as const

export type SectTier = (typeof SECT_TIERS)[number]

export interface SectTierDef {
  tier: SectTier
  /** 1 最低，4 最高 */
  rank: number
  brief: string
  desc: string
}

/** 势力等级说明 */
export const SECT_TIER_DEFS: SectTierDef[] = [
  {
    tier: '三流势力',
    rank: 1,
    brief: '地方小宗',
    desc: '势力局限于一州一郡，底蕴尚浅，弟子多在炼气～筑基，难入修仙界主流舞台。'
  },
  {
    tier: '二流势力',
    rank: 2,
    brief: '一方强宗',
    desc: '可镇守一域，有金丹、元婴坐镇，参与区域纷争与秘境争夺。'
  },
  {
    tier: '一流势力',
    rank: 3,
    brief: '名门正宗',
    desc: '威震一方乃至数域，化神、炼虚辈出，传承完整、灵脉深厚，为修仙界中流砥柱。'
  },
  {
    tier: '圣地',
    rank: 4,
    brief: '至高圣地',
    desc: '超然于诸宗之上，法则传承与天材地宝冠绝，可左右天下格局。'
  }
]

/** 宗门派系 */
export const SECT_FACTIONS = ['正道', '魔门', '妖族'] as const

export type SectFaction = (typeof SECT_FACTIONS)[number]

export interface SectFactionDef {
  faction: SectFaction
  brief: string
  desc: string
}

/** 派系说明 */
export const SECT_FACTION_DEFS: SectFactionDef[] = [
  {
    faction: '正道',
    brief: '清修守序',
    desc: '以正心问道、护佑苍生为宗，讲究传承与戒律，功法多循天地正理。'
  },
  {
    faction: '魔门',
    brief: '以杀证道',
    desc: '唯强者居、以欲炼心，修为进取迅猛，行事不拘世俗善恶。'
  },
  {
    faction: '妖族',
    brief: '血脉通灵',
    desc: '依血脉觉醒与化形通灵修炼，山林湖海皆可为道场，族群意识鲜明。'
  }
]

export interface SectOption {
  id: SectId
  name: string
  /** 势力等级：三流 / 二流 / 一流 / 圣地 */
  tier: SectTier
  /** 派系：正道 / 魔门 / 妖族 */
  faction: SectFaction
  /** 定位短标签（UI 展示） */
  tag: string
  desc: string
  base: string
  tone: 'gold' | 'hp' | 'mp' | 'jade'
}

/** 可选宗门列表 */
export const SECT_OPTIONS: SectOption[] = [
  {
    id: 'qingyun',
    name: '青云宗',
    tier: '一流势力',
    faction: '正道',
    tag: '名门正宗',
    desc: '御剑乘风，清修问道，以正心守正法。',
    base: '驻地青云山',
    tone: 'jade'
  },
  {
    id: 'tianmo',
    name: '天魔宗',
    tier: '一流势力',
    faction: '魔门',
    tag: '魔心灼灼',
    desc: '以杀证道，魔心灼灼，弱肉强食唯强者居。',
    base: '驻地天魔渊',
    tone: 'hp'
  },
  {
    id: 'wanjian',
    name: '万剑宗',
    tier: '圣地',
    faction: '正道',
    tag: '剑修圣地',
    desc: '一剑破万法，剑意通玄，锋芒直指九霄。',
    base: '驻地万剑峰',
    tone: 'mp'
  },
  {
    id: 'yaozu',
    name: '妖族',
    tier: '一流势力',
    faction: '妖族',
    tag: '万妖汇聚',
    desc: '血脉觉醒，化形通灵，山林湖海皆为道场。',
    base: '驻地万妖谷',
    tone: 'gold'
  }
]

export function getSectTierDef(tier: SectTier | string | null | undefined) {
  return SECT_TIER_DEFS.find((item) => item.tier === tier) || null
}

export function getSectFactionDef(faction: SectFaction | string | null | undefined) {
  return SECT_FACTION_DEFS.find((item) => item.faction === faction) || null
}

export function getSectOption(id: SectId | string | null | undefined) {
  return SECT_OPTIONS.find((item) => item.id === id || item.name === id) || null
}

export function getSectTierRank(tier: SectTier | string | null | undefined) {
  return getSectTierDef(tier)?.rank || 0
}
