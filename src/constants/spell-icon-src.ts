import { SPELL_ICON_FILES, resolveSpellIconName } from './spell-icons'

const modules = import.meta.glob('../assets/spells/icons/*.png', {
  eager: true,
  import: 'default'
}) as Record<string, string>

const byFile: Record<string, string> = {}
for (const [path, url] of Object.entries(modules)) {
  const file = path.split('/').pop() || ''
  if (file) byFile[file] = url
}

export function getSpellIconUrl(name: string): string {
  const key = resolveSpellIconName(name)
  if (!key) return ''
  const file = SPELL_ICON_FILES[key]
  return file ? byFile[file] || '' : ''
}

export function hasSpellIcon(name: string) {
  return Boolean(getSpellIconUrl(name))
}
