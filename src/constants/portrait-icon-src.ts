import { getDefaultAvatarUrlByName } from './default-avatar-src'
import { hasMemberIcon, loadMemberIconUrl } from './member-icon-src'
import { hasNpcIcon, loadNpcIconUrl } from './npc-icon-src'

/** 宗门人物或历练 NPC 头像；无专属图时回退默认男女像 */
export async function loadPortraitIconUrl(name: string): Promise<string> {
  return (
    (await loadMemberIconUrl(name)) ||
    (await loadNpcIconUrl(name)) ||
    getDefaultAvatarUrlByName(name)
  )
}

export function hasPortraitIcon(name: string) {
  return hasMemberIcon(name) || hasNpcIcon(name)
}
