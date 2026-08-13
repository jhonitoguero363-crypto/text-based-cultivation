import { BEAST_CATALOG } from './beast-catalog'
import { BEAST_ICON_FILES, resolveBeastIconName } from './beast-icons'

const modules = import.meta.glob('../assets/beasts/icons/*.png', {
  eager: true,
  import: 'default'
}) as Record<string, string>

const byFile: Record<string, string> = {}
for (const [path, url] of Object.entries(modules)) {
  const file = path.split('/').pop() || ''
  if (file) byFile[file] = url
}

const realmByName = new Map(BEAST_CATALOG.map((item) => [item.name, item.realm]))

export function getBeastRealm(name: string) {
  return realmByName.get(name)
}

/** 图鉴切片打包后的 URL，供 background-image 使用 */
export function getBeastIconUrl(name: string, realm?: string): string {
  const key = resolveBeastIconName(name, realm || realmByName.get(name))
  if (!key) return ''
  const file = BEAST_ICON_FILES[key]
  return file ? byFile[file] || '' : ''
}

export function hasBeastIcon(name: string) {
  return Boolean(getBeastIconUrl(name))
}
