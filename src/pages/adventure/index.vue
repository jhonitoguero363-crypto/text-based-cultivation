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
          <text class="section-title__main">同行人员</text>
          <text class="section-title__sub">
            {{ adventure.companionCount }}/{{ companionMax }} · 每人探索收益 +8%
          </text>
        </view>
        <view v-if="!adventure.companions.length" class="empty-tip">
          尚未邀请同行 · 可在宗门「人物」拜访后选择「邀请历练」
        </view>
        <view v-for="mate in adventure.companions" :key="mate.id" class="row-item">
          <PortraitAvatar :name="mate.name" :fallback-char="mate.avatar" size="md" />
          <view class="row-item__body">
            <view class="inline-row">
              <text class="row-item__title">{{ mate.name }}</text>
              <text class="tag tag--jade">{{ mate.group || '同行' }}</text>
            </view>
            <text class="row-item__desc">{{ mate.title }} · {{ mate.realm }}</text>
            <text class="row-item__desc gold">战力 {{ mate.power.toLocaleString() }}</text>
          </view>
          <view class="btn btn--ghost" @tap="removeCompanion(mate.id)">移除</view>
        </view>
        <view v-if="adventure.companions.length" class="companion-bar">
          <text class="muted">合计战力 {{ adventure.companionPower.toLocaleString() }}（名录×0.3）</text>
          <text class="jade" @tap="goMembers">再邀 ›</text>
          <text class="muted" @tap="clearCompanions">清空</text>
        </view>
        <view v-else class="companion-bar">
          <text class="jade" @tap="goMembers">前往人物 ›</text>
        </view>
      </view>

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
        <view v-for="item in locationList" :key="item.id" class="loc-row shop-item">
          <view class="shop-item__head">
            <LocationIcon :name="item.name" size="lg" />
            <view class="row-item__body">
              <view class="inline-row">
                <text class="row-item__title">{{ item.name }}</text>
                <text class="tag tag--jade">{{ item.danger }}</text>
              </view>
              <text class="row-item__desc">建议 · {{ item.realm }} · 产出 · {{ item.drops }}</text>
              <text class="row-item__desc muted">{{ item.feature }}</text>
              <text v-if="!canEnter(item)" class="row-item__desc hp">境界未及 · 需达{{ item.realm }}</text>
              <text v-else class="row-item__desc muted">
                预计修为 +{{ estimate(item).exp }} · 灵石 ×{{ estimate(item).stones }}
              </text>
            </view>
            <view
              class="btn"
              :class="canEnter(item) ? 'btn--gold' : 'btn--ghost'"
              @tap="enterLocation(item)"
            >
              进入
            </view>
          </view>
        </view>
      </view>
    </view>

    <view v-else class="content">
      <view class="panel">
        <view class="section-title">
          <text class="section-title__main">坊市人物</text>
          <text class="section-title__sub">今日 {{ adventure.marketNpcs.length }} 人 · 商人/正道/魔道/散修</text>
        </view>
        <view v-if="canRecruitDisciples" class="recruit-bar">
          <view class="recruit-bar__body">
            <text class="recruit-bar__title">招收弟子</text>
            <text class="recruit-bar__desc">于坊市招入 3 名散修 · 姓名与根骨随机</text>
          </view>
          <view class="btn btn--gold btn--sm" @tap="recruitDisciples">招收</view>
        </view>
        <view v-if="!adventure.marketNpcs.length" class="empty-tip">今日暂无坊市人物</view>
        <view v-for="npc in adventure.marketNpcs" :key="npc.id" class="market-npc">
          <PortraitAvatar :name="npc.name" :fallback-char="npc.avatar" size="sm" />
          <view class="market-npc__body">
            <view class="market-npc__top">
              <text class="market-npc__name">{{ npc.name }}</text>
              <text class="tag" :class="marketKindTagClass(npc.kind)">{{ npc.kind }}</text>
            </view>
            <text class="market-npc__meta">{{ npc.title }} · {{ npc.realm }}</text>
            <text class="market-npc__event">
              {{ npc.event }} · 亲密 {{ formatIntimacy(player.getIntimacy(npc.id, '中立', { hostile: isHostileIntimacyTarget(player.sectId, { kind: npc.kind, source: 'market' }) })) }}
            </text>
          </view>
          <view class="btn btn--gold btn--sm" @tap="visitMarketNpc(npc)">拜访</view>
        </view>
      </view>

      <view class="panel shop-panel">
        <view class="section-title">
          <text class="section-title__main">坊市商店</text>
          <text class="section-title__sub">{{ adventure.marketDayLabel }}</text>
        </view>

        <view class="shop-tabs">
          <view
            v-for="cat in shopCats"
            :key="cat"
            class="shop-tabs__item"
            :class="{ 'shop-tabs__item--active': adventure.shopCategory === cat }"
            @tap="adventure.setShopCategory(cat)"
          >
            <text class="shop-tabs__icon">{{ categoryIcon(cat) }}</text>
            <text class="shop-tabs__label">{{ cat }}</text>
          </view>
        </view>

        <view class="shop-meta">
          <text class="shop-meta__left">灵石 {{ player.spiritStones.toLocaleString() }}</text>
          <text class="shop-meta__right">
            {{ adventure.shopCategory }} · {{ marketList.length }} 件
          </text>
        </view>

        <view v-if="!marketList.length" class="empty-tip">今日该品类暂无货物</view>
        <view v-else class="shop-list">
          <view
            v-for="item in marketList"
            :key="item.id"
            class="shop-card"
            :class="{ 'shop-card--locked': !canBuyOffer(item) }"
          >
            <view class="shop-card__art">
              <HerbIcon v-if="item.materialKind === 'herb'" :name="item.name" size="lg" />
              <OreIcon v-else-if="item.materialKind === 'ore'" :name="item.name" size="lg" />
              <LootMaterialIcon
                v-else-if="item.materialKind === 'loot' || item.category === '材料'"
                :name="item.name"
                size="lg"
              />
              <PillIcon v-else-if="item.category === '丹药'" :name="item.name" size="lg" />
              <TechniqueIcon v-else-if="item.category === '功法'" :name="item.name" size="lg" />
              <TreasureIcon
                v-else-if="item.category === '法宝'"
                :name="item.name"
                :grade="item.treasure?.gradeLabel"
                :type="item.treasure?.type"
                size="lg"
              />
              <view v-else class="shop-card__fallback">{{ categoryIcon(item.category) }}</view>
            </view>
            <view class="shop-card__body">
              <view class="shop-card__title">
                <text class="shop-card__name">{{ item.name }}</text>
                <text class="tag" :class="`tag--${item.tagTone}`">{{ item.tag }}</text>
              </view>
              <text class="shop-card__meta">{{ item.meta }}</text>
              <text class="shop-card__effect">{{ item.effect }}</text>
            </view>
            <view
              class="shop-card__buy"
              :class="canBuyOffer(item) ? 'shop-card__buy--ok' : 'shop-card__buy--off'"
              @tap="buyOffer(item)"
            >
              <text class="shop-card__buy-label">灵石</text>
              <text class="shop-card__buy-price">{{ item.price.toLocaleString() }}</text>
            </view>
          </view>
        </view>
        <text class="hint shop-hint">{{ nextDayHint }}换日更新货架 · 仅售卖</text>
      </view>

      <view class="panel shop-panel">
        <view class="section-title">
          <text class="section-title__main">回收</text>
          <text class="section-title__sub">市价 80% · 仅背包持有</text>
        </view>
        <view v-if="!bagRecycleList.length" class="empty-tip">背包暂无可回收物品</view>
        <view v-else class="shop-list">
          <view v-for="row in bagRecycleList" :key="row.id" class="shop-card">
            <view class="shop-card__art">
              <HerbIcon v-if="row.category === '药材'" :name="row.name" size="lg" />
              <OreIcon v-else-if="row.category === '矿石'" :name="row.name" size="lg" />
              <PillIcon v-else-if="row.category === '丹药'" :name="row.name" size="lg" />
              <LootMaterialIcon v-else-if="row.category === '材料'" :name="row.name" size="lg" />
              <view v-else class="shop-card__fallback shop-card__fallback--loot">
                {{ row.name.slice(0, 1) }}
              </view>
            </view>
            <view class="shop-card__body">
              <view class="shop-card__title">
                <text class="shop-card__name">{{ row.name }}</text>
                <text class="tag tag--gold">{{ row.category }} ×{{ row.count }}</text>
              </view>
              <text class="shop-card__meta">参考市价 {{ row.buyPrice.toLocaleString() }}</text>
              <text class="shop-card__effect">回收可得 {{ row.recyclePrice.toLocaleString() }} 灵石</text>
            </view>
            <view class="shop-card__sell shop-card__sell--ok" @tap="recycleBagItem(row)">
              <text class="shop-card__buy-label">回收</text>
              <text class="shop-card__buy-price">{{ row.recyclePrice.toLocaleString() }}</text>
            </view>
          </view>
        </view>
        <text class="hint shop-hint">丹药 / 药材 / 矿石 / 材料可回收；宗门可兑换功法与法术除外 · 每次 1 份</text>
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
import LocationIcon from '../../components/LocationIcon.vue'
import LootMaterialIcon from '../../components/LootMaterialIcon.vue'
import OreIcon from '../../components/OreIcon.vue'
import PillIcon from '../../components/PillIcon.vue'
import PortraitAvatar from '../../components/PortraitAvatar.vue'
import TechniqueIcon from '../../components/TechniqueIcon.vue'
import TreasureIcon from '../../components/TreasureIcon.vue'
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
import type { AdventureNpc } from '../../constants/adventure-npc-catalog'
import { formatUntilNextGameDay } from '../../constants/game-time'
import { formatIntimacy, isHostileIntimacyTarget } from '../../constants/intimacy'
import { isMissionObjectiveMet } from '../../constants/mission-catalog'
import {
  calcMarketRecyclePrice,
  canMarketRecycleBagItem,
  estimateBagItemBuyPrice,
  type MarketOffer,
  type MarketRecycleBagCategory
} from '../../constants/market-shop'
import type { TreasureGrade } from '../../constants/treasure'
import {
  ADVENTURE_COMPANION_MAX,
  useAdventureStore,
  type AdventureTab,
  type ShopCategory
} from '../../stores/adventure'
import { usePlayerStore } from '../../stores/player'
import { useSectStore } from '../../stores/sect'
import { useTreasureStore } from '../../stores/treasure'

