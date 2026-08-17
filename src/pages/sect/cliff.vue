<template>
  <view class="page page--sub page-cliff">
    <PageHeader
      title="思过崖"
      :subtitle="serving ? '面壁中 · 刑期未满不可离开' : '宗门 · 面壁受罚'"
      show-back
      :lock-back="serving"
      lock-back-hint="刑期未满，不可离开思过崖"
    />
    <view class="content">
      <view v-if="serving" class="panel">
        <text class="title">正在思过受罚</text>
        <text class="desc">面壁期间不可离开此页、不可外出历练</text>
        <text class="remain">剩余 {{ remainText }}</text>
        <view class="info-row">
          <text class="label">受罚人</text>
          <text>{{ player.name }} · {{ player.rank || '弟子' }}</text>
        </view>
        <view class="info-row">
          <text class="label">受罚原因</text>
          <text class="hp">{{ cliff?.reason || '宗门惩戒' }}</text>
        </view>
        <view class="info-row">
          <text class="label">开始时间</text>
          <text class="secondary">{{ startText }}</text>
        </view>
        <view class="info-row">
          <text class="label">结束时间</text>
          <text class="secondary">{{ endText }}</text>
        </view>
      </view>

      <view v-else class="panel">
        <text class="title">暂无面壁之罚</text>
        <text class="desc">
          与同门生死比斗并夺其资财后，执法堂会将你押往此处。刑期依对方职位而定。
        </text>
      </view>

      <view v-if="serving || encounterLogs.length" class="panel">
        <text class="title">面壁奇遇</text>
        <text class="desc">每 10 秒极低概率顿悟：高阶材料 / 功法或法术熟练度</text>
        <view v-if="!encounterLogs.length" class="empty-tip">静心面壁中，尚无奇遇…</view>
        <view v-for="(line, idx) in encounterLogs" :key="`${idx}-${line}`" class="log-line">
          <text class="log-line__text">{{ line }}</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import Taro, { useDidShow } from '@tarojs/taro'
import PageHeader from '../../components/PageHeader.vue'
import { formatDurationMs } from '../../constants/sect-duel'
import { usePlayerStore } from '../../stores/player'

const player = usePlayerStore()
const tick = ref(0)
let timer: ReturnType<typeof setInterval> | null = null

const cliff = computed(() => player.cliff)
const serving = computed(() => {
  tick.value
  player.clearCliffIfExpired()
  return player.onCliff
})
const remainText = computed(() => {
  tick.value
  return formatDurationMs(player.cliffRemainMs)
})
const encounterLogs = computed(() => {
  tick.value
  return player.cliff?.encounterLogs || []
})

function formatClock(ms: number) {
  if (!ms) return '—'
  const d = new Date(ms)
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`
}

const startText = computed(() => formatClock(cliff.value?.startedAt || 0))
const endText = computed(() => formatClock(cliff.value?.endsAt || 0))

function toast(title: string) {
  Taro.showToast({ title, icon: 'none', duration: 2200 })
}

function runEncounterTick() {
  if (!player.onCliff) return
  const messages = player.tickCliffEncounters()
  if (!messages.length) return
  toast(messages[0])
  tick.value += 1
}

function refresh() {
  player.clearCliffIfExpired()
  if (player.onCliff) runEncounterTick()
  tick.value += 1
}

useDidShow(() => {
  refresh()
})

onMounted(() => {
  refresh()
  timer = setInterval(() => {
    tick.value += 1
    if (player.clearCliffIfExpired()) {
      toast('面壁期满，可以离开思过崖了')
      return
    }
    if (!player.onCliff) return
    // 每秒检查；内部按 10s 间隔判定奇遇（含离线补算）
    runEncounterTick()
  }, 1000)
})

onBeforeUnmount(() => {
  if (timer) clearInterval(timer)
})
</script>

<style lang="scss">
.page-cliff {
.content {
  padding: 0 16px 20px;
}
.title {
  display: block;
  font-size: 15px;
  font-weight: 700;
}
.desc {
  display: block;
  margin-top: 6px;
  font-size: 11px;
  color: var(--text-secondary);
  line-height: 1.45;
}
.remain {
  display: block;
  margin: 12px 0;
  font-size: 18px;
  color: var(--hp);
  font-weight: 700;
  letter-spacing: 0.04em;
  font-variant-numeric: tabular-nums;
}
.info-row {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  padding: 8px 0;
  border-bottom: 1px solid rgba(46, 59, 89, 0.45);
  font-size: 11px;
}
.label {
  color: var(--text-muted);
  flex-shrink: 0;
}
.secondary {
  color: var(--text-secondary);
  text-align: right;
}
.hp {
  color: var(--hp);
  text-align: right;
}
.log-line {
  margin-top: 8px;
  padding: 8px 10px;
  border-radius: 8px;
  background: var(--panel-2);
  border: 1px solid var(--border-soft);
}
.log-line__text {
  font-size: 11px;
  color: var(--jade);
  line-height: 1.4;
}
.empty-tip {
  margin-top: 10px;
  font-size: 11px;
  color: var(--text-muted);
}
}
</style>
