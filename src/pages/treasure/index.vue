<template>
  <view class="page page--sub">
    <PageHeader title="法宝" :subtitle="`已装备 ${treasure.equippedCount()}/4`" show-back />

    <view class="content">
      <view class="panel">
        <view class="featured" v-if="treasure.active">
          <view class="avatar avatar--lg">剑</view>
          <view class="featured__info">
            <text class="featured__name">{{ treasure.active.name }}</text>
            <text class="featured__meta">{{ treasure.active.gradeLabel || treasure.active.grade }} · {{ treasure.active.type }}</text>
            <text class="featured__meta muted">{{ gradeHint(treasure.active.grade) }}</text>
            <text v-if="treasure.active.special" class="featured__meta muted">特技：{{ treasure.active.special }}</text>
            <text class="featured__meta muted">
              等级 Lv.{{ treasure.active.level || 1 }} · 淬炼 +{{ treasure.active.refine || 0 }}
            </text>
          </view>
        </view>
        <view v-else class="empty-tip">暂无法宝，可前往坊市购买或器阁打造</view>
        <view v-if="treasure.active" class="stat-grid" style="margin-top: 12px">
          <view class="stat-cell">
            <text class="stat-cell__value">+{{ activePowerBonus }}</text>
            <text class="stat-cell__label">战力加成</text>
          </view>
          <view class="stat-cell">
            <text class="stat-cell__value mp">{{ treasure.active.spirit || 0 }}</text>
            <text class="stat-cell__label">灵性</text>
          </view>
        </view>
        <view v-if="treasure.active" class="btn-row">
          <view class="btn btn--gold" style="flex: 1" @tap="toast('淬炼中…')">淬炼升级</view>
          <view class="btn btn--ghost" style="flex: 1" @tap="unequip">卸下</view>
        </view>
        <view class="slot-row">
          <text v-for="slot in slots" :key="slot" class="slot" :class="{ 'slot--on': hasSlot(slot) }">
            {{ slot }}
          </text>
        </view>
      </view>

      <view class="panel">
        <view class="section-title">
          <text class="section-title__main">法宝仓库</text>
          <text class="section-title__sub">拥有 {{ treasure.list.length }} 件</text>
        </view>
        <view v-if="!treasure.list.length" class="empty-tip">仓库空空如也</view>
        <view v-for="item in treasure.list" :key="item.id" class="row-item" @tap="treasure.selectTreasure(item.id)">
          <view class="icon-box">💎</view>
          <view class="row-item__body">
            <text class="row-item__title">{{ item.name }}</text>
            <text class="row-item__desc">{{ item.gradeLabel || item.grade }} · {{ item.type }}</text>
            <text class="row-item__desc">{{ item.desc }}</text>
          </view>
          <view
            v-if="!item.equipped"
            class="btn btn--ghost"
            @tap.stop="onEquip(item.id, item.grade)"
          >
            装备
          </view>
          <text v-else class="muted">已装备</text>
        </view>
      </view>

      <view class="panel">
        <view class="section-title">
          <text class="section-title__main">法宝品阶</text>
          <text class="section-title__sub">当前最高可驾驭：{{ maxGrade }}</text>
        </view>
        <view v-for="item in gradeDefs" :key="item.grade" class="grade-line">
          <text class="grade-line__name" :class="`tone-${item.tone}`">{{ item.grade }}</text>
          <view class="grade-line__body">
            <text class="grade-line__range">{{ item.realmRange }}</text>
            <text class="grade-line__trait">{{ item.trait }}</text>
          </view>
        </view>
      </view>

      <view class="panel">
        <view class="section-title">
          <text class="section-title__main">法宝获取途径</text>
        </view>
        <text class="hint">法器 → 灵器 → 仙器 → 道器 → 镇界神器 → 先天至宝</text>
        <text class="hint">秘境历练掉落 · 品阶受境界限制</text>
        <text class="hint">坊市购买 · 宗门器阁打造</text>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import Taro from '@tarojs/taro'
import PageHeader from '../../components/PageHeader.vue'
import {
  TREASURE_GRADE_DEFS,
  canWieldTreasureGrade,
  getMaxTreasureGrade,
  getTreasureGradeDef,
  type TreasureGrade
} from '../../constants/treasure'
import { usePlayerStore } from '../../stores/player'
import { getTreasurePowerBonus, useTreasureStore } from '../../stores/treasure'

const treasure = useTreasureStore()
const player = usePlayerStore()
const slots = ['攻击位', '防御位', '辅助位', '特殊位'] as const
const gradeDefs = TREASURE_GRADE_DEFS
const maxGrade = computed(() => getMaxTreasureGrade(player.realmState))
const activePowerBonus = computed(() =>
  treasure.active ? getTreasurePowerBonus(treasure.active) : 0
)

function gradeHint(grade: string) {
  const def = getTreasureGradeDef(grade)
  return def ? `${def.realmRange} · ${def.trait}` : ''
}

function hasSlot(slot: string) {
  return treasure.list.some((item) => item.equipped && item.slot === slot)
}

function onEquip(id: string, grade: TreasureGrade) {
  if (!canWieldTreasureGrade(player.realmState, grade)) {
    toast(`境界不足，无法驾驭${grade}`)
    return
  }
  treasure.equip(id)
  toast('已装备')
}

function unequip() {
  if (!treasure.active) return
  treasure.unequip(treasure.active.id)
  toast('已卸下')
}

function toast(title: string) {
  Taro.showToast({ title, icon: 'none' })
}
</script>

<style lang="scss">
.content {
  padding: 0 16px;
}
.featured {
  display: flex;
  gap: 12px;
  align-items: center;
}
.featured__name {
  display: block;
  font-size: 18px;
  font-weight: 700;
}
.featured__meta {
  display: block;
  margin-top: 3px;
  font-size: 12px;
  color: var(--gold);
}
.muted {
  color: var(--text-muted) !important;
  font-size: 12px;
}
.empty-tip {
  padding: 16px 4px;
  font-size: 12px;
  color: var(--text-muted);
  text-align: center;
}
.mp {
  color: var(--mp) !important;
}
.btn-row {
  display: flex;
  gap: 8px;
  margin-top: 12px;
}
.slot-row {
  display: flex;
  gap: 8px;
  margin-top: 12px;
}
.slot {
  flex: 1;
  text-align: center;
  padding: 6px 0;
  border-radius: 8px;
  background: var(--panel-2);
  color: var(--text-muted);
  font-size: 10px;
}
.slot--on {
  color: var(--text-secondary);
  border: 1px solid var(--border-soft);
}
.grade-line {
  display: flex;
  gap: 10px;
  padding: 8px 0;
  border-bottom: 1px solid rgba(46, 59, 89, 0.4);
}
.grade-line:last-child {
  border-bottom: none;
}
.grade-line__name {
  width: 72px;
  flex-shrink: 0;
  font-size: 13px;
  font-weight: 700;
}
.grade-line__body {
  flex: 1;
}
.grade-line__range {
  display: block;
  font-size: 11px;
  color: var(--text-secondary);
}
.grade-line__trait {
  display: block;
  margin-top: 2px;
  font-size: 10px;
  color: var(--text-muted);
}
.tone-gold { color: var(--gold); }
.tone-jade { color: var(--jade); }
.tone-mp { color: var(--mp); }
.tone-hp { color: var(--hp); }
.tone-muted { color: var(--text-muted); }
</style>
