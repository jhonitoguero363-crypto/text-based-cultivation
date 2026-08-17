import { ORE_MATERIALS } from './ore-catalog'
import { buildLazyIconIndex } from '../utils/lazy-icon-index'
import { ORE_ICON_FILES, resolveOreIconName } from './ore-icons'

const index = buildLazyIconIndex(
  import.meta.glob('../assets/ores/icons/*.png', {
    import: 'default'
  }) as Record<string, () => Promise<string>>
)

const levelByName = new Map(ORE_MATERIALS.map((item) => [item.name, item.level]))

export function getOreLevel(name: string) {
  return levelByName.get(name)
}

function fileOf(name: string, level?: string) {
  const key = resolveOreIconName(name, level || levelByName.get(name))
  if (!key) return ''
  return ORE_ICON_FILES[key] || ''
}

export function getOreIconUrl(name: string, level?: string): string {
  const file = fileOf(name, level)
  return file ? index.getCached(file) : ''
}

export function loadOreIconUrl(name: string, level?: string) {
  const file = fileOf(name, level)
  return file ? index.load(file) : Promise.resolve('')
}

export function hasOreIcon(name: string, level?: string) {
  return Boolean(fileOf(name, level))
}
