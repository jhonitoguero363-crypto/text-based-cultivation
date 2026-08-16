import type { TreasureCategory } from './treasure'
import { TREASURE_ICON_FILES, resolveTreasureIconName } from './treasure-icons'

const modules = import.meta.glob('../assets/treasures/icons/*.png', {
  eager: true,
  import: 'default'
}) as Record<string, string>

const fallbackModules = import.meta.glob('../assets/treasures/fallback/*.png', {
  eager: true,
  import: 'default'
}) as Record<string, string>

const byFile: Record<string, string> = {}
for (const [path, url] of Object.entries(modules)) {
  const file = path.split('/').pop() || ''
  if (file) byFile[file] = url
}

const fallbackByFile: Record<string, string> = {}
for (const [path, url] of Object.entries(fallbackModules)) {
  const file = path.split('/').pop() || ''
  if (file) fallbackByFile[file] = url
}

/** 无专属图标时，按法宝类别使用默认图 */
export const TREASURE_TYPE_FALLBACK_FILES: Record<TreasureCategory, string> = {
  攻击类: 'type-attack.png',
  防御类: 'type-defend.png',
  辅助类: 'type-assist.png',
  特殊类: 'type-special.png'
}

export function normalizeTreasureType(type?: string): TreasureCategory {
  const text = (type || '').replace(/型$/, '类')
  if (text === '攻击类' || text === '防御类' || text === '辅助类' || text === '特殊类') {
    return text
  }
  return '特殊类'
}

export function getTreasureTypeFallbackUrl(type?: string): string {
  const file = TREASURE_TYPE_FALLBACK_FILES[normalizeTreasureType(type)]
  return fallbackByFile[file] || ''
}

/** 图鉴切片打包后的 URL；无专属图时按类别回退默认图 */
export function getTreasureIconUrl(name: string, grade?: string, type?: string): string {
  const key = resolveTreasureIconName(name, grade)
  if (key) {
    const file = TREASURE_ICON_FILES[key]
    const url = file ? byFile[file] || '' : ''
    if (url) return url
  }
  return getTreasureTypeFallbackUrl(type)
}

export function hasTreasureIcon(name: string, grade?: string, type?: string) {
  return Boolean(getTreasureIconUrl(name, grade, type))
}
