<template>
  <view class="page">
    <PageHeader title="角色" subtitle="道途修为一览" />

    <view class="content char-page">
      <view class="panel profile">
        <view class="profile__main">
          <PlayerAvatar
            class="profile__face"
            :gender="player.gender"
            :fallback-char="player.avatarChar"
            size="lg"
          />
          <view class="profile__info">
            <text class="profile__name">{{ player.name }}</text>
            <text class="profile__meta">
              {{ player.gender }} · {{ player.sect || '无宗门' }} · {{ player.rank }}
            </text>
            <view class="profile__tags">
              <text class="profile__tag profile__tag--jade">{{ player.rootBone }}</text>
              <text class="profile__tag">悟性 {{ player.comprehension }}</text>
              <text v-if="player.injured" class="profile__tag profile__tag--hp">受伤</text>
            </view>
          </view>
        </view>

        <view v-if="player.injured" class="injury-banner">
          <view class="injury-banner__text">
            <text class="injury-banner__title">伤势未愈</text>
            <text class="injury-banner__desc">
              战力暂减；可赴洞府静养疗伤，或在此服用疗伤丹药
            </text>
          </view>
          <view
            v-if="healPills.length"
            class="btn btn--gold btn--mini"
            @tap="onHealInjury"
          >
            疗伤
          </view>
          <text v-else class="injury-banner__empty">背包无疗伤丹</text>
        </view>

        <view class="stat-bar">
          <view class="stat-bar__cell">
            <text class="stat-bar__value stat-bar__value--realm" :key="player.realm">{{ player.realm }}</text>
            <text class="stat-bar__label">境界</text>
          </view>
          <view class="stat-bar__divider" />
          <view class="stat-bar__cell">
            <text class="stat-bar__value">{{ player.combatPower.toLocaleString() }}</text>
            <text class="stat-bar__label">战力</text>
          </view>
        </view>

        <view class="wallet">
          <view class="wallet__cell">
            <text class="wallet__value">{{ player.spiritStones.toLocaleString() }}</text>
            <text class="wallet__label">灵石</text>
          </view>
          <view class="wallet__divider" />
          <view class="wallet__cell">
            <text class="wallet__value wallet__value--contrib">
              {{ player.contribution.toLocaleString() }}
            </text>
            <text class="wallet__label">贡献点</text>
          </view>
        </view>

        <view class="detail-entry" @tap="goDetail">
          <view class="detail-entry__text">
            <text class="detail-entry__title">人物详情</text>
            <text class="detail-entry__desc">灵根 · 战力 · 法宝 · 功法 · 法术</text>
          </view>
          <text class="detail-entry__arrow">›</text>
        </view>
      </view>

      <view class="panel">
        <view class="section-title">
          <text class="section-title__main">功法</text>
          <text class="section-title__sub" @tap="goTech">功法阁 ›</text>
        </view>
        <view v-if="!ownedTechs.length" class="empty-tip">尚未修习功法，可前往功法阁兑换</view>
        <view v-else class="skill-list">
          <view
            v-for="tech in ownedTechs"
            :key="tech.id"
            class="skill-row"
            :class="{ 'skill-row--active': tech.active }"
            @tap="goTech"
          >
            <TechniqueIcon :name="tech.name" size="lg" class="skill-row__icon" />
            <view class="skill-row__body">
              <text class="skill-row__name">{{ tech.name }}</text>
              <text class="skill-row__meta">
                {{ tech.active ? '修习中' : '已收录' }} · {{ tech.proficiencyName || '初窥门径' }}
              </text>
              <text class="skill-row__sub">
                {{ tech.proficiencyLabel || '初窥门径 · 0/99' }}
              </text>
            </view>
          </view>
        </view>
        <text v-if="ownedTechs.length" class="tech-note">洞府修炼可提升功法熟练度 · 熟练越高战力加成越高</text>
      </view>

      <view class="panel">
        <view class="section-title">
          <text class="section-title__main">法术</text>
          <text class="section-title__sub" @tap="goTech">功法阁 ›</text>
        </view>
        <view v-if="!ownedSpells.length" class="empty-tip">尚未修习法术，可前往功法阁兑换</view>
        <view v-else class="skill-list">
          <view
            v-for="spell in ownedSpells"
            :key="spell.id"
            class="skill-row"
            @tap="goTech"
          >
            <SpellIcon :name="spell.name" size="lg" class="skill-row__icon" />
            <view class="skill-row__body">
              <text class="skill-row__name">{{ spell.name }}</text>
              <text class="skill-row__meta">{{ spell.grade }} · {{ spell.attr }}</text>
              <text class="skill-row__sub">{{ spell.proficiencyLabel || '初窥门径 · 0/99' }}</text>
            </view>
          </view>
        </view>
        <text v-if="ownedSpells.length" class="tech-note">洞府演练可提升熟练度</text>
      </view>

      <view class="panel">
        <view class="section-title">
          <text class="section-title__main">当前任务</text>
          <text class="section-title__sub">
            {{ sect.activeMission ? '进行中 · 同时仅 1 个' : '暂无进行中任务' }}
          </text>
        </view>
        <view v-if="!sect.activeMission" class="empty-tip">前往任务堂领取任务</view>
        <template v-else>
          <view class="mission-card">
            <view class="inline-row">
              <text class="row-item__title">{{ sect.activeMission.name }}</text>
              <text class="tag" :class="missionTagClass(sect.activeMission.tagTone)">
                {{ sect.activeMission.tag }}
              </text>
            </view>
            <text class="row-item__desc">{{ sect.activeMission.desc }}</text>
            <text v-if="sect.activeMission.objective" class="row-item__desc jade">
              条件 · {{ missionConditionText }}
            </text>
            <text v-if="sect.activeMission.objective" class="row-item__desc">
              进度 · {{ missionProgressText }}
              {{ missionReady ? ' · 已达成' : '' }}
            </text>
            <text class="row-item__desc gold">{{ sect.activeMission.reward }}</text>
          </view>
          <view class="mission-actions">
            <view
              class="btn"
              :class="missionReady ? 'btn--gold' : 'btn--ghost'"
              @tap="completeActive"
            >
              {{ missionReady ? '完成任务' : '条件未达成' }}
            </view>
            <view class="btn btn--ghost" @tap="cancelActive">取消任务</view>
          </view>
        </template>
      </view>

      <view class="panel">
        <view class="section-title">
          <text class="section-title__main">我的灵兽</text>
          <text class="section-title__sub">
            {{
              player.pets.length
                ? `出战 ${player.activePet ? 1 : 0} · 共 ${player.pets.length}`
                : '尚未拥有'
            }}
          </text>
        </view>
        <view v-if="!player.pets.length" class="empty-tip">暂无灵兽（兽阁购买或秘境抓捕）</view>
        <view v-else class="pet-list">
          <view
            v-for="pet in player.pets"
            :key="pet.id"
            class="pet-card"
            :class="{ 'pet-card--active': pet.status === '出战' }"
            @tap="onDeployPet(pet.id)"
          >
            <view class="pet-card__art">
              <BeastIcon v-if="pet.source === 'capture'" :name="pet.name" size="md" />
              <PetIcon v-else :name="pet.name" size="md" />
            </view>
            <view class="pet-card__body">
              <view class="pet-card__top">
                <text class="pet-card__name">{{ pet.name }}</text>
                <text
                  class="pet-card__badge"
                  :class="pet.status === '出战' ? 'pet-card__badge--active' : 'pet-card__badge--idle'"
                >
                  {{ pet.status === '出战' ? '出战中' : '待命' }}
                </text>
              </view>
              <text class="pet-card__meta">
                {{ pet.source === 'capture' ? '抓捕' : '灵宠' }} · {{ pet.grade }} · {{ pet.type }}
              </text>
              <text class="pet-card__bonus">{{ pet.bonus }}</text>
              <view class="pet-card__foot">
                <text class="pet-card__favor">好感 {{ pet.favor }}</text>
                <text class="pet-card__action">
                  {{ pet.status === '出战' ? '点击取消出战' : '点击出战' }}
                </text>
              </view>
            </view>
          </view>
        </view>
        <text v-if="player.pets.length" class="hint">
          同时仅可一只出战，也可全部待命；战斗中有概率依战力差阵亡
        </text>
      </view>

      <view class="panel">
        <view class="section-title">
          <text class="section-title__main">背包物品</text>
          <view class="bag-head">
            <text class="section-title__sub">共 {{ bagList.length }} 件</text>
            <view class="btn btn--gold btn--mini" @tap="goCodex">图鉴</view>
          </view>
        </view>
        <view class="chip-row bag-chips">
          <view
            v-for="cat in bagCats"
            :key="cat"
            class="chip"
            :class="{ 'chip--active': player.bagFilter === cat }"
            @tap="setBagFilter(cat)"
          >
            {{ cat }}
          </view>
        </view>
        <view v-if="!bagList.length" class="empty-tip">背包空空如也</view>
        <view v-else class="bag-grid">
          <view v-for="item in bagList" :key="item.id" class="bag-item">
            <OreIcon v-if="showOreIcon(item)" :name="item.name" size="md" />
            <HerbIcon v-else-if="showHerbIcon(item)" :name="item.name" size="md" />
            <PillIcon v-else-if="showPillIcon(item)" :name="item.name" size="md" />
            <text class="bag-item__name">{{ item.name }}</text>
            <text class="bag-item__count" :style="{ color: colorOf(item.color) }">
              x{{ item.count }}
            </text>
          </view>
        </view>
        <text class="hint">丹药可在修炼界面快速使用 · 功法 / 法术见上方 · 法宝请前往法宝页</text>
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
import PillIcon from '../../components/PillIcon.vue'
import TechniqueIcon from '../../components/TechniqueIcon.vue'
import SpellIcon from '../../components/SpellIcon.vue'
import PageHeader from '../../components/PageHeader.vue'
import PlayerAvatar from '../../components/PlayerAvatar.vue'
import BeastIcon from '../../components/BeastIcon.vue'
import PetIcon from '../../components/PetIcon.vue'
import { hasPillIcon } from '../../constants/pill-icon-src'
import { canHealInjury } from '../../constants/pill-catalog'
import { parseMissionReward } from '../../constants/mission-catalog'
import {
  formatMissionConditionText,
  formatMissionProgress,
  isMissionObjectiveMet
} from '../../constants/mission-catalog'
import { usePlayerStore, type BagCategory, type BagItem } from '../../stores/player'
import { useSectStore } from '../../stores/sect'

