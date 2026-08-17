<template>
  <view
    class="treasure-icon"
    :class="[`treasure-icon--${size}`, { 'treasure-icon--empty': !src }]"
    :style="src ? { backgroundImage: `url('${src}')` } : undefined"
  >
    <text v-if="!src" class="treasure-icon__fallback">宝</text>
  </view>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useAsyncIconSrc } from '../composables/useAsyncIconSrc'
import { FORGE_SHOP_CATALOG } from '../constants/treasure-catalog'
import { loadTreasureIconUrl } from '../constants/treasure-icon-src'

const props = withDefaults(
  defineProps<{
    name: string
    grade?: string
    /** 攻击类 / 防御类 / 辅助类 / 特殊类；无专属图时按类别回退 */
    type?: string
    size?: 'sm' | 'md' | 'lg'
  }>(),
  { size: 'md' }
)

const resolvedType = computed(() => {
  if (props.type) return props.type
  return FORGE_SHOP_CATALOG.find((item) => item.name === props.name)?.type
})

const src = useAsyncIconSrc(
  () => `${props.name}::${props.grade || ''}::${resolvedType.value || ''}`,
  (key) => {
    const [name, grade, type] = key.split('::')
    return loadTreasureIconUrl(name, grade || undefined, type || undefined)
  }
)
</script>

<style lang="scss">
.treasure-icon {
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

.treasure-icon--sm {
  width: 28px;
  height: 28px;
  border-radius: 6px;
}

.treasure-icon--md {
  width: 40px;
  height: 40px;
}

.treasure-icon--lg {
  width: 56px;
  height: 56px;
  border-radius: 10px;
}

.treasure-icon__fallback {
  font-size: 11px;
  color: var(--text-muted);
}
</style>
