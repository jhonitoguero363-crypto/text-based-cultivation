<template>
  <view class="page page--sub page-tower">
    <PageHeader title="镇妖塔" subtitle="青云宗 · 镇守试炼" show-back />
    <view class="content">
      <view class="panel">
        <view class="section-title">
          <text class="section-title__main">镇妖塔层数</text>
          <text class="section-title__sub">
            {{
              guarding
                ? `镇守中 · ${guardLeft}s`
                : `今日剩余 ${usesLeft}/${dailyLimit} 次 · 战力 ${player.combatPower}`
            }}
          </text>
        </view>
        <text class="hint">
          战力达标可稳妥镇守；二层、三层可强行挑战，不足则有受伤风险。完成当场结算贡献与修为；接「试炼妖塔」可额外领周常奖。
        </text>
        <view v-for="item in floorRows" :key="item.id" class="row-item">
          <view class="icon-box">🏯</view>
          <view class="row-item__body">
            <text class="row-item__title">{{ item.name }}</text>
            <text class="row-item__desc">{{ item.detail }}</text>
          </view>
          <view
            class="btn"
            :class="guardingFloor === item.id ? 'btn--hp' : 'btn--gold'"
            @tap="toggleGuard(item.id)"
          >
            {{ guardingFloor === item.id ? '停止' : '镇守' }}
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, ref } from 'vue'
import Taro from '@tarojs/taro'
import PageHeader from '../../components/PageHeader.vue'
import {
  getTowerFloor,
  LANDMARK_DAILY_LIMIT,
  TOWER_FLOORS,
  towerRequiredPower
} from '../../constants/sect-landmark'
import { usePlayerStore } from '../../stores/player'
import { useSectStore } from '../../stores/sect'

const player = usePlayerStore()
const sect = useSectStore()

const guardingFloor = ref('')
const guardLeft = ref(0)
const guarding = ref(false)
const startedUnderpowered = ref(false)
let guardTimer: ReturnType<typeof setInterval> | null = null
let elapsed = 0
let activeDuration = 60

const dailyLimit = LANDMARK_DAILY_LIMIT
const usesLeft = computed(() => player.getLandmarkUsesLeft('tower'))

const floorRows = computed(() => {
  const power = player.combatPower
  const major = player.realmState.major
  return TOWER_FLOORS.map((floor) => {
    const need = towerRequiredPower(major, floor)
    const ok = power >= need
    const risk =
      floor.underpowered === 'risk'
        ? ok
          ? '可稳守'
          : floor.injuryChance >= 1
            ? '强行·必伤'
            : '强行·或伤'
        : ok
          ? '可镇守'
          : '战力不足'
    return {
      id: floor.id,
      name: floor.name,
      detail: `需战力 ${need}（本境中位×${floor.powerMult}） · ${floor.durationSec}s · 贡献+${floor.contribution}/修为+${floor.exp} · ${risk}`
    }
  })
})

function toast(title: string) {
  Taro.showToast({ title, icon: 'none' })
}

function clearGuard() {
  if (guardTimer) clearInterval(guardTimer)
  guardTimer = null
  guarding.value = false
  guardingFloor.value = ''
  guardLeft.value = 0
  startedUnderpowered.value = false
  elapsed = 0
}

function canEnterLandmark() {
  if (player.injured) {
    toast('伤势未愈，不宜镇守')
    return false
  }
  if (player.onCliff) {
    toast('思过崖面壁期间不可镇守')
    return false
  }
  if (player.getLandmarkUsesLeft('tower') <= 0) {
    toast('今日镇守次数已用尽')
    return false
  }
  return true
}

function toggleGuard(id: string) {
  if (guardingFloor.value === id) {
    clearGuard()
    return toast('已停止镇守（未结算）')
  }
  if (!canEnterLandmark()) return

  const floor = getTowerFloor(id)
  if (!floor) return

  const need = towerRequiredPower(player.realmState.major, floor)
  const under = player.combatPower < need
  if (under && floor.underpowered === 'block') {
    return toast(`战力不足（需 ${need}），无法镇守一层`)
  }

  clearGuard()
  guardingFloor.value = id
  guarding.value = true
  startedUnderpowered.value = under
  activeDuration = floor.durationSec
  guardLeft.value = activeDuration
  elapsed = 0
  guardTimer = setInterval(() => {
    elapsed += 1
    guardLeft.value = Math.max(0, activeDuration - elapsed)
    if (elapsed >= activeDuration) {
      finishGuard(id)
    }
  }, 1000)
  toast(under ? '强行镇守开始' : '开始镇守')
}

function finishGuard(id: string) {
  const floor = getTowerFloor(id)
  const wasUnderpowered = startedUnderpowered.value
  clearGuard()
  if (!floor) return
  if (!player.consumeLandmarkUse('tower')) {
    return toast('今日次数已满，未能结算')
  }

  let injuredNow = false
  if (wasUnderpowered && floor.underpowered === 'risk') {
    if (Math.random() < floor.injuryChance) {
      player.setInjured(true)
      injuredNow = true
    }
  }

  player.earnContribution(floor.contribution)
  player.addExp(floor.exp)
  player.persist()
  sect.reportMissionProgress('tower_guard', 1)

  const parts = [
    `${floor.name}镇守完成`,
    `贡献+${floor.contribution}`,
    `修为+${floor.exp}`
  ]
  if (injuredNow) parts.push('身受创伤')
  toast(parts.join(' · '))
}

onBeforeUnmount(() => clearGuard())
</script>

<style lang="scss">
.page-tower {
.content {
  padding: 0 16px 20px;
}
.hint {
  display: block;
  margin-bottom: 10px;
  font-size: 11px;
  color: var(--text-muted);
  line-height: 1.45;
}
.icon-box {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  background: var(--panel-2);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
}
</style>
