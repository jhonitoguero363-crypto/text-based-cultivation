/**
 * 生成青云宗扩编弟子，输出 member-catalog-qingyun-extra.ts
 * 运行：node scripts/gen-qingyun-extra-members.mjs
 */
import fs from 'fs'

const EXISTING = new Set([
  '沈天玄', '柳清寒', '顾长风', '苏灵月', '韩铁山', '莫问道', '林玄机', '白无尘',
  '秦无夜', '赵德厚', '云疏白', '江晚晴', '周烈', '叶青璃', '陆沉舟', '陈小满',
  '何青禾', '阿福', '小翠',
  // 历练常用名，避免撞名
  '林青竹', '苏晚晴', '李玄风', '顾少陵', '沈月璃', '赵天河', '慕容雪', '楚狂歌',
  '洛神音', '白无涯', '王老三', '陈平', '柳如烟', '周青', '魏无忌', '赵老鬼',
  '宁道远', '魏长生', '莫天行', '老乞丐', '钱多多', '铁算盘', '百宝道人',
])

const SURNAMES = [
  '张', '王', '李', '刘', '陈', '杨', '黄', '赵', '周', '吴', '徐', '孙', '胡', '朱', '高',
  '林', '何', '郭', '马', '罗', '梁', '宋', '郑', '谢', '韩', '唐', '冯', '于', '董', '萧',
  '程', '曹', '袁', '邓', '许', '傅', '沈', '曾', '彭', '吕', '苏', '卢', '蒋', '蔡', '贾',
  '丁', '魏', '薛', '叶', '阎', '余', '潘', '杜', '戴', '夏', '钟', '汪', '田', '任', '姜',
  '范', '方', '石', '姚', '谭', '廖', '邹', '熊', '金', '陆', '郝', '孔', '白', '崔', '康',
  '毛', '邱', '秦', '江', '史', '顾', '侯', '邵', '孟', '龙', '万', '段', '雷', '钱', '汤',
  '尹', '黎', '易', '常', '武', '乔', '贺', '赖', '龚', '文',
]

const MALE_GIVEN = [
  '远山', '清尘', '怀安', '守正', '明远', '致远', '承志', '立恒', '景行', '知微',
  '若虚', '无咎', '有恒', '正阳', '朝晖', '望川', '听潮', '问松', '抚琴', '执炬',
  '破晓', '归舟', '踏雪', '乘风', '御风', '凌云', '栖梧', '抱朴', '守拙', '养浩',
  '崇德', '弘毅', '自强', '厚德', '载物', '通玄', '悟真', '炼心', '凝锋', '铸剑',
  '镇岳', '安澜', '定川', '济世', '行舟', '拾薪', '负囊', '担水', '斫木', '理田',
  '守夜', '巡山', '护阶', '司仓', '掌灯', '鸣铎', '击柝', '启扉', '封篆', '录籍',
  '墨池', '砚边', '竹简', '青简', '白羽', '玄戈', '赤羽', '苍岚', '铁衣', '石桥',
  '木青', '火辛', '水衡', '土厚', '金锋', '霜刃', '雷霆', '风至', '云起', '雨歇',
  '星河', '月白', '日升', '辰光', '子昂', '伯庸', '仲远', '叔平', '季恒', '少游',
]

const FEMALE_GIVEN = [
  '青萝', '素心', '婉清', '若雪', '听雨', '含烟', '映雪', '疏影', '流云', '采薇',
  '怀橘', '弄梅', '折柳', '浣纱', '织锦', '绣春', '步莲', '倾城', '如玉', '无瑕',
  '清婉', '柔嘉', '令仪', '静姝', '窈窕', '慧心', '明珠', '瑶光', '琼华', '碧落',
  '紫烟', '绿筠', '红袖', '白芷', '黄粱', '玄霜', '银杏', '金蕊', '木兰', '水仙',
  '禾穗', '豆蔻', '茶烟', '药香', '兰息', '芷柔', '萱草', '芙蕖', '蘅芜', '蘅芷',
]

const PERSONALITIES_M = [
  '勤恳', '寡言', '踏实', '憨厚', '急躁', '谨慎', '好学', '嘴碎', '爽朗', '沉闷',
  '固执', '圆滑', '耿直', '懒散', '认真', '好胜', '随和', '孤僻', '热心', '冷静',
]
const PERSONALITIES_F = [
  '温婉', '机灵', '细腻', '文静', '泼辣', '柔和', '聪慧', '勤快', '内敛', '爽利',
  '谨慎', '热心', '寡言', '好学', '嘴碎', '认真', '随和', '倔强', '清冷', '活泼',
]

const ATTITUDES = ['友善', '中立', '中立', '中立', '冷淡', '友善']

function pick(arr, i) {
  return arr[i % arr.length]
}

function uniqueName(used, surname, given) {
  let name = surname + given
  let n = 2
  while (used.has(name) || EXISTING.has(name)) {
    name = surname + given + (n === 2 ? '儿' : String(n))
    n++
    if (n > 9) {
      name = surname + given + String.fromCharCode(0x4e00 + n)
      break
    }
  }
  used.add(name)
  return name
}

