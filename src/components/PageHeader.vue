<template>
  <view class="page-header">
    <view class="page-header__safe" />
    <view class="page-header__calendar-bar">
      <text class="page-header__calendar">{{ calendarLabel }}</text>
    </view>
    <view class="page-header__main">
      <view
        v-if="showBack"
        class="page-header__back"
        :class="{ 'page-header__back--locked': lockBack }"
        @tap="onBack"
      >
        ‹
      </view>
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

const props = withDefaults(
  defineProps<{
    title: string
    subtitle?: string
    showBack?: boolean
    /** 为 true 时点击返回无效并提示 */
    lockBack?: boolean
    lockBackHint?: string
  }>(),
  {
    showBack: false,
    lockBack: false,
    lockBackHint: '当前不可离开'
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
  if (props.lockBack) {
    Taro.showToast({ title: props.lockBackHint || '当前不可离开', icon: 'none' })
    return
  }
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
  border-bottom: 1px solid var(--border-soft);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.35);
  margin-bottom: 8px;
}

.page-header__safe {
  height: env(safe-area-inset-top);
  background: var(--bg);
}

.page-header__calendar-bar {
  padding: 6px 16px 4px;
  background: linear-gradient(180deg, var(--accent-wash), transparent);
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
  align-items: center;
  gap: 8px;
  padding: 4px 16px 10px;
}

.page-header__back {
  width: 28px;
  height: 28px;
  flex-shrink: 0;
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
  /* ‹ 字形偏上，略下移以视觉居中 */
  padding-bottom: 2px;
  box-sizing: border-box;
}

.page-header__back--locked {
  opacity: 0.45;
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
  display: flex;
  align-items: center;
}
</style>
