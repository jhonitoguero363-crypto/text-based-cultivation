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
            <text class="row-item__desc muted">探索极小概率拾得药材 / 矿石</text>
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
          <text class="section-title__main">同行人员</text>
          <text class="section-title__sub">
            {{ adventure.companionCount }}/{{ companionMax
            }}{{ adventure.companionCount ? ` · 收益 ${companionBonusLabel}` : '' }}
          </text>
        </view>
        <view v-if="!adventure.companions.length" class="empty-tip">独行历练 · 可在历练页或人物拜访邀请同行</view>
        <view v-for="mate in adventure.companions" :key="mate.id" class="row-item">
          <PortraitAvatar :name="mate.name" :fallback-char="mate.avatar" size="md" />
          <view class="row-item__body">
            <view class="inline-row">
              <text class="row-item__title">{{ mate.name }}</text>
              <text class="tag tag--jade">同行</text>
            </view>
            <text class="row-item__desc">{{ mate.title }} · {{ mate.realm }}</text>
            <text class="row-item__desc gold">战力 {{ mate.power.toLocaleString() }}</text>
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
          <text class="section-title__sub">击败获灵石 · 小概率法宝 · 极小概率丹药 · 战败或伤或陨</text>
        </view>
        <view v-if="!adventure.npcEncounters.length" class="empty-tip">本次未偶遇修士</view>
        <view v-for="npc in adventure.npcEncounters" :key="npc.encounterId" class="shop-item">
          <view class="shop-item__head">
            <PortraitAvatar :name="npc.name" :fallback-char="npc.avatar" size="md" />
            <view class="row-item__body">
              <view class="inline-row">
                <text class="row-item__title">{{ npc.name }}</text>
                <text class="tag" :class="npcKindTagClass(npc.kind)">{{ npc.kind }}</text>
              </view>
              <text class="row-item__desc">{{ npc.title }} · {{ npc.realm }} · {{ npc.personality }}</text>
              <text class="row-item__desc gold">{{ npc.event }}</text>
              <text class="row-item__desc muted">出没 · {{ npc.place }}</text>
            </view>
            <view
              class="btn"
              :class="npc.interacted ? 'btn--ghost' : 'btn--gold'"
              @tap="onChallengeNpc(npc.encounterId)"
            >
              {{ npc.interacted ? '已击败' : '击败' }}
            </view>
          </view>
        </view>
      </view>

      <view class="panel">
        <view class="section-title">
          <text class="section-title__main">遭遇妖兽</text>
          <text class="section-title__sub">击败后选击杀或抓捕 · 战败依战力差受伤或阵亡</text>
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
              <text v-else-if="monster.killed" class="row-item__desc gold">已击杀</text>
              <text v-else-if="monster.defeated" class="row-item__desc jade">
                已制服 · 请选择击杀或抓捕
              </text>
              <text v-else-if="player.ownedPet(monster.name)" class="row-item__desc muted">
                已拥有同名灵宠（仅可击杀）
              </text>
            </view>
            <view class="beast-actions">
              <template v-if="!monster.defeated">
                <view class="btn btn--gold" @tap="onChallenge(monster.encounterId)">挑战</view>
              </template>
              <template v-else-if="!monster.captured && !monster.killed">
                <view class="btn btn--gold" @tap="onKill(monster.encounterId)">击杀</view>
                <view
                  class="btn"
                  :class="player.ownedPet(monster.name) ? 'btn--ghost' : 'btn--jade'"
                  @tap="onCapture(monster.encounterId)"
                >
                  抓捕
                </view>
              </template>
              <template v-else>
                <view class="btn btn--ghost">
                  {{ monster.captured ? '已抓捕' : '已击杀' }}
                </view>
              </template>
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
import PortraitAvatar from '../../components/PortraitAvatar.vue'
import StoneChip from '../../components/StoneChip.vue'
import {
  pickBattleSpell,
  rollBattleOutcome,
  rollBattleSpellProfGain,
  rollNpcDefeatLoot,
  rollPetFallInBattle,
  rollPlayerBattleFate
} from '../../constants/adventure-battle'
import {
  estimateExploreReward,
  getLocationById,
  type AdventureLocation
} from '../../constants/adventure-locations'
import { beastToPetFields, captureChanceOf, estimateBeastPower } from '../../constants/beast-catalog'
import { estimateNpcBattlePower, isDemonicNpcKind } from '../../constants/adventure-npc-catalog'
import { resolveMaterialBagCategory } from '../../constants/loot-material-catalog'
import { INTIMACY_SHARED_ADVENTURE } from '../../constants/intimacy'
import {
  ADVENTURE_COMPANION_MAX,
  useAdventureStore
} from '../../stores/adventure'
import { usePlayerStore } from '../../stores/player'
import { useSectStore } from '../../stores/sect'
import { useTreasureStore } from '../../stores/treasure'

