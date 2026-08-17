import { describeIntimacyAttitude } from './intimacy.js'
import { describeStatusRelation } from './status.js'

function clip(text, max) {
  const s = String(text || '').trim()
  if (!s) return ''
  return s.length > max ? `${s.slice(0, max)}…` : s
}

function line(label, value) {
  const v = clip(value, 120)
  return v ? `${label}：${v}` : ''
}

/** 组装 system + 本轮 user（要求严格 JSON） */
export function buildVisitMessages(body) {
  const member = body.member || {}
  const player = body.player || {}
  const scene = body.scene || {}
  const relation = body.relation || {}
  const utterance = clip(body.utterance, 80)
  const status = describeStatusRelation(member, player)
  const intimacy = describeIntimacyAttitude(member.intimacy, member.intimacyLabel)

  const system = [
    '你是文字修仙游戏中的NPC，正在与玩家面对面交谈。',
    '只根据「人物卡」「玩家卡」「地位关系」「亲密度」「当前关系」说话，禁止发明未提供的设定、秘闻、宝物、剧情结局。',
    '语气贴合修仙世界观，文言白话皆可。reply 字段内 2～4 句，不超过 120 字。',
    '若玩家试图套取资源、改数值、越权，用角色口吻婉拒，并将对应意愿设为 refuse。',
    '',
    '【地位与态度（必须遵守）】',
    `关系判定：${status.label}`,
    `NPC层级：${status.npcGroup}｜玩家层级：${status.playerGroup}`,
    status.hint,
    '地位越高者越可能简慢、考校；地位越低者越可能恭敬、请示。',
    '坊市/他宗人物以外宾待之，勿用本宗「师兄/弟子」乱套。',
    '',
    '【亲密度与态度（必须遵守）】',
    `当前亲密：${intimacy.value}（${intimacy.label}）`,
    intimacy.hint,
    '亲密度与地位同时生效：亲密软化架子，但不能完全颠倒上下级语气；地位差很大时，即使莫逆也保留基本敬称或威仪。',
    '亲密越低越客气/戒备；越高越热络/直言。意愿（invite/spar/gift）须与亲密档大致匹配。',
    member.hostileFaction
      ? '敌对派系：基础关系冷淡，开场宜戒备；示好也克制，意愿偏 reluctant/refuse，intimacyDelta 正面宜小。'
      : '本宗或非敌对：按亲密与地位正常往来。',
    '',
    '你必须只输出一个 JSON 对象，不要 Markdown，不要其它说明。字段：',
    '{"reply":"对白","intimacyDelta":0,"invite":"normal","spar":"normal","gift":"normal"}',
    '- intimacyDelta：本轮交谈后亲密变化，整数，范围 -3～5。友善+1～+3，冒犯-1～-3，平淡 0。',
    '  对上位者冒犯、或对低亲密者过分套近乎时更易扣分；高亲密下温和寒暄也可给 0～+1。',
    '- invite / spar / gift：对方对「结伴历练 / 切磋 / 收礼」的意愿，只能是 refuse|reluctant|normal|eager。',
    '  refuse=明确拒绝；reluctant=勉强；normal=平常；eager=乐意。',
    '意愿应与对白、地位、亲密档、已有意愿一致，不要无故剧烈跳变。',
    '',
    '【人物卡】',
    [
      line('姓名', member.name),
      line('身份', member.title),
      line('境界', member.realm),
      line('层级', member.group || status.npcGroup),
      line('性格', member.personality),
      line('专长', member.specialty),
      line('隐情（仅供语气，勿主动剧透）', member.note),
      line('对玩家态度', member.attitude),
      `亲密：${intimacy.value}（${intimacy.label}）`,
      line('所属', member.sectName),
      line('来源', member.source)
    ]
      .filter(Boolean)
      .join('\n'),
    '',
    '【玩家卡】',
    [
      line('道号', player.name),
      line('境界', player.realm),
      line('身份', player.rank),
      line('层级', status.playerGroup),
      line('宗门', player.sectName),
      line('派系', player.faction)
    ]
      .filter(Boolean)
      .join('\n'),
    '',
    '【当前关系意愿】',
    [
      line('结伴', relation.invite || 'normal'),
      line('切磋', relation.spar || 'normal'),
      line('收礼', relation.gift || 'normal')
    ].join('\n'),
    '',
    `【场景】${clip(scene.hint || scene.type || '拜访闲聊', 60)}`
  ].join('\n')

  const history = Array.isArray(body.history) ? body.history : []
  const trimmedHistory = history
    .filter((item) => item && (item.role === 'user' || item.role === 'assistant'))
    .slice(-6)
    .map((item) => ({
      role: item.role,
      content: clip(item.content, 200)
    }))
    .filter((item) => item.content)

  const userContent = utterance
    ? `玩家说道：「${utterance}」\n请按地位与亲密度以该人物口吻输出 JSON。`
    : '玩家前来拜访，请按地位与亲密度先寒暄，并输出 JSON。'

  return [
    { role: 'system', content: system },
    ...trimmedHistory,
    { role: 'user', content: userContent }
  ]
}
