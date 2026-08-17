<template>
  <view class="page page--sub">
    <PageHeader title="拜访" :subtitle="`${member?.name || ''} · ${member?.title || ''}`" show-back />
    <view class="content" v-if="member">
      <view class="panel">
        <view class="hero">
          <PlayerAvatar
            v-if="member.self"
            :gender="player.gender"
            :fallback-char="member.avatar"
            size="lg"
          />
          <PortraitAvatar
            v-else
            :name="member.name"
            :fallback-char="member.avatar"
            size="lg"
          />
          <view class="hero__body">
            <text class="name">{{ member.name }}{{ member.self ? ' · 我' : '' }}</text>
            <text class="meta">{{ member.title }} · {{ member.realm }}</text>
            <text v-if="member.source !== 'market' && member.division" class="meta">
              归属 {{ member.division }}
            </text>
            <text class="meta">战力 {{ member.power.toLocaleString() }}</text>
            <view v-if="member.source === 'market'" class="favor">
              <text class="muted">来源</text>
              <text class="jade">坊市偶遇 · {{ member.kind || '修士' }}</text>
            </view>
            <view v-else-if="!member.self" class="favor">
              <text class="muted">态度</text>
              <text class="hp">{{ member.attitude || '中立' }}</text>
            </view>
            <view v-if="!member.self" class="favor">
              <text class="muted">亲密</text>
              <text class="gold">{{ intimacyText }}</text>
            </view>
          </view>
        </view>
      </view>

      <view class="panel">
        <view class="section-title">
          <text class="section-title__main">人物情报</text>
          <text class="section-title__sub">{{ member.source === 'market' ? '性格与事迹' : '性格与专长' }}</text>
        </view>
        <view class="info-row">
          <text class="info-label">性格</text>
          <text class="info-val">{{ member.personality || '未知' }}</text>
        </view>
        <view v-if="member.source !== 'market'" class="info-row">
          <text class="info-label">专长</text>
          <text class="info-val">{{ member.specialty || '未知' }}</text>
        </view>
        <view v-if="member.rootBone" class="info-row">
          <text class="info-label">根骨</text>
          <text class="info-val gold">{{ member.rootBone }}</text>
        </view>
        <view v-if="member.note && member.source !== 'market'" class="info-row">
          <text class="info-label">隐情</text>
          <text class="info-val jade">{{ member.note }}</text>
        </view>
        <view v-if="member.source === 'market'" class="info-row info-row--stack">
          <text class="info-label">事件</text>
          <text class="info-val gold market-event">{{ member.specialty }}</text>
        </view>
      </view>

      <view v-if="moleHint" class="panel mole-panel">
        <view class="section-title">
          <text class="section-title__main">卧底提示</text>
          <text class="section-title__sub">举止反常</text>
        </view>
        <text class="mole-panel__text">{{ moleHint }}</text>
      </view>

      <view class="panel">
        <view class="section-title">
          <text class="section-title__main">互动</text>
          <text class="section-title__sub">选择与对方的互动方式</text>
        </view>
        <view v-for="action in actions" :key="action.title" class="action-row" @tap="onAction(action.title)">
          <view class="action-row__body">
            <text class="action-row__title">{{ action.title }}</text>
            <text class="action-row__desc">{{ action.desc }}</text>
            <text v-if="actionNote(action)" class="action-row__note">{{ actionNote(action) }}</text>
          </view>
          <text class="arrow">›</text>
        </view>
      </view>

      <view v-if="canChat" class="panel chat-panel">
        <view class="section-title">
          <text class="section-title__main">交谈</text>
          <text class="section-title__sub">{{ chatBusy ? '对方沉吟中…' : '灵机对白' }}</text>
        </view>
        <scroll-view
          class="chat-log"
          scroll-y
          :scroll-into-view="chatScrollInto"
          scroll-with-animation
        >
          <view v-if="!chatLines.length" class="chat-log__empty empty-tip">
            尚未开口 · 可点快捷语或自行输入
          </view>
          <view
            v-for="(line, idx) in chatLines"
            :id="`chat-line-${idx}`"
            :key="`${line.role}-${idx}`"
            class="chat-bubble"
            :class="`chat-bubble--${line.role}`"
          >
            <text class="chat-bubble__role">{{ line.role === 'user' ? '我' : member.name }}</text>
            <text class="chat-bubble__text">{{ line.content }}</text>
          </view>
          <view id="chat-log-end" class="chat-log__end" />
        </scroll-view>
        <view class="chat-presets">
          <view
            v-for="preset in chatPresets"
            :key="preset"
            class="chat-preset"
            :class="{ 'chat-preset--off': chatBusy }"
            @tap="sendChat(preset)"
          >
            {{ preset }}
          </view>
        </view>
        <view class="chat-compose">
          <input
            class="chat-input"
            type="text"
            maxlength="80"
            :disabled="chatBusy"
            :value="chatDraft"
            placeholder="说一句…"
            confirm-type="send"
            @input="onChatInput"
            @confirm="sendChat()"
          />
          <view
            class="btn btn--sm"
            :class="chatBusy || !chatDraft.trim() ? 'btn--ghost' : 'btn--gold'"
            @tap="sendChat()"
          >
            {{ chatBusy ? '…' : '发送' }}
          </view>
        </view>
        <text v-if="relationHint" class="chat-relation">{{ relationHint }}</text>
      </view>

      <view v-if="isMerchant && merchantOffers.length" class="panel">
        <view class="section-title">
          <text class="section-title__main">行商私货</text>
          <text class="section-title__sub">略高一境 · {{ merchantOffers.length }} 件</text>
        </view>
        <view v-for="item in merchantOffers" :key="item.id" class="mer-card">
          <view class="mer-card__art">
            <HerbIcon v-if="item.materialKind === 'herb'" :name="item.name" size="md" />
            <OreIcon v-else-if="item.materialKind === 'ore'" :name="item.name" size="md" />
            <LootMaterialIcon
              v-else-if="item.materialKind === 'loot' || item.category === '材料'"
              :name="item.name"
              size="md"
            />
            <PillIcon v-else-if="item.category === '丹药'" :name="item.name" size="md" />
            <TechniqueIcon v-else-if="item.category === '功法'" :name="item.name" size="md" />
            <TreasureIcon
              v-else-if="item.category === '法宝'"
              :name="item.name"
              :grade="item.treasure?.gradeLabel"
              :type="item.treasure?.type"
              size="md"
            />
            <view v-else class="mer-card__fallback">{{ item.category.slice(0, 1) }}</view>
          </view>
          <view class="mer-card__body">
            <view class="mer-card__title">
              <text class="mer-card__name">{{ item.name }}</text>
              <text class="tag tag--gold">{{ item.category }}</text>
            </view>
            <text class="mer-card__meta">{{ item.meta }}</text>
            <text class="mer-card__effect">{{ item.effect }}</text>
          </view>
          <view
            class="mer-card__buy"
            :class="canBuyMerchant(item) ? 'mer-card__buy--ok' : 'mer-card__buy--off'"
            @tap="buyMerchantOffer(item)"
          >
            <text class="mer-card__buy-label">灵石</text>
            <text class="mer-card__buy-price">{{ item.price.toLocaleString() }}</text>
          </view>
        </view>
        <text class="hint">丹药 / 功法 / 法宝 / 药材 / 矿石 · 随日刷新</text>
      </view>
    </view>
    <view v-else class="content">
      <view class="panel">
        <view class="empty-tip">未找到该人物</view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import Taro, { useDidShow } from '@tarojs/taro'
