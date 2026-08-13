<template>
  <view class="page page--sub">
    <PageHeader title="任务堂" :subtitle="headerSub" show-back />
    <view class="content">
      <view v-if="sect.activeMission" class="panel active-panel">
        <view class="section-title">
          <text class="section-title__main">当前任务</text>
          <text class="section-title__sub">进行中</text>
        </view>
        <text class="row-item__title">{{ sect.activeMission.name }}</text>
        <text class="row-item__desc">{{ sect.activeMission.desc }}</text>
        <text class="row-item__desc gold">{{ sect.activeMission.reward }}</text>
        <view class="btn btn--jade btn--block" style="margin-top: 10px" @tap="goCharacter">
          前往角色查看
        </view>
      </view>

      <view class="panel">
        <view class="section-title">
          <text class="section-title__main">修历任务</text>
          <text class="section-title__sub">常驻 5 个 · 未完成保留 · {{ dayLabel }}</text>
        </view>
        <view v-if="!sect.missions.length" class="empty-tip">任务加载中</view>
        <view v-for="item in sect.missions" :key="item.instanceId" class="shop-item">
          <view class="shop-item__head">
            <view class="row-item__body">
              <view class="inline">
                <text class="row-item__title">{{ item.name }}</text>
                <text class="tag" :class="tagClass(item.tagTone)">{{ item.tag }}</text>
              </view>
              <text class="row-item__desc">{{ item.desc }}</text>
              <text class="row-item__desc gold">{{ item.reward }}</text>
              <text v-if="item.playStyle" class="row-item__desc muted">玩法 · {{ item.playStyle }}</text>
            </view>
            <view
              class="btn"
              :class="btnClass(item)"
              @tap="onAction(item)"
            >
              {{ btnText(item) }}
            </view>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
import Taro from '@tarojs/taro'
import PageHeader from '../../components/PageHeader.vue'
import {
  formatTianyuanCalendar,
  formatUntilNextGameDay
} from '../../constants/game-time'
import type { DailyMission } from '../../constants/mission-catalog'
import { useSectStore } from '../../stores/sect'

const sect = useSectStore()
const dayLabel = computed(() => formatTianyuanCalendar(undefined, 'short'))
const headerSub = computed(
  () => `宗门 · ${formatUntilNextGameDay()}`
)

onMounted(() => {
  sect.ensureDailyMissions()
})

function tagClass(tone: string) {
  if (tone === 'muted') return ''
  return `tag--${tone}`
}

function btnText(item: DailyMission) {
  if (item.done) return '已完成'
  if (item.accepted) return '进行中'
  if (sect.hasActiveMission) return '已有任务'
  return '领取'
}

function btnClass(item: DailyMission) {
  if (item.done || item.accepted || sect.hasActiveMission) return 'btn--ghost'
  return 'btn--gold'
}

function toast(title: string) {
  Taro.showToast({ title, icon: 'none', duration: 2000 })
}

function goCharacter() {
  Taro.reLaunch({ url: '/pages/character/index' })
}

function onAction(item: DailyMission) {
  if (item.done) return toast('任务已完成')
  if (item.accepted) return goCharacter()
  if (sect.hasActiveMission) return toast('请先完成或取消当前任务')

  const accepted = sect.acceptMission(item.instanceId)
  if (!accepted) return toast('领取失败')
  toast(`已领取：${accepted.name}`)
}
</script>

<style lang="scss">
.content { padding: 0 16px 20px; }
.active-panel .row-item__title {
  display: block;
}
.active-panel .row-item__desc {
  display: block;
  margin-top: 4px;
}
.inline { display: flex; align-items: center; gap: 6px; flex-wrap: wrap; }
.shop-item {
  padding: 12px 0;
  border-bottom: 1px solid rgba(46, 59, 89, 0.45);
}
.shop-item:last-child { border-bottom: none; }
.shop-item__head {
  display: flex;
  align-items: flex-start;
  gap: 10px;
}
.gold { color: var(--gold); }
.muted { color: var(--text-muted); }
.empty-tip {
  padding: 12px 4px;
  text-align: center;
  font-size: 12px;
  color: var(--text-muted);
}
</style>
