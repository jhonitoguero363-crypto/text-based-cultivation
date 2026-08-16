import { TECHNIQUE_ICON_FILES, resolveTechniqueIconName } from './technique-icons'

const modules = import.meta.glob('../assets/techniques/icons/*.png', {
  eager: true,
  import: 'default'
}) as Record<string, string>

const byFile: Record<string, string> = {}
for (const [path, url] of Object.entries(modules)) {
  const file = path.split('/').pop() || ''
  if (file) byFile[file] = url
}

export function getTechniqueIconUrl(name: string): string {
  const key = resolveTechniqueIconName(name)
  if (!key) return ''
  const file = TECHNIQUE_ICON_FILES[key]
  return file ? byFile[file] || '' : ''
}

export function hasTechniqueIcon(name: string) {
  return Boolean(getTechniqueIconUrl(name))
}
