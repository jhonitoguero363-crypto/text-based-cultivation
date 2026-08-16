import { memberGroupFromTitle, MEMBER_GROUP_ORDER, type MemberGroup } from './member-catalog'
import { REALM_MAJORS, type RealmState } from './realm'
import { getSectOption, getSectTierRank } from './sects'

/** 玩家可通过修为晋升的身份（不含执事及以上） */
export const PLAYER_PROMOTABLE_RANKS = [
  '杂役弟子',
  '外门弟子',
  '内门弟子',
  '亲传弟子'
] as const

export type PlayerPromotableRank = (typeof PLAYER_PROMOTABLE_RANKS)[number]

/**
 * 三流宗门下，晋升各身份所需大境界序号（REALM_MAJORS index）
 * 炼气=1 · 筑基=2 · 金丹=3 · 元婴=4 · 化神=5 …
 */
export const SECT_RANK_REALM_NEED: Record<PlayerPromotableRank, number> = {
  杂役弟子: 0,
  外门弟子: 1,
  内门弟子: 2,
  亲传弟子: 3
}

function groupOrderIndex(group: MemberGroup | string) {
  const g = memberGroupFromTitle(String(group || ''))
  const i = MEMBER_GROUP_ORDER.indexOf(g)
  return i < 0 ? MEMBER_GROUP_ORDER.indexOf('外门弟子') : i
}

/** 宗门等级对晋升门槛的抬升（大境界档）：三流/二流 0，一流 +1，圣地 +2 */
export function sectRankPromotionTierShift(sectTierRank: number) {
  return Math.max(0, (Number(sectTierRank) || 1) - 2)
}

/**
 * 依当前境界与宗门等级，可达到的最高身份（仅升不降的上限参考）
 */
export function maxSectRankForRealm(
  realm: RealmState,
  sectTierRank = 1
): PlayerPromotableRank {
  const majorIdx = Math.max(0, REALM_MAJORS.indexOf(realm.major))
  const shift = sectRankPromotionTierShift(sectTierRank)
  let best: PlayerPromotableRank = '杂役弟子'
  for (const rank of PLAYER_PROMOTABLE_RANKS) {
    const need = SECT_RANK_REALM_NEED[rank] + shift
    if (majorIdx >= need) best = rank
  }
  return best
}

export function resolveSectTierRankBySectId(sectId: string | null | undefined) {
  return getSectTierRank(getSectOption(sectId)?.tier)
}

/**
 * 计算修为晋升后应有的身份：取「当前身份」与「境界可达身份」中较高者，且不超过亲传。
 * 不会因境界不足而降职。
 */
export function resolvePromotedSectRank(input: {
  currentRank: string
  realm: RealmState
  sectId?: string | null
  sectTierRank?: number
}): { rank: string; promoted: boolean; from: string; to: string } {
  const from = (input.currentRank || '').trim() || '散修'
  if (!from || from === '散修') {
    return { rank: from, promoted: false, from, to: from }
  }

  const tierRank =
    typeof input.sectTierRank === 'number'
      ? input.sectTierRank
      : resolveSectTierRankBySectId(input.sectId)

  const eligible = maxSectRankForRealm(input.realm, tierRank)
  const fromGroup = memberGroupFromTitle(from)
  const fromIdx = groupOrderIndex(fromGroup)
  const eligibleIdx = groupOrderIndex(eligible)

  // 已超过亲传（执事等）则不动
  const capIdx = groupOrderIndex('亲传弟子')
  if (fromIdx < capIdx) {
    return { rank: from, promoted: false, from, to: from }
  }

  // MEMBER_GROUP_ORDER：序号越小职位越高；可晋升当 eligible 更靠前
  if (eligibleIdx >= fromIdx) {
    return { rank: from, promoted: false, from, to: from }
  }

  const to = eligible
  return { rank: to, promoted: true, from, to }
}
