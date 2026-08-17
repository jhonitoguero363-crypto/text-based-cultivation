/** 与游戏 MEMBER_GROUP_ORDER 一致：越前地位越高 */
const GROUP_ORDER = ['宗主', '长老', '执事', '亲传弟子', '内门弟子', '外门弟子', '杂役弟子']

function groupFromTitle(title) {
  const t = String(title || '')
  if (/杂役/.test(t)) return '杂役弟子'
  if (/亲传/.test(t)) return '亲传弟子'
  if (/内门/.test(t)) return '内门弟子'
  if (/外门/.test(t)) return '外门弟子'
  if (/执法弟子/.test(t)) return '内门弟子'
  if (/执事|堂主|管事/.test(t)) return '执事'
  if (/长老/.test(t)) return '长老'
  if (/宗主|掌门|副宗主/.test(t)) return '宗主'
  return ''
}

function resolveGroup(person) {
  const direct = String(person?.group || '').trim()
  if (GROUP_ORDER.includes(direct)) return direct
  const fromTitle = groupFromTitle(person?.title || person?.rank || '')
  if (fromTitle) return fromTitle
  const rank = String(person?.rank || '').trim()
  if (rank === '散修' || !rank) return ''
  return groupFromTitle(rank) || '外门弟子'
}

function groupIndex(group) {
  const i = GROUP_ORDER.indexOf(group)
  return i < 0 ? -1 : i
}

/**
 * 地位差：npc 相对玩家。
 * higher = NPC 地位更高；lower = 玩家更高；peer = 相近；outsider = 散修/坊市/异宗等
 */
export function describeStatusRelation(member, player) {
  const npcGroup = resolveGroup(member)
  const playerGroup = resolveGroup({
    group: player?.group,
    title: player?.rank,
    rank: player?.rank
  })

  const sameSect =
    member?.source === 'market'
      ? false
      : Boolean(
          player?.sectName &&
            member?.sectName &&
            String(player.sectName) === String(member.sectName)
        )

  if (!sameSect || member?.source === 'market') {
    const kind = member?.source === 'market' ? member?.kind || '坊市修士' : '他宗/路人'
    return {
      relation: 'outsider',
      label: `非本宗同门（${kind}）`,
      npcGroup: npcGroup || '未知',
      playerGroup: playerGroup || (player?.rank === '散修' ? '散修' : '未知'),
      hint: '以外宾/路人口吻；客气或戒备，少用宗门上下级口吻。结伴切磋可更谨慎。'
    }
  }

  if (!playerGroup || String(player?.rank || '') === '散修') {
    return {
      relation: 'outsider',
      label: '玩家尚为散修或身份不明',
      npcGroup: npcGroup || '未知',
      playerGroup: '散修',
      hint: '对方可略疏离或试探；高位者简慢，低位者观望。'
    }
  }

  const ni = groupIndex(npcGroup)
  const pi = groupIndex(playerGroup)
  if (ni < 0 || pi < 0) {
    return {
      relation: 'peer',
      label: '同门，地位相近',
      npcGroup: npcGroup || '未知',
      playerGroup,
      hint: '同辈口吻，自然往来。'
    }
  }

  const diff = pi - ni // >0 玩家地位更低（index 更大）
  if (diff >= 2) {
    return {
      relation: 'higher',
      label: `NPC 远高于玩家（${npcGroup} vs ${playerGroup}）`,
      npcGroup,
      playerGroup,
      hint: '长辈/上位者口吻：训诫、考校、简慢皆可；玩家若失礼，intimacyDelta 易为负，invite/spar 可 reluctant 或 refuse。'
    }
  }
  if (diff === 1) {
    return {
      relation: 'higher',
      label: `NPC 略高于玩家（${npcGroup} vs ${playerGroup}）`,
      npcGroup,
      playerGroup,
      hint: '略带前辈架子，可点拨亦可疏离；亲密低时更冷。'
    }
  }
  if (diff <= -2) {
    return {
      relation: 'lower',
      label: `NPC 远低于玩家（${npcGroup} vs ${playerGroup}）`,
      npcGroup,
      playerGroup,
      hint: '下位者口吻：敬称、谦恭、请示；对结伴切磋更易 eager/normal，少对上位者强硬 refuse（除非性格乖张或玩家极冒犯）。'
    }
  }
  if (diff === -1) {
    return {
      relation: 'lower',
      label: `NPC 略低于玩家（${npcGroup} vs ${playerGroup}）`,
      npcGroup,
      playerGroup,
      hint: '恭敬中带同门熟络，视亲密而定。'
    }
  }
  return {
    relation: 'peer',
    label: `同辈（皆为${npcGroup}）`,
    npcGroup,
    playerGroup,
    hint: '同辈口吻：可争锋可交好，少用上下级训诫。'
  }
}