const adventure = useAdventureStore()
const player = usePlayerStore()
const treasure = useTreasureStore()
const sect = useSectStore()
const shopCats: ShopCategory[] = ['丹药', '功法', '法宝', '药材', '矿石']
const companionMax = ADVENTURE_COMPANION_MAX
const locationRealm = ref(player.realmState.major)
const realmTabs = ['全部', ...ADVENTURE_LOCATION_REALMS] as const

const locationList = computed(() => filterLocationsByRealm(locationRealm.value))
const marketList = computed(() => adventure.marketList)

const canRecruitDisciples = computed(() => {
  const mission = sect.activeMission
  if (!sect.joined || !mission || mission.objective?.kind !== 'recruit_disciples') return false
  return !isMissionObjectiveMet(mission)
})

const bagRecycleList = computed(() =>
  player.bag
    .filter((item) => item.count > 0 && canMarketRecycleBagItem(item.name, item.category))
    .map((item) => {
      const category = item.category as MarketRecycleBagCategory
      const shelf = adventure.marketOffers.find(
        (offer) => offer.name === item.name && offer.category === category
      )
      const buyPrice = shelf?.price || estimateBagItemBuyPrice(item.name, category)
      return {
        id: `recycle-${category}-${item.name}`,
        name: item.name,
        category,
        count: item.count,
        buyPrice,
        recyclePrice: calcMarketRecyclePrice(buyPrice)
      }
    })
    .sort((a, b) => {
      const cat = a.category.localeCompare(b.category, 'zh-CN')
      return cat || a.name.localeCompare(b.name, 'zh-CN')
    })
)

