<template>
  <view
    class="ore-icon"
    :class="[`ore-icon--${size}`, { 'ore-icon--empty': !src }]"
    :style="src ? { backgroundImage: `url('${src}')` } : undefined"
  >
    <text v-if="!src" class="ore-icon__fallback">矿</text>
  </view>
</template>

<script setup lang="ts">
import { useAsyncIconSrc } from '../composables/useAsyncIconSrc'
import { loadOreIconUrl } from '../constants/ore-icon-src'

const props = withDefaults(
  defineProps<{
    name: string
    level?: string
    size?: 'sm' | 'md' | 'lg'
  }>(),
  { size: 'md' }
)

const src = useAsyncIconSrc(
  () => `${props.name}::${props.level || ''}`,
  (key) => {
    const [name, level] = key.split('::')
    return loadOreIconUrl(name, level || undefined)
  }
)
</script>

<style lang="scss">
.ore-icon {
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

.ore-icon--sm {
  width: 28px;
  height: 28px;
  border-radius: 6px;
  background-size: 28px 28px;
}

.ore-icon--md {
  width: 40px;
  height: 40px;
  background-size: 40px 40px;
}

.ore-icon--lg {
  width: 56px;
  height: 56px;
  border-radius: 10px;
  background-size: 56px 56px;
}

.ore-icon__fallback {
  font-size: 11px;
  color: var(--text-muted);
}
</style>
