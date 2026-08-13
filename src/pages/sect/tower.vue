<template>
  <view class="page page--sub">
    <PageHeader title="镇妖塔" subtitle="宗门 · 镇守妖兽" show-back />
    <view class="content">
      <view class="panel">
        <view class="section-title">
          <text class="section-title__main">镇妖塔层数</text>
          <text class="section-title__sub">当前镇守至第 3 层</text>
        </view>
        <view v-for="item in sect.towerFloors" :key="item.id" class="row-item">
          <view class="icon-box">🏯</view>
          <view class="row-item__body">
            <text class="row-item__title">{{ item.name }}</text>
            <text class="row-item__desc">{{ item.detail }}</text>
          </view>
          <text v-if="item.done" class="muted">已镇守</text>
          <view v-else class="btn btn--gold" @tap="toast('开始镇守')">镇守</view>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import Taro from '@tarojs/taro'
import PageHeader from '../../components/PageHeader.vue'
import { useSectStore } from '../../stores/sect'

const sect = useSectStore()
function toast(title: string) {
  Taro.showToast({ title, icon: 'none' })
}
</script>

<style lang="scss">
.content { padding: 0 16px; }
.muted { color: var(--text-muted); font-size: 12px; }
</style>
