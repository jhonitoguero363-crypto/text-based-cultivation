import type { TreasureCategory } from './treasure'
import { buildLazyIconIndex } from '../utils/lazy-icon-index'
import { TREASURE_ICON_FILES, resolveTreasureIconName } from './treasure-icons'

const icons = buildLazyIconIndex(
  import.meta.glob('../assets/treasures/icons/*.png', {
    import: 'default'
  }) as Record<string, () => Promise<string>>
)

const fallbacks = buildLazyIconIndex(
  import.meta.glob('../assets/treasures/fallback/*.png', {
    import: 'default'
  }) as Record<string, () => Promise<string>>
)

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
  return fallbacks.getCached(file)
}

export function loadTreasureTypeFallbackUrl(type?: string) {
  const file = TREASURE_TYPE_FALLBACK_FILES[normalizeTreasureType(type)]
  return fallbacks.load(file)
}

export function getTreasureIconUrl(name: string, grade?: string, type?: string): string {
  const key = resolveTreasureIconName(name, grade)
  if (key) {
    const file = TREASURE_ICON_FILES[key]
    const url = file ? icons.getCached(file) : ''
    if (url) return url
  }
  return getTreasureTypeFallbackUrl(type)
}

export async function loadTreasureIconUrl(name: string, grade?: string, type?: string) {
  const key = resolveTreasureIconName(name, grade)
  if (key) {
    const file = TREASURE_ICON_FILES[key]
    if (file) {
      const url = await icons.load(file)
      if (url) return url
    }
  }
  return loadTreasureTypeFallbackUrl(type)
}

export function hasTreasureIcon(name: string, grade?: string) {
  const key = resolveTreasureIconName(name, grade)
  return Boolean(key && TREASURE_ICON_FILES[key])
}
