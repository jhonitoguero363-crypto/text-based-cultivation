import maleUrl from '../assets/player/default-male.png'
import femaleUrl from '../assets/player/default-female.png'
import {
  QINGYUN_EXTRA_FEMALE_NAMES,
  TIANMO_FEMALE_NAMES,
  WANJIAN_FEMALE_NAMES,
  YAOZU_FEMALE_NAMES
} from './member-female-names'

/** 已知女性角色（无专属头像时用女默认像） */
const FEMALE_NAMES = new Set([
  // 青云宗
  '柳清寒',
  '苏灵月',
  '叶青璃',
  '江晚晴',
  '何青禾',
  '小翠',
  '陈小满',
  ...QINGYUN_EXTRA_FEMALE_NAMES,
  // 天魔 / 万剑 / 妖族
  ...TIANMO_FEMALE_NAMES,
  ...WANJIAN_FEMALE_NAMES,
  ...YAOZU_FEMALE_NAMES,
  // 历练偶遇（女）
  '林青竹',
  '苏晚晴',
  '李玄风',
  '李玄凤',
  '沈月璃',
  '沈月琉',
  '慕容雪',
  '洛神音',
  '柳如烟',
  '灵兽商人',
  '老乞少女',
  '采药少女',
  '失忆少女',
  '灵宠少女',
  '妖族使者',
  '上古残魂',
  '天外来客'
])

const FEMALE_HINT =
  /女|娘|姬|妃|夫人|小姐|少女|青禾|晚晴|清寒|灵月|青璃|小翠|如烟|神音|慕容雪|鬼姬|魔女|狐帝|蝶母|雪狐|青雀|小狸|毒萝|小幽|霜华|霜月|追影|青禾兔|小翠雀|小翠剑/

export function inferCharacterGender(name: string): '男' | '女' {
  const n = (name || '').trim()
  if (!n) return '男'
  if (FEMALE_NAMES.has(n) || FEMALE_HINT.test(n)) return '女'
  return '男'
}

export function getDefaultAvatarUrl(gender: string): string {
  return gender === '女' ? femaleUrl : maleUrl
}

/** 无专属头像时的默认像（按姓名推断性别） */
export function getDefaultAvatarUrlByName(name: string): string {
  return getDefaultAvatarUrl(inferCharacterGender(name))
}
