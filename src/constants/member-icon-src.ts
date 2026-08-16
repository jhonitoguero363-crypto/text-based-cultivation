import { MEMBER_ICON_FILES, resolveMemberIconName } from './member-icons'

const modules = import.meta.glob('../assets/members/icons/*.png', {
  eager: true,
  import: 'default'
}) as Record<string, string>

const byFile: Record<string, string> = {}
for (const [path, url] of Object.entries(modules)) {
  const file = path.split('/').pop() || ''
  if (file) byFile[file] = url
}

export function getMemberIconUrl(name: string): string {
  const key = resolveMemberIconName(name)
  if (!key) return ''
  const file = MEMBER_ICON_FILES[key]
  return file ? byFile[file] || '' : ''
}

export function hasMemberIcon(name: string) {
  return Boolean(getMemberIconUrl(name))
}
