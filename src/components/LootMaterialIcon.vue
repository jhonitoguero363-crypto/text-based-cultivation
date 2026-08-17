<template>
  <view
    class="loot-icon"
    :class="[`loot-icon--${size}`, { 'loot-icon--empty': !src }]"
    :style="src ? { backgroundImage: `url('${src}')` } : undefined"
  >
    <text v-if="!src" class="loot-icon__fallback">{{ fallback }}</text>
  </view>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useAsyncIconSrc } from '../composables/useAsyncIconSrc'
import { loadLootIconUrl } from '../constants/loot-icon-src'

const props = withDefaults(
  defineProps<{
    name: string
    size?: 'sm' | 'md' | 'lg'
    fallbackChar?: string
  }>(),
  { size: 'md' }
)

const src = useAsyncIconSrc(() => props.name, loadLootIconUrl)
const fallback = computed(() => props.fallbackChar || props.name.slice(0, 1) || '材')
</script>

<style lang="scss">
.loot-icon {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  background-color: var(--icon-well);
  background-repeat: no-repeat;
  background-position: center center;
  border: 1px solid var(--border-soft);
  overflow: hidden;
  box-sizing: border-box;
}

.loot-icon--sm {
  width: 28px;
  height: 28px;
  border-radius: 6px;
  background-size: 28px 28px;
}

.loot-icon--md {
  width: 40px;
  height: 40px;
  background-size: 40px 40px;
}

.loot-icon--lg {
  width: 56px;
  height: 56px;
  border-radius: 10px;
  background-size: 56px 56px;
}

.loot-icon__fallback {
  font-size: 11px;
  color: var(--text-muted);
}
</style>
