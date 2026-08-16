import type { SectId } from './sects'
import { QINGYUN_EXTRA_MEMBERS } from './member-catalog-qingyun-extra'
import { TIANMO_MEMBERS } from './member-catalog-tianmo'
import { WANJIAN_MEMBERS } from './member-catalog-wanjian'
import { YAOZU_MEMBERS } from './member-catalog-yaozu'

/** 宗门身份层级（由高到低） */
export type MemberGroup =
  | '宗主'
  | '长老'
  | '执事'
  | '亲传弟子'
  | '内门弟子'
  | '外门弟子'
  | '杂役弟子'

/** 宗门设施归属（可未划分） */
export type MemberDivision = '丹阁' | '器阁' | '灵兽阁' | '药园' | '矿洞' | '未划分'

export interface CatalogMember {
  id: string
  name: string
  title: string
  realm: string
  power: number
  avatar: string
  tone: string
  group: MemberGroup
  /** 丹阁 / 器阁 / 灵兽阁 / 药园 / 矿洞 / 未划分 */
  division: MemberDivision
  personality: string
  specialty: string
  /** 隐藏设定或补充说明 */
  note: string
  /** 对玩家态度 */
  attitude: string
  sectId: SectId
}

type CatalogMemberDraft = Omit<CatalogMember, 'division'>

export const MEMBER_GROUP_ORDER: MemberGroup[] = [
  '宗主',
  '长老',
  '执事',
  '亲传弟子',
  '内门弟子',
  '外门弟子',
  '杂役弟子'
]

export const MEMBER_GROUPS: Array<MemberGroup | '全部'> = ['全部', ...MEMBER_GROUP_ORDER]

export const MEMBER_DIVISION_ORDER: MemberDivision[] = [
  '丹阁',
  '器阁',
  '灵兽阁',
  '药园',
  '矿洞',
  '未划分'
]

export const MEMBER_DIVISIONS: Array<MemberDivision | '全部'> = ['全部', ...MEMBER_DIVISION_ORDER]

/** 按头衔、专长、备注推断设施归属 */
export function inferMemberDivision(
  member: Pick<CatalogMemberDraft, 'title' | 'specialty' | 'note'>
): MemberDivision {
  const text = `${member.title}${member.specialty}${member.note || ''}`
  if (/丹阁|丹房|炼丹|丹方|丹渣|晒药|清扫丹渣|魔丹|妖丹|剑丹/.test(text)) return '丹阁'
  if (/器阁|器房|炼器|锤锻|器屑|矿料|收拾器屑|骨兵|铸剑|骨甲/.test(text)) return '器阁'
  if (/灵兽|兽栏|饲灵禽|喂养灵|草料|灵禽|灵鸡|清理兽栏|魔兽|饲魔禽|剑灵/.test(text)) {
    return '灵兽阁'
  }
  if (/矿洞|挖矿|采矿|矿石运|运料/.test(text)) return '矿洞'
  if (/药园|灵田|灵泉|菜畦|菜园|晒谷|督耕|灌溉|灵药|药材|药泉|施肥|粪肥|医术|医理|毒田|魔药|医剑|药谷/.test(text)) {
    return '药园'
  }
  return '未划分'
}

function withDivision(members: CatalogMemberDraft[]): CatalogMember[] {
  return members.map((item) => ({
    ...item,
    division: inferMemberDivision(item)
  }))
}

/** 由职位/身份文案推断分组 */
export function memberGroupFromTitle(title: string): MemberGroup {
  if (/杂役/.test(title)) return '杂役弟子'
  if (/亲传/.test(title)) return '亲传弟子'
  if (/内门/.test(title)) return '内门弟子'
  if (/外门/.test(title)) return '外门弟子'
  if (/执法弟子/.test(title)) return '内门弟子'
  if (/执事|堂主|管事/.test(title)) return '执事'
  if (/长老/.test(title)) return '长老'
  if (/宗主|掌门/.test(title)) return '宗主'
  return '外门弟子'
}