const adventure = useAdventureStore()
const player = usePlayerStore()
const sect = useSectStore()
const treasure = useTreasureStore()
const companionMax = ADVENTURE_COMPANION_MAX
const locationId = ref('')
const allowingExit = ref(false)
let guardReady = false

const location = computed<AdventureLocation | null>(() => {
  return getLocationById(locationId.value) || adventure.selectedLocation
})

const reward = computed(() => {
  if (!location.value) return { exp: 0, stones: 0 }
  const base = estimateExploreReward(location.value)
  const mult = adventure.companionRewardMult
  return {
    exp: Math.max(1, Math.round(base.exp * mult)),
    stones: Math.max(1, Math.round(base.stones * mult))
  }
})

const companionBonusLabel = computed(() => `+${Math.round((adventure.companionRewardMult - 1) * 100)}%`)

const headerSub = computed(() => {
  if (!location.value) return '历练中'
  const party =
    adventure.companionCount > 0 ? ` · 同行${adventure.companionCount}人` : ''
  return `${location.value.danger} · 今日已探索 ${adventure.exploreToday} 次${party}`
})

function toast(title: string) {
  Taro.showToast({ title, icon: 'none' })
}

function npcKindTagClass(kind: string) {
  if (kind === '宗门弟子') return 'tag--jade'
  if (kind === '正道修士') return 'tag--jade'
  if (kind === '魔道修士') return 'tag--hp'
  if (kind === '妖族') return 'tag--gold'
  if (kind === '商人') return 'tag--gold'
  if (kind === '隐世' || kind === '奇遇') return 'tag--mp'
  return ''
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

  const lootParts: string[] = []
  if (result.materials?.herb) {
    player.addBagItem(result.materials.herb.name, '药材')
    lootParts.push(`药材「${result.materials.herb.name}」`)
  }
  if (result.materials?.ore) {
    player.addBagItem(result.materials.ore.name, '矿石')
    lootParts.push(`矿石「${result.materials.ore.name}」`)
  }

  player.persist()
  const lootMsg = lootParts.length ? ` · 拾得 ${lootParts.join('、')}` : ''
  if (result.encounter) return toast(`触发奇遇：${result.encounter.name}${lootMsg}`)
  const beastNames = result.beasts.map((item) => item.name).join('、')
  const npcNames = result.npcs.map((item) => item.name).join('、')
  if (npcNames && beastNames) return toast(`遭遇${beastNames}；偶遇${npcNames}${lootMsg}`)
  if (npcNames) return toast(`偶遇：${npcNames}${lootMsg}`)
  if (beastNames) return toast(`遭遇：${beastNames}${lootMsg}`)
  toast(lootMsg ? `探索有获${lootMsg}` : `探索成功：修为+${result.exp}`)
}

function onResolveEncounter() {
  const result = adventure.resolveEncounter()
  if (!result) return toast('奇遇已了结或尚未触发')
  player.earnStones(result.stones)
  player.addExp(result.exp)
  if (result.drop) player.addBagItem(result.drop, resolveMaterialBagCategory(result.drop))
  player.persist()
  const dropMsg = result.drop ? ` · 「${result.drop}」×1` : ''
  toast(`了结「${result.encounter.name}」：修为+${result.exp} · 灵石×${result.stones}${dropMsg}`)
}

function applyBattleSpellGain(elementHint = '') {
  const ownedSpells = sect.spells
    .filter((item) => item.owned)
    .map((item) => ({ name: item.name, attr: item.attr }))
  const cast = pickBattleSpell(ownedSpells, elementHint)
  if (!cast) return ''
  const profGain = rollBattleSpellProfGain(adventure.companionRewardMult)
  const raised = player.addSpellProficiency(cast.name, profGain)
  sect.applySpellProficiency(player.spellProficiency)
  if (raised.gain <= 0) return ''
  adventure.pushLog(
    `施展《${cast.name}》克敌，熟练度 +${raised.gain}${raised.tierUp ? `（${raised.name}）` : ''}`,
    'jade'
  )
  return raised.tierUp
    ? ` · 《${cast.name}》进境${raised.name}`
    : ` · 《${cast.name}》熟练 +${raised.gain}`
}