import PageHeader from '../../components/PageHeader.vue'
import HerbIcon from '../../components/HerbIcon.vue'
import LootMaterialIcon from '../../components/LootMaterialIcon.vue'
import OreIcon from '../../components/OreIcon.vue'
import PillIcon from '../../components/PillIcon.vue'
import PlayerAvatar from '../../components/PlayerAvatar.vue'
import PortraitAvatar from '../../components/PortraitAvatar.vue'
import TechniqueIcon from '../../components/TechniqueIcon.vue'
import TreasureIcon from '../../components/TreasureIcon.vue'
import {
  combatArchetypeFromNpcKind,
  estimateNpcPower,
  type AdventureNpc
} from '../../constants/adventure-npc-catalog'
import type { MarketOffer } from '../../constants/market-shop'
import { memberGroupFromTitle, type MemberGroup } from '../../constants/member-catalog'
import {
  formatMissionConditionText,
  isEscortMissionKind,
  resolveEscortMembers,
  resolveMoleMember,
  rollMoleTalkLine
} from '../../constants/mission-catalog'
import { inferCharacterGender } from '../../constants/default-avatar-src'
import {
  buildBattlePreview,
  enemyAttrFromNpcKind,
  formatBattleFlavor,
  rollBattleOutcome,
  rollPlayerBattleFate
} from '../../constants/adventure-battle'
import { formatLifesavePreviewLine } from '../../constants/pill-system'
import {
  formatCliffSentenceLabel,
  formatDurationMs,
  rollDeathDuelLoot,
  summarizeDeathDuelLoot
} from '../../constants/sect-duel'
import { getRealmPracticeExpBase } from '../../constants/realm-exp'
import { rollSparOutcome } from '../../constants/spar'
import { VISIT_CHAT_PRESETS } from '../../constants/chat-api'
import {
  applyStanceToIntimacyGain,
  getChatRelation,
  stanceLabel,
  stanceRefuseToast,
  type ChatRelationEffects
} from '../../constants/chat-relation'
import { formatIntimacy, intimacyLabel, isHostileIntimacyTarget, INTIMACY_GIFT, INTIMACY_INVITE_ADVENTURE, DUAL_CULTIVATION_INTIMACY_MIN } from '../../constants/intimacy'
import { getSectOption } from '../../constants/sects'
import type { TreasureGrade } from '../../constants/treasure'
import { getVisitChatHistory, requestVisitChat, type VisitChatTurn } from '../../services/visit-chat'
import { ADVENTURE_COMPANION_MAX, useAdventureStore } from '../../stores/adventure'
import { usePlayerStore } from '../../stores/player'
import { useSectStore, type Member } from '../../stores/sect'
import { useTreasureStore } from '../../stores/treasure'

type VisitMember = Member & {
  source?: 'sect' | 'market'
  kind?: string
}

const sect = useSectStore()
const player = usePlayerStore()
const adventure = useAdventureStore()
const treasure = useTreasureStore()

