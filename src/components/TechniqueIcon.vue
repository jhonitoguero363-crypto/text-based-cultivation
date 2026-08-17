<template>
  <view
    class="technique-icon"
    :class="[`technique-icon--${size}`, { 'technique-icon--empty': !src }]"
    :style="src ? { backgroundImage: `url('${src}')` } : undefined"
  >
    <text v-if="!src" class="technique-icon__fallback">{{ fallback }}</text>
  </view>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useAsyncIconSrc } from '../composables/useAsyncIconSrc'
import { loadTechniqueIconUrl } from '../constants/technique-icon-src'

const props = withDefaults(
  defineProps<{
    name: string
    fallbackChar?: string
    size?: 'sm' | 'md' | 'lg'
  }>(),
  { size: 'md' }
)

const src = useAsyncIconSrc(() => props.name, loadTechniqueIconUrl)
const fallback = computed(() => props.fallbackChar || props.name.slice(0, 1) || '法')
</script>

<style lang="scss">
.technique-icon {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  background-color: var(--icon-well);
  background-repeat: no-repeat;
  background-position: center center;
  background-size: cover;
  border: 1px solid var(--border-soft);
  overflow: hidden;
  box-sizing: border-box;
}

.technique-icon--sm {
  width: 28px;
  height: 28px;
  border-radius: 6px;
}

.technique-icon--md {
  width: 40px;
  height: 40px;
}

.technique-icon--lg {
  width: 56px;
  height: 56px;
  border-radius: 10px;
}

.technique-icon__fallback {
  font-size: 11px;
  color: var(--text-muted);
  font-weight: 700;
}

.technique-icon--lg .technique-icon__fallback {
  font-size: 18px;
  color: var(--gold);
}
</style>
