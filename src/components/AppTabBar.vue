<template>
  <view class="tabbar">
    <view
      v-for="item in tabs"
      :key="item.key"
      class="tabbar__item"
      :class="{ 'tabbar__item--active': current === item.key }"
      @tap="go(item)"
    >
      <text class="tabbar__icon">{{ item.icon }}</text>
      <text class="tabbar__label">{{ item.label }}</text>
    </view>
  </view>
</template>

<script setup lang="ts">
import Taro from '@tarojs/taro'

defineProps<{
  current: 'adventure' | 'sect' | 'character'
}>()

const tabs = [
  { key: 'adventure', label: '历练', icon: '⚔️', url: '/pages/adventure/index' },
  { key: 'sect', label: '宗门', icon: '🏛️', url: '/pages/sect/index' },
  { key: 'character', label: '角色', icon: '🧍', url: '/pages/character/index' }
] as const

function go(item: (typeof tabs)[number]) {
  const pages = Taro.getCurrentPages()
  const currentRoute = pages[pages.length - 1]?.route
  if (currentRoute && `/${currentRoute}` === item.url) return
  Taro.reLaunch({ url: item.url })
}
</script>

<style lang="scss">
.tabbar {
  position: fixed;
  left: 16px;
  right: 16px;
  bottom: calc(12px + env(safe-area-inset-bottom));
  z-index: 100;
  height: 62px;
  padding: 6px;
  display: flex;
  align-items: center;
  background: var(--tab-bg);
  border: 1px solid rgba(224, 123, 108, 0.25);
  border-radius: 31px;
  backdrop-filter: blur(16px);
  box-shadow: var(--shadow-tab);
}

.tabbar__item {
  flex: 1;
  height: 100%;
  border-radius: 25px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 2px;
  transition: background 0.15s ease;
}

.tabbar__item--active {
  background: rgba(139, 26, 34, 0.95);
  box-shadow: 0 0 15px rgba(139, 26, 34, 0.4);
}

.tabbar__icon {
  font-size: 16px;
  line-height: 1;
  color: var(--text-secondary);
  font-family: 'Apple Color Emoji', 'Segoe UI Emoji', 'Noto Color Emoji', sans-serif;
}

.tabbar__item--active .tabbar__icon,
.tabbar__item--active .tabbar__label {
  color: var(--text-primary);
}

.tabbar__label {
  font-size: 10px;
  color: var(--text-secondary);
}
</style>
