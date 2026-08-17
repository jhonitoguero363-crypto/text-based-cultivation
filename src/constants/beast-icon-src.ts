import { BEAST_CATALOG } from './beast-catalog'
import { buildLazyIconIndex } from '../utils/lazy-icon-index'
import { BEAST_ICON_FILES, resolveBeastIconName } from './beast-icons'

const index = buildLazyIconIndex(
  import.meta.glob('../assets/beasts/icons/*.png', {
    import: 'default'
  }) as Record<string, () => Promise<string>>
)

const realmByName = new Map(BEAST_CATALOG.map((item) => [item.name, item.realm]))

export function getBeastRealm(name: string) {
  return realmByName.get(name)
}

function fileOf(name: string, realm?: string) {
  const key = resolveBeastIconName(name, realm || realmByName.get(name))
  if (!key) return ''
  return BEAST_ICON_FILES[key] || ''
}

export function getBeastIconUrl(name: string, realm?: string): string {
  const file = fileOf(name, realm)
  return file ? index.getCached(file) : ''
}

export function loadBeastIconUrl(name: string, realm?: string) {
  const file = fileOf(name, realm)
  return file ? index.load(file) : Promise.resolve('')
}

export function hasBeastIcon(name: string, realm?: string) {
  return Boolean(fileOf(name, realm))
}
