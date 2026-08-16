import { PILL_ICON_FILES, resolvePillIconName } from './pill-icons'

const modules = import.meta.glob('../assets/pills/icons/*.png', {
  eager: true,
  import: 'default'
}) as Record<string, string>

const byFile: Record<string, string> = {}
for (const [path, url] of Object.entries(modules)) {
  const file = path.split('/').pop() || ''
  if (file) byFile[file] = url
}

/** 图鉴切片打包后的 URL，供 background-image 使用 */
export function getPillIconUrl(name: string): string {
  const key = resolvePillIconName(name)
  if (!key) return ''
  const file = PILL_ICON_FILES[key]
  return file ? byFile[file] || '' : ''
}

export function hasPillIcon(name: string) {
  return Boolean(getPillIconUrl(name))
}
