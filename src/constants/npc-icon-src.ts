import { buildLazyIconIndex } from '../utils/lazy-icon-index'
import { NPC_ICON_FILES, resolveNpcIconName } from './npc-icons'

const index = buildLazyIconIndex(
  import.meta.glob('../assets/npcs/icons/*.png', {
    import: 'default'
  }) as Record<string, () => Promise<string>>
)

function fileOf(name: string) {
  const key = resolveNpcIconName(name)
  if (!key) return ''
  return NPC_ICON_FILES[key] || ''
}

export function getNpcIconUrl(name: string): string {
  const file = fileOf(name)
  return file ? index.getCached(file) : ''
}

export function loadNpcIconUrl(name: string) {
  const file = fileOf(name)
  return file ? index.load(file) : Promise.resolve('')
}

export function hasNpcIcon(name: string) {
  return Boolean(fileOf(name))
}
