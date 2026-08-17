<template>
  <view class="page page--sub page-sword-tomb">
    <PageHeader title="剑冢" subtitle="万剑宗 · 问剑悟道" show-back />
    <view class="content">
      <view class="panel">
        <view class="section-title">
          <text class="section-title__main">问剑</text>
          <text class="section-title__sub">
            {{
              meditating
                ? `悟剑中 · ${left}s`
                : `今日剩余 ${usesLeft}/${dailyLimit} 次 · 成功率约 ${successRate}%`
            }}
          </text>
        </view>
        <text class="hint">
          静坐 {{ durationSec }} 秒感悟剑意。悟性越高、本命为剑修功法时更易成功：成功增加功法熟练度并得贡献；失败剑意反噬，本层修为略损。
        </text>
        <text class="meta">当前功法：{{ techLabel }}</text>

        <view v-if="lastResult" class="result">
          <text class="result__title">{{ lastResult.title }}</text>
          <text class="result__desc">{{ lastResult.desc }}</text>
        </view>

        <view
          class="btn btn--block"
          :class="meditating ? 'btn--hp' : 'btn--gold'"
          @tap="toggleAsk"
        >
          {{ meditating ? '停止问剑' : '开始问剑' }}
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, ref } from 'vue'
import Taro from '@tarojs/taro'
import PageHeader from '../../components/PageHeader.vue'
import { isSwordTechnique } from '../../constants/combat-power'
import {
  calcSwordTombSuccessRate,
  getLandmarkDailyLimit,
  rollInclusiveRange,
  SWORD_TOMB
} from '../../constants/sect-landmark'
import { usePlayerStore } from '../../stores/player'
import { useSectStore } from '../../stores/sect'

const player = usePlayerStore()
const sect = useSectStore()

const meditating = ref(false)
const left = ref(0)
const lastResult = ref<{ title: string; desc: string } | null>(null)
let timer: ReturnType<typeof setInterval> | null = null
let elapsed = 0

const durationSec = SWORD_TOMB.durationSec
const dailyLimit = getLandmarkDailyLimit('sword_tomb')
const usesLeft = computed(() => player.getLandmarkUsesLeft('sword_tomb'))

const activeTech = computed(() => sect.activeTechnique)
const isSword = computed(() =>
  activeTech.value ? isSwordTechnique(activeTech.value.school || activeTech.value.attr || '') : false
)
const successRate = computed(() =>
  calcSwordTombSuccessRate(player.effectiveComprehension, isSword.value)
)
const techLabel = computed(() => {
  if (!activeTech.value) return '无（需先修习一门功法）'
  return `${activeTech.value.name} · ${activeTech.value.school}${isSword.value ? '（剑修加成）' : ''}`
})

function toast(title: string) {
  Taro.showToast({ title, icon: 'none' })
}

function clearTimer() {
  if (timer) clearInterval(timer)
  timer = null
  meditating.value = false
  left.value = 0
  elapsed = 0
}

function toggleAsk() {
  if (meditating.value) {
    clearTimer()
    return toast('已停止问剑（未结算）')
  }
  if (player.injured) return toast('伤势未愈，不宜问剑')
  if (player.onCliff) return toast('思过崖面壁期间不可问剑')
  if (player.getLandmarkUsesLeft('sword_tomb') <= 0) return toast('今日问剑次数已用尽')
  if (!activeTech.value) return toast('请先修习一门功法')

  meditating.value = true
  left.value = durationSec
  elapsed = 0
  timer = setInterval(() => {
    elapsed += 1
    left.value = Math.max(0, durationSec - elapsed)
    if (elapsed >= durationSec) finishAsk()
  }, 1000)
  toast('开始问剑')
}

function finishAsk() {
  clearTimer()
  const tech = activeTech.value
  if (!tech) return toast('未找到修习中功法')
  if (!player.consumeLandmarkUse('sword_tomb')) return toast('今日次数已满')

  const rate = calcSwordTombSuccessRate(player.effectiveComprehension, isSword.value)
  const ok = Math.random() * 100 < rate

  if (ok) {
    let gain = rollInclusiveRange(SWORD_TOMB.profGain)
    if (isSwordTechnique(tech.school || tech.attr || '')) {
      gain = Math.round(gain * SWORD_TOMB.swordProfMult * 10) / 10
    }
    const prof = player.addTechniqueProficiency(tech.name, gain)
    player.earnContribution(SWORD_TOMB.successContribution)
    player.persist()
    sect.reportMissionProgress('sword_ask', 1)
    sect.applyTechniqueProficiency(player.techniqueProficiency)
    lastResult.value = {
      title: '剑意有所得',
      desc: `${tech.name} 熟练 +${prof.gain} · 贡献+${SWORD_TOMB.successContribution}${
        prof.tierUp ? ` · 进阶「${prof.name}」` : ''
      }`
    }
    toast(`成功 · 熟练+${prof.gain} · 贡献+${SWORD_TOMB.successContribution}`)
  } else {
    const loss = Math.round(player.exp * SWORD_TOMB.failExpLossRate * 10) / 10
    const lost = player.loseExp(loss)
    player.earnContribution(SWORD_TOMB.failContribution)
    player.persist()
    lastResult.value = {
      title: '剑意反噬',
      desc: `修为 -${lost} · 贡献+${SWORD_TOMB.failContribution}（成功率约 ${rate}%）`
    }
    toast(`失败 · 修为-${lost} · 贡献+${SWORD_TOMB.failContribution}`)
  }
}

onBeforeUnmount(() => clearTimer())
</script>

<style lang="scss">
.page-sword-tomb {
.content {
  padding: 0 16px 20px;
}
.hint {
  display: block;
  margin-bottom: 8px;
  font-size: 11px;
  color: var(--text-muted);
  line-height: 1.45;
}
.meta {
  display: block;
  margin-bottom: 12px;
  font-size: 12px;
  color: var(--text-secondary);
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
}
</style>
