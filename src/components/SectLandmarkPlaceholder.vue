<template>
  <view class="page page--sub">
    <PageHeader :title="title" :subtitle="subtitle" show-back />
    <view class="content">
      <view class="panel">
        <text class="title">{{ title }}</text>
        <text class="desc">{{ desc }}</text>
        <text class="hint">功能待后续开放，敬请期待。</text>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
defineProps<{
  title: string
  subtitle: string
  desc: string
}>()
</script>

<style lang="scss">
.content {
  padding: 0 16px 20px;
}
.title {
  display: block;
  font-size: 16px;
  font-weight: 700;
}
.desc {
  display: block;
  margin-top: 8px;
  font-size: 12px;
  color: var(--text-secondary);
  line-height: 1.45;
}
.hint {
  display: block;
  margin-top: 14px;
  font-size: 11px;
  color: var(--text-muted);
}
</style>
