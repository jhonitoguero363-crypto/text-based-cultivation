import { buildLazyIconIndex } from '../utils/lazy-icon-index'
import { PILL_ICON_FILES, resolvePillIconName } from './pill-icons'

const index = buildLazyIconIndex(
  import.meta.glob('../assets/pills/icons/*.png', {
    import: 'default'
  }) as Record<string, () => Promise<string>>
)

function fileOf(name: string) {
  const key = resolvePillIconName(name)
  if (!key) return ''
  return PILL_ICON_FILES[key] || ''
}

/** 仅已缓存；组件请用 loadPillIconUrl */
export function getPillIconUrl(name: string): string {
  const file = fileOf(name)
  return file ? index.getCached(file) : ''
}

export function loadPillIconUrl(name: string) {
  const file = fileOf(name)
  return file ? index.load(file) : Promise.resolve('')
}

export function hasPillIcon(name: string) {
  return Boolean(fileOf(name))
}