function foeCombatAttr(target: VisitMember) {
  if (target.source === 'market') return enemyAttrFromNpcKind(target.kind)
  const faction = getSectOption(target.sectId)?.faction
  if (faction === '妖族') return '木'
  if (faction === '魔门') return '火'
  return '金'
}

const selfMember = computed<VisitMember>(() => {
  const rank = player.rank || '外门弟子'
  return {
    id: 'self',
    name: player.name || '散修',
    title: rank,
    realm: player.realm,
    power: player.combatPower,
    avatar: (player.name || '我').slice(0, 1),
    tone: 'jade',
    group: memberGroupFromTitle(rank),
    division: '未划分',
    personality: '坚韧',
    specialty: '修行问道',
    note: '',
    attitude: '',
    sectId: (sect.sectId || 'qingyun') as Member['sectId'],
    self: true,
    source: 'sect'
  }
})

function mapMarketNpc(npc: AdventureNpc): VisitMember {
  return {
    id: npc.id,
    name: npc.name,
    title: npc.title,
    realm: npc.realm,
    power: estimateNpcPower(npc.realm, npc.id, combatArchetypeFromNpcKind(npc.kind)),
    avatar: npc.avatar || npc.name.slice(0, 1),
    tone: 'jade',
    group: '外门弟子' as MemberGroup,
    division: '未划分',
    personality: npc.personality,
    specialty: npc.event,
    note: `常出没于${npc.place}`,
    attitude: '中立',
    sectId: (sect.sectId || 'qingyun') as Member['sectId'],
    self: false,
    source: 'market',
    kind: npc.kind
  }
}

const member = computed<VisitMember | null>(() => {
  if (adventure.visitNpc) return mapMarketNpc(adventure.visitNpc)
  if (sect.visitTargetId === 'self') return selfMember.value
  const found = sect.members.find((item) => item.id === sect.visitTargetId)
  return found ? { ...found, source: 'sect' as const } : null
})

const intimacyText = computed(() => {
  const target = member.value
  if (!target || target.self) return ''
  return formatIntimacy(player.getIntimacy(target.id, target.attitude, intimacySeedOpts(target)))
})

function intimacySeedOpts(target: VisitMember | null | undefined) {
  if (!target || target.self) return undefined
  return {
    hostile: isHostileIntimacyTarget(player.sectId, {
      sectId: target.sectId,
      kind: target.kind,
      source: target.source
    })
  }
}

const canChat = computed(() => {
  const target = member.value
  return !!target && !target.self
})

const chatPresets = VISIT_CHAT_PRESETS
const chatDraft = ref('')
const chatBusy = ref(false)
const chatLines = ref<VisitChatTurn[]>([])
const relationTick = ref(0)
const chatScrollInto = ref('')

function scrollChatToEnd() {
  chatScrollInto.value = ''
  // 下一帧再设，确保 scroll-view 识别变化
  setTimeout(() => {
    chatScrollInto.value = 'chat-log-end'
  }, 32)
}

const chatRelation = computed<ChatRelationEffects>(() => {
  relationTick.value
  const id = member.value?.id || ''
  return id ? getChatRelation(id) : getChatRelation('')
})

const relationHint = computed(() => {
  if (!canChat.value) return ''
  const r = chatRelation.value
  return `意愿 · 结伴${stanceLabel(r.invite)} · 切磋${stanceLabel(r.spar)} · 收礼${stanceLabel(r.gift)}`
})

function reloadChatLines() {
  const id = member.value?.id || ''
  chatLines.value = id ? getVisitChatHistory(id) : []
  relationTick.value += 1
  scrollChatToEnd()
}

watch(
  () => member.value?.id,
  () => {
    chatDraft.value = ''
    reloadChatLines()
  },
  { immediate: true }
)

function onChatInput(e: { detail?: { value?: string } }) {
  chatDraft.value = String(e?.detail?.value || '')
}

async function sendChat(preset?: string) {
  const target = member.value
  if (!target || target.self || chatBusy.value) return
  const text = String(preset || chatDraft.value || '').trim().slice(0, 80)
  if (!text) return toast('请先说一句')

  chatBusy.value = true
  chatDraft.value = ''
  try {
    const intimacy = player.getIntimacy(target.id, target.attitude, intimacySeedOpts(target))
    const result = await requestVisitChat({
      utterance: text,
      member: {
        id: target.id,
        name: target.name,
        title: target.title,
        realm: target.realm,
        group: target.group,
        personality: target.personality,
        specialty: target.specialty,
        note: target.note,
        attitude: target.attitude,
        intimacy,
        intimacyLabel: intimacyLabel(intimacy),
        sectName:
          target.source === 'market'
            ? String(target.kind || '坊市')
            : sect.name || getSectOption(target.sectId)?.name || '',
        source: target.source || 'sect',
        hostileFaction: !!intimacySeedOpts(target)?.hostile
      },
      player: {
        id: 'self',
        name: player.name || '散修',
        realm: player.realm,
        rank: player.rank || '散修',
        sectName: player.sect || sect.name || '',
        faction: getSectOption(player.sectId)?.faction || ''
      },
      sceneHint: target.source === 'market' ? '坊市偶遇交谈' : '宗门拜访闲聊'
    })
    reloadChatLines()

    const parts: string[] = []
    if (!result.fallback && result.effects.intimacyDelta) {
      const next = player.addIntimacy(
        target.id,
        result.effects.intimacyDelta,
        target.attitude,
        intimacySeedOpts(target)
      )
      player.persist()
      const sign = result.effects.intimacyDelta > 0 ? '+' : ''
      parts.push(`亲密 ${sign}${result.effects.intimacyDelta} → ${formatIntimacy(next)}`)
    }
    if (result.fallback) {
      parts.push(
        result.error === 'network' || result.error === 'empty' ? '灵机不显，以常言对之' : '对方应之以常言'
      )
    }
    if (parts.length) toast(parts.join(' · '))
  } finally {
    chatBusy.value = false
  }
}

