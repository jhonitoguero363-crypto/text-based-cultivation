<template>
  <view class="page page--sub explore-page">
    <PageHeader :title="location?.name || '秘境历练'" :subtitle="headerSub">
      <template #right>
        <StoneChip label="灵石" :value="player.spiritStones" />
      </template>
    </PageHeader>

    <view class="content" v-if="location">
      <view class="panel realm-card">
        <view class="realm-card__head">
          <view class="row-item__body">
            <text class="row-item__title">{{ location.name }}</text>
            <text class="row-item__desc">{{ location.realm }} · {{ location.danger }}</text>
            <text class="row-item__desc">产出：{{ location.drops }}</text>
            <text class="row-item__desc muted">{{ location.feature }}</text>
          </view>
          <view class="btn btn--gold" @tap="onExplore">探索</view>
        </view>
        <view class="stat-grid" style="margin-top: 12px">
          <view class="stat-cell">
            <text class="stat-cell__value">{{ adventure.remainTimes }}</text>
            <text class="stat-cell__label">剩余次数</text>
          </view>
          <view class="stat-cell">
            <text class="stat-cell__value">+{{ reward.exp }}</text>
            <text class="stat-cell__label">修为掉落</text>
          </view>
          <view class="stat-cell">
            <text class="stat-cell__value">×{{ reward.stones }}</text>
            <text class="stat-cell__label">灵石掉落</text>
          </view>
        </view>
      </view>

      <view class="panel">
        <view class="section-title">
          <text class="section-title__main">旅途奇遇</text>
          <text class="section-title__sub">探索时随机触发 · 非宗门任务</text>
        </view>
        <view v-if="!adventure.encounterEvent" class="empty-tip">本次未触发奇遇</view>
        <view v-else class="shop-item">
          <view class="shop-item__head">
            <view class="icon-box">✨</view>
            <view class="row-item__body">
              <view class="inline-row">
                <text class="row-item__title">{{ adventure.encounterEvent.name }}</text>
                <text class="tag tag--gold">奇遇</text>
              </view>
              <text class="row-item__desc">{{ adventure.encounterEvent.desc }}</text>
              <text class="row-item__desc gold">{{ adventure.encounterEvent.reward }}</text>
              <text v-if="adventure.encounterEvent.playStyle" class="row-item__desc muted">
                玩法 · {{ adventure.encounterEvent.playStyle }}
              </text>
            </view>
            <view
              class="btn"
              :class="adventure.encounterEvent.resolved ? 'btn--ghost' : 'btn--gold'"
              @tap="onResolveEncounter"
            >
              {{ adventure.encounterEvent.resolved ? '已了结' : adventure.encounterEvent.action || '探查' }}
            </view>
          </view>
        </view>
      </view>

      <view class="panel">
        <view class="section-title">
          <text class="section-title__main">偶遇人物</text>
          <text class="section-title__sub">每次探索刷新 · 可互动触发事件</text>
        </view>
        <view v-if="!adventure.npcEncounters.length" class="empty-tip">本次未偶遇修士</view>
        <view v-for="npc in adventure.npcEncounters" :key="npc.encounterId" class="shop-item">
          <view class="shop-item__head">
            <view class="avatar">{{ npc.avatar }}</view>
            <view class="row-item__body">
              <view class="inline-row">
                <text class="row-item__title">{{ npc.name }}</text>
                <text class="tag tag--jade">{{ npc.kind }}</text>
              </view>
              <text class="row-item__desc">{{ npc.title }} · {{ npc.realm }} · {{ npc.personality }}</text>
              <text class="row-item__desc gold">{{ npc.event }}</text>
              <text class="row-item__desc muted">出没 · {{ npc.place }}</text>
            </view>
            <view
              class="btn"
              :class="npc.interacted ? 'btn--ghost' : 'btn--gold'"
              @tap="onInteract(npc.encounterId)"
            >
              {{ npc.interacted ? '已互动' : '互动' }}
            </view>
          </view>
        </view>
      </view>

      <view class="panel">
        <view class="section-title">
          <text class="section-title__main">遭遇妖兽</text>
          <text class="section-title__sub">击败取材料 · 抓捕化为灵宠</text>
        </view>
        <view v-if="!adventure.encounters.length" class="empty-tip">点击探索，随机遭遇妖兽</view>
        <view v-for="monster in adventure.encounters" :key="monster.encounterId" class="shop-item">
          <view class="shop-item__head">
            <BeastIcon :name="monster.name" size="md" />
            <view class="row-item__body">
              <view class="inline-row">
                <text class="row-item__title">{{ monster.name }}</text>
                <text class="tag" :class="tagClass(monster.tone)">{{ monster.rarity }}</text>
              </view>
              <text class="row-item__desc">
                Lv.{{ monster.level }} · {{ monster.race }} · {{ monster.element }}
              </text>
              <text class="row-item__desc gold">{{ monster.ability }}</text>
              <text class="row-item__desc muted">掉落 · {{ monster.drops }}</text>
              <text v-if="monster.captured" class="row-item__desc jade">已抓捕为灵宠</text>
              <text v-else-if="player.ownedPet(monster.name)" class="row-item__desc muted">已拥有同名灵宠</text>
            </view>
            <view class="beast-actions">
              <view
                class="btn"
                :class="monster.defeated || monster.captured ? 'btn--ghost' : 'btn--gold'"
                @tap="onChallenge(monster.encounterId)"
              >
                {{ monster.defeated || monster.captured ? '已击败' : '挑战' }}
              </view>
              <view
                class="btn"
                :class="captureBtnClass(monster)"
                @tap="onCapture(monster.encounterId)"
              >
                {{ monster.captured ? '已抓捕' : '抓捕' }}
              </view>
            </view>
          </view>
        </view>
      </view>

      <view class="panel">
        <view class="section-title">
          <text class="section-title__main">探索记录</text>
        </view>
        <view v-if="!adventure.logs.length" class="empty-tip">尚无记录</view>
        <view v-for="(log, idx) in adventure.logs" :key="idx" class="log-row">
          <text class="log-row__time">{{ log.time }}</text>
          <text class="log-row__text" :class="`tone-${log.tone}`">{{ log.text }}</text>
        </view>
      </view>
    </view>

    <view class="end-bar">
      <view class="btn btn--gold btn--block" @tap="endAdventure">历练结束</view>
      <text class="end-hint">须点击「历练结束」方可离开此地</text>
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import Taro, { useLoad, useUnload } from '@tarojs/taro'
import BeastIcon from '../../components/BeastIcon.vue'
import PageHeader from '../../components/PageHeader.vue'
import StoneChip from '../../components/StoneChip.vue'
import {
  estimateExploreReward,
  getLocationById,
  type AdventureLocation
} from '../../constants/adventure-locations'
import { beastToPetFields, captureChanceOf } from '../../constants/beast-catalog'
import { useAdventureStore, type EncounterBeast } from '../../stores/adventure'
import { usePlayerStore } from '../../stores/player'

