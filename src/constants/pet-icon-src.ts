import { PET_SHOP_CATALOG } from './pet-catalog'
import { PET_ICON_FILES, resolvePetIconName } from './pet-icons'

const modules = import.meta.glob('../assets/pets/icons/*.png', {
  eager: true,
  import: 'default'
}) as Record<string, string>

const byFile: Record<string, string> = {}
for (const [path, url] of Object.entries(modules)) {
  const file = path.split('/').pop() || ''
  if (file) byFile[file] = url
}

const realmByName = new Map(PET_SHOP_CATALOG.map((item) => [item.name, item.realm]))

export function getPetRealm(name: string) {
  return realmByName.get(name)
}

/** 图鉴切片打包后的 URL，供 background-image 使用 */
export function getPetIconUrl(name: string, realm?: string): string {
  const key = resolvePetIconName(name, realm || realmByName.get(name))
  if (!key) return ''
  const file = PET_ICON_FILES[key]
  return file ? byFile[file] || '' : ''
}

export function hasPetIcon(name: string) {
  return Boolean(getPetIconUrl(name))
}
