import { getDefaultAvatarUrlByName } from './default-avatar-src'
import { getMemberIconUrl } from './member-icon-src'
import { getNpcIconUrl } from './npc-icon-src'

/** 宗门人物或历练 NPC 头像；无专属图时回退默认男女像 */
export function getPortraitIconUrl(name: string): string {
  return getMemberIconUrl(name) || getNpcIconUrl(name) || getDefaultAvatarUrlByName(name)
}

export function hasPortraitIcon(name: string) {
  return Boolean(getMemberIconUrl(name) || getNpcIconUrl(name))
}
