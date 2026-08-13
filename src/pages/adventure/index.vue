<template>
  <view class="page">
    <PageHeader title="历练秘境" :subtitle="headerSub">
      <template #right>
        <StoneChip label="灵石" :value="player.spiritStones" />
      </template>
    </PageHeader>

    <SegmentTabs :model-value="adventure.tab" :items="['坊市历练', '秘境历练']" @update:model-value="onTab" />

    <view v-if="adventure.tab === '秘境历练'" class="content">
      <view class="panel">
        <view class="section-title">
          <text class="section-title__main">选择历练地点</text>
          <text class="section-title__sub">选定后进入独立历练页</text>
        </view>
        <view class="realm-filter">
          <view
            v-for="realm in realmTabs"
            :key="realm"
            class="realm-chip"
            :class="{ 'realm-chip--active': locationRealm === realm }"
            @tap="locationRealm = realm"
          >
            {{ realm }}
          </view>
        </view>
      </view>

      <view class="panel">
        <view class="section-title">
          <text class="section-title__main">{{ locationRealm }}地点</text>
          <text class="section-title__sub">共 {{ locationList.length }} 处</text>
        </view>
        <view v-if="!locationList.length" class="empty-tip">该境界暂无历练地点</view>
        <view v-for="item in locationList" :key="item.id" class="shop-item">
          <view class="shop-item__head">
            <view class="icon-box">🗺️</view>
            <view class="row-item__body">
              <view class="inline-row">
                <text class="row-item__title">{{ item.name }}</text>
                <text class="tag tag--jade">{{ item.danger }}</text>
              </view>
              <text class="row-item__desc">建议境界 · {{ item.realm }}</text>
              <text class="row-item__desc gold">产出 · {{ item.drops }}</text>
              <text class="row-item__desc muted">特色 · {{ item.feature }}</text>
            </view>
            <view
              class="btn"
              :class="canEnter(item) ? 'btn--gold' : 'btn--ghost'"
              @tap="enterLocation(item)"
            >
              进入
            </view>
          </view>
          <text v-if="!canEnter(item)" class="shop-item__lock">境界未及 · 需达{{ item.realm }}</text>
          <text v-else class="shop-item__owned">
            预计修为 +{{ estimate(item).exp }} · 灵石 ×{{ estimate(item).stones }}
          </text>
        </view>
      </view>
    </view>

    <view v-else class="content">
      <view class="panel">
        <view class="section-title">
          <text class="section-title__main">坊市商店</text>
          <text class="section-title__sub">{{ adventure.marketDayLabel }} · {{ nextDayHint }}</text>
        </view>
        <view class="chip-row">
          <view
            v-for="cat in shopCats"
            :key="cat"
            class="chip"
            :class="{ 'chip--active': adventure.shopCategory === cat }"
            @tap="adventure.setShopCategory(cat)"
          >
            {{ cat }}
          </view>
        </view>
        <text class="market-bar muted">持有灵石 {{ player.spiritStones.toLocaleString() }} · 货架随天元历换日更新</text>
      </view>

      <view class="panel">
        <view class="section-title">
          <text class="section-title__main">{{ adventure.shopCategory }}</text>
          <text class="section-title__sub">在售 {{ inStockCount }} / {{ marketList.length }}</text>
        </view>
        <view v-if="!marketList.length" class="empty-tip">今日该品类暂无货物</view>
        <view v-for="item in marketList" :key="item.id" class="row-item">
          <HerbIcon v-if="item.materialKind === 'herb'" :name="item.name" size="md" />
          <OreIcon v-else-if="item.materialKind === 'ore'" :name="item.name" size="md" />
          <view v-else class="icon-box">{{ categoryIcon(item.category) }}</view>
          <view class="row-item__body">
            <view class="inline-row">
              <text class="row-item__title">{{ item.name }}</text>
              <text class="tag" :class="`tag--${item.tagTone}`">{{ item.tag }}</text>
            </view>
            <text class="row-item__desc">{{ item.meta }}</text>
            <text class="row-item__desc gold">{{ item.effect }}</text>
            <text class="row-item__desc muted">库存 ×{{ item.stock }}</text>
          </view>
          <view
            class="btn"
            :class="item.stock > 0 && canBuyOffer(item) ? 'btn--gold' : 'btn--ghost'"
            @tap="buyOffer(item)"
          >
            {{ item.stock <= 0 ? '售罄' : item.price.toLocaleString() }}
          </view>
        </view>
        <text class="hint">现实 6 小时为天元一日；换日后货架自动更新，不可手动刷新。</text>
      </view>
    </view>

    <AppTabBar current="adventure" />
  </view>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import Taro, { useDidShow } from '@tarojs/taro'