useDidShow(() => {
  adventure.ensureDailyMarket(player.realmState.major)
  const npc = adventure.visitNpc
  if (npc?.kind === '商人') {
    adventure.ensureMerchantShop(npc.id, player.realmState.major)
  }
  const target = member.value
  if (target && !target.self) {
    player.ensureIntimacySeed(target.id, target.attitude, intimacySeedOpts(target))
    player.persist()
  }
  reloadChatLines()
})

const isMerchant = computed(
  () => member.value?.source === 'market' && member.value.kind === '商人'
)

const moleTarget = computed(() => {
  const mission = sect.activeMission
  if (!mission || mission.objective?.kind !== 'find_mole') return null
  const target = member.value
  if (!target || target.self || target.source === 'market') return null
  const mole = resolveMoleMember(mission, sect.members)
  if (!mole.id || target.id !== mole.id) return null
  return { mission, mole }
})

const moleHint = computed(() => {
  if (!moleTarget.value) return ''
  const done = (moleTarget.value.mission.progress || 0) >= (moleTarget.value.mission.objective?.target || 1)
  if (done) return '此人已承认卧底身份，可回角色页完成任务。'
  return '此人气息驳杂、言辞闪烁，极可能是潜入本宗的卧底。可与其交谈拆穿。'
})

const merchantOffers = computed(() => {
  if (!isMerchant.value || !member.value) return [] as MarketOffer[]
  return adventure.getMerchantOffers(member.value.id)
})

const actions = computed(() => {
  const rel = chatRelation.value
  const list = [
    {
      title: '邀请历练',
      desc:
        rel.invite === 'refuse'
          ? '对方目前不愿结伴'
          : `结伴探索；意愿 · ${stanceLabel(rel.invite)}`
    },
    {
      title: '切磋比武',
      desc:
        rel.spar === 'refuse'
          ? '对方目前不愿切磋'
          : `点到为止；意愿 · ${stanceLabel(rel.spar)}`
    },
    {
      title: '生死比斗',
      desc: '胜则尽夺对方资源，败则伤或陨'
    },
    {
      title: '赠送物品',
      desc:
        rel.gift === 'refuse'
          ? '对方目前不愿收礼'
          : `消耗药材或丹药；意愿 · ${stanceLabel(rel.gift)}`
    },
    { title: '邀请双修', desc: '邀至洞府双修，仅增修为' }
  ]
  const target = member.value
  const mission = sect.activeMission
  const kind = mission?.objective?.kind
  if (isEscortMissionKind(kind)) {
    const route = resolveEscortMembers(mission, sect.members)
    let desc = formatMissionConditionText(mission, sect.members, sect.sectId)
    if (route.pickupName && route.deliverName) {
      if (route.phase === 'none') {
        desc = target?.id === route.pickupId
          ? `在此领取，再送往 ${route.deliverName}`
          : `请先拜访 ${route.pickupName} 领取`
      } else if (route.phase === 'holding') {
        desc = target?.id === route.deliverId
          ? `在此送达（来自 ${route.pickupName}）`
          : `请送达 ${route.deliverName}`
      } else {
        desc = '已送达，可回角色页完成'
      }
    }
    list.unshift({ title: '任务交接', desc })
  }
  if (kind === 'market_talk' && target?.source === 'market') {
    list.unshift({ title: '寻访交谈', desc: '完成寻访散修任务' })
  }
  if (kind === 'rescue_talk' && target && !target.self) {
    list.unshift({ title: '营救交谈', desc: '安抚被困弟子' })
  }
  if (moleTarget.value) {
    const done =
      (moleTarget.value.mission.progress || 0) >= (moleTarget.value.mission.objective?.target || 1)
    list.unshift({
      title: '卧底交谈',
      desc: done ? '已拆穿，可回角色页完成' : '质问对方，拆穿卧底身份'
    })
  }
  if (!target || target.self) {
    return list.filter(
      (item) =>
        item.title !== '邀请双修' &&
        item.title !== '切磋比武' &&
        item.title !== '生死比斗'
    )
  }
  let next = list
  if (target.source === 'market' && target.kind === '商人') {
    next = next.filter(
      (item) =>
        item.title !== '邀请历练' &&
        item.title !== '切磋比武' &&
        item.title !== '生死比斗'
    )
  }
  // 生死比斗仅限宗门同门
  if (target.source === 'market') {
    next = next.filter((item) => item.title !== '生死比斗')
  }
  const targetGender = inferCharacterGender(target.name)
  const intimacy = player.getIntimacy(target.id, target.attitude, intimacySeedOpts(target))
  if (targetGender === player.gender || intimacy < DUAL_CULTIVATION_INTIMACY_MIN) {
    return next.filter((item) => item.title !== '邀请双修')
  }
  return next
})

