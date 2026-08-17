import { estimateCombatPowerForRealm } from './combat-power'
import {
  memberGroupFromTitle,
  type CatalogMember,
  type MemberGroup
} from './member-catalog'
import type { RealmMajor } from './realm'
import {
  formatRootBoneLabel,
  resolveJoinRankFromRoots,
  rollRootBones,
  type RootBone
} from './roots'
import { getSectOption, getSectTierRank, type SectId } from './sects'

const SURNAMES =
  '赵钱孙李周吴郑王冯陈褚卫蒋沈韩杨朱秦尤许何吕施张孔曹严华金魏陶姜戚谢邹喻柏水窦章云苏潘葛奚范彭郎鲁韦昌马苗凤花方俞任袁柳酆鲍史唐费廉岑薛雷贺倪汤滕殷罗毕郝邬安常乐于时傅皮卞齐康伍余元卜顾孟平黄和穆萧尹姚邵湛汪祁毛禹狄米贝明臧计伏成戴谈宋茅庞熊纪舒屈项祝董梁杜阮蓝闵席季麻强贾路娄危江童颜郭梅盛林刁钟徐邱骆高夏蔡田樊胡凌霍虞万支柯昝管卢莫经房裘缪干解应宗丁宣贲邓郁单杭洪包诸左石崔吉钮龚'.split(
    ''
  )

const GIVEN_MALE = [
  '云深',
  '清风',
  '无尘',
  '玄机',
  '长歌',
  '怀瑾',
  '明远',
  '子昂',
  '景行',
  '望舒',
  '问天',
  '承泽',
  '沐阳',
  '砚舟',
  '听潮',
  '鹤归',
  '青崖',
  '白羽',
  '寒江',
  '砚溪',
  '书简',
  '远山',
  '若水',
  '知玄',
  '凌霄',
  '破军',
  '星河',
  '夜白',
  '沉舟',
  '归鸿'
]

const GIVEN_FEMALE = [
  '疏影',
  '清婉',
  '如雪',
  '晚棠',
  '听雨',
  '怀橘',
  '浣纱',
  '步莲',
  '无瑕',
  '令仪',
  '慧心',
  '琼华',
  '绿筠',
  '金蕊',
  '禾穗',
  '药香',
  '萱草',
  '蘅芷',
  '婉清',
  '含烟',
  '弄梅',
  '织锦',
  '紫烟',
  '白芷',
  '银杏',
  '水仙',
  '茶烟',
  '芷柔',
  '蘅芜',
  '素心'
]

const PERSONALITIES = ['沉稳', '机敏', '憨直', '谨慎', '活泼', '寡言', '执拗', '温和']

const REALMS_BY_RANK: Record<string, Array<{ realm: string; major: RealmMajor }>> = {
  内门弟子: [
    { realm: '筑基初期', major: '筑基' },
    { realm: '筑基中期', major: '筑基' },
    { realm: '炼气后期', major: '炼气' }
  ],
  外门弟子: [
    { realm: '炼气中期', major: '炼气' },
    { realm: '炼气后期', major: '炼气' },
    { realm: '炼气初期', major: '炼气' }
  ],
  杂役弟子: [
    { realm: '炼气初期', major: '炼气' },
    { realm: '炼气中期', major: '炼气' },
    { realm: '无修为', major: '无修为' }
  ]
}

function pickOne<T>(list: T[]): T {
  return list[Math.floor(Math.random() * list.length)]
}

export function rollRecruitDiscipleName(existingNames: Iterable<string> = []) {
  const used = new Set(existingNames)
  for (let i = 0; i < 40; i++) {
    const female = Math.random() < 0.45
    const name = `${pickOne(SURNAMES)}${pickOne(female ? GIVEN_FEMALE : GIVEN_MALE)}`
    if (!used.has(name)) return name
  }
  return `${pickOne(SURNAMES)}${pickOne(GIVEN_MALE)}${Math.floor(Math.random() * 90 + 10)}`
}

export interface RecruitedMember extends CatalogMember {
  /** 招收弟子标记 */
  recruited?: boolean
  rootBone?: string
  roots?: RootBone[]
}

/** 坊市招收：随机姓名 + 随机根骨，生成一名本宗新弟子 */
export function rollRecruitDisciple(
  sectId: SectId | string,
  existingNames: Iterable<string> = []
): RecruitedMember {
  const option = getSectOption(sectId)
  const id = option?.id || 'qingyun'
  const sectName = option?.name || '宗门'
  const tierRank = getSectTierRank(option?.tier)
  const roots = rollRootBones()
  const rootBone = formatRootBoneLabel(roots)
  const joinRank = resolveJoinRankFromRoots(roots, tierRank)
  const group = memberGroupFromTitle(joinRank) as MemberGroup
  const realmPick = pickOne(REALMS_BY_RANK[joinRank] || REALMS_BY_RANK.外门弟子)
  const name = rollRecruitDiscipleName(existingNames)
  const stamp = `${Date.now().toString(36)}${Math.floor(Math.random() * 1e4).toString(36)}`

  return {
    id: `recruit-${id}-${stamp}`,
    name,
    title: `${sectName}${joinRank}`,
    realm: realmPick.realm,
    power: estimateCombatPowerForRealm(realmPick.major, name),
    avatar: name.slice(0, 1),
    tone: 'jade',
    group,
    division: '未划分',
    personality: pickOne(PERSONALITIES),
    specialty: '坊市招收',
    note: `根骨 · ${rootBone}`,
    attitude: '中立',
    sectId: id,
    recruited: true,
    rootBone,
    roots
  }
}

export function rollRecruitDisciples(
  sectId: SectId | string,
  count = 3,
  existingNames: Iterable<string> = []
): RecruitedMember[] {
  const used = new Set(existingNames)
  const list: RecruitedMember[] = []
  for (let i = 0; i < count; i++) {
    const member = rollRecruitDisciple(sectId, used)
    used.add(member.name)
    list.push(member)
  }
  return list
}
