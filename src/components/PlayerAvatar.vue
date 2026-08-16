<template>
  <view
    class="player-avatar"
    :class="[`player-avatar--${size}`, { 'player-avatar--empty': !src }]"
    :style="src ? { backgroundImage: `url('${src}')` } : undefined"
  >
    <text v-if="!src" class="player-avatar__fallback">{{ fallback }}</text>
  </view>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { getPlayerAvatarUrl } from '../constants/player-avatar-src'

const props = withDefaults(
  defineProps<{
    gender: string
    fallbackChar?: string
    size?: 'sm' | 'md' | 'lg'
  }>(),
  { size: 'md' }
)

const src = computed(() => getPlayerAvatarUrl(props.gender))
const fallback = computed(() => props.fallbackChar || '我')
</script>

<style lang="scss">
.player-avatar {
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

.player-avatar--sm {
  width: 36px;
  height: 36px;
  border-radius: 10px;
}

.player-avatar--md {
  width: 48px;
  height: 48px;
}

.player-avatar--lg {
  width: 64px;
  height: 64px;
  border-radius: 16px;
}

.player-avatar__fallback {
  font-size: 18px;
  font-weight: 700;
  color: var(--gold);
}

.player-avatar--sm .player-avatar__fallback {
  font-size: 14px;
}

.player-avatar--lg .player-avatar__fallback {
  font-size: 26px;
}
</style>
