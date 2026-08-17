import { PET_SHOP_CATALOG } from './pet-catalog'
import { buildLazyIconIndex } from '../utils/lazy-icon-index'
import { PET_ICON_FILES, resolvePetIconName } from './pet-icons'

const index = buildLazyIconIndex(
  import.meta.glob('../assets/pets/icons/*.png', {
    import: 'default'
  }) as Record<string, () => Promise<string>>
)

const realmByName = new Map(PET_SHOP_CATALOG.map((item) => [item.name, item.realm]))

export function getPetRealm(name: string) {
  return realmByName.get(name)
}

function fileOf(name: string, realm?: string) {
  const key = resolvePetIconName(name, realm || realmByName.get(name))
  if (!key) return ''
  return PET_ICON_FILES[key] || ''
}

export function getPetIconUrl(name: string, realm?: string): string {
  const file = fileOf(name, realm)
  return file ? index.getCached(file) : ''
}

export function loadPetIconUrl(name: string, realm?: string) {
  const file = fileOf(name, realm)
  return file ? index.load(file) : Promise.resolve('')
}

export function hasPetIcon(name: string, realm?: string) {
  return Boolean(fileOf(name, realm))
}