const player = usePlayerStore()
const sect = useSectStore()
const bagCats: BagCategory[] = ['全部', '丹药', '矿石', '药材', '材料']

/** 角色背包不展示功法 / 法术 / 法宝（上方或独立页） */
const bagList = computed(() =>
  player.filteredBag.filter(
    (item) =>
      item.category !== '功法' &&
      item.category !== '法术' &&
      item.category !== '法宝'
  )
)

function setBagFilter(cat: BagCategory) {
  if (cat === '功法' || cat === '法术' || cat === '法宝') {
    player.bagFilter = '全部'
    return
  }
  player.bagFilter = cat
}
const ownedTechs = computed(() => {
  const list = sect.techniques.filter((item) => item.owned)
  return [...list].sort((a, b) => Number(b.active) - Number(a.active))
})
const ownedSpells = computed(() => sect.spells.filter((item) => item.owned))
const healPills = computed(() =>
  player.bag.filter((item) => item.category === '丹药' && item.count > 0 && canHealInjury(item.name))
)
const missionProgressText = computed(() => formatMissionProgress(sect.activeMission))
const missionReady = computed(() => isMissionObjectiveMet(sect.activeMission))
const missionConditionText = computed(() =>
  formatMissionConditionText(sect.activeMission, sect.members)
)

