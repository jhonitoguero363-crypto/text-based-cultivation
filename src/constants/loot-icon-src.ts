import { buildLazyIconIndex } from '../utils/lazy-icon-index'
import { LOOT_ICON_FILES, resolveLootIconName } from './loot-icons'

const index = buildLazyIconIndex(
  import.meta.glob('../assets/loot/icons/*.png', {
    import: 'default'
  }) as Record<string, () => Promise<string>>
)

function fileOf(name: string) {
  const key = resolveLootIconName(name)
  if (!key) return ''
  return LOOT_ICON_FILES[key] || ''
}

export function getLootIconUrl(name: string): string {
  const file = fileOf(name)
  return file ? index.getCached(file) : ''
}

export function loadLootIconUrl(name: string) {
  const file = fileOf(name)
  return file ? index.load(file) : Promise.resolve('')
}

export function hasLootIcon(name: string) {
  return Boolean(fileOf(name))
}
