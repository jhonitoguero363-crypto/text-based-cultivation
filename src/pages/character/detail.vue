<template>
  <view class="page page--sub">
    <PageHeader title="人物详情" subtitle="灵根 · 战力 · 法宝 · 功法 · 法术" show-back />

    <view class="content">
      <view class="panel">
        <view class="section-title">
          <text class="section-title__main">战力</text>
          <text class="section-title__sub">本体 + 法宝加成</text>
        </view>
        <view class="power-hero">
          <text class="power-hero__value">{{ player.combatPower.toLocaleString() }}</text>
          <text class="power-hero__sub">
            本体 {{ player.power.toLocaleString() }}
            <text v-if="treasureBonus > 0"> · 法宝 +{{ treasureBonus.toLocaleString() }}</text>
          </text>
        </view>
      </view>

      <view class="panel">
        <view class="section-title">
          <text class="section-title__main">灵根</text>
          <text class="section-title__sub">悟性 {{ player.comprehension }}</text>
        </view>
        <view class="root-grid">
          <view v-for="root in player.roots" :key="root.name" class="root-item">
            <text class="root-item__name" :class="`tone-${root.color}`">{{ root.name }}</text>
            <text class="root-item__value">{{ root.value }}</text>
            <text class="root-item__grade">{{ root.grade }}</text>
          </view>
        </view>
      </view>

      <view class="panel">
        <view class="section-title">
          <text class="section-title__main">已装备法宝</text>
          <text class="section-title__sub" @tap="goTreasure">前往法宝界面管理 ›</text>
        </view>
        <view v-if="!equipped.length" class="empty-tip">暂未装备法宝</view>
        <view v-for="item in equipped" :key="item.id" class="row-item">
          <view class="icon-box">💎</view>
          <view class="row-item__body">
            <text class="row-item__title">{{ item.name }}</text>
            <text class="row-item__desc">{{ item.gradeLabel || item.grade }} · {{ item.desc }}</text>
            <text v-if="!canWield(item.grade)" class="row-item__desc hp">境界不足，暂不可驾驭</text>
          </view>
          <text class="gold">Lv.{{ item.level || 1 }}</text>
        </view>
      </view>

      <view class="panel">
        <view class="section-title">
          <text class="section-title__main">本命功法</text>
          <text class="section-title__sub" @tap="goTech">功法阁 ›</text>
        </view>
        <view v-if="!activeTech" class="empty-tip">尚未修习功法（同时仅一门）</view>
        <view v-else class="row-item">
          <view class="icon-box">📜</view>
          <view class="row-item__body">
            <text class="row-item__title">{{ activeTech.name }}</text>
            <text class="row-item__desc">{{ activeTech.grade }} · {{ activeTech.school }} · {{ activeTech.effect }}</text>
          </view>
          <text class="gold">修习中</text>
        </view>
        <view v-if="ownedTechs.length > 1" class="owned-note">
          另有 {{ ownedTechs.length - 1 }} 部已收录，可在功法阁改修
        </view>
      </view>

      <view class="panel">
        <view class="section-title">
          <text class="section-title__main">已习法术</text>
          <text class="section-title__sub">{{ learnedSpells.length }} 门</text>
        </view>
        <view v-if="!learnedSpells.length" class="empty-tip">尚未修习法术（可同时多门）</view>
        <view v-for="item in learnedSpells" :key="item.id" class="row-item">
          <view class="icon-box">✦</view>
          <view class="row-item__body">
            <view class="inline">
              <text class="row-item__title">{{ item.name }}</text>
              <text class="tag tag--jade">{{ item.proficiencyName || '初窥门径' }}</text>
            </view>
            <text class="row-item__desc">
              {{ item.grade }} · {{ item.attr }} · {{ item.proficiencyLabel || '0/99' }}
            </text>
            <text class="row-item__desc">{{ item.proficiencyEffect || item.effect }}</text>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import Taro from '@tarojs/taro'
import PageHeader from '../../components/PageHeader.vue'
import { canWieldTreasureGrade, type TreasureGrade } from '../../constants/treasure'
import { usePlayerStore } from '../../stores/player'
import { useSectStore } from '../../stores/sect'
import { useTreasureStore } from '../../stores/treasure'

const player = usePlayerStore()
const sect = useSectStore()
const treasure = useTreasureStore()

const equipped = computed(() => treasure.list.filter((item) => item.equipped))
const treasureBonus = computed(() => treasure.equippedPowerBonus)
const activeTech = computed(() => sect.activeTechnique)
const ownedTechs = computed(() => sect.techniques.filter((item) => item.owned))
const learnedSpells = computed(() => sect.spells.filter((item) => item.owned))

function canWield(grade: TreasureGrade | string) {
  return canWieldTreasureGrade(player.realmState, grade)
}

function goTreasure() {
  Taro.navigateTo({ url: '/pages/treasure/index' })
}

function goTech() {
  Taro.navigateTo({ url: '/pages/sect/technique' })
}
</script>

<style lang="scss">
.content { padding: 0 16px; }
.owned-note {
  margin-top: 8px;
  font-size: 11px;
  color: var(--text-muted);
}
.power-hero {
  text-align: center;
  padding: 8px 0 4px;
}
.power-hero__value {
  display: block;
  font-size: 32px;
  font-weight: 700;
  color: var(--gold);
  letter-spacing: -0.02em;
}
.power-hero__sub {
  display: block;
  margin-top: 6px;
  font-size: 12px;
  color: var(--text-muted);
}
.root-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 8px;
}
.root-item {
  background: var(--panel-2);
  border-radius: 10px;
  padding: 10px 0;
  text-align: center;
}
.root-item__name { display: block; font-size: 13px; font-weight: 600; }
.root-item__value { display: block; margin-top: 4px; font-size: 11px; color: var(--text-secondary); }
.root-item__grade { display: block; margin-top: 2px; font-size: 9px; color: var(--text-muted); }
.inline {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 6px;
}
.gold { color: var(--gold); }
.hp { color: var(--hp); }
.tone-gold { color: var(--gold); }
.tone-jade { color: var(--jade); }
.tone-mp { color: var(--mp); }
.tone-hp { color: var(--hp); }
.empty-tip {
  padding: 12px 4px;
  font-size: 12px;
  color: var(--text-muted);
  text-align: center;
}
</style>