useDidShow(() => {
  player.hydrate()
  player.reclassifyBagMaterials()
  sect.syncLearnedFromBag(
    player.bag,
    player.activeTechniqueId || null,
    player.spellProficiency,
    player.techniqueProficiency
  )
  if (
    player.bagFilter === '功法' ||
    player.bagFilter === '法术' ||
    player.bagFilter === '法宝'
  ) {
    player.bagFilter = '全部'
  }
  sect.ensureDailyMissions()
  const stipendNotice = player.ensureMonthlyStipend()
  if (stipendNotice) toast(stipendNotice)
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
  return item.category === '矿石'
}

function showHerbIcon(item: BagItem) {
  return item.category === '药材'
}

function showPillIcon(item: BagItem) {
  return item.category === '丹药' && hasPillIcon(item.name)
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
  if (!isMissionObjectiveMet(mission)) {
    return toast(formatMissionConditionText(mission, sect.members) || '任务条件尚未达成')
  }
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

function onDeployPet(id: string) {
  const pet = player.pets.find((item) => item.id === id)
  if (!pet) return
  if (pet.status === '出战') {
    if (!player.clearActivePet()) return toast('取消失败')
    return toast(`已取消${pet.name}出战`)
  }
  if (!player.setActivePet(id)) return toast('切换失败')
  toast(`已令${pet.name}出战`)
}

function onHealInjury() {
  if (!player.injured) return toast('当前并无伤势')
  const pill = healPills.value[0]
  if (!pill) return toast('背包中没有疗伤丹药')
  const result = player.healInjuryWithPill(pill.name)
  if (!result.ok) {
    if (result.reason === 'no_pill') return toast('丹药不足')
    if (result.reason === 'invalid_pill') return toast('此丹药无法疗伤')
    return toast('疗伤失败')
  }
  toast(`服下${result.pillName}，伤势已愈`)
}
</script>

<style lang="scss">
.char-page {
  padding-top: 2px;
}

.profile {
  padding-bottom: 12px;
}

.profile__main {
  display: flex;
  gap: 12px;
  align-items: center;
}

.profile__face {
  flex-shrink: 0;
}

.profile__info {
  flex: 1;
  min-width: 0;
}

.profile__name {
  display: block;
  font-size: 17px;
  font-weight: 700;
  letter-spacing: 0.02em;
  line-height: 1.2;
  font-family: var(--font-serif);
}

.profile__meta {
  display: block;
  margin-top: 4px;
  font-size: 11px;
  color: var(--text-secondary);
  line-height: 1.3;
}

.profile__tags {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  margin-top: 6px;
}

.profile__tag {
  padding: 2px 7px;
  border-radius: 999px;
  font-size: 10px;
  line-height: 1.3;
  color: var(--text-secondary);
  background: var(--panel-2);
  border: 1px solid var(--border-soft);
}

.profile__tag--jade {
  color: var(--jade);
  border-color: rgba(91, 200, 168, 0.35);
  background: rgba(91, 200, 168, 0.1);
}

.profile__tag--hp {
  color: var(--hp);
  border-color: rgba(224, 92, 106, 0.4);
  background: rgba(224, 92, 106, 0.12);
}

.injury-banner {
  margin-top: 10px;
  padding: 10px 12px;
  border-radius: 12px;
  border: 1px solid rgba(224, 92, 106, 0.4);
  background: rgba(224, 92, 106, 0.1);
  display: flex;
  align-items: center;
  gap: 10px;
}

.injury-banner__text {
  flex: 1;
  min-width: 0;
}

.injury-banner__title {
  display: block;
  font-size: 13px;
  font-weight: 700;
  color: var(--hp);
}

.injury-banner__desc {
  display: block;
  margin-top: 2px;
  font-size: 11px;
  color: var(--text-secondary);
  line-height: 1.35;
}

.injury-banner__empty {
  flex-shrink: 0;
  font-size: 10px;
  color: var(--text-muted);
}

.stat-bar {
  margin-top: 12px;
  padding: 10px 6px;
  border-radius: 12px;
  background: linear-gradient(160deg, rgba(217, 179, 108, 0.12), rgba(31, 43, 69, 0.95));
  border: 1px solid rgba(217, 179, 108, 0.28);
  display: flex;
  align-items: stretch;
}

.stat-bar__cell {
  flex: 1;
  text-align: center;
  min-width: 0;
  padding: 0 4px;
}

.stat-bar__divider {
  width: 1px;
  margin: 4px 0;
  background: rgba(217, 179, 108, 0.28);
}

.stat-bar__value {
  display: block;
  font-size: 16px;
  font-weight: 700;
  color: var(--gold);
  letter-spacing: -0.02em;
  line-height: 1.2;
  font-variant-numeric: tabular-nums;
}

.stat-bar__value--realm {
  font-size: 14px;
  letter-spacing: 0.02em;
  font-family: var(--font-serif);
}

.stat-bar__label {
  display: block;
  margin-top: 2px;
  font-size: 10px;
  color: var(--text-muted);
  letter-spacing: 0.08em;
}

.wallet {
  margin-top: 12px;
  padding: 10px 6px;
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
  margin: 4px 0;
  background: rgba(46, 59, 89, 0.55);
}

.wallet__value {
  display: block;
  font-size: 16px;
  font-weight: 700;
  color: var(--gold);
  letter-spacing: -0.02em;
  line-height: 1.15;
  font-variant-numeric: tabular-nums;
}

.wallet__value--contrib {
  color: var(--jade);
}

.wallet__label {
  display: block;
  margin-top: 2px;
  font-size: 10px;
  color: var(--text-muted);
  letter-spacing: 0.06em;
}

.detail-entry {
  margin-top: 10px;
  padding: 10px 12px;
  border-radius: 12px;
  background: linear-gradient(100deg, #e6c27a 0%, var(--gold-strong) 100%);
  box-shadow: var(--shadow-gold);
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}

.detail-entry__text {
  min-width: 0;
}

.detail-entry__title {
  display: block;
  font-size: 13px;
  color: var(--ink);
  font-weight: 700;
  line-height: 1.2;
}

.detail-entry__desc {
  display: block;
  margin-top: 2px;
  font-size: 10px;
  color: var(--ink-soft);
  line-height: 1.3;
}

.detail-entry__arrow {
  font-size: 18px;
  color: var(--ink);
  line-height: 1;
}

.char-page .section-title {
  margin-bottom: 10px;
}

.skill-list {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.skill-row {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 4px 6px;
  border-radius: 10px;
  background: var(--panel-2);
  border: 1px solid var(--border-soft);
  box-sizing: border-box;
}

.skill-row--active {
  border-color: rgba(217, 179, 108, 0.55);
  background: linear-gradient(135deg, rgba(217, 179, 108, 0.14), rgba(31, 43, 69, 0.96));
}

.skill-row__icon,
.skill-row .technique-icon,
.skill-row .spell-icon {
  width: 54px !important;
  height: 54px !important;
  border-radius: 10px !important;
  flex-shrink: 0;
}

.skill-row__body {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 2px;
  min-height: 54px;
}

.skill-row__name {
  font-size: 13px;
  font-weight: 700;
  color: var(--text);
  line-height: 1.2;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.skill-row__meta {
  font-size: 11px;
  font-weight: 600;
  color: var(--gold);
  line-height: 1.2;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.skill-row__sub {
  font-size: 10px;
  color: var(--text-muted);
  line-height: 1.2;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.mission-card {
  padding: 10px;
  border-radius: var(--radius-sm);
  background: var(--panel-2);
  border: 1px solid var(--border-soft);
}

.mission-card .row-item__desc {
  margin-top: 4px;
}

.mission-actions {
  margin-top: 10px;
  display: flex;
  gap: 8px;
}

.mission-actions .btn {
  flex: 1;
}

.pet-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.pet-card {
  display: flex;
  gap: 10px;
  padding: 10px;
  border-radius: 12px;
  background: var(--panel-2);
  border: 1px solid var(--border-soft);
  transition: border-color 0.15s ease, background 0.15s ease;
}

.pet-card--active {
  border-color: rgba(217, 179, 108, 0.55);
  background: linear-gradient(135deg, rgba(217, 179, 108, 0.14), rgba(31, 43, 69, 0.96));
}

.pet-card__art {
  flex-shrink: 0;
}

.pet-card__body {
  flex: 1;
  min-width: 0;
}

.pet-card__top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}

.pet-card__name {
  font-size: 14px;
  font-weight: 700;
  color: var(--text);
  line-height: 1.2;
}

.pet-card__badge {
  flex-shrink: 0;
  padding: 2px 7px;
  border-radius: 999px;
  font-size: 10px;
  line-height: 1.3;
  font-weight: 600;
}

.pet-card__badge--active {
  color: var(--ink);
  background: linear-gradient(180deg, #e6c27a, var(--gold-strong));
}

.pet-card__badge--idle {
  color: var(--text-muted);
  background: rgba(46, 59, 89, 0.55);
  border: 1px solid var(--border-soft);
}

.pet-card__meta {
  display: block;
  margin-top: 4px;
  font-size: 11px;
  color: var(--text-secondary);
  line-height: 1.35;
}

.pet-card__bonus {
  display: block;
  margin-top: 3px;
  font-size: 11px;
  color: var(--jade);
  line-height: 1.35;
}

.pet-card__foot {
  margin-top: 6px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}

.pet-card__favor {
  font-size: 10px;
  color: var(--text-muted);
}

.pet-card__action {
  font-size: 10px;
  color: var(--gold);
  font-weight: 600;
}

.pet-card--active .pet-card__action {
  color: var(--text-muted);
  font-weight: 500;
}

.bag-head {
  display: flex;
  align-items: center;
  gap: 8px;
}

.btn--mini {
  height: 22px;
  padding: 0 8px;
  font-size: 10px;
  border-radius: 6px;
}

.bag-chips {
  margin-bottom: 10px;
  gap: 6px;
}

.bag-chips .chip {
  padding: 4px 9px;
  font-size: 11px;
}

.link-row {
  margin-top: 10px;
  padding: 9px 12px;
  border-radius: var(--radius-sm);
  background: var(--panel-2);
  border: 1px solid var(--border-soft);
  display: flex;
  justify-content: space-between;
  color: var(--text-secondary);
  font-size: 12px;
}

.gold {
  color: var(--gold);
}

.jade {
  color: var(--jade);
}

.muted {
  color: var(--text-muted);
}

.tech-note {
  display: block;
  margin-top: 6px;
  font-size: 11px;
  color: var(--text-muted);
  line-height: 1.35;
}

.empty-tip {
  padding: 10px 4px;
  font-size: 12px;
  color: var(--text-muted);
  text-align: center;
}

.hint {
  display: block;
  margin-top: 8px;
  font-size: 11px;
  color: var(--text-muted);
}

/* 正道亮色：角色页内容偏亮 */
[data-theme='zhengdao'] {
  .profile__tag {
    background: rgba(255, 255, 255, 0.78);
    border-color: rgba(120, 160, 180, 0.3);
  }

  .profile__tag--jade {
    background: rgba(42, 159, 136, 0.1);
    border-color: rgba(42, 159, 136, 0.32);
  }

  .profile__tag--hp {
    background: rgba(208, 102, 102, 0.1);
    border-color: rgba(208, 102, 102, 0.32);
  }

  .injury-banner {
    background: rgba(208, 102, 102, 0.08);
    border-color: rgba(208, 102, 102, 0.28);
  }

  .stat-bar {
    background: linear-gradient(160deg, rgba(212, 176, 86, 0.16), #ffffff 55%, #eef7fb 100%);
    border-color: rgba(196, 154, 60, 0.32);
    box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.9);
  }

  .stat-bar__divider {
    background: rgba(196, 154, 60, 0.28);
  }

  .wallet {
    background: linear-gradient(180deg, #ffffff 0%, #eef7fb 100%);
    border-color: rgba(120, 160, 180, 0.28);
    box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.95);
  }

  .wallet__divider {
    background: rgba(120, 160, 180, 0.28);
  }

  .detail-entry {
    background: linear-gradient(100deg, var(--btn-gold-top) 0%, var(--btn-gold-bottom) 100%);
    border: 1px solid var(--btn-gold-border);
    box-shadow:
      0 1px 0 rgba(255, 255, 255, 0.4) inset,
      0 2px 6px rgba(150, 110, 30, 0.18);
  }

  .detail-entry__title,
  .detail-entry__arrow {
    color: var(--btn-on-solid);
    text-shadow: 0 1px 0 rgba(90, 60, 10, 0.2);
  }

  .detail-entry__desc {
    color: rgba(255, 255, 255, 0.88);
  }

  .skill-row {
    background: linear-gradient(180deg, #ffffff 0%, #eef7fb 100%);
    border-color: rgba(120, 160, 180, 0.26);
    box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.9);
  }

  .skill-row--active {
    border-color: rgba(196, 154, 60, 0.45);
    background: linear-gradient(135deg, rgba(212, 176, 86, 0.16), #ffffff 60%);
  }

  .mission-card {
    background: linear-gradient(180deg, #ffffff 0%, #eef7fb 100%);
    border-color: rgba(120, 160, 180, 0.26);
    box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.9);
  }

  .pet-card {
    background: linear-gradient(180deg, #ffffff 0%, #eef7fb 100%);
    border-color: rgba(120, 160, 180, 0.26);
    box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.9);
  }

  .pet-card--active {
    border-color: rgba(196, 154, 60, 0.45);
    background: linear-gradient(135deg, rgba(212, 176, 86, 0.16), #ffffff 60%);
  }

  .pet-card__badge--active {
    color: var(--btn-on-solid);
    background: linear-gradient(180deg, var(--btn-gold-top) 0%, var(--btn-gold-bottom) 100%);
    border: 1px solid var(--btn-gold-border);
    text-shadow: 0 1px 0 rgba(90, 60, 10, 0.18);
  }

  .pet-card__badge--idle {
    color: var(--text-muted);
    background: rgba(255, 255, 255, 0.75);
    border-color: rgba(120, 160, 180, 0.3);
  }

  .link-row {
    background: linear-gradient(180deg, #ffffff 0%, #eef7fb 100%);
    border-color: rgba(120, 160, 180, 0.26);
    box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.9);
  }
}
</style>
