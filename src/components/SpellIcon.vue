<template>
  <view
    class="spell-icon"
    :class="[`spell-icon--${size}`, { 'spell-icon--empty': !src }]"
    :style="src ? { backgroundImage: `url('${src}')` } : undefined"
  >
    <text v-if="!src" class="spell-icon__fallback">{{ fallback }}</text>
  </view>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useAsyncIconSrc } from '../composables/useAsyncIconSrc'
import { loadSpellIconUrl } from '../constants/spell-icon-src'

const props = withDefaults(
  defineProps<{
    name: string
    fallbackChar?: string
    size?: 'sm' | 'md' | 'lg'
  }>(),
  { size: 'md' }
)

const src = useAsyncIconSrc(() => props.name, loadSpellIconUrl)
const fallback = computed(() => props.fallbackChar || props.name.slice(0, 1) || '术')
</script>

<style lang="scss">
.spell-icon {
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

.spell-icon--sm {
  width: 28px;
  height: 28px;
  border-radius: 6px;
}

.spell-icon--md {
  width: 40px;
  height: 40px;
}

.spell-icon--lg {
  width: 56px;
  height: 56px;
  border-radius: 10px;
}

.spell-icon__fallback {
  font-size: 11px;
  color: var(--text-muted);
  font-weight: 700;
}

.spell-icon--lg .spell-icon__fallback {
  font-size: 18px;
  color: var(--gold);
}
</style>
