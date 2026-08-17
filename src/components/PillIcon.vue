<template>
  <view
    class="pill-icon"
    :class="[`pill-icon--${size}`, { 'pill-icon--empty': !src }]"
    :style="src ? { backgroundImage: `url('${src}')` } : undefined"
  >
    <text v-if="!src" class="pill-icon__fallback">丹</text>
  </view>
</template>

<script setup lang="ts">
import { useAsyncIconSrc } from '../composables/useAsyncIconSrc'
import { loadPillIconUrl } from '../constants/pill-icon-src'

const props = withDefaults(
  defineProps<{
    name: string
    size?: 'sm' | 'md' | 'lg'
  }>(),
  { size: 'md' }
)

const src = useAsyncIconSrc(() => props.name, loadPillIconUrl)
</script>

<style lang="scss">
.pill-icon {
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

.pill-icon--sm {
  width: 28px;
  height: 28px;
  border-radius: 6px;
  background-size: 28px 28px;
}

.pill-icon--md {
  width: 40px;
  height: 40px;
  background-size: 40px 40px;
}

.pill-icon--lg {
  width: 56px;
  height: 56px;
  border-radius: 10px;
  background-size: 56px 56px;
}

.pill-icon__fallback {
  font-size: 11px;
  color: var(--text-muted);
}
</style>
