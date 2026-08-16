<template>
  <view class="page page--sub">
    <PageHeader title="矿洞" subtitle="宗门 · 挖矿取石" show-back />
    <view class="content">
      <view class="panel">
        <view class="section-title">
          <text class="section-title__main">矿脉挖矿</text>
          <text class="section-title__sub">{{ player.realm }} · 今日已挖 {{ digsUsed }} 次</text>
        </view>
        <text class="hint">
          无每日次数上限。开始后每 5 秒挖一次；停止或退出矿洞即结束。矿脉贫瘠，空手居多；修为越高，略易有所获。
        </text>
        <view
          class="btn btn--block dig-btn"
          :class="mining ? 'btn--danger' : 'btn--gold'"
          @tap="toggleMining"
        >
          {{ mining ? '停止挖矿' : '开始挖矿' }}
        </view>
        <text v-if="mining" class="mining-tip">挖矿中 · 下次 {{ countdown }}s</text>
        <text class="stat">持有灵石 {{ player.spiritStones.toLocaleString() }}</text>
      </view>

      <view class="panel">
        <view class="section-title">
          <text class="section-title__main">掉落预览</text>
          <text class="section-title__sub">按当前修为权重</text>
        </view>
        <view class="preview-row">
          <text class="preview-label">矿石品阶</text>
          <text class="preview-val">{{ orePreview }}</text>
        </view>
        <view class="preview-row">
          <text class="preview-label">灵石数量</text>
          <text class="preview-val">{{ spiritPreview }}</text>
        </view>
      </view>

      <view class="panel">
        <view class="section-title">
          <text class="section-title__main">本次收获</text>
          <text class="section-title__sub">最近 {{ logs.length }} 条</text>
        </view>
        <view v-if="!logs.length" class="empty-tip">尚未挖矿</view>
        <view
          v-for="(item, index) in logs"
          :key="`${item.text}-${index}`"
          class="log-line"
          :class="{ 'log-line--empty': item.text.includes('一无所获') }"
        >
          <OreIcon v-if="item.oreName" :name="item.oreName" :level="item.oreLevel" size="sm" />
          <text class="log-line__text">{{ item.text }}</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, ref } from 'vue'
import Taro, { useDidHide, useDidShow, useUnload } from '@tarojs/taro'
import { storeToRefs } from 'pinia'
import OreIcon from '../../components/OreIcon.vue'
import PageHeader from '../../components/PageHeader.vue'
import {
  formatMineReward,
  getCultivationScore,
  rollMineReward
} from '../../constants/ore-catalog'
import { usePlayerStore } from '../../stores/player'
import { useSectStore } from '../../stores/sect'

const DIG_INTERVAL_MS = 5_000

interface MineLog {
  text: string
  oreName?: string
  oreLevel?: string
}

const player = usePlayerStore()
const sect = useSectStore()
const { mineDigsUsed } = storeToRefs(player)
const logs = ref<MineLog[]>([])
const mining = ref(false)
const countdown = ref(5)

let digTimer: ReturnType<typeof setInterval> | null = null
let tickTimer: ReturnType<typeof setInterval> | null = null
let nextDigAt = 0

const digsUsed = computed(() => mineDigsUsed.value)

const score = computed(() => getCultivationScore(player.realmState))

const orePreview = computed(() => {
  const t = Math.min(1, score.value / 93)
  if (t < 0.2) return '多为灵矿，偶见高阶灵矿'
  if (t < 0.4) return '灵矿/高阶灵矿为主，可出神矿'
  if (t < 0.6) return '神矿、仙矿渐增'
  if (t < 0.8) return '仙矿、道矿概率提升'
  return '道矿与镇界神材显著提高'
})

const spiritPreview = computed(() => {
  const t = Math.min(1, score.value / 93)
  if (t < 0.25) return '约 10～60 / 次'
  if (t < 0.5) return '约 30～150 / 次'
  if (t < 0.75) return '约 60～280 / 次'
  return '约 100～400 / 次'
})

function toast(title: string) {
  Taro.showToast({ title, icon: 'none', duration: 1800 })
}

function clearTimers() {
  if (digTimer) {
    clearInterval(digTimer)
    digTimer = null
  }
  if (tickTimer) {
    clearInterval(tickTimer)
    tickTimer = null
  }
}

function stopMining(reason?: string) {
  if (!mining.value && !digTimer && !tickTimer) return
  mining.value = false
  countdown.value = 5
  clearTimers()
  if (reason) toast(reason)
}

function digOnce() {
  player.consumeMineDig()
  const reward = rollMineReward(player.realmState)
  if (reward.kind === 'ore') {
    player.addBagItem(reward.name, '矿石', reward.count)
    sect.reportMissionProgress('collect_ore', 1)
  } else if (reward.kind === 'spirit') {
    player.earnStones(reward.amount)
  }
  sect.reportMissionProgress('mine_dig', 1)
  player.persist()
  const text = formatMineReward(reward)
  const entry: MineLog = {
    text,
    oreName: reward.kind === 'ore' ? reward.name : undefined,
    oreLevel: reward.kind === 'ore' ? reward.level : undefined
  }
  logs.value = [entry, ...logs.value].slice(0, 12)
  toast(text)
  return true
}

function scheduleNext() {
  nextDigAt = Date.now() + DIG_INTERVAL_MS
  countdown.value = 5
}

function startMining() {
  if (mining.value) return

  mining.value = true
  digOnce()
  scheduleNext()
  clearTimers()

  digTimer = setInterval(() => {
    if (!mining.value) return
    digOnce()
    scheduleNext()
  }, DIG_INTERVAL_MS)

  tickTimer = setInterval(() => {
    if (!mining.value) return
    const left = Math.max(0, Math.ceil((nextDigAt - Date.now()) / 1000))
    countdown.value = left || 5
  }, 250)
}

function toggleMining() {
  if (mining.value) {
    stopMining('已停止挖矿')
    return
  }
  startMining()
}

useDidShow(() => {
  player.hydrate()
  player.ensureMineDay()
})

useDidHide(() => {
  stopMining()
})

useUnload(() => {
  stopMining()
})

onBeforeUnmount(() => {
  stopMining()
})
</script>

<style lang="scss">
.content { padding: 0 16px 20px; }
.hint {
  display: block;
  margin-bottom: 12px;
  font-size: 12px;
  color: var(--text-muted);
  line-height: 1.5;
}
.dig-btn { margin-top: 4px; }
.mining-tip {
  display: block;
  margin-top: 8px;
  text-align: center;
  font-size: 12px;
  color: var(--jade);
}
.stat {
  display: block;
  margin-top: 10px;
  text-align: center;
  font-size: 12px;
  color: var(--gold);
}
.preview-row {
  display: flex;
  gap: 10px;
  padding: 8px 0;
  border-bottom: 1px solid rgba(46, 59, 89, 0.35);
}
.preview-row:last-child { border-bottom: none; }
.preview-label {
  flex-shrink: 0;
  width: 64px;
  font-size: 12px;
  color: var(--text-secondary);
}
.preview-val {
  flex: 1;
  font-size: 12px;
  color: var(--text-primary);
  line-height: 1.4;
}
.log-line {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 0;
  border-bottom: 1px solid rgba(46, 59, 89, 0.35);
  font-size: 12px;
  color: var(--jade);
}
.log-line__text {
  flex: 1;
  min-width: 0;
}
.log-line--empty { color: var(--text-muted); }
.log-line:last-child { border-bottom: none; }
.empty-tip {
  padding: 12px 4px;
  text-align: center;
  font-size: 12px;
  color: var(--text-muted);
}
</style>