const adventure = useAdventureStore()
const player = usePlayerStore()
const locationId = ref('')
const allowingExit = ref(false)
let guardReady = false

const location = computed<AdventureLocation | null>(() => {
  return getLocationById(locationId.value) || adventure.selectedLocation
})

const reward = computed(() => {
  if (!location.value) return { exp: 0, stones: 0 }
  return estimateExploreReward(location.value)
})

const headerSub = computed(() => {
  if (!location.value) return '历练中'
  return `${location.value.danger} · 今日已探索 ${adventure.exploreToday} 次`
})

function toast(title: string) {
  Taro.showToast({ title, icon: 'none' })
}

function blockBrowserBack() {
  if (allowingExit.value) return
  window.history.pushState({ adventureLock: 1 }, '', window.location.href)
  toast('请点击「历练结束」离开')
}

function setupExitGuard() {
  if (guardReady) return
  guardReady = true
  try {
    Taro.enableAlertBeforeUnload?.({
      message: '历练尚未结束，请点击「历练结束」离开'
    })
  } catch {
    // ignore
  }
  if (typeof window !== 'undefined' && window.history) {
    window.history.pushState({ adventureLock: 1 }, '', window.location.href)
    window.addEventListener('popstate', blockBrowserBack)
  }
}

function clearExitGuard() {
  if (!guardReady) return
  guardReady = false
  try {
    Taro.disableAlertBeforeUnload?.()
  } catch {
    // ignore
  }
  if (typeof window !== 'undefined') {
    window.removeEventListener('popstate', blockBrowserBack)
  }
}

useLoad((query) => {
  const id = String(query?.id || '')
  locationId.value = id
  const loc = getLocationById(id)
  if (!loc) {
    toast('地点无效')
    allowingExit.value = true
    Taro.redirectTo({ url: '/pages/adventure/index' })
    return
  }
  adventure.selectLocation(loc)
  setupExitGuard()
})

useUnload(() => {
  clearExitGuard()
  if (!allowingExit.value) {
    adventure.clearLocation()
  }
})

function tagClass(tone: string) {
  if (!tone || tone === 'muted') return ''
  return `tag--${tone}`
}

