<template>
  <view class="stone-chip">
    <text class="stone-chip__icon">◆</text>
    <text v-if="label" class="stone-chip__label">{{ label }}</text>
    <text class="stone-chip__value">{{ value.toLocaleString() }}</text>
  </view>
</template>

<script setup lang="ts">
withDefaults(
  defineProps<{
    value: number
    /** 如：灵石 / 贡献 */
    label?: string
  }>(),
  { label: '' }
)
</script>

<style lang="scss">
.stone-chip {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px 10px;
  border-radius: 999px;
  background: var(--panel);
  border: 1px solid var(--border-soft);
  box-shadow: var(--shadow-panel);
}

.stone-chip__icon {
  font-size: 10px;
  color: var(--gold);
}

.stone-chip__label {
  font-size: 11px;
  color: var(--text-muted);
}

.stone-chip__value {
  font-size: 13px;
  color: var(--text-primary);
  font-weight: 600;
}
</style>
