<template>
  <view class="segment">
    <view
      v-for="item in items"
      :key="item"
      class="segment__item"
      :class="{ 'segment__item--active': item === modelValue }"
      @tap="$emit('update:modelValue', item)"
    >
      <text>{{ item }}</text>
    </view>
  </view>
</template>

<script setup lang="ts">
defineProps<{
  modelValue: string
  items: string[]
}>()

defineEmits<{
  (e: 'update:modelValue', value: string): void
}>()
</script>

<style lang="scss">
.segment {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  padding: 0 16px 12px;
}

.segment__item {
  flex: 0 0 auto;
  min-width: 64px;
  padding: 0 12px;
  height: 32px;
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--panel);
  border: 1px solid var(--border-soft);
  box-shadow: var(--shadow-panel);
  color: var(--text-secondary);
  font-size: 12px;
}

.segment__item--active {
  background: linear-gradient(180deg, var(--jade) 0%, var(--tab-active) 100%);
  border-color: transparent;
  color: var(--ink);
  font-weight: 600;
  box-shadow: 0 2px 6px var(--jade-soft);
}
</style>