/** 战斗结束后判定出战灵兽是否阵亡；返回文案片段 */
function resolveBattlePetFate(enemyPower: number) {
  const pet = player.activePet
  if (!pet) return ''
  const myPower = player.combatPower + adventure.companionPower
  const { chance, died } = rollPetFallInBattle(myPower, enemyPower)
  if (!died) return ''
  const name = pet.name
  const pct = Math.round(chance * 100)
  player.removePet(pet.id)
  adventure.pushLog(`出战灵兽「${name}」力战不支，不幸阵亡（风险约 ${pct}%）`, 'hp')
  return ` · ${name}阵亡`
}

function myBattlePower() {
  return player.combatPower + adventure.companionPower
}

function ensureCanFight() {
  if (player.injured) {
    toast('伤势未愈，不宜再战；请先服用疗伤丹药')
    return false
  }
  player.clearCliffIfExpired()
  if (player.onCliff) {
    toast('思过崖面壁期间不可交手')
    return false
  }
  return true
}

/** 战败处理；若阵亡返回 true（已弹窗） */
function handleBattleDefeat(enemyName: string, enemyPower: number) {
  const myPower = myBattlePower()
  const { fate, deathChance, injuryChance } = rollPlayerBattleFate(myPower, enemyPower)
  const deathPct = Math.round(deathChance * 100)
  const injuryPct = Math.round(injuryChance * 100)

  if (fate === 'death') {
    adventure.pushLog(
      `与${enemyName}交手落败，身死道消（阵亡风险约 ${deathPct}%）`,
      'hp'
    )
    player.persist()
    Taro.showModal({
      title: '身死道消',
      content: `你败于「${enemyName}」，此世修为尽散。是否重新开辟道途？`,
      confirmText: '重新开始',
      showCancel: false,
      success: () => {
        allowingExit.value = true
        clearExitGuard()
        adventure.clearLocation()
        adventure.clearCompanions()
        player.wipeOnDeath()
        Taro.reLaunch({ url: '/pages/create/index' })
      }
    })
    return true
  }

  if (fate === 'injury') {
    player.setInjured(true)
    adventure.pushLog(
      `与${enemyName}交手落败，身受重伤（受伤风险约 ${injuryPct}%），需丹药疗伤后方可再战`,
      'hp'
    )
    player.persist()
    toast(`战败！身受重伤，需服用疗伤丹药（约 ${injuryPct}%）`)
    return false
  }

  adventure.pushLog(`与${enemyName}交手不敌，狼狈脱身（幸免于难）`, 'gold')
  player.persist()
  toast('战败，侥幸脱身')
  return false
}

function onChallenge(encounterId: string) {
  if (!ensureCanFight()) return
  const monster = adventure.encounters.find((item) => item.encounterId === encounterId)
  if (!monster) return toast('目标不存在')
  if (monster.defeated || monster.captured || monster.killed) return toast('无法挑战')

  const enemyPower = estimateBeastPower(monster, monster.level)
  const outcome = rollBattleOutcome(myBattlePower(), enemyPower)
  if (!outcome.won) {
    handleBattleDefeat(monster.name, enemyPower)
    return
  }

  const result = adventure.challengeMonster(encounterId)
  if (!result) return toast('无法挑战')
  player.addExp(result.exp)
  player.markSpiritBeastSeen(result.beast.name)
  const spellMsg = applyBattleSpellGain(result.beast.element)
  const petMsg = resolveBattlePetFate(enemyPower)
  player.persist()
  const winPct = Math.round(outcome.winChance * 100)
  toast(
    `击败${result.beast.name}（胜率约 ${winPct}%），修为 +${result.exp}${spellMsg}${petMsg}；请选择击杀或抓捕`
  )
}

function onKill(encounterId: string) {
  const result = adventure.killMonster(encounterId)
  if (!result) return toast('无法击杀')
  player.addBagItem(result.drop, resolveMaterialBagCategory(result.drop))
  player.markSpiritBeastSeen(result.beast.name)
  player.persist()
  toast(`击杀${result.beast.name}，获得 ${result.drop}×1`)
  sect.reportMissionProgress('kill_beast', 1)
}