function toast(title: string) {
  Taro.showToast({ title, icon: 'none' })
}

function actionNote(action: { title: string; desc: string }) {
  if (action.title === '生死比斗' && member.value && !member.value.self) {
    return `执法堂押往思过崖 · 胜后思过 ${formatCliffSentenceLabel(member.value.group)}`
  }
  if (action.title === '邀请历练' && member.value && !member.value.self) {
    if (adventure.hasCompanion(member.value.id)) {
      return `已在同行名单（${adventure.companionCount}/${ADVENTURE_COMPANION_MAX}）`
    }
    return `空位 ${adventure.companionSlotsLeft}`
  }
  return ''
}

function handleDeathDuelDefeat(
  enemyName: string,
  enemyPower: number,
  opts?: { elementLabel?: string; winChance?: number }
) {
  const myPower = player.combatPower
  const { fate, deathChance, injuryChance } = rollPlayerBattleFate(myPower, enemyPower)
  const deathPct = Math.round(deathChance * 100)
  const injuryPct = Math.round(injuryChance * 100)
  const flavor = formatBattleFlavor({
    won: false,
    enemyName,
    scene: 'duel',
    elementLabel: opts?.elementLabel,
    fate,
    winChance: opts?.winChance
  })
  if (fate === 'death') {
    const saved = player.tryConsumeLifesave()
    if (saved.ok) {
      const pillLabel = saved.pillName || '保命丹'
      const stateTip = saved.injured ? '重伤未愈，需疗伤' : '伤势无碍'
      toast(`${pillLabel}生效，逃过身死（${stateTip}）`)
      return
    }
    player.persist()
    Taro.showModal({
      title: '身死道消',
      content: `${flavor}\n此世修为尽散（阵亡风险约 ${deathPct}%）。是否重新开辟道途？`,
      confirmText: '重新开始',
      showCancel: false,
      success: () => {
        player.wipeOnDeath()
        Taro.reLaunch({ url: '/pages/create/index' })
      }
    })
    return
  }
  if (fate === 'injury') {
    player.setInjured(true)
    player.persist()
    return toast(`${flavor}（约 ${injuryPct}%）`)
  }
  toast(flavor)
}

function lifesaveLine() {
  return formatLifesavePreviewLine({
    bagNames: player.bag.filter((item) => item.category === '丹药').map((item) => item.name),
    charges: player.lifesaveCharges
  })
}

function startDeathDuel() {
  const target = member.value
  if (!target || target.self) return toast('不可与自己比斗')
  if (target.source === 'market') return toast('生死比斗仅限宗门同门')
  if (player.injured) return toast('伤势未愈，不宜死斗')
  if (player.onCliff) return toast('思过崖面壁期间不可动手')

  const preview = buildBattlePreview({
    myPower: player.combatPower,
    enemyPower: target.power,
    enemyName: target.name,
    myAttrs: player.battleSpellAttrs(),
    enemyAttr: foeCombatAttr(target),
    titleHint: `与「${target.name}」（${target.group}）约死斗。`,
    showRisk: true,
    lifesaveLine: lifesaveLine()
  })
  const sentence = formatCliffSentenceLabel(target.group)
  Taro.showModal({
    title: '生死比斗',
    content: `${preview.content}\n胜：尽夺对方资源，并入思过崖面壁 ${sentence}\n败：重伤或身死道消\n是否开启？`,
    confirmText: '死斗',
    confirmColor: '#c45c5c',
    success: (res) => {
      if (!res.confirm) return
      const outcome = rollBattleOutcome(player.combatPower, target.power, {
        elementMod: preview.elementMod
      })
      if (!outcome.won) {
        handleDeathDuelDefeat(target.name, target.power, {
          elementLabel: preview.elementLabel,
          winChance: outcome.winChance
        })
        return
      }
      const castSpell = player.resolveBattleSpellNames()[0] || ''
      const flavor = formatBattleFlavor({
        won: true,
        enemyName: target.name,
        scene: 'duel',
        castSpell,
        elementLabel: preview.elementLabel,
        winChance: outcome.winChance
      })
      const loot = rollDeathDuelLoot({ group: target.group, realm: String(target.realm) })
      player.applyDeathDuelLoot(loot)
      player.startCliffPunishment({
        targetName: target.name,
        targetGroup: target.group,
        reason: `与同门「${target.name}」生死比斗，夺其资财`
      })
      player.addIntimacy(target.id, -40, target.attitude)
      player.persist()
      const summary = summarizeDeathDuelLoot(loot)
      Taro.showModal({
        title: '死斗胜',
        content: `${flavor}\n尽夺其资源：\n${summary}\n\n执法堂已将你押往思过崖，面壁 ${sentence}（剩余 ${formatDurationMs(player.cliffRemainMs)}）。`,
        confirmText: '前往思过崖',
        cancelText: '稍后',
        success: (nav) => {
          if (nav.confirm) {
            Taro.navigateTo({ url: '/pages/sect/cliff' })
          }
        }
      })
    }
  })
}

