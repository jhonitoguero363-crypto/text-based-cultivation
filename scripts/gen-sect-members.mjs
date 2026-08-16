/**
 * 为天魔宗 / 万剑宗 / 妖族生成与青云宗结构相近的人物名录。
 * 每宗约：宗主2 · 长老6 · 执事5 · 亲传7 · 内门18 · 外门32 · 杂役52 ≈ 122
 * 运行：node scripts/gen-sect-members.mjs
 */
import fs from 'fs'

const EXISTING = new Set([
  // 青云
  '沈天玄', '柳清寒', '顾长风', '苏灵月', '韩铁山', '莫问道', '林玄机', '白无尘',
  '秦无夜', '赵德厚', '云疏白', '江晚晴', '周烈', '叶青璃', '陆沉舟', '陈小满',
  '何青禾', '阿福', '小翠',
  // 历练 NPC
  '林青竹', '苏晚晴', '李玄风', '顾少陵', '沈月璃', '赵天河', '慕容雪', '楚狂歌',
  '洛神音', '白无涯', '王老三', '陈平', '柳如烟', '周青', '魏无忌', '赵老鬼',
  '宁道远', '魏长生', '莫天行', '老乞丐', '钱多多', '铁算盘', '百宝道人'
])

const SURNAMES = [
  '张', '王', '李', '刘', '陈', '杨', '黄', '赵', '周', '吴', '徐', '孙', '胡', '朱', '高',
  '林', '何', '郭', '马', '罗', '梁', '宋', '郑', '谢', '韩', '唐', '冯', '于', '董', '萧',
  '程', '曹', '袁', '邓', '许', '傅', '沈', '曾', '彭', '吕', '苏', '卢', '蒋', '蔡', '贾',
  '丁', '魏', '薛', '叶', '阎', '余', '潘', '杜', '戴', '夏', '钟', '汪', '田', '任', '姜',
  '范', '方', '石', '姚', '谭', '廖', '邹', '熊', '金', '陆', '郝', '孔', '白', '崔', '康',
  '毛', '邱', '秦', '江', '史', '顾', '侯', '邵', '孟', '龙', '万', '段', '雷', '钱', '汤',
  '尹', '黎', '易', '常', '武', '乔', '贺', '赖', '龚', '文', '聂', '狄', '墨', '冷', '夜'
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
  '屠魔', '饮血', '裂空', '断岳', '灭尘', '焚天', '噬魂', '斩玄', '破军', '煞星'
]

const FEMALE_GIVEN = [
  '青萝', '素心', '婉清', '若雪', '听雨', '含烟', '映雪', '疏影', '流云', '采薇',
  '怀橘', '弄梅', '折柳', '浣纱', '织锦', '绣春', '步莲', '倾城', '如玉', '无瑕',
  '清婉', '柔嘉', '令仪', '静姝', '窈窕', '慧心', '明珠', '瑶光', '琼华', '碧落',
  '紫烟', '绿筠', '红袖', '白芷', '黄粱', '玄霜', '银杏', '金蕊', '木兰', '水仙',
  '禾穗', '豆蔻', '茶烟', '药香', '兰息', '芷柔', '萱草', '芙蕖', '蘅芜', '蘅芷',
  '血玲', '夜姬', '幽萝', '魔纱', '赤绡', '霜姬', '剑影', '狐仙', '鸾音', '蝶舞'
]

const PERSONALITIES_M = [
  '勤恳', '寡言', '踏实', '憨厚', '急躁', '谨慎', '好学', '嘴碎', '爽朗', '沉闷',
  '固执', '圆滑', '耿直', '懒散', '认真', '好胜', '随和', '孤僻', '热心', '冷静',
  '冷酷', '狂傲', '阴鸷', '嗜杀', '沉默', '跋扈', '阴沉', '狠厉', '豪迈', '桀骜'
]
const PERSONALITIES_F = [
  '温婉', '机灵', '细腻', '文静', '泼辣', '柔和', '聪慧', '勤快', '内敛', '爽利',
  '谨慎', '热心', '寡言', '好学', '嘴碎', '认真', '随和', '倔强', '清冷', '活泼',
  '妖冶', '妩媚', '冷艳', '狠辣', '神秘', '娇蛮', '清傲', '阴柔', '飒爽', '残忍'
]

const ATTITUDES = ['友善', '中立', '中立', '中立', '冷淡', '友善', '严格']

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
  EXISTING.add(name)
  return name
}

function makePool(count, femaleRatio) {
  const femaleCount = Math.round(count * femaleRatio)
  const genders = [
    ...Array(femaleCount).fill('女'),
    ...Array(count - femaleCount).fill('男')
  ]
  for (let i = genders.length - 1; i > 0; i--) {
    const j = (i * 7 + 3) % (i + 1)
    ;[genders[i], genders[j]] = [genders[j], genders[i]]
  }
  return genders
}

/** @type {Map<string, Set<string>>} */
const usedBySect = new Map()

