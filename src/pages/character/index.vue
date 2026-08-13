<template>
  <view class="page">
    <PageHeader title="角色" :subtitle="`境界：${player.realm}`" />

    <view class="content">
      <view class="panel profile">
        <view class="profile__main">
          <view class="avatar avatar--lg">{{ player.avatarChar }}</view>
          <view class="profile__info">
            <text class="profile__name">{{ player.name }}</text>
            <text class="profile__meta">{{ player.gender }} · {{ player.sect || '无宗门' }} · {{ player.rank }}</text>
            <text class="profile__root">灵根：{{ player.rootBone }} · 悟性 {{ player.comprehension }}</text>
            <text class="profile__tech">
              功法：{{ activeTech ? activeTech.name : '尚未修习' }}
            </text>
          </view>
          <view class="power-box">
            <text class="power-box__value">{{ player.combatPower.toLocaleString() }}</text>
            <text class="power-box__label">战力</text>
          </view>
        </view>
        <view class="wallet">
          <view class="wallet__cell">
            <text class="wallet__value">{{ player.spiritStones.toLocaleString() }}</text>
            <text class="wallet__label">灵石</text>
            <text class="wallet__hint">坊市消费</text>
          </view>
          <view class="wallet__divider" />
          <view class="wallet__cell">
            <text class="wallet__value wallet__value--contrib">
              {{ player.contribution.toLocaleString() }}
            </text>
            <text class="wallet__label">贡献点</text>
            <text class="wallet__hint">宗门消费</text>
          </view>
        </view>
        <view class="detail-entry" @tap="goDetail">
          <view>
            <text class="detail-entry__title">人物详情</text>
            <text class="detail-entry__desc">灵根 · 战力 · 法宝 · 功法 · 法术</text>
          </view>
          <text class="detail-entry__arrow">›</text>
        </view>
      </view>

      <view class="panel">
        <view class="section-title">
          <text class="section-title__main">当前功法</text>
          <text class="section-title__sub" @tap="goTech">功法阁 ›</text>
        </view>
        <view v-if="!activeTech" class="empty-tip">尚未修习功法，可前往功法阁兑换</view>
        <view v-else class="row-item" @tap="goTech">
          <view class="icon-box">📜</view>
          <view class="row-item__body">
            <view class="inline-row" style="margin-bottom: 2px">
              <text class="row-item__title">{{ activeTech.name }}</text>
              <text class="tag tag--gold">修习中</text>
            </view>
            <text class="row-item__desc">
              {{ activeTech.grade }} · {{ activeTech.school }} · {{ activeTech.type }}
            </text>
            <text class="row-item__desc">适合 {{ activeTech.realmLabel }}</text>
            <text class="row-item__desc gold">{{ activeTech.effect }}</text>
          </view>
          <text class="muted">›</text>
        </view>
        <text v-if="ownedTechCount > 1" class="tech-note">
          另有 {{ ownedTechCount - 1 }} 部已收录，可在功法阁改修
        </text>
      </view>

      <view class="panel">
        <view class="section-title">
          <text class="section-title__main">当前任务</text>
          <text class="section-title__sub">{{ sect.activeMission ? '进行中 · 同时仅 1 个' : '暂无进行中任务' }}</text>
        </view>
        <view v-if="!sect.activeMission" class="empty-tip">
          前往任务堂领取任务
        </view>
        <template v-else>
          <view class="inline-row" style="margin-bottom: 6px">
            <text class="row-item__title">{{ sect.activeMission.name }}</text>
            <text class="tag" :class="missionTagClass(sect.activeMission.tagTone)">
              {{ sect.activeMission.tag }}
            </text>
          </view>
          <text class="row-item__desc">{{ sect.activeMission.desc }}</text>
          <text class="row-item__desc gold">{{ sect.activeMission.reward }}</text>
          <view class="mission-actions">
            <view class="btn btn--gold" @tap="completeActive">完成任务</view>
            <view class="btn btn--ghost" @tap="cancelActive">取消任务</view>
          </view>
        </template>
      </view>

      <view class="panel">
        <view class="section-title">
          <text class="section-title__main">我的灵兽</text>
          <text class="section-title__sub">已拥有 {{ player.pets.length }} 只</text>
        </view>
        <view v-if="!player.pets.length" class="empty-tip">暂无灵兽（兽阁购买或秘境抓捕）</view>
        <view v-for="pet in player.pets" :key="pet.id" class="row-item">
          <BeastIcon v-if="pet.source === 'capture'" :name="pet.name" size="md" />
          <PetIcon v-else :name="pet.name" size="md" />
          <view class="row-item__body">
            <text class="row-item__title">{{ pet.name }}</text>
            <text class="row-item__desc">
              {{ pet.source === 'capture' ? '抓捕' : '灵宠' }} · {{ pet.grade }} · {{ pet.type }}
            </text>
            <text class="row-item__desc">{{ pet.bonus }} · 好感 {{ pet.favor }}</text>
          </view>
          <text :class="pet.status === '出战' ? 'gold' : 'muted'">{{ pet.status }}</text>
        </view>
      </view>

      <view class="panel">
        <view class="section-title">
          <text class="section-title__main">背包物品</text>
          <view class="inline-row">
            <text class="section-title__sub">共 {{ player.bag.length }} 件物品</text>
            <view class="btn btn--gold" style="height: 24px; margin-left: 8px" @tap="goCodex">图鉴</view>
          </view>
        </view>
        <view class="chip-row" style="margin-bottom: 12px">
          <view
            v-for="cat in bagCats"
            :key="cat"
            class="chip"
            :class="{ 'chip--active': player.bagFilter === cat }"
            @tap="player.bagFilter = cat"
          >
            {{ cat }}
          </view>
        </view>
        <view v-if="!player.filteredBag.length" class="empty-tip">背包空空如也</view>
        <view v-else class="bag-grid">
          <view v-for="item in player.filteredBag" :key="item.id" class="bag-item">
            <OreIcon v-if="showOreIcon(item)" :name="item.name" size="md" />
            <HerbIcon v-else-if="showHerbIcon(item)" :name="item.name" size="md" />
            <text class="bag-item__name">{{ item.name }}</text>
            <text class="bag-item__count" :style="{ color: colorOf(item.color) }">x{{ item.count }}</text>
          </view>
        </view>
        <text class="hint">丹药与功法可在修炼界面快速使用</text>
        <view class="link-row" @tap="goTreasure">
          <text>前往法宝界面</text>
          <text>›</text>
        </view>
      </view>
    </view>

    <AppTabBar current="character" />
  </view>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import Taro, { useDidShow } from '@tarojs/taro'
