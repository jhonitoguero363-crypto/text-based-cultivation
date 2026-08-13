import { ORE_MATERIALS } from './ore-catalog'
import { ORE_ICON_FILES, resolveOreIconName } from './ore-icons'

const modules = import.meta.glob('../assets/ores/icons/*.png', {
  eager: true,
  import: 'default'
}) as Record<string, string>

const byFile: Record<string, string> = {}
for (const [path, url] of Object.entries(modules)) {
  const file = path.split('/').pop() || ''
  if (file) byFile[file] = url
}

const levelByName = new Map(ORE_MATERIALS.map((item) => [item.name, item.level]))

export function getOreLevel(name: string) {
  return levelByName.get(name)
}

/** 图鉴切片打包后的 URL，供 <image> / background-image 使用 */
export function getOreIconUrl(name: string, level?: string): string {
  const key = resolveOreIconName(name, level || levelByName.get(name))
  if (!key) return ''
  const file = ORE_ICON_FILES[key]
  return file ? byFile[file] || '' : ''
}

export function hasOreIcon(name: string) {
  return Boolean(getOreIconUrl(name))
}
