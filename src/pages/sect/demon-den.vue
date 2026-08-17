<template>
  <view class="page page--sub page-demon-den">
    <PageHeader title="魔窟" subtitle="天魔宗 · 杀伐试炼" show-back />
    <view class="content">
      <view class="panel">
        <view class="section-title">
          <text class="section-title__main">魔影杀伐</text>
          <text class="section-title__sub">
            今日剩余 {{ usesLeft }}/{{ dailyLimit }} 次 · 战力 {{ player.combatPower }}
          </text>
        </view>
        <text class="hint">
          凝出魔影一战。胜则获贡献、修为与灵石；败则受伤、无收益。接「魔窟试炼」可额外领周常奖。
        </text>

        <view v-if="lastResult" class="result">
          <text class="result__title">{{ lastResult.title }}</text>
          <text class="result__desc">{{ lastResult.desc }}</text>
        </view>

        <view
          class="btn btn--block btn--gold fight-btn"
          :class="{ 'btn--ghost': busy }"
          @tap="onSlay"
        >
          {{ busy ? '杀伐中…' : '凝影杀伐' }}
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import Taro from '@tarojs/taro'
import PageHeader from '../../components/PageHeader.vue'
import {
  buildBattlePreview,
  formatBattleFlavor,
  rollBattleOutcome
} from '../../constants/adventure-battle'
import {
  DEMON_DEN,
  LANDMARK_DAILY_LIMIT,
  rollDemonDenEnemyPower,
  rollInclusiveRange
} from '../../constants/sect-landmark'
import { usePlayerStore } from '../../stores/player'
import { useSectStore } from '../../stores/sect'

const player = usePlayerStore()
const sect = useSectStore()

const busy = ref(false)
const lastResult = ref<{ title: string; desc: string } | null>(null)

const dailyLimit = LANDMARK_DAILY_LIMIT
const usesLeft = computed(() => player.getLandmarkUsesLeft('demon_den'))

function toast(title: string) {
  Taro.showToast({ title, icon: 'none' })
}

function onSlay() {
  if (busy.value) return
  if (player.injured) return toast('伤势未愈，不宜杀伐')
  if (player.onCliff) return toast('思过崖面壁期间不可杀伐')
  if (player.getLandmarkUsesLeft('demon_den') <= 0) return toast('今日杀伐次数已用尽')

  busy.value = true
  const myPower = player.combatPower
  const enemyPower = rollDemonDenEnemyPower(myPower)
  const preview = buildBattlePreview({
    myPower,
    enemyPower,
    enemyName: '魔影',
    myAttrs: player.battleSpellAttrs(),
    enemyAttr: '火',
    titleHint: '凝出魔影一战。',
    showRisk: false
  })

  Taro.showModal({
    title: '魔影杀伐',
    content: preview.content,
    confirmText: '杀伐',
    success: (res) => {
      if (!res.confirm) {
        busy.value = false
        return
      }
      const { won, winChance } = rollBattleOutcome(myPower, enemyPower, {
        elementMod: preview.elementMod
      })
      const castSpell = player.resolveBattleSpellNames()[0] || ''
      const flavor = formatBattleFlavor({
        won,
        enemyName: '魔影',
        scene: 'demon',
        castSpell,
        elementLabel: preview.elementLabel,
        winChance,
        fate: won ? null : 'injury'
      })

      if (!player.consumeLandmarkUse('demon_den')) {
        busy.value = false
        return toast('今日次数已满')
      }

      if (won) {
        const contrib = rollInclusiveRange(DEMON_DEN.winContribution)
        const exp = rollInclusiveRange(DEMON_DEN.winExp)
        const stones = rollInclusiveRange(DEMON_DEN.winStones)
        player.earnContribution(contrib)
        player.addExp(exp)
        player.earnStones(stones)
        player.persist()
        sect.reportMissionProgress('demon_slay', 1)
        lastResult.value = {
          title: '斩杀魔影',
          desc: `${flavor} · 贡献+${contrib} · 修为+${exp} · 灵石+${stones}`
        }
        toast(`${flavor} · 贡献+${contrib}`)
      } else {
        player.setInjured(true)
        player.persist()
        lastResult.value = {
          title: '杀伐落败',
          desc: `${flavor} · 身受创伤，本次无收益`
        }
        toast(flavor)
      }
      busy.value = false
    }
  })
}
</script>

<style lang="scss">
.page-demon-den {
.content {
  padding: 0 16px 20px;
}
.hint {
  display: block;
  margin-bottom: 12px;
  font-size: 11px;
  color: var(--text-muted);
  line-height: 1.45;
}
.result {
  margin-bottom: 14px;
  padding: 10px 12px;
  border-radius: 10px;
  background: var(--panel-2);
}
.result__title {
  display: block;
  font-size: 13px;
  font-weight: 700;
}
.result__desc {
  display: block;
  margin-top: 4px;
  font-size: 11px;
  color: var(--text-secondary);
  line-height: 1.45;
}
.fight-btn {
  margin-top: 4px;
}
}
</style>