function onExplore() {
  if (!location.value) return toast('地点无效')
  const result = adventure.exploreOnce()
  if (!result) return toast('今日探索次数已用尽')
  player.earnStones(result.stones)
  player.addExp(result.exp)
  player.persist()
  if (result.encounter) return toast(`触发奇遇：${result.encounter.name}`)
  const beastNames = result.beasts.map((item) => item.name).join('、')
  const npcNames = result.npcs.map((item) => item.name).join('、')
  if (npcNames && beastNames) return toast(`遭遇${beastNames}；偶遇${npcNames}`)
  if (npcNames) return toast(`偶遇：${npcNames}`)
  toast(beastNames ? `遭遇：${beastNames}` : `探索成功：修为+${result.exp}`)
}

function onResolveEncounter() {
  const result = adventure.resolveEncounter()
  if (!result) return toast('奇遇已了结或尚未触发')
  player.earnStones(result.stones)
  player.addExp(result.exp)
  player.persist()
  toast(`了结「${result.encounter.name}」：修为+${result.exp} · 灵石×${result.stones}`)
}

function captureBtnClass(monster: EncounterBeast) {
  if (monster.captured) return 'btn--ghost'
  if (monster.defeated && !player.ownedPet(monster.name)) return 'btn--jade'
  return 'btn--ghost'
}

function onChallenge(encounterId: string) {
  const result = adventure.challengeMonster(encounterId)
  if (!result) return toast('无法挑战')
  player.earnStones(result.stones)
  player.addExp(result.exp)
  player.addBagItem(result.drop, '材料')
  player.markSpiritBeastSeen(result.beast.name)
  player.persist()
  toast(`击败${result.beast.name}，获得${result.drop}`)
}

function onCapture(encounterId: string) {
  const monster = adventure.encounters.find((item) => item.encounterId === encounterId)
  if (!monster) return toast('目标不存在')
  if (monster.captured) return toast('已抓捕')
  if (!monster.defeated) return toast('需先击败方可抓捕')
  if (player.ownedPet(monster.name)) return toast('已拥有同名灵宠')

  const result = adventure.captureMonster(encounterId, player.ownedPet(monster.name))
  if (!result) return toast('无法抓捕')
  player.markSpiritBeastSeen(monster.name)

  if (!result.ok) {
    player.persist()
    if (result.reason === 'need_defeat') return toast('需先击败方可抓捕')
    if (result.reason === 'owned') return toast('已拥有同名灵宠')
    const pct = Math.round((result.chance || captureChanceOf(monster)) * 100)
    return toast(`抓捕失败（约 ${pct}%）`)
  }

  const fields = beastToPetFields(result.beast)
  const pet = player.addPet(fields)
  player.persist()
  if (!pet) return toast('收服失败')
  toast(`已将${result.beast.name}收为灵宠`)
}

function onInteract(encounterId: string) {
  const result = adventure.interactNpc(encounterId)
  if (!result) return toast('无法互动')
  player.earnStones(result.stones)
  player.addExp(result.exp)
  player.persist()
  toast(`${result.npc.name}：${result.npc.event}`)
}

function endAdventure() {
  allowingExit.value = true
  clearExitGuard()
  adventure.clearLocation()
  Taro.redirectTo({ url: '/pages/adventure/index' })
}
</script>

<style lang="scss">
.explore-page {
  padding-bottom: 100px;
}

.content {
  padding-bottom: 20px;
}

.muted {
  font-size: 10px;
}
.jade {
  color: var(--jade);
}
.beast-actions {
  display: flex;
  flex-direction: column;
  gap: 6px;
  flex-shrink: 0;
}

.realm-card__head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 10px;
}

.log-row {
  display: flex;
  gap: 10px;
  padding: 8px 0;
  border-bottom: 1px solid rgba(46, 59, 89, 0.45);
}

.log-row:last-child {
  border-bottom: none;
}

.log-row__time {
  width: 40px;
  font-size: 10px;
  color: var(--text-muted);
}

.log-row__text {
  flex: 1;
  font-size: 11px;
  color: var(--text-secondary);
  line-height: 1.4;
}

.tone-jade {
  color: var(--jade);
}

.tone-hp {
  color: var(--hp);
}

.tone-secondary {
  color: var(--text-secondary);
}

.end-bar {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  padding: 12px 16px calc(12px + env(safe-area-inset-bottom));
  background: linear-gradient(180deg, transparent, rgba(14, 20, 36, 0.96) 28%);
  z-index: 20;
}

.end-hint {
  display: block;
  margin-top: 8px;
  text-align: center;
  font-size: 11px;
  color: var(--text-muted);
}
</style>