function makePool(count, femaleRatio) {
  const femaleCount = Math.round(count * femaleRatio)
  const genders = [
    ...Array(femaleCount).fill('女'),
    ...Array(count - femaleCount).fill('男'),
  ]
  // shuffle lightly by index mixing
  for (let i = genders.length - 1; i > 0; i--) {
    const j = (i * 7 + 3) % (i + 1)
    ;[genders[i], genders[j]] = [genders[j], genders[i]]
  }
  return genders
}

const used = new Set()
let idSeq = 100 // qy-100+

function buildMember({ group, title, realm, power, tone, specialty, note, gender, i }) {
  idSeq++
  const surname = pick(SURNAMES, idSeq * 3 + i * 5)
  const given = gender === '女' ? pick(FEMALE_GIVEN, idSeq + i * 2) : pick(MALE_GIVEN, idSeq + i * 2)
  const name = uniqueName(used, surname, given)
  const personality =
    gender === '女' ? pick(PERSONALITIES_F, idSeq + i) : pick(PERSONALITIES_M, idSeq + i)
  return {
    id: `qy-${idSeq}`,
    name,
    title,
    realm,
    power,
    avatar: name.slice(0, 1),
    tone,
    group,
    personality,
    specialty,
    note,
    attitude: pick(ATTITUDES, idSeq + i),
    sectId: 'qingyun',
    _gender: gender,
  }
}

const extras = []

// 3 执事：金丹初期~中期
{
  const specs = [
    { title: '丹阁执事', specialty: '丹方调配、丹房巡察', note: '协理二长老药事', realm: '金丹中期', power: 72000 },
    { title: '器阁执事', specialty: '矿料清点、炼器后勤', note: '常与三长老往来', realm: '金丹初期', power: 63000 },
    { title: '外门执事', specialty: '外门考勤、弟子调度', note: '外门弟子多惧其簿册', realm: '金丹初期', power: 60000 },
  ]
  const genders = ['男', '男', '女']
  specs.forEach((s, i) => {
    extras.push(
      buildMember({
        group: '执事',
        title: s.title,
        realm: s.realm,
        power: s.power,
        tone: 'jade',
        specialty: s.specialty,
        note: s.note,
        gender: genders[i],
        i,
      })
    )
  })
}

// 5 亲传弟子
{
  const specs = [
    { note: '大长老座下亲传', specialty: '炼丹入门', realm: '金丹初期', power: 58000, gender: '男' },
    { note: '二长老座下亲传', specialty: '医理、灵药', realm: '筑基大圆满', power: 36000, gender: '女' },
    { note: '三长老座下亲传', specialty: '炼器锤锻', realm: '筑基大圆满', power: 34000, gender: '男' },
    { note: '四长老座下亲传', specialty: '阵法推演', realm: '筑基后期', power: 32000, gender: '男' },
    { note: '执法长老座下亲传', specialty: '律法、审讯', realm: '筑基后期', power: 33000, gender: '女' },
  ]
  specs.forEach((s, i) => {
    extras.push(
      buildMember({
        group: '亲传弟子',
        title: '亲传弟子',
        realm: s.realm,
        power: s.power,
        tone: 'gold',
        specialty: s.specialty,
        note: s.note,
        gender: s.gender,
        i,
      })
    )
  })
}

// 15 内门弟子：筑基初期~后期
{
  const realms = [
    ['筑基后期', 31000],
    ['筑基后期', 30000],
    ['筑基中期', 27000],
    ['筑基中期', 26500],
    ['筑基中期', 26000],
    ['筑基初期', 24500],
    ['筑基初期', 24000],
    ['筑基初期', 23500],
    ['筑基中期', 25500],
    ['筑基后期', 30500],
    ['筑基初期', 23000],
    ['筑基中期', 25000],
    ['筑基初期', 22800],
    ['筑基中期', 25800],
    ['筑基后期', 31500],
  ]
  const specialties = [
    '剑术勤修', '符箓抄写', '护山巡逻', '藏经整理', '丹房助手',
    '器房学徒', '阵基维护', '灵田督耕', '外勤传讯', '内务协理',
    '兽栏照看', '试剑场值守', '山门接待', '功法研习', '灵泉看守',
  ]
  const genders = makePool(15, 0.35)
  for (let i = 0; i < 15; i++) {
    const [realm, power] = realms[i]
    extras.push(
      buildMember({
        group: '内门弟子',
        title: '内门弟子',
        realm,
        power,
        tone: 'jade',
        specialty: specialties[i],
        note: i % 4 === 0 ? '有望冲击亲传考核' : '',
        gender: genders[i],
        i,
      })
    )
  }
}