function inviteToAdventure() {
  const target = member.value
  if (!target || target.self) return toast('不可邀请自己')
  const stance = getChatRelation(target.id).invite
  if (stance === 'refuse') return toast(stanceRefuseToast('invite'))
  const result = adventure.inviteCompanion({
    id: target.id,
    name: target.name,
    title: target.title,
    realm: String(target.realm),
    power: target.power,
    avatar: target.avatar,
    group: target.kind || target.group || '同行'
  })
  if (!result.ok) {
    if (result.reason === 'already') return toast('已在同行名单中')
    if (result.reason === 'full') return toast(`同行已满（最多 ${ADVENTURE_COMPANION_MAX} 人）`)
    return toast('邀请失败')
  }
  const gain = applyStanceToIntimacyGain(INTIMACY_INVITE_ADVENTURE, stance)
  const next = player.addIntimacy(target.id, gain, target.attitude)
  player.persist()
  toast(`已邀请${target.name}同行 · 亲密 ${formatIntimacy(next)}`)
}

function canBuyMerchant(item: MarketOffer) {
  if (item.category === '功法' && player.getBagCount(item.name, '功法') > 0) return false
  if (player.spiritStones < item.price) return false
  return true
}

function buyMerchantOffer(item: MarketOffer) {
  if (!isMerchant.value) return
  if (item.category === '功法' && player.getBagCount(item.name, '功法') > 0) {
    return toast('已拥有该功法')
  }
  if (!player.spendStones(item.price)) return toast('灵石不足')

  if (item.category === '丹药') {
    player.addBagItem(item.name, '丹药')
  } else if (item.category === '功法') {
    player.addBagItem(item.name, '功法')
    sect.syncLearnedFromBag(
      player.bag,
      player.activeTechniqueId || null,
      player.spellProficiency,
      player.techniqueProficiency
    )
  } else if (item.category === '药材') {
    player.addBagItem(item.name, '药材')
  } else if (item.category === '矿石') {
    player.addBagItem(item.name, '矿石')
  } else if (item.category === '法宝' && item.treasure) {
    treasure.addTreasure({
      id: `mer-${item.catalogId}-${Date.now()}`,
      name: item.name,
      grade: item.treasure.grade as TreasureGrade,
      gradeLabel: item.treasure.gradeLabel,
      type: item.treasure.type,
      desc: item.effect,
      special: item.treasure.special,
      story: item.treasure.story,
      equipped: false,
      level: 1,
      refine: 0
    })
  }

  player.persist()
  toast(`已购得${item.name}`)
}

function giftItem() {
  const target = member.value
  if (!target || target.self) return toast('不可赠予自己')
  const stance = getChatRelation(target.id).gift
  if (stance === 'refuse') return toast(stanceRefuseToast('gift'))
  const gift =
    player.bag.find((item) => item.category === '药材' && item.count > 0) ||
    player.bag.find((item) => item.category === '丹药' && item.count > 0)
  if (!gift) return toast('背包无药材或丹药可赠')
  if (!player.removeBagItem(gift.name, gift.category, 1)) return toast('赠送失败')
  const gain = applyStanceToIntimacyGain(INTIMACY_GIFT, stance)
  const next = player.addIntimacy(target.id, gain, target.attitude)
  player.persist()
  toast(`赠予${gift.name}，亲密 ${formatIntimacy(next)}`)
}

