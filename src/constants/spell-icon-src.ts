import { buildLazyIconIndex } from '../utils/lazy-icon-index'
import { SPELL_ICON_FILES, resolveSpellIconName } from './spell-icons'

const index = buildLazyIconIndex(
  import.meta.glob('../assets/spells/icons/*.png', {
    import: 'default'
  }) as Record<string, () => Promise<string>>
)

function fileOf(name: string) {
  const key = resolveSpellIconName(name)
  if (!key) return ''
  return SPELL_ICON_FILES[key] || ''
}

export function getSpellIconUrl(name: string): string {
  const file = fileOf(name)
  return file ? index.getCached(file) : ''
}

export function loadSpellIconUrl(name: string) {
  const file = fileOf(name)
  return file ? index.load(file) : Promise.resolve('')
}

export function hasSpellIcon(name: string) {
  return Boolean(fileOf(name))
}