function buildMember(sectId, prefix, idSeq, used, opts) {
  const { group, title, realm, power, tone, specialty, note, gender, i, name: fixedName } =
    opts
  let name = fixedName
  if (!name) {
    const surname = pick(SURNAMES, idSeq * 3 + i * 5 + prefix.charCodeAt(0))
    const given =
      gender === '女' ? pick(FEMALE_GIVEN, idSeq + i * 2) : pick(MALE_GIVEN, idSeq + i * 2)
    name = uniqueName(used, surname, given)
  } else {
    used.add(name)
    EXISTING.add(name)
  }
  const personality =
    gender === '女' ? pick(PERSONALITIES_F, idSeq + i) : pick(PERSONALITIES_M, idSeq + i)
  return {
    id: `${prefix}-${idSeq}`,
    name,
    title,
    realm,
    power,
    avatar: name.slice(0, 1),
    tone,
    group,
    personality: opts.personality || personality,
    specialty,
    note: note || '',
    attitude: opts.attitude || pick(ATTITUDES, idSeq + i),
    sectId,
    _gender: gender
  }
}

function toTs(m) {
  const note = m.note ? `'${m.note.replace(/'/g, "\\'")}'` : "''"
  const personality = m.personality.replace(/'/g, "\\'")
  const specialty = m.specialty.replace(/'/g, "\\'")
  return `  {
    id: '${m.id}',
    name: '${m.name}',
    title: '${m.title}',
    realm: '${m.realm}',
    power: ${m.power},
    avatar: '${m.avatar}',
    tone: '${m.tone}',
    group: '${m.group}',
    personality: '${personality}',
    specialty: '${specialty}',
    note: ${note},
    attitude: '${m.attitude}',
    sectId: '${m.sectId}'
  }`
}

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
  '抬轿引路', '迎接访客行李', '打扫试剑场', '擦拭兵器架', '收拾膳堂残羹'
]

function genExtras(sectId, prefix, used, theme) {
  const extras = []
  let idSeq = 100

  const next = (opts) => {
    idSeq++
    return buildMember(sectId, prefix, idSeq, used, opts)
  }

  // 3 执事
  theme.extraZhiShi.forEach((s, i) => {
    extras.push(
      next({
        group: '执事',
        title: s.title,
        realm: s.realm,
        power: s.power,
        tone: 'jade',
        specialty: s.specialty,
        note: s.note,
        gender: s.gender || (i === 2 ? '女' : '男'),
        i
      })
    )
  })

  // 5 亲传
  theme.extraQinChuan.forEach((s, i) => {
    extras.push(
      next({
        group: '亲传弟子',
        title: '亲传弟子',
        realm: s.realm,
        power: s.power,
        tone: 'gold',
        specialty: s.specialty,
        note: s.note,
        gender: s.gender,
        i
      })
    )
  })

  // 15 内门
  {
    const realms = theme.neiMenRealms || [
      ['筑基后期', 31000], ['筑基后期', 30000], ['筑基中期', 27000], ['筑基中期', 26500],
      ['筑基中期', 26000], ['筑基初期', 24500], ['筑基初期', 24000], ['筑基初期', 23500],
      ['筑基中期', 25500], ['筑基后期', 30500], ['筑基初期', 23000], ['筑基中期', 25000],
      ['筑基初期', 22800], ['筑基中期', 25800], ['筑基后期', 31500]
    ]
    const genders = makePool(15, 0.35)
    for (let i = 0; i < 15; i++) {
      const [realm, power] = realms[i]
      extras.push(
        next({
          group: '内门弟子',
          title: '内门弟子',
          realm,
          power: Math.round(power * (theme.neiMenPowerScale ?? theme.powerScale)),
          tone: 'jade',
          specialty: theme.neiMenSpec[i],
          note: i % 4 === 0 ? theme.neiMenNote : '',
          gender: genders[i],
          i
        })
      )
    }
  }

  // 30 外门
  {
    const genders = makePool(30, 0.4)
    for (let i = 0; i < 30; i++) {
      let realm
      let power
      if (theme.waiMenRealms) {
        ;[realm, power] = theme.waiMenRealms[i]
      } else if (i < 8) {
        realm = '炼气后期'
        power = 6500 + (i % 5) * 120
      } else if (i < 18) {
        realm = '炼气中期'
        power = 5600 + (i % 6) * 80
      } else {
        realm = '炼气初期'
        power = 4800 + (i % 5) * 60
      }
      extras.push(
        next({
          group: '外门弟子',
          title: theme.waiMenTitle || '外门弟子',
          realm,
          power: Math.round(power * (theme.waiMenPowerScale ?? theme.powerScale)),
          tone: 'jade',
          specialty: theme.waiMenSpec[i],
          note: i % 5 === 0 ? theme.waiMenNote : '',
          gender: genders[i],
          i
        })
      )
    }
  }

  // 50 杂役
  {
    const genders = makePool(50, 0.35)
    for (let i = 0; i < 50; i++) {
      let realm
      let power
      if (theme.zaYiRealms) {
        ;[realm, power] = theme.zaYiRealms[i]
      } else {
        const layer = (i % 3) + 1
        realm = `炼气${['一', '二', '三'][layer - 1]}层`
        power = 4800 + layer * 200 + (i % 7) * 30
      }
      extras.push(
        next({
          group: '杂役弟子',
          title: theme.zaYiTitle || '杂役弟子',
          realm,
          power: Math.round(power * (theme.zaYiPowerScale ?? theme.powerScale * 0.98)),
          tone: 'jade',
          specialty: theme.zaYiSpec?.[i] || ZAYE_SPEC[i],
          note: i % 6 === 0 ? theme.zaYiNote : '',
          gender: genders[i],
          i
        })
      )
    }
  }

  return extras
}

function writeSectFile(constName, femaleConst, comment, members, females, outPath) {
  const header = `import type { CatalogMember } from './member-catalog'

/** ${comment} */
export const ${constName}: CatalogMember[] = [
`
  const body = members.map(toTs).join(',\n')
  const footer = `\n]

/** 已知女性姓名（供默认头像推断） */
export const ${femaleConst} = ${JSON.stringify(females, null, 2)} as const
`
  fs.writeFileSync(outPath, header + body + footer)
}

// ——— 天魔宗 ———
const tianmoCores = [
  {
    id: 'tm-1', name: '血煞天魔', title: '天魔宗宗主', realm: '化神后期', power: 260000,
    avatar: '血', tone: 'hp', group: '宗主', personality: '暴虐、威严', specialty: '魔功、杀伐',
    note: '以杀证道，魔心通天', attitude: '冷淡', sectId: 'tianmo', _gender: '男'
  },
  {
    id: 'tm-2', name: '幽冥鬼姬', title: '副宗主', realm: '化神中期', power: 228000,
    avatar: '幽', tone: 'hp', group: '宗主', personality: '阴柔、狠辣', specialty: '魂道、魅惑',
    note: '笑容背后常藏杀机', attitude: '冷淡', sectId: 'tianmo', _gender: '女'
  },
  {
    id: 'tm-3', name: '赤炼魔尊', title: '大长老', realm: '元婴后期', power: 145000,
    avatar: '赤', tone: 'mp', group: '长老', personality: '暴躁、嗜火', specialty: '魔丹、血炼',
    note: '丹房常年血气弥漫', attitude: '中立', sectId: 'tianmo', _gender: '男'
  },
  {
    id: 'tm-4', name: '夜煞魔女', title: '二长老', realm: '元婴中期', power: 125000,
    avatar: '夜', tone: 'mp', group: '长老', personality: '妩媚、阴沉', specialty: '毒功、魔药',
    note: '药园尽是毒株', attitude: '冷淡', sectId: 'tianmo', _gender: '女'
  },
  {
    id: 'tm-5', name: '骨铸魔匠', title: '三长老', realm: '元婴后期', power: 142000,
    avatar: '骨', tone: 'mp', group: '长老', personality: '阴鸷、专注', specialty: '炼器、骨兵',
    note: '器阁以白骨为材', attitude: '中立', sectId: 'tianmo', _gender: '男'
  },
  {
    id: 'tm-6', name: '裂空魔影', title: '四长老', realm: '元婴中期', power: 122000,
    avatar: '裂', tone: 'mp', group: '长老', personality: '神秘、寡言', specialty: '魔阵、空间',
    note: '天魔渊阵眼由其镇守', attitude: '中立', sectId: 'tianmo', _gender: '男'
  },
  {
    id: 'tm-7', name: '噬魂老魔', title: '五长老', realm: '元婴初期', power: 108000,
    avatar: '噬', tone: 'mp', group: '长老', personality: '懒散、阴狠', specialty: '魂修、吞噬',
    note: '表面昏聩，实则难测', attitude: '中立', sectId: 'tianmo', _gender: '男'
  },
  {
    id: 'tm-8', name: '铁血魔判', title: '执法长老', realm: '元婴初期', power: 110000,
    avatar: '铁', tone: 'mp', group: '长老', personality: '冷酷无情', specialty: '审讯、处决',
    note: '违律者少有生还', attitude: '严格', sectId: 'tianmo', _gender: '男'
  },
  {
    id: 'tm-9', name: '屠魔刀', title: '执法堂堂主', realm: '金丹后期', power: 85000,
    avatar: '屠', tone: 'hp', group: '执事', personality: '狂傲、嗜杀', specialty: '执法、刀术',
    note: '', attitude: '严格', sectId: 'tianmo', _gender: '男'
  },
  {
    id: 'tm-10', name: '血簿执事', title: '杂务执事', realm: '金丹初期', power: 62000,
    avatar: '血', tone: 'jade', group: '执事', personality: '阴沉、琐碎', specialty: '庶务、血契账册',
    note: '经手外门杂役调配', attitude: '中立', sectId: 'tianmo', _gender: '男'
  },
  {
    id: 'tm-11', name: '魔焰公子', title: '亲传弟子', realm: '金丹初期', power: 63000,
    avatar: '魔', tone: 'gold', group: '亲传弟子', personality: '跋扈、好胜', specialty: '魔炎功法',
    note: '宗主亲传，锋芒毕露', attitude: '冷淡', sectId: 'tianmo', _gender: '男'
  },
  {
    id: 'tm-12', name: '血璃', title: '亲传弟子', realm: '筑基大圆满', power: 36000,
    avatar: '血', tone: 'gold', group: '亲传弟子', personality: '冷艳、聪慧', specialty: '血道、魅惑',
    note: '副宗主座下亲传', attitude: '冷淡', sectId: 'tianmo', _gender: '女'
  },
  {
    id: 'tm-13', name: '狂煞', title: '执法弟子', realm: '筑基后期', power: 33000,
    avatar: '狂', tone: 'hp', group: '内门弟子', personality: '暴躁', specialty: '近战杀伐',
    note: '', attitude: '容易与玩家冲突', sectId: 'tianmo', _gender: '男'
  },
  {
    id: 'tm-14', name: '暗影', title: '执法弟子', realm: '筑基中期', power: 28500,
    avatar: '暗', tone: 'hp', group: '内门弟子', personality: '阴沉', specialty: '追踪、暗杀',
    note: '', attitude: '冷淡', sectId: 'tianmo', _gender: '男'
  },
  {
    id: 'tm-15', name: '石魔', title: '内门弟子', realm: '筑基初期', power: 24000,
    avatar: '石', tone: 'jade', group: '内门弟子', personality: '沉闷、寡言', specialty: '土系魔功',
    note: '常年镇守天魔渊深处', attitude: '中立', sectId: 'tianmo', _gender: '男'
  },
  {
    id: 'tm-16', name: '小魔头', title: '外门弟子', realm: '炼气后期', power: 7000,
    avatar: '小', tone: 'jade', group: '外门弟子', personality: '嘴碎、好胜', specialty: '跑腿打听',
    note: '消息灵通', attitude: '友善', sectId: 'tianmo', _gender: '男'
  },
  {
    id: 'tm-17', name: '毒萝', title: '外门弟子', realm: '炼气中期', power: 6100,
    avatar: '毒', tone: 'jade', group: '外门弟子', personality: '阴柔', specialty: '药园劳作',
    note: '一心想入内门', attitude: '中立', sectId: 'tianmo', _gender: '女'
  },
  {
    id: 'tm-18', name: '阿煞', title: '杂役弟子', realm: '炼气一层', power: 5050,
    avatar: '阿', tone: 'jade', group: '杂役弟子', personality: '憨厚', specialty: '砍柴挑水',
    note: '宗门杂役数年', attitude: '友善', sectId: 'tianmo', _gender: '男'
  },
  {
    id: 'tm-19', name: '小幽', title: '杂役弟子', realm: '炼气二层', power: 5350,
    avatar: '幽', tone: 'jade', group: '杂役弟子', personality: '机灵、嘴碎', specialty: '洒扫、传话',
    note: '常在膳堂附近转悠', attitude: '中立', sectId: 'tianmo', _gender: '女'
  }
]

const tianmoTheme = {
  powerScale: 1.02,
  extraZhiShi: [
    { title: '魔丹阁执事', specialty: '魔丹调配、丹房巡察', note: '协理大长老血炼', realm: '金丹中期', power: 74000 },
    { title: '骨器阁执事', specialty: '骨料清点、炼器后勤', note: '常与三长老往来', realm: '金丹初期', power: 64000 },
    { title: '外门执事', specialty: '外门考勤、血契登记', note: '外门弟子多惧其簿册', realm: '金丹初期', power: 61000, gender: '女' }
  ],
  extraQinChuan: [
    { note: '大长老座下亲传', specialty: '魔丹入门', realm: '金丹初期', power: 59000, gender: '男' },
    { note: '二长老座下亲传', specialty: '毒功、魔药', realm: '筑基大圆满', power: 36500, gender: '女' },
    { note: '三长老座下亲传', specialty: '骨兵锤锻', realm: '筑基大圆满', power: 34500, gender: '男' },
    { note: '四长老座下亲传', specialty: '魔阵推演', realm: '筑基后期', power: 32500, gender: '男' },
    { note: '执法长老座下亲传', specialty: '审讯、血律', realm: '筑基后期', power: 33500, gender: '女' }
  ],
  neiMenSpec: [
    '魔功勤修', '血符抄写', '渊口巡逻', '魔典整理', '丹房助手',
    '器房学徒', '阵基维护', '毒田督耕', '外勤传讯', '内务协理',
    '魔兽照看', '试炼场值守', '山门接待', '魔功研习', '血泉看守'
  ],
  neiMenNote: '有望冲击亲传考核',
  waiMenSpec: [
    '药园除草', '矿洞运料', '山门扫地', '膳堂帮厨', '洗衣浆裳',
    '饲魔禽', '抄录杂务', '传信跑腿', '灯油添换', '柴房劈柴',
    '水井汲水', '菜畦施肥', '仓储盘点', '院落洒扫', '路石修补',
    '试炼场擦拭', '魔典打杂', '丹渣清理', '器屑回收', '魔兽粪便清理',
    '外门巡更', '迎客引路', '杂物搬运', '灶火添薪', '晒药翻片',
    '缝补道袍', '磨刀擦剑', '井绳更换', '篱笆修缮', '账册誊抄'
  ],
  waiMenNote: '盼着血试翻身入内门',
  zaYiNote: '杂役年头不短，略通人情'
}

// ——— 万剑宗 ———
const wanjianCores = [
  {
    id: 'wj-1', name: '剑无涯', title: '万剑宗宗主', realm: '炼虚后期', power: 480000,
    avatar: '剑', tone: 'mp', group: '宗主', personality: '清傲、威严', specialty: '剑道、破法',
    note: '一剑破万法，威震诸域', attitude: '中立', sectId: 'wanjian', _gender: '男'
  },
  {
    id: 'wj-2', name: '霜华剑尊', title: '副宗主', realm: '炼虚中期', power: 420000,
    avatar: '霜', tone: 'mp', group: '宗主', personality: '冷静、锐利', specialty: '冰剑、剑意',
    note: '剑心如霜，不近人情', attitude: '冷淡', sectId: 'wanjian', _gender: '女'
  },
  {
    id: 'wj-3', name: '丹剑真人', title: '大长老', realm: '化神后期', power: 280000,
    avatar: '丹', tone: 'mp', group: '长老', personality: '严厉、古板', specialty: '剑丹、炼丹',
    note: '以剑入丹，独树一帜', attitude: '中立', sectId: 'wanjian', _gender: '男'
  },
  {
    id: 'wj-4', name: '青莲剑娘', title: '二长老', realm: '化神中期', power: 250000,
    avatar: '青', tone: 'mp', group: '长老', personality: '温婉、聪慧', specialty: '灵药、医剑',
    note: '药园亦藏剑冢一角', attitude: '友善', sectId: 'wanjian', _gender: '女'
  },
  {
    id: 'wj-5', name: '铸剑山人', title: '三长老', realm: '化神后期', power: 275000,
    avatar: '铸', tone: 'mp', group: '长老', personality: '豪爽、直率', specialty: '炼器、铸剑',
    note: '万剑峰器阁掌炉', attitude: '中立', sectId: 'wanjian', _gender: '男'
  },
  {
    id: 'wj-6', name: '玄阵剑客', title: '四长老', realm: '化神中期', power: 248000,
    avatar: '玄', tone: 'mp', group: '长老', personality: '神秘、寡言', specialty: '剑阵、推演',
    note: '万剑护宗大阵由其主持', attitude: '中立', sectId: 'wanjian', _gender: '男'
  },
  {
    id: 'wj-7', name: '醉剑仙', title: '五长老', realm: '化神初期', power: 210000,
    avatar: '醉', tone: 'mp', group: '长老', personality: '懒散、爱喝酒', specialty: '醉剑、剑意',
    note: '醉时剑势无人能测', attitude: '友善', sectId: 'wanjian', _gender: '男'
  },
  {
    id: 'wj-8', name: '律剑长老', title: '执法长老', realm: '化神初期', power: 215000,
    avatar: '律', tone: 'mp', group: '长老', personality: '铁面无私', specialty: '审讯、剑律',
    note: '', attitude: '严格', sectId: 'wanjian', _gender: '男'
  },
  {
    id: 'wj-9', name: '断罪剑使', title: '执法堂堂主', realm: '元婴后期', power: 150000,
    avatar: '断', tone: 'hp', group: '执事', personality: '冷酷、公正', specialty: '执法、剑术',
    note: '', attitude: '严格', sectId: 'wanjian', _gender: '男'
  },
  {
    id: 'wj-10', name: '簿剑执事', title: '杂务执事', realm: '元婴初期', power: 105000,
    avatar: '簿', tone: 'jade', group: '执事', personality: '勤恳、琐碎', specialty: '庶务、账册',
    note: '经手外门杂役调配', attitude: '中立', sectId: 'wanjian', _gender: '男'
  },
  {
    id: 'wj-11', name: '凌霄剑子', title: '亲传弟子', realm: '元婴初期', power: 108000,
    avatar: '凌', tone: 'gold', group: '亲传弟子', personality: '清傲、好胜', specialty: '御剑术',
    note: '宗主亲传，锋芒初露', attitude: '冷淡', sectId: 'wanjian', _gender: '男'
  },
  {
    id: 'wj-12', name: '霜月', title: '亲传弟子', realm: '金丹大圆满', power: 92000,
    avatar: '霜', tone: 'gold', group: '亲传弟子', personality: '温婉、聪慧', specialty: '冰剑心法',
    note: '副宗主座下亲传', attitude: '友善', sectId: 'wanjian', _gender: '女'
  },
  {
    id: 'wj-13', name: '烈锋', title: '执法弟子', realm: '金丹后期', power: 82000,
    avatar: '烈', tone: 'hp', group: '内门弟子', personality: '暴躁', specialty: '近战剑术',
    note: '', attitude: '容易与玩家冲突', sectId: 'wanjian', _gender: '男'
  },
  {
    id: 'wj-14', name: '追影', title: '执法弟子', realm: '金丹中期', power: 72000,
    avatar: '追', tone: 'hp', group: '内门弟子', personality: '认真', specialty: '调查、追踪',
    note: '', attitude: '对玩家较友善', sectId: 'wanjian', _gender: '女'
  },
  {
    id: 'wj-15', name: '石剑', title: '内门弟子', realm: '金丹初期', power: 62000,
    avatar: '石', tone: 'jade', group: '内门弟子', personality: '沉稳、寡言', specialty: '重剑防御',
    note: '常年镇守万剑峰后山', attitude: '中立', sectId: 'wanjian', _gender: '男'
  },
  {
    id: 'wj-16', name: '小剑童', title: '外门弟子', realm: '筑基后期', power: 32000,
    avatar: '小', tone: 'jade', group: '外门弟子', personality: '活泼、热心', specialty: '跑腿打听',
    note: '消息灵通', attitude: '友善', sectId: 'wanjian', _gender: '男'
  },
  {
    id: 'wj-17', name: '青禾', title: '外门弟子', realm: '筑基中期', power: 27000,
    avatar: '青', tone: 'jade', group: '外门弟子', personality: '踏实、勤勉', specialty: '药园劳作',
    note: '一心想入内门', attitude: '友善', sectId: 'wanjian', _gender: '女'
  },
  {
    id: 'wj-18', name: '阿锋', title: '杂役弟子', realm: '炼气后期', power: 6800,
    avatar: '阿', tone: 'jade', group: '杂役弟子', personality: '憨厚', specialty: '砍柴挑水',
    note: '宗门杂役数年', attitude: '友善', sectId: 'wanjian', _gender: '男'
  },
  {
    id: 'wj-19', name: '小翠剑', title: '杂役弟子', realm: '炼气中期', power: 5800,
    avatar: '翠', tone: 'jade', group: '杂役弟子', personality: '机灵、嘴碎', specialty: '洒扫、传话',
    note: '常在膳堂附近转悠', attitude: '中立', sectId: 'wanjian', _gender: '女'
  }
]

const wanjianTheme = {
  powerScale: 1,
  neiMenPowerScale: 1,
  waiMenPowerScale: 1,
  zaYiPowerScale: 1,
  neiMenRealms: (() => {
    const list = []
    for (let i = 0; i < 15; i++) {
      if (i < 5) list.push(['金丹后期', 80000 + (i % 4) * 800])
      else if (i < 10) list.push(['金丹中期', 70000 + (i % 5) * 600])
      else list.push(['金丹初期', 60000 + (i % 5) * 500])
    }
    return list
  })(),
  waiMenRealms: (() => {
    const list = []
    for (let i = 0; i < 30; i++) {
      if (i < 8) list.push(['筑基后期', 31000 + (i % 5) * 400])
      else if (i < 18) list.push(['筑基中期', 26000 + (i % 6) * 300])
      else list.push(['筑基初期', 22000 + (i % 5) * 250])
    }
    return list
  })(),
  zaYiRealms: (() => {
    const list = []
    for (let i = 0; i < 50; i++) {
      if (i < 15) list.push(['炼气后期', 6500 + (i % 5) * 100])
      else if (i < 35) list.push(['炼气中期', 5600 + (i % 6) * 80])
      else list.push(['炼气初期', 4800 + (i % 5) * 60])
    }
    return list
  })(),
  extraZhiShi: [
    { title: '丹阁执事', specialty: '剑丹调配、丹房巡察', note: '协理大长老丹事', realm: '元婴中期', power: 125000 },
    { title: '器阁执事', specialty: '剑胚清点、铸剑后勤', note: '常与三长老往来', realm: '元婴初期', power: 108000 },
    { title: '外门执事', specialty: '外门考勤、弟子调度', note: '外门弟子多惧其簿册', realm: '元婴初期', power: 102000, gender: '女' }
  ],
  extraQinChuan: [
    { note: '大长老座下亲传', specialty: '剑丹入门', realm: '金丹后期', power: 85000, gender: '男' },
    { note: '二长老座下亲传', specialty: '医剑、灵药', realm: '金丹中期', power: 74000, gender: '女' },
    { note: '三长老座下亲传', specialty: '铸剑锤锻', realm: '金丹中期', power: 72000, gender: '男' },
    { note: '四长老座下亲传', specialty: '剑阵推演', realm: '金丹初期', power: 64000, gender: '男' },
    { note: '执法长老座下亲传', specialty: '剑律、审讯', realm: '金丹初期', power: 65000, gender: '女' }
  ],
  neiMenSpec: [
    '剑术勤修', '符箓抄写', '护峰巡逻', '藏经整理', '丹房助手',
    '器房学徒', '阵基维护', '灵田督耕', '外勤传讯', '内务协理',
    '剑灵照看', '试剑场值守', '山门接待', '剑意研习', '灵泉看守'
  ],
  neiMenNote: '有望冲击亲传考核',
  waiMenSpec: [
    '药园除草', '矿洞运料', '山门扫地', '膳堂帮厨', '洗衣浆裳',
    '饲灵禽', '抄录杂务', '传信跑腿', '灯油添换', '柴房劈柴',
    '水井汲水', '菜畦施肥', '仓储盘点', '院落洒扫', '路石修补',
    '试剑场擦拭', '经阁打杂', '丹渣清理', '器屑回收', '灵兽粪便清理',
    '外门巡更', '迎客引路', '杂物搬运', '灶火添薪', '晒药翻片',
    '缝补道袍', '磨刀擦剑', '井绳更换', '篱笆修缮', '账册誊抄'
  ],
  waiMenNote: '盼着年底剑试翻身',
  zaYiNote: '杂役年头不短，略通人情'
}

// ——— 妖族 ———
const yaozuCores = [
  {
    id: 'yz-1', name: '万妖王', title: '万妖谷主', realm: '化神后期', power: 255000,
    avatar: '万', tone: 'gold', group: '宗主', personality: '霸道、威严', specialty: '血脉、统御',
    note: '万妖归心，号令山林', attitude: '中立', sectId: 'yaozu', _gender: '男'
  },
  {
    id: 'yz-2', name: '青丘狐帝', title: '副谷主', realm: '化神中期', power: 225000,
    avatar: '青', tone: 'gold', group: '宗主', personality: '狡黠、聪慧', specialty: '幻术、化形',
    note: '九尾未显，已足以惑人', attitude: '中立', sectId: 'yaozu', _gender: '女'
  },
  {
    id: 'yz-3', name: '玄龟长老', title: '大长老', realm: '元婴后期', power: 140000,
    avatar: '玄', tone: 'mp', group: '长老', personality: '沉稳、古板', specialty: '炼丹、龟息',
    note: '丹阁以灵草与妖丹并重', attitude: '友善', sectId: 'yaozu', _gender: '男'
  },
  {
    id: 'yz-4', name: '蝶母', title: '二长老', realm: '元婴中期', power: 122000,
    avatar: '蝶', tone: 'mp', group: '长老', personality: '温柔、聪慧', specialty: '灵药、医术',
    note: '掌握一处隐秘药谷', attitude: '友善', sectId: 'yaozu', _gender: '女'
  },
  {
    id: 'yz-5', name: '金犀匠', title: '三长老', realm: '元婴后期', power: 138000,
    avatar: '金', tone: 'mp', group: '长老', personality: '豪爽、直率', specialty: '炼器、骨甲',
    note: '器阁多用妖骨妖角', attitude: '中立', sectId: 'yaozu', _gender: '男'
  },
  {
    id: 'yz-6', name: '蛛网尊者', title: '四长老', realm: '元婴中期', power: 120000,
    avatar: '蛛', tone: 'mp', group: '长老', personality: '神秘、寡言', specialty: '阵法、蛛网',
    note: '谷中大阵丝丝相连', attitude: '冷淡', sectId: 'yaozu', _gender: '男'
  },
  {
    id: 'yz-7', name: '醉猿', title: '五长老', realm: '元婴初期', power: 105000,
    avatar: '醉', tone: 'mp', group: '长老', personality: '懒散、爱喝酒', specialty: '占卜、兽语',
    note: '醉后能听懂百兽心声', attitude: '友善', sectId: 'yaozu', _gender: '男'
  },
  {
    id: 'yz-8', name: '白虎判', title: '执法长老', realm: '元婴初期', power: 108000,
    avatar: '白', tone: 'mp', group: '长老', personality: '铁面无私', specialty: '审讯、追踪',
    note: '', attitude: '严格', sectId: 'yaozu', _gender: '男'
  },
  {
    id: 'yz-9', name: '狼牙使', title: '执法堂堂主', realm: '金丹后期', power: 84000,
    avatar: '狼', tone: 'hp', group: '执事', personality: '冷酷、公正', specialty: '执法、近战',
    note: '', attitude: '严格', sectId: 'yaozu', _gender: '男'
  },
  {
    id: 'yz-10', name: '仓鼠管事', title: '杂务执事', realm: '金丹初期', power: 61500,
    avatar: '仓', tone: 'jade', group: '执事', personality: '勤恳、琐碎', specialty: '庶务、账册',
    note: '经手外门杂役调配', attitude: '中立', sectId: 'yaozu', _gender: '男'
  },
  {
    id: 'yz-11', name: '烈焰狮子', title: '亲传弟子', realm: '金丹初期', power: 62000,
    avatar: '烈', tone: 'gold', group: '亲传弟子', personality: '清傲、好胜', specialty: '火系血脉',
    note: '谷主亲传，锋芒初露', attitude: '冷淡', sectId: 'yaozu', _gender: '男'
  },
  {
    id: 'yz-12', name: '雪狐', title: '亲传弟子', realm: '筑基大圆满', power: 35500,
    avatar: '雪', tone: 'gold', group: '亲传弟子', personality: '温婉、聪慧', specialty: '幻术、冰系',
    note: '副谷主座下亲传', attitude: '友善', sectId: 'yaozu', _gender: '女'
  },
  {
    id: 'yz-13', name: '黑豹', title: '执法弟子', realm: '筑基后期', power: 32500,
    avatar: '黑', tone: 'hp', group: '内门弟子', personality: '暴躁', specialty: '近战',
    note: '', attitude: '容易与玩家冲突', sectId: 'yaozu', _gender: '男'
  },
  {
    id: 'yz-14', name: '青雀', title: '执法弟子', realm: '筑基中期', power: 28200,
    avatar: '青', tone: 'hp', group: '内门弟子', personality: '认真', specialty: '调查、追踪',
    note: '', attitude: '对玩家较友善', sectId: 'yaozu', _gender: '女'
  },
  {
    id: 'yz-15', name: '岩龟', title: '内门弟子', realm: '筑基初期', power: 24000,
    avatar: '岩', tone: 'jade', group: '内门弟子', personality: '沉稳、寡言', specialty: '土系防御',
    note: '常年镇守万妖谷后山', attitude: '中立', sectId: 'yaozu', _gender: '男'
  },
  {
    id: 'yz-16', name: '小狸', title: '外门弟子', realm: '炼气后期', power: 6900,
    avatar: '狸', tone: 'jade', group: '外门弟子', personality: '活泼、热心', specialty: '跑腿打听',
    note: '消息灵通', attitude: '友善', sectId: 'yaozu', _gender: '女'
  },
  {
    id: 'yz-17', name: '青禾兔', title: '外门弟子', realm: '炼气中期', power: 6000,
    avatar: '青', tone: 'jade', group: '外门弟子', personality: '踏实、勤勉', specialty: '药园劳作',
    note: '一心想入内门', attitude: '友善', sectId: 'yaozu', _gender: '女'
  },
  {
    id: 'yz-18', name: '阿牛', title: '杂役弟子', realm: '炼气一层', power: 5100,
    avatar: '阿', tone: 'jade', group: '杂役弟子', personality: '憨厚', specialty: '砍柴挑水',
    note: '谷中杂役数年', attitude: '友善', sectId: 'yaozu', _gender: '男'
  },
  {
    id: 'yz-19', name: '小翠雀', title: '杂役弟子', realm: '炼气二层', power: 5400,
    avatar: '翠', tone: 'jade', group: '杂役弟子', personality: '机灵、嘴碎', specialty: '洒扫、传话',
    note: '常在膳堂附近转悠', attitude: '中立', sectId: 'yaozu', _gender: '女'
  }
]

const yaozuTheme = {
  powerScale: 1.0,
  extraZhiShi: [
    { title: '丹阁执事', specialty: '妖丹调配、丹房巡察', note: '协理大长老药事', realm: '金丹中期', power: 72000 },
    { title: '器阁执事', specialty: '骨料清点、炼器后勤', note: '常与三长老往来', realm: '金丹初期', power: 63000 },
    { title: '外门执事', specialty: '外门考勤、弟子调度', note: '外门弟子多惧其簿册', realm: '金丹初期', power: 60000, gender: '女' }
  ],
  extraQinChuan: [
    { note: '大长老座下亲传', specialty: '炼丹入门', realm: '金丹初期', power: 58000, gender: '男' },
    { note: '二长老座下亲传', specialty: '医理、灵药', realm: '筑基大圆满', power: 36000, gender: '女' },
    { note: '三长老座下亲传', specialty: '骨甲锤锻', realm: '筑基大圆满', power: 34000, gender: '男' },
    { note: '四长老座下亲传', specialty: '蛛阵推演', realm: '筑基后期', power: 32000, gender: '男' },
    { note: '执法长老座下亲传', specialty: '律法、审讯', realm: '筑基后期', power: 33000, gender: '女' }
  ],
  neiMenSpec: [
    '血脉勤修', '兽符抄写', '护谷巡逻', '藏经整理', '丹房助手',
    '器房学徒', '阵基维护', '灵田督耕', '外勤传讯', '内务协理',
    '兽栏照看', '试炼场值守', '山门接待', '化形研习', '灵泉看守'
  ],
  neiMenNote: '有望冲击亲传考核',
  waiMenSpec: [
    '药园除草', '矿洞运料', '山门扫地', '膳堂帮厨', '洗衣浆裳',
    '饲灵禽', '抄录杂务', '传信跑腿', '灯油添换', '柴房劈柴',
    '水井汲水', '菜畦施肥', '仓储盘点', '院落洒扫', '路石修补',
    '试炼场擦拭', '经阁打杂', '丹渣清理', '器屑回收', '灵兽粪便清理',
    '外门巡更', '迎客引路', '杂物搬运', '灶火添薪', '晒药翻片',
    '缝补道袍', '磨刀擦剑', '井绳更换', '篱笆修缮', '账册誊抄'
  ],
  waiMenNote: '盼着血脉觉醒入内门',
  zaYiNote: '杂役年头不短，略通人情'
}

function finalizeSect(sectId, prefix, cores, theme, constName, femaleConst, comment, outPath) {
  const used = new Set(cores.map((m) => m.name))
  usedBySect.set(sectId, used)
  cores.forEach((m) => EXISTING.add(m.name))
  const extras = genExtras(sectId, prefix, used, theme)
  const all = [...cores, ...extras]
  const females = all.filter((m) => m._gender === '女').map((m) => m.name)
  writeSectFile(constName, femaleConst, comment, all, females, outPath)
  const counts = {}
  for (const m of all) counts[m.group] = (counts[m.group] || 0) + 1
  console.log(sectId, all.length, counts, 'female', females.length)
  return { all, females, counts }
}

finalizeSect(
  'tianmo',
  'tm',
  tianmoCores,
  tianmoTheme,
  'TIANMO_MEMBERS',
  'TIANMO_FEMALE_NAMES',
  '天魔宗人物名录（结构对齐青云宗）',
  'src/constants/member-catalog-tianmo.ts'
)

finalizeSect(
  'wanjian',
  'wj',
  wanjianCores,
  wanjianTheme,
  'WANJIAN_MEMBERS',
  'WANJIAN_FEMALE_NAMES',
  '万剑宗人物名录（结构对齐青云宗；圣地战力整体偏高）',
  'src/constants/member-catalog-wanjian.ts'
)

finalizeSect(
  'yaozu',
  'yz',
  yaozuCores,
  yaozuTheme,
  'YAOZU_MEMBERS',
  'YAOZU_FEMALE_NAMES',
  '妖族（万妖谷）人物名录（结构对齐青云宗）',
  'src/constants/member-catalog-yaozu.ts'
)

console.log('done')
