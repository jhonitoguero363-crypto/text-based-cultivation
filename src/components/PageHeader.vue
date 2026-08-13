<template>
  <view class="page-header">
    <view class="page-header__safe" />
    <view class="page-header__calendar-bar">
      <text class="page-header__calendar">{{ calendarLabel }}</text>
    </view>
    <view class="page-header__main">
      <view v-if="showBack" class="page-header__back" @tap="onBack">‹</view>
      <view class="page-header__texts">
        <text class="page-header__title">{{ title }}</text>
        <text v-if="subtitle" class="page-header__subtitle">{{ subtitle }}</text>
      </view>
      <view v-if="$slots.right" class="page-header__right">
        <slot name="right" />
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue'
import Taro, { eventCenter, getCurrentInstance } from '@tarojs/taro'
import { formatTianyuanCalendar } from '../constants/game-time'

withDefaults(
  defineProps<{
    title: string
    subtitle?: string
    showBack?: boolean
  }>(),
  {
    showBack: false
  }
)

const calendarLabel = ref(formatTianyuanCalendar())

function refreshCalendar() {
  calendarLabel.value = formatTianyuanCalendar()
}

const instance = getCurrentInstance()
const onShowEventId = instance?.router?.onShow

onMounted(() => {
  refreshCalendar()
  if (onShowEventId) eventCenter.on(onShowEventId, refreshCalendar)
})

onUnmounted(() => {
  if (onShowEventId) eventCenter.off(onShowEventId, refreshCalendar)
})

function onBack() {
  const pages = Taro.getCurrentPages()
  if (pages.length > 1) {
    Taro.navigateBack()
  } else {
    Taro.reLaunch({ url: '/pages/sect/index' })
  }
}
</script>

<style lang="scss">
.page-header {
  position: sticky;
  top: 0;
  z-index: 200;
  background: var(--bg);
  border-bottom: 1px solid rgba(46, 59, 89, 0.35);
  box-shadow: 0 8px 20px rgba(7, 11, 20, 0.35);
}

.page-header__safe {
  height: env(safe-area-inset-top);
  background: var(--bg);
}

.page-header__calendar-bar {
  padding: 6px 16px 4px;
  background: linear-gradient(180deg, rgba(91, 200, 168, 0.1), transparent);
}

.page-header__calendar {
  display: block;
  font-size: 12px;
  color: var(--jade);
  letter-spacing: 0.06em;
  font-weight: 600;
}

.page-header__main {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  padding: 4px 16px 10px;
}

.page-header__back {
  width: 28px;
  height: 28px;
  margin-top: 2px;
  border-radius: 8px;
  background: var(--panel);
  border: 1px solid var(--border-soft);
  box-shadow: var(--shadow-panel);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-primary);
  font-size: 18px;
  line-height: 1;
}

.page-header__texts {
  flex: 1;
  min-width: 0;
}

.page-header__title {
  display: block;
  font-size: 20px;
  font-weight: 700;
  color: var(--text-primary);
  letter-spacing: -0.02em;
  line-height: 1.2;
}

.page-header__subtitle {
  display: block;
  margin-top: 4px;
  font-size: 12px;
  color: var(--gold);
}

.page-header__right {
  flex-shrink: 0;
  margin-top: 2px;
}
</style>
