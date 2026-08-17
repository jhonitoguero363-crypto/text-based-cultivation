import { HERB_MATERIALS } from './herb-catalog'
import { buildLazyIconIndex } from '../utils/lazy-icon-index'
import { HERB_ICON_FILES, resolveHerbIconName } from './herb-icons'

const index = buildLazyIconIndex(
  import.meta.glob('../assets/herbs/icons/*.png', {
    import: 'default'
  }) as Record<string, () => Promise<string>>
)

const levelByName = new Map(HERB_MATERIALS.map((item) => [item.name, item.level]))

export function getHerbLevel(name: string) {
  return levelByName.get(name)
}

function fileOf(name: string, level?: string) {
  const key = resolveHerbIconName(name, level || levelByName.get(name))
  if (!key) return ''
  return HERB_ICON_FILES[key] || ''
}

export function getHerbIconUrl(name: string, level?: string): string {
  const file = fileOf(name, level)
  return file ? index.getCached(file) : ''
}

export function loadHerbIconUrl(name: string, level?: string) {
  const file = fileOf(name, level)
  return file ? index.load(file) : Promise.resolve('')
}

export function hasHerbIcon(name: string, level?: string) {
  return Boolean(fileOf(name, level))
}