// 30 外门弟子：炼气初期~后期
{
  const realms = []
  for (let i = 0; i < 30; i++) {
    if (i < 8) realms.push(['炼气后期', 6500 + (i % 5) * 120])
    else if (i < 18) realms.push(['炼气中期', 5600 + (i % 6) * 80])
    else realms.push(['炼气初期', 4800 + (i % 5) * 60])
  }
  const specialties = [
    '药园除草', '矿洞运料', '山门扫地', '膳堂帮厨', '洗衣浆裳',
    '饲灵禽', '抄录杂务', '传信跑腿', '灯油添换', '柴房劈柴',
    '水井汲水', '菜畦施肥', '仓储盘点', '院落洒扫', '路石修补',
    '试剑场擦拭', '经阁打杂', '丹渣清理', '器屑回收', '灵兽粪便清理',
    '外门巡更', '迎客引路', '杂物搬运', '灶火添薪', '晒药翻片',
    '缝补道袍', '磨刀擦剑', '井绳更换', '篱笆修缮', '账册誊抄',
  ]
  const genders = makePool(30, 0.4)
  for (let i = 0; i < 30; i++) {
    const [realm, power] = realms[i]
    extras.push(
      buildMember({
        group: '外门弟子',
        title: '外门弟子',
        realm,
        power,
        tone: 'jade',
        specialty: specialties[i],
        note: i % 5 === 0 ? '盼着年底外门大比翻身' : '',
        gender: genders[i],
        i,
      })
    )
  }
}

// 50 杂役弟子：炼气一层~三层
const ZAYE_SPEC = [
  '砍柴挑水', '膳堂洗碗', '茅厕清理', '石阶洒扫', '柴房看守',
  '菜园浇水', '喂养灵鸡', '浆洗衣物', '运送粪肥', '擦拭门扉',
  '添换灯油', '清扫厢房', '搬运砖石', '修补篱笆', '井边打水',
  '晒谷翻场', '灶下添薪', '泔水倾倒', '草料堆垛', '扫落叶',
  '擦拭香案', '山门扫地', '廊下抹灰', '修整竹篱', '翻晒被褥',
  '淘米择菜', '劈柴入垛', '清理兽栏', '抬送柴捆', '整理工具',
  '巡夜敲梆', '清晨打更', '帮厨切菜', '刷洗锅灶', '搬运水缸',
  '清扫丹渣', '收拾器屑', '抄录杂单', '传唤杂役', '看守仓门',
  '修补草鞋', '搓麻绳', '晒药翻片', '除草松土', '清理水沟',
  '抬轿引路', '迎接访客行李', '打扫试剑场', '擦拭兵器架', '收拾膳堂残羹',
]
{
  const genders = makePool(50, 0.35)
  for (let i = 0; i < 50; i++) {
    const layer = (i % 3) + 1
    const realm = `炼气${['一', '二', '三'][layer - 1]}层`
    const power = 4800 + layer * 200 + (i % 7) * 30
    extras.push(
      buildMember({
        group: '杂役弟子',
        title: '杂役弟子',
        realm,
        power,
        tone: 'jade',
        specialty: ZAYE_SPEC[i],
        note: i % 6 === 0 ? '杂役年头不短，略通人情' : '',
        gender: genders[i],
        i,
      })
    )
  }
}

const females = extras.filter((m) => m._gender === '女').map((m) => m.name)

function toTs(m) {
  const note = m.note ? `'${m.note}'` : "''"
  return `  {
    id: '${m.id}',
    name: '${m.name}',
    title: '${m.title}',
    realm: '${m.realm}',
    power: ${m.power},
    avatar: '${m.avatar}',
    tone: '${m.tone}',
    group: '${m.group}',
    personality: '${m.personality}',
    specialty: '${m.specialty}',
    note: ${note},
    attitude: '${m.attitude}',
    sectId: 'qingyun'
  }`
}

const byGroup = {
  执事: extras.filter((m) => m.group === '执事'),
  亲传弟子: extras.filter((m) => m.group === '亲传弟子'),
  内门弟子: extras.filter((m) => m.group === '内门弟子'),
  外门弟子: extras.filter((m) => m.group === '外门弟子'),
  杂役弟子: extras.filter((m) => m.group === '杂役弟子'),
}

for (const [g, list] of Object.entries(byGroup)) {
  console.log(g, list.length)
}

const header = `import type { CatalogMember } from './member-catalog'

/** 青云宗扩编弟子（执事/亲传/内门/外门/杂役） */
export const QINGYUN_EXTRA_MEMBERS: CatalogMember[] = [
`

const body = extras.map(toTs).join(',\n')
const footer = `\n]

/** 扩编中已知女性姓名（供默认头像推断） */
export const QINGYUN_EXTRA_FEMALE_NAMES = ${JSON.stringify(females, null, 2)} as const
`

fs.writeFileSync('src/constants/member-catalog-qingyun-extra.ts', header + body + footer)
fs.writeFileSync(
  'scripts/_qingyun-extra-meta.json',
  JSON.stringify(
    {
      total: extras.length,
      counts: Object.fromEntries(Object.entries(byGroup).map(([k, v]) => [k, v.length])),
      females,
    },
    null,
    2
  )
)
console.log('wrote', extras.length, 'members,', females.length, 'female')