import AppTabBar from '../../components/AppTabBar.vue'
import HerbIcon from '../../components/HerbIcon.vue'
import OreIcon from '../../components/OreIcon.vue'
import PageHeader from '../../components/PageHeader.vue'
import BeastIcon from '../../components/BeastIcon.vue'
import PetIcon from '../../components/PetIcon.vue'
import { hasHerbIcon } from '../../constants/herb-icon-src'
import { hasOreIcon } from '../../constants/ore-icon-src'
import { parseMissionReward } from '../../constants/mission-catalog'
import { usePlayerStore, type BagCategory, type BagItem } from '../../stores/player'
import { useSectStore } from '../../stores/sect'

const player = usePlayerStore()
const sect = useSectStore()
const bagCats: BagCategory[] = ['全部', '丹药', '功法', '法术', '材料']
const activeTech = computed(() => sect.activeTechnique)
const ownedTechCount = computed(() => sect.techniques.filter((item) => item.owned).length)

useDidShow(() => {
  player.hydrate()
  sect.ensureDailyMissions()
  if (!player.created) {
    Taro.reLaunch({ url: '/pages/create/index' })
  }
})

function colorOf(tone?: string) {
  if (tone === 'jade') return 'var(--jade)'
  if (tone === 'mp') return 'var(--mp)'
  if (tone === 'hp') return 'var(--hp)'
  if (tone === 'gold') return 'var(--gold)'
  return 'var(--text-secondary)'
}

function showOreIcon(item: BagItem) {
  return item.category === '材料' && hasOreIcon(item.name)
}

function showHerbIcon(item: BagItem) {
  return item.category === '材料' && !hasOreIcon(item.name) && hasHerbIcon(item.name)
}

function missionTagClass(tone: string) {
  if (tone === 'muted') return ''
  return `tag--${tone}`
}

function toast(title: string) {
  Taro.showToast({ title, icon: 'none', duration: 2000 })
}

function completeActive() {
  const mission = sect.activeMission
  if (!mission) return toast('暂无进行中任务')
  const claimed = sect.completeMission(mission.instanceId)
  if (!claimed) return toast('完成失败')

  const reward = parseMissionReward(claimed.reward)
  if (reward.contribution) player.earnContribution(reward.contribution)
  if (reward.spiritStones) player.earnStones(reward.spiritStones)
  if (reward.exp) player.addExp(reward.exp)
  if (reward.prestige) sect.prestige += reward.prestige
  player.persist()

  const parts = []
  if (reward.contribution) parts.push(`贡献+${reward.contribution}`)
  if (reward.spiritStones) parts.push(`灵石+${reward.spiritStones}`)
  if (reward.exp) parts.push(`修为+${reward.exp}`)
  if (reward.prestige) parts.push(`声望+${reward.prestige}`)
  if (reward.extra.length) parts.push(reward.extra.join('、'))
  toast(parts.length ? `完成：${parts.join(' · ')}` : `已完成${claimed.name}`)
}

