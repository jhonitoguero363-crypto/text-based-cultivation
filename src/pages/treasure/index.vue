<template>
  <view class="page page--sub">
    <PageHeader title="法宝" :subtitle="`已装备 ${treasure.equippedCount()}/4`" show-back />

    <view class="content">
      <view class="panel">
        <view class="featured" v-if="treasure.active">
          <TreasureIcon
            :name="treasure.active.name"
            :grade="treasure.active.gradeLabel || treasure.active.grade"
            size="lg"
          />
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
        <view class="vault-list">
          <view
            v-for="item in vaultList"
            :key="item.id"
            class="vault-card"
            :class="{
              'vault-card--active': treasure.activeId === item.id,
              'vault-card--equipped': item.equipped
            }"
            @tap="treasure.selectTreasure(item.id)"
          >
            <view class="vault-card__icon-wrap">
              <TreasureIcon :name="item.name" :grade="item.gradeLabel || item.grade" size="md" />
              <text v-if="item.equipped" class="vault-card__dot" />
            </view>
            <view class="vault-card__body">
              <view class="vault-card__head">
                <text class="vault-card__name">{{ item.name }}</text>
                <text
                  class="vault-card__grade"
                  :class="`tone-${gradeTone(item.grade)}`"
                >
                  {{ item.gradeLabel || item.grade }}
                </text>
              </view>
              <view class="vault-card__meta">
                <text class="vault-card__tag">{{ slotOf(item.type) }}</text>
                <text class="vault-card__power">战力 +{{ powerOf(item) }}</text>
                <text class="vault-card__lv">Lv.{{ item.level || 1 }}</text>
              </view>
              <text class="vault-card__desc">{{ item.special || item.desc }}</text>
            </view>
            <view class="vault-card__action">
              <view
                v-if="!item.equipped"
                class="btn btn--ghost btn--mini"
                @tap.stop="onEquip(item.id, item.grade)"
              >
                装备
              </view>
              <text v-else class="vault-card__equipped-label">已装备</text>
            </view>
          </view>
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
import TreasureIcon from '../../components/TreasureIcon.vue'
import {
  TREASURE_GRADE_DEFS,
  canWieldTreasureGrade,
  getMaxTreasureGrade,
  getTreasureGradeDef,
  getTreasureSlot,
  type TreasureGrade
} from '../../constants/treasure'
import { usePlayerStore } from '../../stores/player'
import {
  getTreasurePowerBonus,
  useTreasureStore,
  type Treasure
} from '../../stores/treasure'

const treasure = useTreasureStore()
const player = usePlayerStore()
const slots = ['攻击位', '防御位', '辅助位', '特殊位'] as const
const gradeDefs = TREASURE_GRADE_DEFS
const maxGrade = computed(() => getMaxTreasureGrade(player.realmState))
const activePowerBonus = computed(() =>
  treasure.active ? getTreasurePowerBonus(treasure.active) : 0
)

const vaultList = computed(() => {
  const gradeRank = (grade: string) => {
    const idx = TREASURE_GRADE_DEFS.findIndex((item) => item.grade === grade)
    return idx >= 0 ? idx : -1
  }
  return [...treasure.list].sort((a, b) => {
    if (a.equipped !== b.equipped) return a.equipped ? -1 : 1
    const gradeDiff = gradeRank(b.grade) - gradeRank(a.grade)
    if (gradeDiff) return gradeDiff
    return getTreasurePowerBonus(b) - getTreasurePowerBonus(a)
  })
})

function gradeHint(grade: string) {
  const def = getTreasureGradeDef(grade)
  return def ? `${def.realmRange} · ${def.trait}` : ''
}

function gradeTone(grade: string) {
  return getTreasureGradeDef(grade)?.tone || 'muted'
}

function slotOf(type: string) {
  return getTreasureSlot(type)
}

function powerOf(item: Treasure) {
  return getTreasurePowerBonus(item)
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

.vault-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.vault-card {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  padding: 8px;
  border-radius: 12px;
  background: linear-gradient(160deg, rgba(31, 43, 69, 0.95), rgba(24, 33, 54, 0.98));
  border: 1px solid var(--border-soft);
  box-shadow: var(--shadow-panel);
}

.vault-card--active {
  border-color: rgba(217, 179, 108, 0.55);
  background: linear-gradient(160deg, rgba(217, 179, 108, 0.12), rgba(31, 43, 69, 0.96));
}

.vault-card--equipped {
  box-shadow: inset 0 0 0 1px rgba(91, 200, 168, 0.18);
}

.vault-card__icon-wrap {
  position: relative;
  flex-shrink: 0;
  margin-top: 1px;
}

.vault-card__dot {
  position: absolute;
  right: -2px;
  top: -2px;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--jade);
  border: 1.5px solid var(--panel);
}

.vault-card__body {
  flex: 1;
  min-width: 0;
}

.vault-card__head {
  display: flex;
  align-items: baseline;
  gap: 6px;
  flex-wrap: wrap;
}

.vault-card__name {
  font-size: 14px;
  font-weight: 700;
  color: var(--text-primary);
  line-height: 1.25;
  font-family: var(--font-serif);
}

.vault-card__grade {
  font-size: 10px;
  font-weight: 600;
  letter-spacing: 0.02em;
}

.vault-card__meta {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 6px;
  margin-top: 2px;
}

.vault-card__tag {
  padding: 1px 6px;
  border-radius: 999px;
  font-size: 10px;
  color: var(--text-secondary);
  background: rgba(46, 59, 89, 0.65);
  border: 1px solid var(--border-soft);
}

.vault-card__power {
  font-size: 11px;
  color: var(--gold);
  font-variant-numeric: tabular-nums;
}

.vault-card__lv {
  font-size: 10px;
  color: var(--text-muted);
  font-variant-numeric: tabular-nums;
}

.vault-card__desc {
  display: block;
  margin-top: 2px;
  font-size: 11px;
  color: var(--text-muted);
  line-height: 1.25;
  word-break: break-word;
  white-space: normal;
}

.vault-card__action {
  flex-shrink: 0;
  align-self: center;
  min-width: 48px;
  text-align: center;
}

.vault-card__equipped-label {
  font-size: 11px;
  color: var(--jade);
  font-weight: 600;
}

.btn--mini {
  padding: 4px 10px;
  font-size: 11px;
  line-height: 1.3;
  min-height: 0;
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