function onAction(title: string) {
  if (title === '邀请历练') {
    inviteToAdventure()
    return
  }
  if (title === '切磋比武') {
    if (!member.value || member.value.self) return toast('不可与自己切磋')
    if (player.injured) return toast('伤势未愈，不宜切磋')
    if (player.onCliff) return toast('思过崖面壁期间不可动手')
    if (getChatRelation(member.value.id).spar === 'refuse') {
      return toast(stanceRefuseToast('spar'))
    }

    const foe = member.value
    const sparStance = getChatRelation(foe.id).spar
    const enemyPower = Math.max(1, foe.power || 1)
    const preview = buildBattlePreview({
      myPower: player.combatPower,
      enemyPower,
      enemyName: foe.name,
      myAttrs: player.battleSpellAttrs(),
      enemyAttr: foeCombatAttr(foe),
      titleHint: '点到为止，低风险切磋。'
    })

    Taro.showModal({
      title: '切磋比武',
      content: `${preview.content}\n胜：亲密+2，或涨法术熟练/修为\n负：亲密不变；约 4% 受伤`,
      confirmText: '切磋',
      success: (res) => {
        if (!res.confirm) return
        const battle = rollBattleOutcome(player.combatPower, enemyPower, {
          elementMod: preview.elementMod
        })
        const spellNames = player.resolveBattleSpellNames()
        const ownedFallback = player.bag
          .filter((item) => item.category === '法术')
          .map((item) => item.name)
        const pool = spellNames.length ? spellNames : ownedFallback
        const outcome = rollSparOutcome(
          battle.won,
          pool,
          getRealmPracticeExpBase(player.realmState)
        )

        sect.reportMissionProgress('spar', 1)

        const flavor = formatBattleFlavor({
          won: battle.won,
          enemyName: foe.name,
          scene: 'spar',
          castSpell: outcome.spellName || pool[0] || '',
          elementLabel: preview.elementLabel,
          winChance: battle.winChance
        })
        const parts: string[] = [flavor]

        if (battle.won) {
          const gain = applyStanceToIntimacyGain(2, sparStance)
          const next = player.addIntimacy(foe.id, gain, foe.attitude)
          parts.push(`亲密 ${formatIntimacy(next)}`)
        } else {
          parts.push('亲密未变')
        }

        if (outcome.spellName && outcome.spellProfGain > 0) {
          const result = player.addSpellProficiency(outcome.spellName, outcome.spellProfGain)
          sect.applySpellProficiency(player.spellProficiency)
          parts.push(`《${outcome.spellName}》熟练 +${result.gain}`)
          if (result.tierUp) parts.push(`进境：${result.name}`)
        }
        if (outcome.expGain > 0 && player.exp < player.expMax) {
          const before = player.exp
          player.addExp(outcome.expGain)
          const actual = Math.round((player.exp - before) * 10) / 10
          if (actual > 0) parts.push(`修为 +${actual}`)
        }
        if (outcome.injured) {
          player.setInjured(true)
          parts.push('不慎受伤，战力暂减')
        }
        player.persist()
        toast(parts.join(' · '))
      }
    })
    return
  }
  if (title === '生死比斗') {
    return startDeathDuel()
  }
  if (title === '赠送物品') {
    return giftItem()
  }
  if (title === '任务交接') {
    return handleEscortTalk()
  }
  if (title === '寻访交谈') {
    const target = member.value
    sect.reportMissionProgress('market_talk', 1)
    if (target && !target.self) {
      const next = player.addIntimacy(target.id, 3, target.attitude)
      player.persist()
      return toast(`已寻访交谈 · 亲密 ${formatIntimacy(next)}`)
    }
    return toast('已寻访散修，任务进度已更新')
  }
  if (title === '营救交谈') {
    const target = member.value
    sect.reportMissionProgress('rescue_talk', 1)
    if (target && !target.self) {
      const next = player.addIntimacy(target.id, 5, target.attitude)
      player.persist()
      return toast(`已安抚 · 亲密 ${formatIntimacy(next)}`)
    }
    return toast('已安抚被困弟子，任务进度已更新')
  }
  if (title === '卧底交谈') {
    return handleMoleTalk()
  }
  if (title === '邀请双修') {
    const target = member.value
    if (!target || target.self) return toast('不可与自己双修')
    if (inferCharacterGender(target.name) === player.gender) {
      return toast('同性不可双修')
    }
    const intimacy = player.getIntimacy(target.id, target.attitude, intimacySeedOpts(target))
    if (intimacy < DUAL_CULTIVATION_INTIMACY_MIN) {
      return toast(`亲密不足 ${DUAL_CULTIVATION_INTIMACY_MIN}，暂不可双修`)
    }
    player.setDualPartner({
      id: target.id,
      name: target.name,
      gender: inferCharacterGender(target.name),
      attitude: target.attitude
    })
    player.persist()
    return toast(`已邀${target.name}至洞府双修，请前往洞府`)
  }
  toast(title)
}

function handleEscortTalk() {
  const mission = sect.activeMission
  const target = member.value
  if (!mission || !target || target.self) return toast('目标无效')
  const kind = mission.objective?.kind
  if (!isEscortMissionKind(kind)) return toast('当前无护送任务')
  const route = resolveEscortMembers(mission, sect.members)
  const phase = route.phase
  const goods = kind === 'pill_deliver' ? '丹药' : '灵材'
  if (phase === 'none') {
    if (target.id !== route.pickupId) {
      return toast(`请先拜访领取人：${route.pickupName || '指定弟子'}`)
    }
    sect.advanceEscortPhase('holding')
    return toast(`已领到${goods}，请送往：${route.deliverName || '指定弟子'}`)
  }
  if (phase === 'holding') {
    if (target.id !== route.deliverId) {
      return toast(`请送达：${route.deliverName || '指定弟子'}`)
    }
    sect.advanceEscortPhase('done')
    return toast(`已送达 ${route.deliverName || '指定弟子'}，进度达成`)
  }
  return toast('该任务已送达')
}

function handleMoleTalk() {
  const info = moleTarget.value
  const target = member.value
  if (!info || !target || target.self) return toast('此处并非目标卧底')
  const { mission, mole } = info
  const done = (mission.progress || 0) >= (mission.objective?.target || 1)
  if (done) return toast('已拆穿此人，可回角色页完成任务')

  const content = rollMoleTalkLine(mole.name || target.name)
  Taro.showModal({
    title: '卧底交谈',
    content,
    showCancel: false,
    confirmText: '已知晓',
    success: () => {
      sect.reportMissionProgress('find_mole', 1)
      const next = player.addIntimacy(target.id, 3, target.attitude)
      player.persist()
      toast(`已拆穿卧底 · 亲密 ${formatIntimacy(next)}`)
    }
  })
}
</script>

