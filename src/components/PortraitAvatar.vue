<template>
  <view
    class="portrait-avatar"
    :class="[`portrait-avatar--${size}`, { 'portrait-avatar--empty': !src }]"
    :style="src ? { backgroundImage: `url('${src}')` } : undefined"
  >
    <text v-if="!src" class="portrait-avatar__fallback">{{ fallback }}</text>
  </view>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { getPortraitIconUrl } from '../constants/portrait-icon-src'

const props = withDefaults(
  defineProps<{
    name: string
    fallbackChar?: string
    size?: 'sm' | 'md' | 'lg'
  }>(),
  { size: 'md' }
)

const src = computed(() => getPortraitIconUrl(props.name))
const fallback = computed(
  () => props.fallbackChar || props.name.slice(0, 1) || '人'
)
</script>

<style lang="scss">
.portrait-avatar {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 12px;
  background-color: #1a2740;
  background-repeat: no-repeat;
  background-position: center center;
  background-size: cover;
  border: 1px solid var(--border-soft);
  overflow: hidden;
  box-sizing: border-box;
  box-shadow: var(--shadow-panel);
}

.portrait-avatar--sm {
  width: 36px;
  height: 36px;
  border-radius: 10px;
}

.portrait-avatar--md {
  width: 48px;
  height: 48px;
}

.portrait-avatar--lg {
  width: 64px;
  height: 64px;
  border-radius: 16px;
}

.portrait-avatar__fallback {
  font-size: 18px;
  font-weight: 700;
  color: var(--gold);
}

.portrait-avatar--sm .portrait-avatar__fallback {
  font-size: 14px;
}

.portrait-avatar--lg .portrait-avatar__fallback {
  font-size: 26px;
}
</style>
