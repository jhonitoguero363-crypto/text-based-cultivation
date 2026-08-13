export type SectId = 'qingyun' | 'tianmo' | 'wanjian' | 'yaozu'

export interface SectOption {
  id: SectId
  name: string
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
    tag: '正道名门',
    desc: '御剑乘风，清修问道，以正心守正法。',
    base: '驻地青云山',
    tone: 'jade'
  },
  {
    id: 'tianmo',
    name: '天魔宗',
    tag: '魔道巨擘',
    desc: '以杀证道，魔心灼灼，弱肉强食唯强者居。',
    base: '驻地天魔渊',
    tone: 'hp'
  },
  {
    id: 'wanjian',
    name: '万剑宗',
    tag: '剑修圣地',
    desc: '一剑破万法，剑意通玄，锋芒直指九霄。',
    base: '驻地万剑峰',
    tone: 'mp'
  },
  {
    id: 'yaozu',
    name: '妖族',
    tag: '万妖汇聚',
    desc: '血脉觉醒，化形通灵，山林湖海皆为道场。',
    base: '驻地万妖谷',
    tone: 'gold'
  }
]

export function getSectOption(id: SectId | string | null | undefined) {
  return SECT_OPTIONS.find((item) => item.id === id || item.name === id) || null
}
