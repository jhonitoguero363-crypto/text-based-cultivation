<template>
  <view class="page page--sub">
    <PageHeader title="灵兽阁" subtitle="宗门 · 只售灵宠 · 回收灵兽" show-back />
    <SegmentTabs
      :model-value="mode"
      :items="['购买灵宠', '出售灵兽', '喂养灵兽']"
      @update:model-value="mode = $event"
    />

    <view class="content">
      <template v-if="mode === '购买灵宠'">
        <view class="panel">
          <view class="section-title">
            <text class="section-title__main">购买灵宠</text>
            <text class="section-title__sub">持有灵石 {{ player.spiritStones.toLocaleString() }}</text>
          </view>
          <text class="hint-top">兽阁仅出售驯化灵宠；野妖需于秘境击败后选择抓捕（仅一次）。</text>
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
            <text class="section-title__main">{{ shopRealm }}灵宠</text>
            <text class="section-title__sub">共 {{ shopList.length }} 只</text>
          </view>
          <view v-for="item in shopList" :key="item.id" class="shop-item">
            <view class="shop-item__head">
              <PetIcon :name="item.name" :realm="item.realm" size="md" />
              <view class="row-item__body">
                <view class="inline">
                  <text class="row-item__title">{{ item.name }}</text>
                  <text class="tag tag--jade">{{ item.role }}</text>
                </view>
                <text class="row-item__desc">{{ item.race }} · {{ item.rarity }}</text>
                <text class="row-item__desc gold">{{ item.ability }}</text>
              </view>
              <view
                class="btn"
                :class="canBuy(item) ? 'btn--gold' : 'btn--ghost'"
                @tap="buy(item)"
              >
                {{ item.price.toLocaleString() }}
              </view>
            </view>
            <text v-if="!canReach(item)" class="shop-item__lock">境界未及 · 需达{{ item.realm }}方可契约</text>
            <text v-else-if="owned(item.name)" class="shop-item__owned">已拥有</text>
          </view>
        </view>
      </template>

      <template v-else-if="mode === '出售灵兽'">
        <view class="panel">
          <view class="section-title">
            <text class="section-title__main">出售灵兽</text>
            <text class="section-title__sub">灵宠与抓捕妖兽均可回售</text>
          </view>
          <view v-if="!player.pets.length" class="empty-tip">暂无可出售灵兽</view>
          <view v-for="item in player.pets" :key="item.id" class="row-item">
            <PetIcon v-if="item.source !== 'capture'" :name="item.name" size="md" />
            <BeastIcon v-else :name="item.name" size="md" />
            <view class="row-item__body">
              <view class="inline">
                <text class="row-item__title">{{ item.name }}</text>
                <text class="tag" :class="item.source === 'capture' ? 'tag--hp' : 'tag--jade'">
                  {{ item.source === 'capture' ? '抓捕' : '灵宠' }}
                </text>
              </view>
              <text class="row-item__desc">{{ item.grade }} · {{ item.type }}</text>
              <text class="row-item__desc">{{ item.bonus }} · {{ item.status }}</text>
              <text class="row-item__desc gold">回收 {{ sellPriceOf(item).toLocaleString() }} 灵石</text>
            </view>
            <view class="btn btn--ghost" @tap="sell(item.id)">出售</view>
          </view>
        </view>
      </template>

      <template v-else>
        <view class="panel">
          <view class="section-title">
            <text class="section-title__main">喂养灵兽</text>
            <text class="section-title__sub">每 5 秒可喂一次 · 提升好感</text>
          </view>
          <text class="hint-top">接取「饲养灵兽」任务后，在此喂养可累计进度。</text>
          <view v-if="!player.pets.length" class="empty-tip">暂无灵兽可喂养</view>
          <view v-for="item in player.pets" :key="item.id" class="row-item">
            <PetIcon v-if="item.source !== 'capture'" :name="item.name" size="md" />
            <BeastIcon v-else :name="item.name" size="md" />
            <view class="row-item__body">
              <text class="row-item__title">{{ item.name }}</text>
              <text class="row-item__desc">好感 {{ item.favor }} · {{ item.status }}</text>
            </view>
            <view
              class="btn"
              :class="canFeed ? 'btn--jade' : 'btn--ghost'"
              @tap="feed(item.id)"
            >
              {{ canFeed ? '喂养' : `${feedCd}s` }}
            </view>
          </view>
          <view
            v-if="turnInReady"
            class="btn btn--gold btn--block"
            style="margin-top: 12px"
            @tap="turnInCapture"
          >
            上交抓捕妖兽（任务）
          </view>
        </view>
      </template>
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, ref } from 'vue'
import Taro from '@tarojs/taro'
import BeastIcon from '../../components/BeastIcon.vue'
import PageHeader from '../../components/PageHeader.vue'
import PetIcon from '../../components/PetIcon.vue'
import SegmentTabs from '../../components/SegmentTabs.vue'
import type { RealmMajor } from '../../constants/realm'
import {
  PET_SHOP_CATALOG,
  PET_SHOP_REALMS,
  sellPriceOfOwnedPet,
  type CatalogPet
} from '../../constants/pet-catalog'
import { getRealmMajorIndex } from '../../constants/treasure'
import { usePlayerStore, type Pet } from '../../stores/player'
import { useSectStore } from '../../stores/sect'