import AppTabBar from '../../components/AppTabBar.vue'
import HerbIcon from '../../components/HerbIcon.vue'
import OreIcon from '../../components/OreIcon.vue'
import PageHeader from '../../components/PageHeader.vue'
import SegmentTabs from '../../components/SegmentTabs.vue'
import StoneChip from '../../components/StoneChip.vue'
import {
  ADVENTURE_LOCATION_REALMS,
  canEnterLocation,
  estimateExploreReward,
  filterLocationsByRealm,
  type AdventureLocation
} from '../../constants/adventure-locations'
import { formatUntilNextGameDay } from '../../constants/game-time'
import type { MarketOffer } from '../../constants/market-shop'
import type { TreasureGrade } from '../../constants/treasure'
import { useAdventureStore, type AdventureTab, type ShopCategory } from '../../stores/adventure'
import { usePlayerStore } from '../../stores/player'
import { useTreasureStore } from '../../stores/treasure'

const adventure = useAdventureStore()
const player = usePlayerStore()
const treasure = useTreasureStore()
const shopCats: ShopCategory[] = ['丹药', '功法', '法宝', '材料']
const locationRealm = ref(player.realmState.major)
const realmTabs = ['全部', ...ADVENTURE_LOCATION_REALMS] as const

const locationList = computed(() => filterLocationsByRealm(locationRealm.value))
const marketList = computed(() => adventure.marketList)
const inStockCount = computed(() => marketList.value.filter((item) => item.stock > 0).length)

const nextDayHint = computed(() => formatUntilNextGameDay())

const headerSub = computed(() => {
  if (adventure.tab !== '秘境历练') return `坊市 · ${adventure.shopCategory}`
  return '请先选择历练地点'
})

useDidShow(() => {
  adventure.ensureDailyMarket(player.realmState.major)
})

function categoryIcon(cat: ShopCategory) {
  if (cat === '丹药') return '🍵'
  if (cat === '功法') return '📜'
  if (cat === '法宝') return '💎'
  return '📦'
}

function canEnter(item: AdventureLocation) {
  return canEnterLocation(player.realmState.major, item)
}

function estimate(item: AdventureLocation) {
  return estimateExploreReward(item)
}

function canBuyOffer(item: MarketOffer) {
  if (item.stock <= 0) return false
  if (item.category === '功法' && player.getBagCount(item.name, '功法') > 0) return false
  return true
}

function onTab(value: string) {
  adventure.setTab(value as AdventureTab)
  if (value === '坊市历练') {
    adventure.ensureDailyMarket(player.realmState.major)
  }
}

function toast(title: string) {
  Taro.showToast({ title, icon: 'none' })
}

function enterLocation(item: AdventureLocation) {
  if (!canEnter(item)) return toast(`需达${item.realm}境界方可进入`)
  adventure.selectLocation(item)
  Taro.navigateTo({ url: `/pages/adventure/explore?id=${item.id}` })
}

function buyOffer(item: MarketOffer) {
  if (item.stock <= 0) return toast('已售罄')
  if (item.category === '功法' && player.getBagCount(item.name, '功法') > 0) {
    return toast('已拥有该功法')
  }
  if (!player.spendStones(item.price)) return toast('灵石不足')

  const offered = adventure.consumeOfferStock(item.id)
  if (!offered) {
    player.earnStones(item.price)
    return toast('库存不足')
  }

  if (item.category === '丹药') {
    player.addBagItem(item.name, '丹药')
  } else if (item.category === '功法') {
    player.addBagItem(item.name, '功法')
  } else if (item.category === '材料') {
    player.addBagItem(item.name, '材料')
  } else if (item.category === '法宝' && item.treasure) {
    treasure.addTreasure({
      id: `adv-${item.catalogId}-${Date.now()}`,
      name: item.name,
      grade: item.treasure.grade as TreasureGrade,
      gradeLabel: item.treasure.gradeLabel,
      type: item.treasure.type,
      desc: item.effect,
      special: item.treasure.special,
      story: item.treasure.story,
      equipped: false,
      level: 1,
      refine: 0
    })
  }

  player.persist()
  toast(`已购买${item.name}`)
}
</script>

<style lang="scss">
.content {
  padding-bottom: 20px;
}

.muted {
  font-size: 10px;
  color: var(--text-muted);
}

.gold {
  font-weight: 600;
  font-size: 11px;
}

.market-bar {
  display: block;
  margin-top: 12px;
  line-height: 1.4;
}

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
  box-shadow: var(--shadow-panel);
  color: var(--text-secondary);
  font-size: 12px;
}

.realm-chip--active {
  color: var(--ink);
  background: linear-gradient(180deg, #e6c27a, var(--gold-strong));
  border-color: transparent;
  font-weight: 600;
  box-shadow: var(--shadow-gold);
}

.shop-item__lock {
  display: block;
  margin-top: 6px;
  font-size: 11px;
  color: var(--hp);
}

.shop-item__owned {
  display: block;
  margin-top: 6px;
  font-size: 11px;
  color: var(--text-muted);
}

.hint {
  display: block;
  margin-top: 10px;
  font-size: 11px;
  color: var(--text-muted);
  line-height: 1.5;
}

.empty-tip {
  padding: 12px 4px;
  text-align: center;
  font-size: 12px;
  color: var(--text-muted);
}
</style>
