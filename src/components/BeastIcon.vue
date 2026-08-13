<template>
  <view
    class="beast-icon"
    :class="[`beast-icon--${size}`, { 'beast-icon--empty': !src }]"
    :style="src ? { backgroundImage: `url('${src}')` } : undefined"
  >
    <text v-if="!src" class="beast-icon__fallback">兽</text>
  </view>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { getBeastIconUrl } from '../constants/beast-icon-src'

const props = withDefaults(
  defineProps<{
    name: string
    realm?: string
    size?: 'sm' | 'md' | 'lg'
  }>(),
  { size: 'md' }
)

const src = computed(() => getBeastIconUrl(props.name, props.realm))
</script>

<style lang="scss">
.beast-icon {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  background-color: #0e1424;
  background-repeat: no-repeat;
  background-position: center center;
  border: 1px solid var(--border-soft);
  overflow: hidden;
  box-sizing: border-box;
}

.beast-icon--sm {
  width: 28px;
  height: 28px;
  border-radius: 6px;
  background-size: 28px 28px;
}

.beast-icon--md {
  width: 40px;
  height: 40px;
  background-size: 40px 40px;
}

.beast-icon--lg {
  width: 56px;
  height: 56px;
  border-radius: 10px;
  background-size: 56px 56px;
}

.beast-icon__fallback {
  font-size: 11px;
  color: var(--text-muted);
}
</style>
