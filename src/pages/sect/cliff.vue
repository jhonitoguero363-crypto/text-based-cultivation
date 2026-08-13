<template>
  <view class="page page--sub">
    <PageHeader title="思过崖" subtitle="宗门 · 面壁受罚" show-back />
    <view class="content">
      <view class="panel">
        <text class="title">正在思过受罚</text>
        <text class="desc">思过崖 · 面壁期间不可外出历练</text>
        <text class="remain">剩余 02:13:45</text>
        <view class="info-row"><text class="label">受罚人</text><text>云中鹤 · 外门弟子</text></view>
        <view class="info-row"><text class="label">受罚原因</text><text class="hp">与同门争执，出手伤人</text></view>
        <view class="info-row"><text class="label">开始时间</text><text class="secondary">今日 08:00</text></view>
        <view class="info-row"><text class="label">结束时间</text><text class="secondary">今日 10:30</text></view>
      </view>
      <view class="panel">
        <text class="title">面壁修为</text>
        <text class="desc">思过静心，心境沉淀亦可增益修为</text>
        <text class="gain">+180</text>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import PageHeader from '../../components/PageHeader.vue'
</script>

<style lang="scss">
.content { padding: 0 16px; }
.title { display: block; font-size: 15px; font-weight: 700; }
.desc { display: block; margin-top: 6px; font-size: 10px; color: var(--text-secondary); }
.remain { display: block; margin: 12px 0; font-size: 13px; color: var(--hp); font-weight: 600; }
.info-row {
  display: flex; justify-content: space-between; padding: 8px 0;
  border-bottom: 1px solid rgba(46, 59, 89, 0.45); font-size: 11px;
}
.label { color: var(--text-muted); }
.secondary { color: var(--text-secondary); }
.hp { color: var(--hp); }
.gain { display: block; margin-top: 12px; font-size: 16px; color: var(--gold); font-weight: 700; }
</style>
