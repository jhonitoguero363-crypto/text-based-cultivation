import { buildLazyIconIndex } from '../utils/lazy-icon-index'
import { LOCATION_ICON_FILES, resolveLocationIconName } from './location-icons'

const index = buildLazyIconIndex(
  import.meta.glob('../assets/locations/icons/*.png', {
    import: 'default'
  }) as Record<string, () => Promise<string>>
)

function fileOf(name: string) {
  const key = resolveLocationIconName(name)
  if (!key) return ''
  return LOCATION_ICON_FILES[key] || ''
}

export function getLocationIconUrl(name: string): string {
  const file = fileOf(name)
  return file ? index.getCached(file) : ''
}

export function loadLocationIconUrl(name: string) {
  const file = fileOf(name)
  return file ? index.load(file) : Promise.resolve('')
}

export function hasLocationIcon(name: string) {
  return Boolean(fileOf(name))
}
