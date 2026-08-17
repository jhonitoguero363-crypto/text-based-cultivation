import { buildLazyIconIndex } from '../utils/lazy-icon-index'
import { MEMBER_ICON_FILES, resolveMemberIconName } from './member-icons'

const index = buildLazyIconIndex(
  import.meta.glob('../assets/members/icons/*.png', {
    import: 'default'
  }) as Record<string, () => Promise<string>>
)

function fileOf(name: string) {
  const key = resolveMemberIconName(name)
  if (!key) return ''
  return MEMBER_ICON_FILES[key] || ''
}

export function getMemberIconUrl(name: string): string {
  const file = fileOf(name)
  return file ? index.getCached(file) : ''
}

export function loadMemberIconUrl(name: string) {
  const file = fileOf(name)
  return file ? index.load(file) : Promise.resolve('')
}

export function hasMemberIcon(name: string) {
  return Boolean(fileOf(name))
}
