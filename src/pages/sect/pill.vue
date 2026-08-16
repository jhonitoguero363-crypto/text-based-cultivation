<template>
  <view class="page page--sub">
    <PageHeader title="丹阁" subtitle="宗门 · 丹药买卖与炼制" show-back />
    <SegmentTabs :model-value="mode" :items="['丹药买卖', '炼制丹药']" @update:model-value="mode = $event" />

    <view class="content">
      <template v-if="mode === '炼制丹药'">
        <view v-if="!canCraftPill" class="panel">
          <view class="section-title">
            <text class="section-title__main">尚未掌握炼丹术</text>
            <text class="section-title__sub">生活法术</text>
          </view>
          <text class="lock-tip">需先在功法阁修习法术「炼丹术」，方可炼制丹药。</text>
          <view class="btn btn--gold btn--block" style="margin-top: 12px" @tap="goTech">前往功法阁</view>
        </view>

        <template v-else>
        <view class="panel">
          <view class="section-title">
            <text class="section-title__main">丹阁 · 炼制丹药</text>
            <text class="section-title__sub">
              炼丹术 · {{ pillSpellLabel }} · 灵石 {{ player.spiritStones.toLocaleString() }}
            </text>
          </view>
          <view class="mode-filter">
            <view
              v-for="label in craftModeLabels"
              :key="label"
              class="realm-chip"
              :class="{ 'realm-chip--active': craftModeLabel === label }"
              @tap="craftModeLabel = label"
            >
              {{ label }}
            </view>
          </view>
          <text class="mode-hint">{{ craftModeHint }}</text>
          <view class="realm-filter">
            <view
              v-for="realm in realmTabs"
              :key="realm"
              class="realm-chip"
              :class="{ 'realm-chip--active': refineRealm === realm }"
              @tap="refineRealm = realm"
            >
              {{ realm }}
            </view>
          </view>
        </view>

        <view class="panel">
          <view class="section-title">
            <text class="section-title__main">{{ refineRealm }}可炼</text>
            <text class="section-title__sub">共 {{ refineList.length }} 种</text>
          </view>
          <view v-if="!refineList.length" class="empty-tip">该境界暂无已知配方</view>
          <view v-for="item in refineList" :key="item.pill.id" class="shop-item">
            <view class="shop-item__head">
              <PillIcon :name="item.pill.name" size="md" />
              <view class="row-item__body">
                <view class="inline">
                  <text class="row-item__title">{{ item.pill.name }}</text>
                  <text class="tag tag--jade">{{ item.pill.grade }}</text>
                  <text class="tag tag--gold">{{ difficultyText(item.pill) }}</text>
                </view>
                <text class="row-item__desc">{{ item.pill.effect }}</text>
                <text class="row-item__desc gold">{{ craftCostText(item) }}</text>
              </view>
              <view
                class="btn"
                :class="canRefine(item.recipe) ? 'btn--gold' : 'btn--ghost'"
                @tap="refine(item)"
              >
                {{ craftMode === 'entrust' ? '委托' : '自炼' }}
              </view>
            </view>
            <view class="mat-list">
              <view
                v-for="mat in item.recipe.materials"
                :key="mat.name"
                class="mat-line"
                :class="{ 'mat-line--ok': ownedHerb(mat.name) >= mat.count }"
              >
                <HerbIcon :name="mat.name" size="sm" />
                <text>
                  {{ mat.name }} ×{{ mat.count }}（持有 {{ ownedHerb(mat.name) }}）
                </text>
              </view>
            </view>
            <text class="shop-item__owned">背包丹药 x{{ ownedCount(item.pill.name) }}</text>
          </view>
        </view>
        </template>
      </template>

      <template v-else>
        <view class="panel">
          <view class="section-title">
            <text class="section-title__main">丹药买卖</text>
            <text class="section-title__sub">持有灵石 {{ player.spiritStones.toLocaleString() }}</text>
          </view>
          <view class="realm-filter">
            <view
              v-for="realm in realmTabs"
              :key="realm"
              class="realm-chip"
              :class="{ 'realm-chip--active': shopRealm === realm }"
              @tap="shopRealm = realm"
            >
              {{ realm }}
            </view>
          </view>
        </view>

        <view class="panel">
          <view class="section-title">
            <text class="section-title__main">{{ shopRealm }}丹药</text>
            <text class="section-title__sub">共 {{ shopList.length }} 件</text>
          </view>
          <view v-for="item in shopList" :key="item.id" class="shop-item">
            <view class="shop-item__head">
              <PillIcon :name="item.name" size="md" />
              <view class="row-item__body">
                <view class="inline">
                  <text class="row-item__title">{{ item.name }}</text>
                  <text class="tag tag--jade">{{ item.grade }}</text>
                  <text class="tag tag--gold">{{ difficultyText(item) }}</text>
                </view>
                <text class="row-item__desc">{{ item.type }}</text>
                <text class="row-item__desc gold">{{ item.effect }}</text>
              </view>
              <view
                class="btn"
                :class="canBuy(item) ? 'btn--gold' : 'btn--ghost'"
                @tap="buy(item)"
              >
                {{ item.price.toLocaleString() }}
              </view>
            </view>
            <text class="shop-item__special">特效：{{ item.special }}</text>
            <text class="shop-item__story">{{ item.story }}</text>
            <text v-if="!canBuy(item)" class="shop-item__lock">境界未及 · 需达{{ item.realm }}方可购入</text>
            <text v-else class="shop-item__owned">背包持有 x{{ ownedCount(item.name) }}</text>
          </view>
        </view>

        <view class="panel">
          <view class="section-title">
            <text class="section-title__main">出售丹药</text>
            <text class="section-title__sub">将背包丹药回售宗门</text>
          </view>
          <view v-if="!bagPills.length" class="empty-tip">暂无可出售丹药</view>
          <view v-for="item in bagPills" :key="item.id" class="row-item">
            <PillIcon :name="item.name" size="md" />
            <view class="row-item__body">
              <text class="row-item__title">{{ item.name }}</text>
              <text class="row-item__desc">持有 {{ item.count }} · 回收 40 灵石/个</text>
            </view>
            <view class="btn btn--ghost" @tap="sell(item.name)">出售</view>
          </view>
        </view>
      </template>
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import Taro from '@tarojs/taro'
import HerbIcon from '../../components/HerbIcon.vue'
import PillIcon from '../../components/PillIcon.vue'
import PageHeader from '../../components/PageHeader.vue'
import SegmentTabs from '../../components/SegmentTabs.vue'
import {
  calcSelfPillSuccessRate,
  CRAFT_MODE_FROM_LABEL,
  CRAFT_MODE_LABELS,
  formatPillCraftDifficulty,
  formatSuccessRate,
  type CraftMode
} from '../../constants/craft-mode'
import type { RealmMajor } from '../../constants/realm'
import { getRecipeByPillName, type PillRecipe } from '../../constants/herb-catalog'
import { PILL_SHOP_CATALOG, PILL_SHOP_REALMS, type CatalogPill } from '../../constants/pill-catalog'
import { SPELL_PILL_CRAFT_NAME } from '../../constants/spell-catalog'
import { getRealmMajorIndex } from '../../constants/treasure'
import { usePlayerStore } from '../../stores/player'
import { useSectStore } from '../../stores/sect'

