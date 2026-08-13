import { HERB_MATERIALS } from './herb-catalog'
import { HERB_ICON_FILES, resolveHerbIconName } from './herb-icons'

const modules = import.meta.glob('../assets/herbs/icons/*.png', {
  eager: true,
  import: 'default'
}) as Record<string, string>

const byFile: Record<string, string> = {}
for (const [path, url] of Object.entries(modules)) {
  const file = path.split('/').pop() || ''
  if (file) byFile[file] = url
}

const levelByName = new Map(HERB_MATERIALS.map((item) => [item.name, item.level]))

export function getHerbLevel(name: string) {
  return levelByName.get(name)
}

/** 图鉴切片打包后的 URL，供 background-image 使用 */
export function getHerbIconUrl(name: string, level?: string): string {
  const key = resolveHerbIconName(name, level || levelByName.get(name))
  if (!key) return ''
  const file = HERB_ICON_FILES[key]
  return file ? byFile[file] || '' : ''
}

export function hasHerbIcon(name: string) {
  return Boolean(getHerbIconUrl(name))
}