const nextDayHint = computed(() => formatUntilNextGameDay())

const headerSub = computed(() => {
  if (adventure.tab !== '秘境历练') return `坊市 · ${adventure.shopCategory}`
  if (adventure.companionCount > 0) {
    return `同行 ${adventure.companionCount} 人 · 请选择历练地点`
  }
  return '请先选择历练地点'
})

useDidShow(() => {
  adventure.ensureDailyMarket(player.realmState.major)
  if (adventure.shopCategory === '材料') {
    adventure.setShopCategory('丹药')
  }
  const stipendNotice = player.ensureMonthlyStipend()
  if (stipendNotice) {
    Taro.showToast({ title: stipendNotice, icon: 'none', duration: 2500 })
  }
})

function categoryIcon(cat: ShopCategory) {
  if (cat === '丹药') return '🍵'
  if (cat === '功法') return '📜'
  if (cat === '法宝') return '💎'
  if (cat === '药材') return '🌿'
  if (cat === '矿石') return '⛏'
  return '📦'
}

function marketKindTagClass(kind: string) {
  if (kind === '商人') return 'tag--gold'
  if (kind === '正道修士') return 'tag--jade'
  if (kind === '魔道修士') return 'tag--hp'
  return 'tag--mp'
}

function canEnter(item: AdventureLocation) {
  return canEnterLocation(player.realmState.major, item)
}