/** 各宗门人物名录（青云 / 天魔 / 万剑 / 妖族结构对齐） */
const SECT_MEMBER_CATALOG_DRAFT: CatalogMemberDraft[] = [
  {
    id: 'qy-1',
    name: '沈天玄',
    title: '青云宗宗主',
    realm: '化神后期',
    power: 253000,
    avatar: '沈',
    tone: 'gold',
    group: '宗主',
    personality: '沉稳、威严',
    specialty: '剑道、宗门管理',
    note: '曾经斩杀过一位渡劫魔修',
    attitude: '中立',
    sectId: 'qingyun'
  },
  {
    id: 'qy-2',
    name: '柳清寒',
    title: '副宗主',
    realm: '化神中期',
    power: 220000,
    avatar: '柳',
    tone: 'gold',
    group: '宗主',
    personality: '冷静、理智',
    specialty: '冰系功法',
    note: '表面冷漠，实际极其护短',
    attitude: '中立',
    sectId: 'qingyun'
  },
  {
    id: 'qy-3',
    name: '顾长风',
    title: '大长老',
    realm: '元婴后期',
    power: 138000,
    avatar: '顾',
    tone: 'mp',
    group: '长老',
    personality: '严厉、古板',
    specialty: '炼丹',
    note: '年轻时曾欠宗主一条命',
    attitude: '中立',
    sectId: 'qingyun'
  },
  {
    id: 'qy-4',
    name: '苏灵月',
    title: '二长老',
    realm: '元婴中期',
    power: 120000,
    avatar: '苏',
    tone: 'mp',
    group: '长老',
    personality: '温柔、聪慧',
    specialty: '灵药、医术',
    note: '掌握一处隐藏药园',
    attitude: '中立',
    sectId: 'qingyun'
  },
  {
    id: 'qy-5',
    name: '韩铁山',
    title: '三长老',
    realm: '元婴后期',
    power: 138000,
    avatar: '韩',
    tone: 'mp',
    group: '长老',
    personality: '豪爽、直率',
    specialty: '炼器',
    note: '收藏大量上古矿石',
    attitude: '中立',
    sectId: 'qingyun'
  },
  {
    id: 'qy-6',
    name: '莫问道',
    title: '四长老',
    realm: '元婴中期',
    power: 120000,
    avatar: '莫',
    tone: 'mp',
    group: '长老',
    personality: '神秘、寡言',
    specialty: '阵法',
    note: '能预测部分未来',
    attitude: '中立',
    sectId: 'qingyun'
  },
  {
    id: 'qy-7',
    name: '林玄机',
    title: '五长老',
    realm: '元婴初期',
    power: 102000,
    avatar: '林',
    tone: 'mp',
    group: '长老',
    personality: '懒散、爱喝酒',
    specialty: '占卜、天机术',
    note: '实际实力远超表面',
    attitude: '中立',
    sectId: 'qingyun'
  },
  {
    id: 'qy-9',
    name: '白无尘',
    title: '执法长老',
    realm: '元婴初期',
    power: 102000,
    avatar: '白',
    tone: 'mp',
    group: '长老',
    personality: '铁面无私',
    specialty: '审讯、追踪',
    note: '',
    attitude: '中立',
    sectId: 'qingyun'
  },
  {
    id: 'qy-8',
    name: '秦无夜',
    title: '执法堂堂主',
    realm: '金丹后期',
    power: 82800,
    avatar: '秦',
    tone: 'hp',
    group: '执事',
    personality: '冷酷、公正',
    specialty: '执法、剑术',
    note: '',
    attitude: '严格',
    sectId: 'qingyun'
  },
  {
    id: 'qy-12',
    name: '赵德厚',
    title: '杂务执事',
    realm: '金丹初期',
    power: 61200,
    avatar: '赵',
    tone: 'jade',
    group: '执事',
    personality: '勤恳、琐碎',
    specialty: '庶务、账册',
    note: '经手外门杂役调配',
    attitude: '中立',
    sectId: 'qingyun'
  },
  {
    id: 'qy-13',
    name: '云疏白',
    title: '亲传弟子',
    realm: '金丹初期',
    power: 61200,
    avatar: '云',
    tone: 'gold',
    group: '亲传弟子',
    personality: '清傲、好胜',
    specialty: '剑道',
    note: '宗主亲传，锋芒初露',
    attitude: '冷淡',
    sectId: 'qingyun'
  },
  {
    id: 'qy-14',
    name: '江晚晴',
    title: '亲传弟子',
    realm: '筑基大圆满',
    power: 35000,
    avatar: '江',
    tone: 'gold',
    group: '亲传弟子',
    personality: '温婉、聪慧',
    specialty: '水系功法',
    note: '副宗主座下亲传',
    attitude: '友善',
    sectId: 'qingyun'
  },
  {
    id: 'qy-10',
    name: '周烈',
    title: '执法弟子',
    realm: '筑基后期',
    power: 32200,
    avatar: '周',
    tone: 'hp',
    group: '内门弟子',
    personality: '暴躁',
    specialty: '近战',
    note: '',
    attitude: '容易与玩家冲突',
    sectId: 'qingyun'
  },
  {
    id: 'qy-11',
    name: '叶青璃',
    title: '执法弟子',
    realm: '筑基中期',
    power: 28000,
    avatar: '叶',
    tone: 'hp',
    group: '内门弟子',
    personality: '认真',
    specialty: '调查、追踪',
    note: '',
    attitude: '对玩家较友善',
    sectId: 'qingyun'
  },
  {
    id: 'qy-15',
    name: '陆沉舟',
    title: '内门弟子',
    realm: '筑基初期',
    power: 23800,
    avatar: '陆',
    tone: 'jade',
    group: '内门弟子',
    personality: '沉稳、寡言',
    specialty: '土系防御',
    note: '常年镇守宗门后山',
    attitude: '中立',
    sectId: 'qingyun'
  },
  {
    id: 'qy-16',
    name: '陈小满',
    title: '外门弟子',
    realm: '炼气后期',
    power: 6900,
    avatar: '陈',
    tone: 'jade',
    group: '外门弟子',
    personality: '活泼、热心',
    specialty: '跑腿打听',
    note: '消息灵通',
    attitude: '友善',
    sectId: 'qingyun'
  },
  {
    id: 'qy-17',
    name: '何青禾',
    title: '外门弟子',
    realm: '炼气中期',
    power: 6000,
    avatar: '何',
    tone: 'jade',
    group: '外门弟子',
    personality: '踏实、勤勉',
    specialty: '药园劳作',
    note: '一心想入内门',
    attitude: '友善',
    sectId: 'qingyun'
  },
  {
    id: 'qy-18',
    name: '阿福',
    title: '杂役弟子',
    realm: '炼气一层',
    power: 5100,
    avatar: '阿',
    tone: 'jade',
    group: '杂役弟子',
    personality: '憨厚',
    specialty: '砍柴挑水',
    note: '宗门杂役数年',
    attitude: '友善',
    sectId: 'qingyun'
  },
  {
    id: 'qy-19',
    name: '小翠',
    title: '杂役弟子',
    realm: '炼气二层',
    power: 5400,
    avatar: '翠',
    tone: 'jade',
    group: '杂役弟子',
    personality: '机灵、嘴碎',
    specialty: '洒扫、传话',
    note: '常在膳堂附近转悠',
    attitude: '中立',
    sectId: 'qingyun'
  },
  ...QINGYUN_EXTRA_MEMBERS as CatalogMemberDraft[],
  ...(TIANMO_MEMBERS as CatalogMemberDraft[]),
  ...(WANJIAN_MEMBERS as CatalogMemberDraft[]),
  ...(YAOZU_MEMBERS as CatalogMemberDraft[])
]

export const SECT_MEMBER_CATALOG: CatalogMember[] = withDivision(SECT_MEMBER_CATALOG_DRAFT)

export function getSectMembers(sectId: SectId | string | null | undefined) {
  if (!sectId) return []
  return SECT_MEMBER_CATALOG.filter((item) => item.sectId === sectId)
}

export function getMembersByDivision(sectId: SectId | string | null | undefined, division: MemberDivision) {
  return getSectMembers(sectId).filter((item) => item.division === division)
}

export function getMemberById(id: string) {
  return SECT_MEMBER_CATALOG.find((item) => item.id === id) || null
}
