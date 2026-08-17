<template>
  <view class="page page--sub page-ancestor-pool">
    <PageHeader title="返祖池" subtitle="妖族 · 血脉试炼" show-back />
    <view class="content">
      <view class="panel">
        <view class="section-title">
          <text class="section-title__main">踏入返祖池</text>
          <text class="section-title__sub">
            今日剩余 {{ usesLeft }}/{{ dailyLimit }} 次 · 成功率约 {{ successRate }}%
          </text>
        </view>
        <text class="hint">
          消耗大量贡献唤起血脉。终身仅第一次成功可涨主灵根 +{{ rootBonusMin }}～{{
            rootBonusMax
          }}（随机）；之后成功只涨修为，次数越多收益越低。失败贡献照扣并受伤。
        </text>
        <text class="meta">
          主灵根 {{ rootLabel }} · 贡献 {{ player.contribution }} · 下次消耗 {{ contribCost }} 贡献
        </text>
        <text class="meta">
          <template v-if="!rootClaimed"
            >下次成功：主灵根 +{{ rootBonusMin }}～{{ rootBonusMax }}（终身一次 · 随机）</template
          >
          <template v-else>下次成功：修为约 +{{ nextExp }}（已衰减 · 累计成功 {{ successCount }} 次）</template>
        </text>

        <view v-if="lastResult" class="result">
          <text class="result__title">{{ lastResult.title }}</text>
          <text class="result__desc">{{ lastResult.desc }}</text>
        </view>

        <view class="btn btn--block btn--gold" :class="{ 'btn--ghost': busy }" @tap="onEnter">
          {{ busy ? '试炼中…' : `消耗 ${contribCost} 贡献 · 返祖` }}
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import Taro from '@tarojs/taro'
import PageHeader from '../../components/PageHeader.vue'
import { pickPrimaryRoot } from '../../constants/roots'
import {
  ANCESTOR_POOL,
  calcAncestorPoolContributionCost,
  calcAncestorPoolExpGain,
  calcAncestorPoolSuccessRate,
  getLandmarkDailyLimit,
  rollAncestorPoolRootBonus
} from '../../constants/sect-landmark'
import { usePlayerStore } from '../../stores/player'
import { useSectStore } from '../../stores/sect'

const player = usePlayerStore()
const sect = useSectStore()

const busy = ref(false)
const lastResult = ref<{ title: string; desc: string } | null>(null)

const rootBonusMin = ANCESTOR_POOL.rootBonusMin
const rootBonusMax = ANCESTOR_POOL.rootBonusMax
const dailyLimit = getLandmarkDailyLimit('ancestor_pool')
const usesLeft = computed(() => player.getLandmarkUsesLeft('ancestor_pool'))
const rootClaimed = computed(() => player.ancestorPoolRootClaimed)
const successCount = computed(() => player.ancestorPoolSuccessCount)
const contribCost = computed(() => calcAncestorPoolContributionCost(successCount.value))
const nextExp = computed(() =>
  calcAncestorPoolExpGain(Math.max(0, successCount.value - 1))
)

const primary = computed(() =>
  player.roots?.length ? pickPrimaryRoot(player.roots as any) : null
)
const rootLabel = computed(() =>
  primary.value ? `${primary.value.name}${primary.value.value}` : '无'
)
const successRate = computed(() =>
  calcAncestorPoolSuccessRate(primary.value?.value ?? 0)
)

function toast(title: string) {
  Taro.showToast({ title, icon: 'none' })
}

function onEnter() {
  if (busy.value) return
  if (player.injured) return toast('伤势未愈，不宜返祖')
  if (player.onCliff) return toast('思过崖面壁期间不可返祖')
  if (!primary.value) return toast('尚无灵根，无法返祖')
  if (player.getLandmarkUsesLeft('ancestor_pool') <= 0) return toast('今日返祖次数已用尽')

  const cost = contribCost.value
  if (player.contribution < cost) return toast(`贡献不足（需 ${cost}）`)

  busy.value = true
  if (!player.spendContribution(cost)) {
    busy.value = false
    return toast('贡献不足')
  }
  if (!player.consumeLandmarkUse('ancestor_pool')) {
    player.earnContribution(cost)
    player.persist()
    busy.value = false
    return toast('今日次数已满')
  }

  const rate = calcAncestorPoolSuccessRate(primary.value.value)
  const ok = Math.random() * 100 < rate
  sect.reportMissionProgress('ancestor_trial', 1)

  if (!ok) {
    player.setInjured(true)
    player.persist()
    lastResult.value = {
      title: '血脉反噬',
      desc: `消耗贡献 ${cost} · 身受创伤（成功率约 ${rate}%）`
    }
    toast('失败 · 受伤')
    busy.value = false
    return
  }

  // 终身第一次成功：涨主灵根；之后 / 根骨已满：只涨修为（递减）
  if (!player.ancestorPoolRootClaimed) {
    if (primary.value.value < 100) {
      const bonus = rollAncestorPoolRootBonus()
      const boost = player.boostPrimaryRoot(bonus)
      if (boost.ok) {
        player.markAncestorPoolSuccess({ claimedRoot: true })
        lastResult.value = {
          title: '祖血觉醒',
          desc: `${boost.name}灵根 +${boost.gained}（现 ${boost.value}）· 已耗贡献 ${cost} · 此后仅增修为`
        }
        toast(`成功 · ${boost.name}灵根+${boost.gained}`)
        busy.value = false
        return
      }
    }
    const expGain = calcAncestorPoolExpGain(0)
    player.addExp(expGain)
    player.markAncestorPoolSuccess({ claimedRoot: true })
    lastResult.value = {
      title: '血脉余韵',
      desc: `主灵根已满，改为修为 +${expGain} · 已耗贡献 ${cost}`
    }
    toast(`成功 · 修为+${expGain}`)
    busy.value = false
    return
  }

  const expGain = calcAncestorPoolExpGain(Math.max(0, player.ancestorPoolSuccessCount - 1))
  player.addExp(expGain)
  player.markAncestorPoolSuccess()
  lastResult.value = {
    title: '血脉温养',
    desc: `修为 +${expGain} · 已耗贡献 ${cost}（收益随次数递减）`
  }
  toast(`成功 · 修为+${expGain}`)
  busy.value = false
}
</script>

<style lang="scss">
.page-ancestor-pool {
.content {
  padding: 0 16px 20px;
}
.hint {
  display: block;
  margin-bottom: 8px;
  font-size: 11px;
  color: var(--text-muted);
  line-height: 1.45;
}
.meta {
  display: block;
  margin-bottom: 8px;
  font-size: 12px;
  color: var(--text-secondary);
  line-height: 1.4;
}
.result {
  margin-bottom: 14px;
  padding: 10px 12px;
  border-radius: 10px;
  background: var(--panel-2);
}
.result__title {
  display: block;
  font-size: 13px;
  font-weight: 700;
}
.result__desc {
  display: block;
  margin-top: 4px;
  font-size: 11px;
  color: var(--text-secondary);
  line-height: 1.45;
}
}
</style>
