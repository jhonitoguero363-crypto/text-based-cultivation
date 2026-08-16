import { NPC_ICON_FILES, resolveNpcIconName } from './npc-icons'

const modules = import.meta.glob('../assets/npcs/icons/*.png', {
  eager: true,
  import: 'default'
}) as Record<string, string>

const byFile: Record<string, string> = {}
for (const [path, url] of Object.entries(modules)) {
  const file = path.split('/').pop() || ''
  if (file) byFile[file] = url
}

export function getNpcIconUrl(name: string): string {
  const key = resolveNpcIconName(name)
  if (!key) return ''
  const file = NPC_ICON_FILES[key]
  return file ? byFile[file] || '' : ''
}

export function hasNpcIcon(name: string) {
  return Boolean(getNpcIconUrl(name))
}