function onCapture(encounterId: string) {
  const monster = adventure.encounters.find((item) => item.encounterId === encounterId)
  if (!monster) return toast('目标不存在')
  if (monster.captured) return toast('已抓捕')
  if (monster.killed) return toast('已击杀')
  if (!monster.defeated) return toast('需先击败方可抓捕')
  if (player.ownedPet(monster.name)) return toast('已拥有同名灵宠，仅可击杀')

  const result = adventure.captureMonster(encounterId, player.ownedPet(monster.name))
  if (!result) return toast('无法抓捕')
  player.markSpiritBeastSeen(monster.name)

  if (!result.ok) {
    if (result.reason === 'need_defeat') {
      player.persist()
      return toast('需先击败方可抓捕')
    }
    if (result.reason === 'owned') {
      player.persist()
      return toast('已拥有同名灵宠，仅可击杀')
    }
    // 抓捕失败 → 已自动击杀并掉落
    if (result.drop) player.addBagItem(result.drop, resolveMaterialBagCategory(result.drop))
    player.persist()
    sect.reportMissionProgress('kill_beast', 1)
    const pct = Math.round((result.chance || captureChanceOf(monster)) * 100)
    return toast(`抓捕失败（约 ${pct}%），已击杀并获得 ${result.drop}×1`)
  }

  const fields = beastToPetFields(result.beast)
  const pet = player.addPet(fields)
  player.persist()
  if (!pet) return toast('收服失败')
  toast(`抓捕成功，已将${result.beast.name}收为灵宠（无材料掉落）`)
}

function onChallengeNpc(encounterId: string) {
  if (!ensureCanFight()) return
  const npc = adventure.npcEncounters.find((item) => item.encounterId === encounterId)
  if (!npc) return toast('目标不存在')
  if (npc.interacted) return toast('无法挑战')

  const enemyPower = estimateNpcBattlePower(npc.realm, npc.id)
  const outcome = rollBattleOutcome(myBattlePower(), enemyPower)
  if (!outcome.won) {
    handleBattleDefeat(npc.name, enemyPower)
    return
  }

  const result = adventure.challengeNpc(encounterId)
  if (!result) return toast('无法挑战')
  player.earnStones(result.stones)
  player.addExp(result.exp)
  const spellMsg = applyBattleSpellGain('')
  const petMsg = resolveBattlePetFate(enemyPower)

  const loot = rollNpcDefeatLoot(result.npc.realm)
  const lootParts: string[] = []
  if (loot.treasure) {
    treasure.addTreasure({
      id: `adv-npc-${loot.treasure.id}-${Date.now()}`,
      name: loot.treasure.name,
      grade: loot.treasure.grade,
      gradeLabel: loot.treasure.gradeLabel,
      type: loot.treasure.type,
      desc: loot.treasure.effect,
      special: loot.treasure.special,
      story: loot.treasure.story,
      equipped: false,
      level: 1,
      refine: 0
    })
    lootParts.push(`法宝「${loot.treasure.name}」`)
    adventure.pushLog(
      `搜得${result.npc.name}随身法宝「${loot.treasure.name}」（${loot.treasure.gradeLabel}）`,
      'gold'
    )
  }
  if (loot.pill) {
    player.addBagItem(loot.pill.name, '丹药')
    lootParts.push(`丹药「${loot.pill.name}」`)
    adventure.pushLog(
      `搜得${result.npc.name}随身丹药「${loot.pill.name}」（${loot.pill.grade}）`,
      'gold'
    )
  }

  player.persist()
  const lootMsg = lootParts.length ? ` · 掉落 ${lootParts.join('、')}` : ''
  const winPct = Math.round(outcome.winChance * 100)
  if (isDemonicNpcKind(result.npc.kind)) {
    sect.reportMissionProgress('defeat_mo_xiu', 1)
  }
  toast(
    `击败${result.npc.name}（胜率约 ${winPct}%），灵石 ×${result.stones} · 修为 +${result.exp}${spellMsg}${petMsg}${lootMsg}`
  )
}

function endAdventure() {
  const mates = [...adventure.companions]
  if (mates.length) {
    mates.forEach((mate) => {
      player.addIntimacy(mate.id, INTIMACY_SHARED_ADVENTURE)
    })
    player.persist()
    toast(`同行历练结束 · 亲密各 +${INTIMACY_SHARED_ADVENTURE}`)
  }
  allowingExit.value = true
  clearExitGuard()
  adventure.clearLocation()
  adventure.clearCompanions()
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
  background: linear-gradient(180deg, transparent, var(--scrim) 28%);
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
