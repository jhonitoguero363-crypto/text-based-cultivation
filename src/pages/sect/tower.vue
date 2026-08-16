<template>
  <view class="page page--sub">
    <PageHeader title="镇妖塔" subtitle="宗门 · 镇守妖兽" show-back />
    <view class="content">
      <view class="panel">
        <view class="section-title">
          <text class="section-title__main">镇妖塔层数</text>
          <text class="section-title__sub">
            {{ guarding ? `镇守中 · ${guardLeft}s` : '点选一层开始镇守' }}
          </text>
        </view>
        <text class="hint">接取「试炼妖塔」后，镇守满 60 秒可完成任务进度。</text>
        <view v-for="item in floors" :key="item.id" class="row-item">
          <view class="icon-box">🏯</view>
          <view class="row-item__body">
            <text class="row-item__title">{{ item.name }}</text>
            <text class="row-item__desc">{{ item.detail }}</text>
          </view>
          <view
            class="btn"
            :class="guardingFloor === item.id ? 'btn--hp' : 'btn--gold'"
            @tap="toggleGuard(item.id)"
          >
            {{ guardingFloor === item.id ? '停止' : '镇守' }}
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { onBeforeUnmount, ref } from 'vue'
import Taro from '@tarojs/taro'
import PageHeader from '../../components/PageHeader.vue'
import { useSectStore } from '../../stores/sect'

const sect = useSectStore()
const floors = [
  { id: 'tf1', name: '一层 · 青风狼', detail: 'Lv.12 · 镇守 60 秒计入任务' },
  { id: 'tf2', name: '二层 · 赤炎狼', detail: 'Lv.24 · 镇守 60 秒计入任务' },
  { id: 'tf3', name: '三层 · 玄甲龟', detail: 'Lv.36 · 镇守 60 秒计入任务' }
]

const guardingFloor = ref('')
const guardLeft = ref(0)
const guarding = ref(false)
let guardTimer: ReturnType<typeof setInterval> | null = null
let elapsed = 0

function toast(title: string) {
  Taro.showToast({ title, icon: 'none' })
}

function clearGuard() {
  if (guardTimer) clearInterval(guardTimer)
  guardTimer = null
  guarding.value = false
  guardingFloor.value = ''
  guardLeft.value = 0
  elapsed = 0
}

function toggleGuard(id: string) {
  if (guardingFloor.value === id) {
    clearGuard()
    return toast('已停止镇守')
  }
  clearGuard()
  guardingFloor.value = id
  guarding.value = true
  guardLeft.value = 60
  elapsed = 0
  guardTimer = setInterval(() => {
    elapsed += 1
    guardLeft.value = Math.max(0, 60 - elapsed)
    if (elapsed >= 60) {
      sect.reportMissionProgress('tower_guard', 60)
      clearGuard()
      toast('镇守完成，任务进度已更新')
    }
  }, 1000)
  toast('开始镇守')
}

onBeforeUnmount(() => clearGuard())
</script>

<style lang="scss">
.content { padding: 0 16px; }
.hint {
  display: block;
  margin-bottom: 10px;
  font-size: 11px;
  color: var(--text-muted);
  line-height: 1.45;
}
.icon-box {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  background: var(--panel-2);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
</style>
