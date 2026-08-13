/** 现实 6 小时 = 游戏 1 日 */
export const MS_PER_GAME_DAY = 6 * 60 * 60 * 1000

/** 修历 / 天元历纪元起点（天元元年正月初一） */
export const GAME_EPOCH_MS = Date.UTC(2026, 0, 1, 0, 0, 0)

/** 天元历：一年十二月，每月三十日（农历风格简化） */
export const TIANYUAN_DAYS_PER_MONTH = 30
export const TIANYUAN_MONTHS_PER_YEAR = 12
export const TIANYUAN_DAYS_PER_YEAR = TIANYUAN_DAYS_PER_MONTH * TIANYUAN_MONTHS_PER_YEAR

const HEAVENLY_STEMS = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'] as const
const EARTHLY_BRANCHES = [
  '子',
  '丑',
  '寅',
  '卯',
  '辰',
  '巳',
  '午',
  '未',
  '申',
  '酉',
  '戌',
  '亥'
] as const

const LUNAR_MONTHS = [
  '正月',
  '二月',
  '三月',
  '四月',
  '五月',
  '六月',
  '七月',
  '八月',
  '九月',
  '十月',
  '冬月',
  '腊月'
] as const

const LUNAR_DAYS = [
  '初一',
  '初二',
  '初三',
  '初四',
  '初五',
  '初六',
  '初七',
  '初八',
  '初九',
  '初十',
  '十一',
  '十二',
  '十三',
  '十四',
  '十五',
  '十六',
  '十七',
  '十八',
  '十九',
  '二十',
  '廿一',
  '廿二',
  '廿三',
  '廿四',
  '廿五',
  '廿六',
  '廿七',
  '廿八',
  '廿九',
  '三十'
] as const

export interface TianyuanDate {
  /** 自纪元起的游戏日序号（从 0 起） */
  dayIndex: number
  /** 天元年份（从 1 起） */
  year: number
  /** 干支年，如 甲子 */
  yearGanzhi: string
  /** 月序 1～12 */
  month: number
  /** 日序 1～30 */
  day: number
  monthName: string
  dayName: string
}

export function getGameNow(now = Date.now()) {
  return now
}

/** 自纪元起的游戏日序号（从 0 起） */
export function getGameDayIndex(now = Date.now()) {
  return Math.floor(Math.max(0, now - GAME_EPOCH_MS) / MS_PER_GAME_DAY)
}

/** 用于存档比对的游戏日 key */
export function getGameDayKey(now = Date.now()) {
  return `gday-${getGameDayIndex(now)}`
}

export function getYearGanzhi(yearIndexZeroBased: number) {
  const i = ((yearIndexZeroBased % 60) + 60) % 60
  return `${HEAVENLY_STEMS[i % 10]}${EARTHLY_BRANCHES[i % 12]}`
}

/** 将游戏日换算为天元历（农历月日风格） */
export function getTianyuanDate(now = Date.now()): TianyuanDate {
  const dayIndex = getGameDayIndex(now)
  const yearIndex = Math.floor(dayIndex / TIANYUAN_DAYS_PER_YEAR)
  const dayOfYear = dayIndex % TIANYUAN_DAYS_PER_YEAR
  const monthIndex = Math.floor(dayOfYear / TIANYUAN_DAYS_PER_MONTH)
  const dayIndexInMonth = dayOfYear % TIANYUAN_DAYS_PER_MONTH
  return {
    dayIndex,
    year: yearIndex + 1,
    yearGanzhi: getYearGanzhi(yearIndex),
    month: monthIndex + 1,
    day: dayIndexInMonth + 1,
    monthName: LUNAR_MONTHS[monthIndex],
    dayName: LUNAR_DAYS[dayIndexInMonth]
  }
}

/**
 * 天元日历展示
 * - full：天元日历 · 甲子年正月初一
 * - short：甲子年正月初一
 * - compact：正月初一
 */
export function formatTianyuanCalendar(
  now = Date.now(),
  style: 'full' | 'short' | 'compact' = 'full'
) {
  const d = getTianyuanDate(now)
  const md = `${d.monthName}${d.dayName}`
  if (style === 'compact') return md
  if (style === 'short') return `${d.yearGanzhi}年${md}`
  return `天元日历 · ${d.yearGanzhi}年${md}`
}

/** @deprecated 兼容旧调用；现统一为天元短日期 */
export function formatGameDay(now = Date.now()) {
  return formatTianyuanCalendar(now, 'short')
}

/** 距下一游戏日的毫秒 */
export function msUntilNextGameDay(now = Date.now()) {
  const elapsed = Math.max(0, now - GAME_EPOCH_MS) % MS_PER_GAME_DAY
  return MS_PER_GAME_DAY - elapsed
}

/** 距下一游戏日的可读文案，如「还有 3 时 12 分」 */
export function formatUntilNextGameDay(now = Date.now()) {
  const ms = msUntilNextGameDay(now)
  const totalMin = Math.ceil(ms / 60000)
  const h = Math.floor(totalMin / 60)
  const m = totalMin % 60
  if (h <= 0) return `还有 ${m} 分换日`
  return `还有 ${h} 时 ${m} 分换日`
}

export function isSameGameDay(aKey: string, now = Date.now()) {
  return aKey === getGameDayKey(now)
}
