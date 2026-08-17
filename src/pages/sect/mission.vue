<template>
  <view class="page page--sub page-mission">
    <PageHeader title="任务堂" :subtitle="headerSub" show-back />
    <view class="content">
      <view v-if="sect.activeMission" class="panel active-panel">
        <view class="section-title">
          <text class="section-title__main">当前任务</text>
          <text class="section-title__sub">进行中</text>
        </view>
        <text class="row-item__title">{{ missionName(sect.activeMission) }}</text>
        <text class="mission-item__line">{{ missionDesc(sect.activeMission) }}</text>
        <text class="mission-item__line jade">
          条件 · {{ activeCondition }}
        </text>
        <text v-if="sect.activeMission.objective?.locationHint" class="mission-item__line">
          推荐地点 · {{ sect.activeMission.objective.locationHint }}
        </text>
        <text class="mission-item__line gold">奖励 · {{ sect.activeMission.reward }}</text>
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
        <view v-for="item in sect.missions" :key="item.instanceId" class="mission-item">
          <view class="mission-item__main">
            <view class="mission-item__body">
              <view class="inline">
                <text class="row-item__title">{{ missionName(item) }}</text>
                <text class="tag" :class="tagClass(item.tagTone)">{{ item.tag }}</text>
              </view>
              <text class="mission-item__line">{{ missionDesc(item) }}</text>
              <text v-if="item.objective" class="mission-item__line jade">
                条件 · {{ conditionText(item) }}
              </text>
              <text class="mission-item__line gold">奖励 · {{ item.reward }}</text>
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
import {
  formatMissionConditionText,
  MISSION_MEMBER_POOL_MIN,
  missionRequiresMemberPool,
  resolveEscortMembers,
  resolveMoleMember,
  type DailyMission
} from '../../constants/mission-catalog'
import { localizeMissionText } from '../../constants/mission-localize'
import { useSectStore } from '../../stores/sect'

const sect = useSectStore()
const dayLabel = computed(() => formatTianyuanCalendar(undefined, 'short'))
const headerSub = computed(
  () => `宗门 · ${formatUntilNextGameDay()}`
)

const activeCondition = computed(() =>
  formatMissionConditionText(sect.activeMission, sect.members, sect.sectId)
)

onMounted(() => {
  sect.ensureDailyMissions()
})

function missionName(item: DailyMission | null | undefined) {
  return localizeMissionText(item?.name || '', sect.sectId)
}

function missionDesc(item: DailyMission | null | undefined) {
  return localizeMissionText(item?.desc || '', sect.sectId)
}

function conditionText(item: DailyMission) {
  return formatMissionConditionText(item, sect.members, sect.sectId)
}

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
  Taro.showToast({ title, icon: 'none', duration: 2200 })
}

function goCharacter() {
  Taro.reLaunch({ url: '/pages/character/index' })
}

function onAction(item: DailyMission) {
  if (item.done) return toast('任务已完成')
  if (item.accepted) return goCharacter()
  if (sect.hasActiveMission) return toast('请先完成或取消当前任务')

  if (missionRequiresMemberPool(item.objective?.kind)) {
    const pool = sect.members.filter((m) => !m.self).length
    if (pool < MISSION_MEMBER_POOL_MIN) {
      return toast(`同门弟子不足 ${MISSION_MEMBER_POOL_MIN} 人，暂不可接`)
    }
  }

  const accepted = sect.acceptMission(item.instanceId)
  if (!accepted) return toast('领取失败')
  const route = resolveEscortMembers(accepted, sect.members)
  if (route.pickupName && route.deliverName) {
    return toast(`已领取：${missionName(accepted)}｜${route.pickupName}→${route.deliverName}`)
  }
  const mole = resolveMoleMember(accepted, sect.members)
  if (accepted.objective?.kind === 'find_mole' && mole.name) {
    return toast(`已领取：${missionName(accepted)}｜卧底 · ${mole.name}`)
  }
  toast(`已领取：${missionName(accepted)}`)
}
</script>

<style lang="scss">
.page-mission {
.content { padding: 0 16px 20px; }
.jade { color: var(--jade); }
.gold { color: var(--gold); }
.muted { color: var(--text-muted); }

.active-panel .row-item__title {
  display: block;
}

.inline {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
  margin-bottom: 2px;
}

.mission-item {
  padding: 8px 0;
  border-bottom: 1px solid rgba(46, 59, 89, 0.45);
}
.mission-item:last-child { border-bottom: none; }

.mission-item__main {
  display: flex;
  align-items: flex-start;
  gap: 8px;
}

.mission-item__body {
  flex: 1;
  min-width: 0;
}

.mission-item__line {
  display: block;
  margin-top: 1px;
  font-size: 10px;
  color: var(--text-muted);
  line-height: 1.25;
}

.active-panel .mission-item__line {
  margin-top: 2px;
}

.empty-tip {
  padding: 12px 4px;
  text-align: center;
  font-size: 12px;
  color: var(--text-muted);
}
}
</style>