<style lang="scss">
.content { padding: 0 16px 20px; }
.hero { display: flex; gap: 12px; align-items: center; }
.hero__body { flex: 1; }
.name { display: block; font-size: 17px; font-weight: 700; }
.meta { display: block; margin-top: 4px; font-size: 11px; color: var(--text-secondary); }
.favor { display: flex; gap: 6px; margin-top: 8px; align-items: center; font-size: 10px; }
.muted { color: var(--text-muted); }
.hp { color: var(--hp); }
.jade { color: var(--jade); }
.mole-panel__text {
  display: block;
  font-size: 12px;
  line-height: 1.5;
  color: var(--hp);
}
.chat-log {
  height: 220px;
  max-height: 220px;
  box-sizing: border-box;
  padding: 4px 2px 6px;
  margin-bottom: 4px;
  border-radius: 10px;
  background: rgba(0, 0, 0, 0.12);
}
.chat-log__empty {
  padding: 24px 8px;
  text-align: center;
}
.chat-log__end {
  height: 1px;
  width: 100%;
}
.chat-bubble {
  padding: 8px 10px;
  border-radius: 10px;
  background: var(--panel-2);
  margin-bottom: 6px;
}
.chat-bubble:last-of-type {
  margin-bottom: 0;
}
.chat-bubble--user {
  background: rgba(46, 59, 89, 0.35);
}
.chat-bubble__role {
  display: block;
  font-size: 10px;
  color: var(--text-muted);
  margin-bottom: 2px;
}
.chat-bubble__text {
  display: block;
  font-size: 12px;
  line-height: 1.45;
  white-space: pre-wrap;
}
.chat-presets {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin: 8px 0;
}
.chat-preset {
  padding: 4px 8px;
  font-size: 11px;
  border-radius: 999px;
  background: var(--panel-2);
  color: var(--text-secondary);
}
.chat-preset--off {
  opacity: 0.45;
}
.chat-compose {
  display: flex;
  align-items: center;
  gap: 8px;
}
.chat-input {
  flex: 1;
  min-width: 0;
  height: 34px;
  line-height: 34px;
  padding: 0 10px;
  font-size: 12px;
  border-radius: 8px;
  background: var(--panel-2);
  color: var(--text);
  box-sizing: border-box;
  vertical-align: middle;
}
.chat-relation {
  display: block;
  margin-top: 8px;
  font-size: 10px;
  color: var(--text-muted);
  line-height: 1.4;
}
.arrow { color: var(--text-muted); font-size: 18px; line-height: 1; }
.action-row {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 10px;
  background: var(--panel-2);
  border-radius: 10px;
}
.action-row + .action-row {
  margin-top: 4px;
}
.action-row__body {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 1px;
}
.action-row__title {
  display: block;
  font-size: 13px;
  font-weight: 500;
  color: var(--text-primary);
  line-height: 1.25;
}
.action-row__desc,
.action-row__note {
  display: block;
  font-size: 10px;
  color: var(--text-muted);
  line-height: 1.3;
}
.action-row__note {
  color: var(--gold);
}
.info-row {
  display: flex;
  gap: 10px;
  padding: 8px 0;
  border-bottom: 1px solid rgba(46, 59, 89, 0.35);
}
.info-row:last-child { border-bottom: none; }
.info-label {
  width: 40px;
  flex-shrink: 0;
  font-size: 12px;
  color: var(--text-secondary);
}
.info-val {
  flex: 1;
  font-size: 12px;
  color: var(--text);
  line-height: 1.4;
}
.info-row--stack {
  flex-direction: column;
  gap: 6px;
}
.info-row--stack .info-label {
  width: auto;
}
.market-event {
  display: block;
  white-space: normal;
  word-break: break-word;
  line-height: 1.5;
}
.gold { color: var(--gold); }
.empty-tip {
  padding: 16px 4px;
  text-align: center;
  font-size: 12px;
  color: var(--text-muted);
}
.hint {
  display: block;
  margin-top: 10px;
  font-size: 10px;
  color: var(--text-muted);
}
.mer-card {
  display: flex;
  gap: 8px;
  align-items: flex-start;
  padding: 6px 0;
  border-bottom: 1px solid rgba(46, 59, 89, 0.35);
}
.mer-card:last-of-type {
  border-bottom: none;
}
.mer-card__art {
  width: 44px;
  height: 44px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}
.mer-card__fallback {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  background: rgba(46, 59, 89, 0.35);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  color: var(--text-secondary);
}
.mer-card__body {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 1px;
}
.mer-card__title {
  display: flex;
  gap: 6px;
  align-items: center;
  flex-wrap: wrap;
}
.mer-card__name {
  font-size: 13px;
  font-weight: 650;
  color: var(--text);
  line-height: 1.25;
  word-break: break-word;
  white-space: normal;
}
.mer-card__meta,
.mer-card__effect {
  display: block;
  margin-top: 0;
  font-size: 10px;
  color: var(--text-secondary);
  line-height: 1.25;
  word-break: break-word;
  white-space: normal;
}
.mer-card__buy {
  flex-shrink: 0;
  align-self: center;
  min-width: 56px;
  padding: 8px 10px;
  border-radius: 10px;
  text-align: center;
}
.mer-card__buy--ok {
  background: rgba(201, 162, 39, 0.18);
  border: 1px solid rgba(201, 162, 39, 0.45);
}
.mer-card__buy--off {
  background: rgba(46, 59, 89, 0.25);
  opacity: 0.55;
}
.mer-card__buy-label {
  display: block;
  font-size: 9px;
  color: var(--text-muted);
}
.mer-card__buy-price {
  display: block;
  margin-top: 2px;
  font-size: 12px;
  font-weight: 700;
  color: var(--gold);
}
</style>