function estimate(item: AdventureLocation) {
  return estimateExploreReward(item)
}

function canBuyOffer(item: MarketOffer) {
  if (item.category === '功法' && player.getBagCount(item.name, '功法') > 0) return false
  if (player.spiritStones < item.price) return false
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

function recruitDisciples() {
  if (!canRecruitDisciples.value) return toast('当前无需招收')
  const created = sect.recruitMarketDisciples(3)
  if (!created?.length) return toast('招收失败')
  const names = created.map((item) => item.name).join('、')
  const roots = created.map((item) => item.rootBone || '未知').join(' / ')
  Taro.showModal({
    title: '招收成功',
    content: `新弟子：${names}\n根骨：${roots}\n可回角色页完成任务`,
    showCancel: false,
    confirmText: '已知晓'
  })
}

function goMembers() {
  if (!player.hasSect) return toast('请先加入宗门')
  Taro.navigateTo({ url: '/pages/sect/members' })
}

function visitMarketNpc(npc: AdventureNpc) {
  adventure.setVisitNpc(npc)
  Taro.navigateTo({ url: '/pages/sect/visit' })
}

function removeCompanion(id: string) {
  adventure.removeCompanion(id)
  toast('已移出同行')
}

function clearCompanions() {
  if (!adventure.companions.length) return
  adventure.clearCompanions()
  toast('已清空同行')
}

function enterLocation(item: AdventureLocation) {
  if (!canEnter(item)) return toast(`需达${item.realm}境界方可进入`)
  player.clearCliffIfExpired()
  if (player.onCliff) return toast('思过崖面壁期间不可外出历练')
  adventure.selectLocation(item)
  Taro.navigateTo({ url: `/pages/adventure/explore?id=${item.id}` })
}

function buyOffer(item: MarketOffer) {
  if (item.category === '功法' && player.getBagCount(item.name, '功法') > 0) {
    return toast('已拥有该功法')
  }
  if (!player.spendStones(item.price)) return toast('灵石不足')

  if (item.category === '丹药') {
    player.addBagItem(item.name, '丹药')
  } else if (item.category === '功法') {
    player.addBagItem(item.name, '功法')
    sect.syncLearnedFromBag(
      player.bag,
      player.activeTechniqueId || null,
      player.spellProficiency,
      player.techniqueProficiency
    )
  } else if (item.category === '药材') {
    player.addBagItem(item.name, '药材')
  } else if (item.category === '矿石') {
    player.addBagItem(item.name, '矿石')
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

function recycleBagItem(row: {
  name: string
  category: MarketRecycleBagCategory
  buyPrice: number
}) {
  if (!canMarketRecycleBagItem(row.name, row.category)) {
    return toast('宗门可兑换功法与法术不可回收')
  }
  if (player.getBagCount(row.name, row.category) <= 0) return toast('背包无此物品')
  const refund = calcMarketRecyclePrice(row.buyPrice)
  if (!player.removeBagItem(row.name, row.category, 1)) return toast('背包无此物品')
  player.earnStones(refund)
  player.persist()
  toast(`回收${row.name}，获得 ${refund} 灵石`)
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

.jade {
  font-size: 11px;
  color: var(--jade);
}

.gold {
  font-weight: 600;
  font-size: 11px;
}

.companion-bar {
  display: flex;
  align-items: center;
  gap: 14px;
  margin-top: 10px;
  padding-top: 8px;
  border-top: 1px solid rgba(46, 59, 89, 0.35);
}

.market-npc {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  padding: 8px 0;
  border-bottom: 1px solid rgba(46, 59, 89, 0.35);
}
.recruit-bar {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  margin-bottom: 8px;
  background: var(--panel-2);
  border-radius: 10px;
}
.recruit-bar__body {
  flex: 1;
  min-width: 0;
}
.recruit-bar__title {
  display: block;
  font-size: 13px;
  font-weight: 700;
}
.recruit-bar__desc {
  display: block;
  margin-top: 2px;
  font-size: 10px;
  color: var(--text-muted);
  line-height: 1.35;
}
.market-npc:last-child {
  border-bottom: none;
  padding-bottom: 2px;
}
.market-npc .avatar--sm {
  width: 32px;
  height: 32px;
  font-size: 13px;
  flex-shrink: 0;
}
.market-npc__body {
  flex: 1;
  min-width: 0;
}
.market-npc__top {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 4px 6px;
}
.market-npc__name {
  font-size: 13px;
  font-weight: 600;
  line-height: 1.2;
}
.market-npc__meta {
  display: block;
  margin-top: 2px;
  font-size: 11px;
  line-height: 1.25;
  color: var(--text-secondary);
}
.market-npc__event {
  display: block;
  margin-top: 3px;
  font-size: 11px;
  line-height: 1.35;
  color: var(--gold);
  white-space: normal;
  word-break: break-word;
}
.market-npc .btn--sm {
  flex-shrink: 0;
  align-self: center;
  padding: 4px 10px;
  font-size: 11px;
  min-height: 28px;
}

.shop-panel {
  padding-bottom: 12px;
}

.shop-tabs {
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  gap: 5px;
  padding: 5px;
  border-radius: 12px;
  background: var(--scrim-mid);
  border: 1px solid var(--border-soft);
}

.shop-tabs__item {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 2px;
  padding: 7px 2px;
  border-radius: 9px;
  color: var(--text-muted);
  border: 1px solid transparent;
  background: transparent;
  min-width: 0;
}

.shop-tabs__item--active {
  color: var(--ink);
  background: linear-gradient(180deg, #e6c27a, var(--gold-strong));
  box-shadow: var(--shadow-gold);
  font-weight: 600;
}

.shop-tabs__icon {
  font-size: 13px;
  line-height: 1;
}

.shop-tabs__label {
  font-size: 10px;
  line-height: 1.15;
  letter-spacing: 0;
}

.shop-meta {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  margin: 10px 0 8px;
  padding: 8px 10px;
  border-radius: 10px;
  background: var(--scrim-soft);
  border: 1px solid var(--border-soft);
}

.shop-meta__left {
  font-size: 12px;
  font-weight: 600;
  color: var(--gold);
  font-variant-numeric: tabular-nums;
}

.shop-meta__right {
  font-size: 11px;
  color: var(--text-muted);
}

.shop-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.shop-card {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px;
  border-radius: 12px;
  background: linear-gradient(155deg, var(--panel-2), var(--panel));
  border: 1px solid var(--border-soft);
  box-shadow: var(--shadow-panel);
}

.shop-card--locked {
  opacity: 0.72;
}

.shop-card__art {
  flex-shrink: 0;
  width: 56px;
  height: 56px;
  border-radius: 10px;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--icon-well);
  border: 1px solid var(--gold-soft);
  box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.03);
}

.shop-card__fallback {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
}

.shop-card__fallback--loot {
  font-size: 16px;
  font-weight: 700;
  color: var(--gold);
}

.shop-card__body {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 1px;
}

.shop-card__title {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 6px;
  min-width: 0;
}

.shop-card__name {
  flex: 1;
  min-width: 0;
  font-size: 13px;
  font-weight: 700;
  line-height: 1.25;
  color: var(--text-primary);
  word-break: break-word;
  white-space: normal;
}

.shop-card__title .tag {
  flex-shrink: 0;
  font-size: 10px;
  padding: 1px 6px;
}

.shop-card__meta,
.shop-card__effect {
  display: block;
  font-size: 11px;
  line-height: 1.25;
  word-break: break-word;
  white-space: normal;
}

.shop-card__meta {
  color: var(--text-secondary);
}

.shop-card__effect {
  color: var(--gold);
}

.shop-card__buy {
  flex-shrink: 0;
  min-width: 58px;
  padding: 7px 8px;
  border-radius: 10px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1px;
  border: 1px solid transparent;
}

.shop-card__buy--ok {
  color: var(--ink);
  background: linear-gradient(180deg, #e6c27a, var(--gold-strong));
  box-shadow: var(--shadow-gold);
}

.shop-card__buy--off {
  color: var(--text-muted);
  background: var(--panel-2);
  border-color: var(--border-soft);
}

.shop-card__sell {
  flex-shrink: 0;
  min-width: 58px;
  padding: 7px 8px;
  border-radius: 10px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1px;
  border: 1px solid transparent;
}

.shop-card__sell--ok {
  color: var(--jade);
  background: rgba(91, 200, 168, 0.12);
  border-color: rgba(91, 200, 168, 0.35);
}

.shop-card__buy-label {
  font-size: 9px;
  line-height: 1;
  opacity: 0.85;
}

.shop-card__buy-price {
  font-size: 12px;
  font-weight: 700;
  line-height: 1.2;
  font-variant-numeric: tabular-nums;
}

.shop-hint {
  margin-top: 10px;
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

.shop-item {
  padding: 6px 0;
  border-bottom: 1px solid rgba(46, 59, 89, 0.45);
}
.shop-item:last-child {
  border-bottom: none;
}
.shop-item__head {
  display: flex;
  align-items: flex-start;
  gap: 8px;
}

/* 秘境地点列表：紧凑 + 按需换行 */
.loc-row.shop-item {
  padding: 6px 0;
}
.loc-row .shop-item__head {
  gap: 8px;
  align-items: flex-start;
}
.loc-row .row-item__body {
  display: flex;
  flex-direction: column;
  gap: 1px;
  min-width: 0;
}
.loc-row .row-item__title,
.loc-row .row-item__desc {
  display: block;
  line-height: 1.25;
  word-break: break-word;
  white-space: normal;
}
.loc-row .row-item__desc {
  margin-top: 0;
}
.loc-row .row-item__desc.hp {
  color: var(--hp);
}
.loc-row .inline-row {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 4px;
}
.empty-tip {
  padding: 12px 4px;
  text-align: center;
  font-size: 12px;
  color: var(--text-muted);
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

/* 正道亮色：坊市货架偏亮 */
[data-theme='zhengdao'] {
  .shop-tabs {
    background: rgba(255, 255, 255, 0.55);
    border-color: rgba(120, 160, 180, 0.28);
    box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.85);
  }

  .shop-tabs__item--active {
    color: var(--btn-on-solid);
    background: linear-gradient(180deg, var(--btn-gold-top) 0%, var(--btn-gold-bottom) 100%);
    border: 1px solid var(--btn-gold-border);
    text-shadow: 0 1px 0 rgba(90, 60, 10, 0.2);
    box-shadow:
      0 1px 0 rgba(255, 255, 255, 0.4) inset,
      0 2px 5px rgba(150, 110, 30, 0.18);
  }

  .shop-meta {
    background: rgba(255, 255, 255, 0.7);
    border-color: rgba(120, 160, 180, 0.28);
    box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.9);
  }

  .shop-card {
    background: linear-gradient(155deg, #ffffff 0%, #eef7fb 100%);
    border-color: rgba(120, 160, 180, 0.26);
    box-shadow:
      inset 0 1px 0 rgba(255, 255, 255, 0.95),
      0 2px 8px rgba(60, 110, 140, 0.07);
  }

  .shop-card--locked {
    opacity: 0.78;
    background: linear-gradient(155deg, #f5fafc 0%, #e6eef3 100%);
  }

  .shop-card__art {
    background: #f4fafc;
    border-color: rgba(196, 154, 60, 0.28);
    box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.9);
  }

  .shop-card__buy--ok {
    color: var(--btn-on-solid);
    background: linear-gradient(180deg, var(--btn-gold-top) 0%, var(--btn-gold-bottom) 100%);
    border: 1px solid var(--btn-gold-border);
    text-shadow: 0 1px 0 rgba(90, 60, 10, 0.2);
    box-shadow:
      0 1px 0 rgba(255, 255, 255, 0.4) inset,
      0 2px 5px rgba(150, 110, 30, 0.16);
  }

  .shop-card__buy--off {
    color: var(--text-muted);
    background: rgba(255, 255, 255, 0.65);
    border-color: rgba(120, 160, 180, 0.3);
  }

  .shop-card__sell--ok {
    color: var(--btn-on-solid);
    background: linear-gradient(180deg, var(--btn-jade-top) 0%, var(--btn-jade-bottom) 100%);
    border-color: rgba(30, 120, 100, 0.35);
    text-shadow: 0 1px 0 rgba(10, 50, 40, 0.18);
    box-shadow:
      0 1px 0 rgba(255, 255, 255, 0.35) inset,
      0 2px 5px rgba(36, 140, 120, 0.16);
  }

  .shop-card__fallback--loot {
    color: var(--gold-strong);
  }
}
</style>
