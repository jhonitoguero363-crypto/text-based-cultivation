<template>
  <view
    class="pet-icon"
    :class="[`pet-icon--${size}`, { 'pet-icon--empty': !src }]"
    :style="src ? { backgroundImage: `url('${src}')` } : undefined"
  >
    <text v-if="!src" class="pet-icon__fallback">宠</text>
  </view>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { getPetIconUrl } from '../constants/pet-icon-src'

const props = withDefaults(
  defineProps<{
    name: string
    realm?: string
    size?: 'sm' | 'md' | 'lg'
  }>(),
  { size: 'md' }
)

const src = computed(() => getPetIconUrl(props.name, props.realm))
</script>

<style lang="scss">
.pet-icon {
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

.pet-icon--sm {
  width: 28px;
  height: 28px;
  border-radius: 6px;
  background-size: 28px 28px;
}

.pet-icon--md {
  width: 40px;
  height: 40px;
  background-size: 40px 40px;
}

.pet-icon--lg {
  width: 56px;
  height: 56px;
  border-radius: 10px;
  background-size: 56px 56px;
}

.pet-icon__fallback {
  font-size: 11px;
  color: var(--text-muted);
}
</style>