function cancelActive() {
  const mission = sect.activeMission
  if (!mission) return toast('暂无进行中任务')
  Taro.showModal({
    title: '取消任务',
    content: `确定取消「${mission.name}」？取消后可领取其他任务。`,
    success: (res) => {
      if (!res.confirm) return
      if (!sect.cancelMission(mission.instanceId)) return toast('取消失败')
      toast('已取消任务')
    }
  })
}

function goDetail() {
  Taro.navigateTo({ url: '/pages/character/detail' })
}

function goTech() {
  if (!player.hasSect) {
    toast('请先加入宗门')
    return
  }
  Taro.navigateTo({ url: '/pages/sect/technique' })
}

function goCodex() {
  Taro.navigateTo({ url: '/pages/codex/index' })
}

function goTreasure() {
  Taro.navigateTo({ url: '/pages/treasure/index' })
}
</script>

<style lang="scss">
.profile__main {
  display: flex;
  gap: 12px;
  align-items: center;
}

.profile__info {
  flex: 1;
  min-width: 0;
}

.profile__name {
  display: block;
  font-size: 17px;
  font-weight: 700;
  letter-spacing: -0.01em;
}

.profile__meta,
.profile__root {
  display: block;
  margin-top: 3px;
  font-size: 12px;
}

.profile__meta {
  color: var(--text-secondary);
}

.profile__root {
  color: var(--jade);
}

.profile__tech {
  display: block;
  margin-top: 3px;
  font-size: 12px;
  color: var(--gold);
}

.power-box {
  text-align: right;
  padding: 6px 8px;
  border-radius: 10px;
  background: var(--panel-2);
  border: 1px solid var(--border-soft);
  box-shadow: var(--shadow-panel);
}

.power-box__value {
  display: block;
  font-size: 16px;
  color: var(--gold);
  font-weight: 700;
  letter-spacing: -0.02em;
}

.power-box__label {
  font-size: 9px;
  color: var(--text-muted);
  letter-spacing: 0.12em;
}

.wallet {
  margin-top: 14px;
  padding: 12px 8px;
  border-radius: 12px;
  background: var(--panel-2);
  border: 1px solid var(--border-soft);
  display: flex;
  align-items: stretch;
}

.wallet__cell {
  flex: 1;
  text-align: center;
  min-width: 0;
}

.wallet__divider {
  width: 1px;
  margin: 2px 0;
  background: rgba(46, 59, 89, 0.45);
}

.wallet__value {
  display: block;
  font-size: 18px;
  font-weight: 700;
  color: var(--gold);
  letter-spacing: -0.02em;
}

.wallet__value--contrib {
  color: var(--jade);
}

.wallet__label {
  display: block;
  margin-top: 2px;
  font-size: 12px;
  color: var(--text-primary);
  font-weight: 600;
}

.wallet__hint {
  display: block;
  margin-top: 2px;
  font-size: 10px;
  color: var(--text-muted);
}

.detail-entry {
  margin-top: 14px;
  padding: 12px;
  border-radius: 12px;
  background: linear-gradient(90deg, #e6c27a, var(--gold-strong));
  box-shadow: var(--shadow-gold);
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.detail-entry__title {
  display: block;
  font-size: 14px;
  color: var(--ink);
  font-weight: 700;
}

.detail-entry__desc {
  display: block;
  margin-top: 2px;
  font-size: 10px;
  color: var(--ink-soft);
}

.detail-entry__arrow {
  font-size: 20px;
  color: var(--ink);
}

.link-row {
  margin-top: 12px;
  padding: 10px 12px;
  border-radius: var(--radius-sm);
  background: var(--panel-2);
  border: 1px solid var(--border-soft);
  display: flex;
  justify-content: space-between;
  color: var(--text-secondary);
  font-size: 12px;
}

.mission-actions {
  margin-top: 12px;
  display: flex;
  gap: 10px;
}

.mission-actions .btn {
  flex: 1;
}

.gold {
  color: var(--gold);
}

.muted {
  color: var(--text-muted);
}

.tech-note {
  display: block;
  margin-top: 8px;
  font-size: 11px;
  color: var(--text-muted);
}

.empty-tip {
  padding: 12px 4px;
  font-size: 12px;
  color: var(--text-muted);
  text-align: center;
}
</style>
