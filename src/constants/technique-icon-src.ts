import { buildLazyIconIndex } from '../utils/lazy-icon-index'
import { TECHNIQUE_ICON_FILES, resolveTechniqueIconName } from './technique-icons'

const index = buildLazyIconIndex(
  import.meta.glob('../assets/techniques/icons/*.png', {
    import: 'default'
  }) as Record<string, () => Promise<string>>
)

function fileOf(name: string) {
  const key = resolveTechniqueIconName(name)
  if (!key) return ''
  return TECHNIQUE_ICON_FILES[key] || ''
}

export function getTechniqueIconUrl(name: string): string {
  const file = fileOf(name)
  return file ? index.getCached(file) : ''
}

export function loadTechniqueIconUrl(name: string) {
  const file = fileOf(name)
  return file ? index.load(file) : Promise.resolve('')
}

export function hasTechniqueIcon(name: string) {
  return Boolean(fileOf(name))
}
