<template>
  <view
    class="loc-icon"
    :class="[`loc-icon--${size}`, { 'loc-icon--empty': !src }]"
    :style="src ? { backgroundImage: `url('${src}')` } : undefined"
  >
    <text v-if="!src" class="loc-icon__fallback">{{ fallback }}</text>
  </view>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useAsyncIconSrc } from '../composables/useAsyncIconSrc'
import { loadLocationIconUrl } from '../constants/location-icon-src'

const props = withDefaults(
  defineProps<{
    name: string
    size?: 'sm' | 'md' | 'lg'
    fallbackChar?: string
  }>(),
  { size: 'md' }
)

const src = useAsyncIconSrc(() => props.name, loadLocationIconUrl)
const fallback = computed(() => props.fallbackChar || props.name.slice(0, 1) || '境')
</script>

<style lang="scss">
.loc-icon {
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

.loc-icon--sm {
  width: 28px;
  height: 28px;
  border-radius: 6px;
  background-size: 28px 28px;
}

.loc-icon--md {
  width: 40px;
  height: 40px;
  background-size: 40px 40px;
}

.loc-icon--lg {
  width: 56px;
  height: 56px;
  border-radius: 10px;
  background-size: 56px 56px;
}

.loc-icon__fallback {
  font-size: 11px;
  color: var(--text-muted);
}
</style>