const player = usePlayerStore()
const sect = useSectStore()
const mode = ref('丹药买卖')
const craftModeLabel = ref<(typeof CRAFT_MODE_LABELS)[number]>('自己炼制')
const craftModeLabels = CRAFT_MODE_LABELS
const shopRealm = ref<RealmMajor>('炼气')
const refineRealm = ref<RealmMajor>('炼气')
const realmTabs = PILL_SHOP_REALMS
const canCraftPill = computed(() => sect.hasOwnedSpell(SPELL_PILL_CRAFT_NAME))
const craftMode = computed<CraftMode>(
  () => CRAFT_MODE_FROM_LABEL[craftModeLabel.value] || 'self'
)
const pillSpellLevel = computed(() => sect.getSpellLevel(SPELL_PILL_CRAFT_NAME) || 1)
const pillSpellLabel = computed(() => {
  const spell = sect.spells.find((item) => item.name === SPELL_PILL_CRAFT_NAME)
  return spell?.proficiencyName || '初窥门径'
})
const craftModeHint = computed(() =>
  craftMode.value === 'entrust'
    ? '委托炼制：只耗药材，由丹阁长老代炼，必定成功。'
    : `自己炼制：只耗药材，成功率由炼丹术熟练度（${pillSpellLabel.value}）与丹药炼制难度决定；失败则药材尽毁。`
)

const shopList = computed(() => PILL_SHOP_CATALOG.filter((item) => item.realm === shopRealm.value))
const bagPills = computed(() => player.bag.filter((item) => item.category === '丹药'))

