<template>
  <view class="page page--sub">
    <PageHeader title="药园" subtitle="宗门 · 灵石兑换药材" show-back />
    <view class="content">
      <view class="panel">
        <view class="section-title">
          <text class="section-title__main">药材兑换</text>
          <text class="section-title__sub">持有灵石 {{ player.spiritStones.toLocaleString() }}</text>
        </view>
        <view class="realm-filter">
          <view
            v-for="tab in levelTabs"
            :key="tab"
            class="realm-chip"
            :class="{ 'realm-chip--active': activeTab === tab }"
            @tap="activeTab = tab"
          >
            {{ tab }}
          </view>
        </view>
      </view>

      <view class="panel">
        <view class="section-title">
          <text class="section-title__main">{{ activeTab }}药材</text>
          <text class="section-title__sub">共 {{ herbList.length }} 种</text>
        </view>
        <view v-for="item in herbList" :key="item.id" class="shop-item">
          <view class="shop-item__head">
            <HerbIcon :name="item.name" :level="item.level" size="md" />
            <view class="row-item__body">
              <view class="inline">
                <text class="row-item__title">{{ item.name }}</text>
                <text class="tag tag--jade">{{ item.level }}</text>
              </view>
              <text class="row-item__desc">属性 · {{ item.attr }} · 产地 {{ item.origin }}</text>
              <text class="row-item__desc">可用于：{{ item.pills.join('、') }}</text>
              <text class="row-item__desc muted">背包持有 x{{ ownedCount(item.name) }}</text>
            </view>
            <view class="btn btn--gold" @tap="exchange(item)">
              {{ item.exchangeCost.toLocaleString() }}
            </view>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import Taro from '@tarojs/taro'
import HerbIcon from '../../components/HerbIcon.vue'
import PageHeader from '../../components/PageHeader.vue'
import {
  filterHerbsByTab,
  HERB_LEVEL_TABS,
  type HerbMaterial
} from '../../constants/herb-catalog'
import { usePlayerStore } from '../../stores/player'

const player = usePlayerStore()
const activeTab = ref<(typeof HERB_LEVEL_TABS)[number]>('全部')
const levelTabs = HERB_LEVEL_TABS

const herbList = computed(() => filterHerbsByTab(activeTab.value))

function ownedCount(name: string) {
  return player.getBagCount(name, '材料')
}

function toast(title: string) {
  Taro.showToast({ title, icon: 'none' })
}

function exchange(item: HerbMaterial) {
  if (!player.spendStones(item.exchangeCost)) return toast('灵石不足')
  player.addBagItem(item.name, '材料')
  player.persist()
  toast(`已兑换${item.name}`)
}
</script>

<style lang="scss">
.content { padding: 0 16px 20px; }
.inline { display: flex; align-items: center; gap: 6px; flex-wrap: wrap; }
.realm-filter {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}
.realm-chip {
  padding: 6px 10px;
  border-radius: 999px;
  background: var(--panel-2);
  border: 1px solid var(--border-soft);
  color: var(--text-secondary);
  font-size: 12px;
}
.realm-chip--active {
  color: var(--ink);
  background: linear-gradient(180deg, #e6c27a, var(--gold-strong));
  border-color: transparent;
  font-weight: 600;
}
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
.muted { color: var(--text-muted); }
</style>