const player = usePlayerStore()
const sect = useSectStore()
const mode = ref('购买灵宠')
const shopRealm = ref<RealmMajor>('炼气')
const realmTabs = PET_SHOP_REALMS
const feedCd = ref(0)
let feedTimer: ReturnType<typeof setInterval> | null = null

const shopList = computed(() => PET_SHOP_CATALOG.filter((item) => item.realm === shopRealm.value))
const canFeed = computed(() => feedCd.value <= 0)
const turnInReady = computed(() => {
  const m = sect.activeMission
  return (
    m?.objective?.kind === 'capture_turn_in' &&
    player.pets.some((p) => p.source === 'capture') &&
    (m.progress || 0) < (m.objective.target || 1)
  )
})

function canReach(item: CatalogPet) {
  return getRealmMajorIndex(player.realmState.major) >= getRealmMajorIndex(item.realm)
}

function owned(name: string) {
  return player.ownedPet(name)
}

function canBuy(item: CatalogPet) {
  return canReach(item) && !owned(item.name)
}

function sellPriceOf(pet: Pet) {
  return sellPriceOfOwnedPet(pet)
}

function toast(title: string) {
  Taro.showToast({ title, icon: 'none' })
}

function buy(item: CatalogPet) {
  if (!canReach(item)) return toast(`需达${item.realm}境界方可契约`)
  if (owned(item.name)) return toast('已拥有该灵宠')
  if (!player.spendStones(item.price)) return toast('灵石不足')
  player.addPet({
    name: item.name,
    grade: item.rarity,
    type: `${item.race} · ${item.role}`,
    bonus: item.ability,
    source: 'shop'
  })
  player.persist()
  toast(`已契约${item.name}`)
}

function sell(id: string) {
  const pet = player.pets.find((item) => item.id === id)
  if (!pet) return
  const refund = sellPriceOf(pet)
  player.removePet(id)
  player.earnStones(refund)
  player.persist()
  toast(`已出售${pet.name}，获得 ${refund} 灵石`)
}

function startFeedCd() {
  feedCd.value = 5
  if (feedTimer) clearInterval(feedTimer)
  feedTimer = setInterval(() => {
    feedCd.value = Math.max(0, feedCd.value - 1)
    if (feedCd.value <= 0 && feedTimer) {
      clearInterval(feedTimer)
      feedTimer = null
    }
  }, 1000)
}

function feed(id: string) {
  if (!canFeed.value) return toast(`冷却中 ${feedCd.value}s`)
  const pet = player.pets.find((item) => item.id === id)
  if (!pet) return
  pet.favor = Math.min(100, pet.favor + 1)
  sect.reportMissionProgress('feed_pet', 1)
  player.persist()
  startFeedCd()
  toast(`已喂养${pet.name}，好感 +1`)
}

function turnInCapture() {
  const pet = player.pets.find((item) => item.source === 'capture')
  if (!pet) return toast('没有可上交的抓捕妖兽')
  const name = pet.name
  player.removePet(pet.id)
  sect.reportMissionProgress('capture_turn_in', 1)
  player.persist()
  toast(`已上交${name}，任务进度更新`)
}

onBeforeUnmount(() => {
  if (feedTimer) clearInterval(feedTimer)
})
</script>

<style lang="scss">
.content { padding: 0 16px 20px; }
.inline { display: flex; align-items: center; gap: 6px; flex-wrap: wrap; }
.hint-top {
  display: block;
  margin: -4px 0 12px;
  font-size: 11px;
  color: var(--text-muted);
  line-height: 1.45;
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
.gold { color: var(--gold); }
.empty-tip {
  padding: 12px 4px;
  text-align: center;
  font-size: 12px;
  color: var(--text-muted);
}
</style>