const refineList = computed(() =>
  PILL_SHOP_CATALOG.filter((pill) => pill.realm === refineRealm.value)
    .map((pill) => {
      const recipe = getRecipeByPillName(pill.name)
      if (!recipe) return null
      return { pill, recipe }
    })
    .filter((item): item is { pill: CatalogPill; recipe: PillRecipe } => !!item)
)

function canBuy(item: CatalogPill) {
  return getRealmMajorIndex(player.realmState.major) >= getRealmMajorIndex(item.realm)
}

function ownedCount(name: string) {
  return player.getBagCount(name, '丹药')
}

function ownedHerb(name: string) {
  return player.getBagCount(name, '药材')
}

function spiritCost(recipe: PillRecipe) {
  return craftMode.value === 'entrust' ? recipe.spiritStones : 0
}

function successRate(item: { pill: CatalogPill; recipe: PillRecipe }) {
  if (craftMode.value === 'entrust') return 1
  return calcSelfPillSuccessRate(pillSpellLevel.value, item.pill.craftDifficulty)
}

function difficultyText(pill: CatalogPill) {
  return `难度 ${formatPillCraftDifficulty(pill.craftDifficulty, pill.grade)}`
}

function craftCostText(item: { pill: CatalogPill; recipe: PillRecipe }) {
  if (craftMode.value === 'entrust') {
    return '委托：只耗药材 · 成功率 100%'
  }
  return `自炼：只耗药材 · 成功率 ${formatSuccessRate(successRate(item))}`
}

function canRefine(recipe: PillRecipe) {
  if (player.spiritStones < spiritCost(recipe)) return false
  return recipe.materials.every((mat) => ownedHerb(mat.name) >= mat.count)
}

function toast(title: string) {
  Taro.showToast({ title, icon: 'none' })
}

function goTech() {
  Taro.navigateTo({ url: '/pages/sect/technique' })
}

function refine(item: { pill: CatalogPill; recipe: PillRecipe }) {
  if (!canCraftPill.value) return toast('需先修习法术「炼丹术」')
  const { pill, recipe } = item
  const cost = spiritCost(recipe)
  if (!canRefine(recipe)) {
    if (player.spiritStones < cost) return toast('灵石不足')
    return toast('药材不足')
  }
  if (cost > 0 && !player.spendStones(cost)) return toast('灵石不足')
  for (const mat of recipe.materials) {
    if (!player.removeBagItem(mat.name, '药材', mat.count)) {
      if (cost > 0) player.earnStones(cost)
      return toast('药材不足')
    }
  }

  const rate = successRate(item)
  if (Math.random() > rate) {
    player.persist()
    return toast(`炼制失败，药材尽毁（成功率 ${formatSuccessRate(rate)}）`)
  }

  player.addBagItem(pill.name, '丹药')
  player.persist()
  toast(
    craftMode.value === 'entrust'
      ? `委托炼制成功：${pill.name}`
      : `自炼成功：${pill.name}`
  )
}

function buy(item: CatalogPill) {
  if (!canBuy(item)) return toast(`需达${item.realm}境界方可购入`)
  if (!player.spendStones(item.price)) return toast('灵石不足')
  player.addBagItem(item.name, '丹药')
  player.persist()
  toast(`已购入${item.name}`)
}

function sell(name: string) {
  if (!player.removeBagItem(name, '丹药', 1)) return
  player.earnStones(40)
  player.persist()
  toast(`已出售${name}，获得 40 灵石`)
}
</script>

<style lang="scss">
.content { padding: 0 16px 20px; }
.inline { display: flex; align-items: center; gap: 6px; }
.mode-filter {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 10px;
}
.mode-hint {
  display: block;
  margin-top: 10px;
  font-size: 11px;
  color: var(--text-muted);
  line-height: 1.5;
}
.realm-filter {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 12px;
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
.shop-item__special {
  display: block;
  margin-top: 8px;
  font-size: 11px;
  color: var(--jade);
  line-height: 1.4;
}
.shop-item__story {
  display: block;
  margin-top: 4px;
  font-size: 10px;
  color: var(--text-muted);
  line-height: 1.4;
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
.mat-list {
  margin-top: 8px;
  padding-left: 42px;
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.mat-line {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 11px;
  color: var(--hp);
  line-height: 1.4;
  margin-top: 4px;
}
.mat-line--ok {
  color: var(--jade);
}
.gold { color: var(--gold); }
.lock-tip {
  display: block;
  font-size: 13px;
  color: var(--text-secondary);
  line-height: 1.5;
}
.empty-tip {
  padding: 12px 4px;
  text-align: center;
  font-size: 12px;
  color: var(--text-muted);
}
</style>
