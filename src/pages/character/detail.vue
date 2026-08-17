<template>
  <view class="page page--sub">
    <PageHeader title="人物详情" :subtitle="`${player.name} · ${player.realm}`" show-back />

    <view class="content detail-page">
      <view class="panel hero">
        <view class="hero__main">
          <PlayerAvatar :gender="player.gender" :fallback-char="player.avatarChar" size="lg" />
          <view class="hero__info">
            <text class="hero__name">{{ player.name }}</text>
            <text class="hero__meta">
              {{ player.gender }} · {{ player.sect || '无宗门' }} · {{ player.rank }}
            </text>
            <view class="hero__tags">
              <text class="hero__tag hero__tag--jade">{{ player.rootBone }}</text>
              <text class="hero__tag">悟性 {{ player.comprehension }}</text>
            </view>
          </view>
        </view>

        <view class="stat-bar">
          <view class="stat-bar__cell">
            <text class="stat-bar__value stat-bar__value--realm">{{ player.realm }}</text>
            <text class="stat-bar__label">境界</text>
          </view>
          <view class="stat-bar__divider" />
          <view class="stat-bar__cell">
            <text class="stat-bar__value">{{ player.combatPower.toLocaleString() }}</text>
            <text class="stat-bar__label">战力</text>
          </view>
        </view>
      </view>

      <view class="panel">
        <view class="section-title">
          <text class="section-title__main">灵根</text>
          <text class="section-title__sub">悟性 {{ player.comprehension }}</text>
        </view>
        <RootRadarChart :roots="visibleRoots" />
      </view>

      <view class="panel">
        <view class="section-title">
          <text class="section-title__main">已装备法宝</text>
          <text class="section-title__sub" @tap="goTreasure">管理 ›</text>
        </view>
        <view
          v-for="slot in treasureSlots"
          :key="slot"
          class="equip-slot"
          :class="{ 'equip-slot--open': switchingSlot === slot }"
        >
          <view class="equip-slot__main" @tap="toggleSlot(slot)">
            <view class="equip-slot__badge">{{ slot }}</view>
            <template v-if="slotItem(slot)">
              <TreasureIcon
                :name="slotItem(slot)!.name"
                :grade="slotItem(slot)!.gradeLabel || slotItem(slot)!.grade"
                size="md"
              />
              <view class="row-item__body">
                <text class="row-item__title">{{ slotItem(slot)!.name }}</text>
                <text class="row-item__desc">
                  {{ slotItem(slot)!.gradeLabel || slotItem(slot)!.grade }}
                  · 战力 +{{ slotBonus(slot) }}
                </text>
                <text v-if="!canWield(slotItem(slot)!.grade)" class="row-item__desc hp">
                  境界不足，暂不可驾驭
                </text>
              </view>
              <text class="side-meta gold">切换</text>
            </template>
            <template v-else>
              <view class="equip-slot__empty-icon">空</view>
              <view class="row-item__body">
                <text class="row-item__title muted-title">未装备</text>
                <text class="row-item__desc">点此切换同部位法宝</text>
              </view>
              <text class="side-meta">选择</text>
            </template>
          </view>

          <view v-if="switchingSlot === slot" class="equip-slot__picker">
            <view
              v-if="!slotCandidates(slot).length"
              class="equip-slot__empty"
              @tap="goTreasure"
            >
              仓库暂无{{ slot }}法宝，去获取 ›
            </view>
            <view
              v-for="item in slotCandidates(slot)"
              :key="item.id"
              class="equip-slot__option"
              :class="{ 'equip-slot__option--on': item.equipped }"
              @tap="chooseTreasure(slot, item.id)"
            >
              <TreasureIcon :name="item.name" :grade="item.gradeLabel || item.grade" size="sm" />
              <view class="row-item__body">
                <text class="row-item__title">{{ item.name }}</text>
                <text class="row-item__desc">
                  {{ item.gradeLabel || item.grade }} · +{{ powerBonus(item) }}
                </text>
              </view>
              <text class="side-meta" :class="{ gold: item.equipped }">
                {{ item.equipped ? '使用中' : '装备' }}
              </text>
            </view>
            <view
              v-if="slotItem(slot)"
              class="equip-slot__unequip"
              @tap="unequipSlot(slot)"
            >
              卸下当前法宝
            </view>
          </view>
        </view>
      </view>

      <view class="panel">
        <view class="section-title">
          <text class="section-title__main">本命功法</text>
          <text class="section-title__sub" @tap="goTech">功法阁 ›</text>
        </view>
        <view v-if="!activeTech" class="empty-tip">尚未修习功法（同时仅一门）</view>
        <view v-else class="row-item">
          <TechniqueIcon :name="activeTech.name" size="sm" />
          <view class="row-item__body">
            <text class="row-item__title">{{ activeTech.name }}</text>
            <text class="row-item__desc">
              {{ activeTech.grade }} · {{ activeTech.attr || activeTech.type }} · {{ activeTech.school }}
            </text>
            <text class="row-item__desc">{{ loreText(activeTech.effect) }}</text>
          </view>
          <text class="side-meta gold">修习中</text>
        </view>
        <view v-if="ownedTechs.length > 1" class="owned-note">
          另有 {{ ownedTechs.length - 1 }} 部已收录，可在功法阁改修
        </view>
      </view>

      <view class="panel spell-battle-panel">
        <view class="section-title">
          <text class="section-title__main">出战法术</text>
          <text class="section-title__sub">最多 {{ battleSpellMax }} 门 · 点按切换</text>
        </view>
        <text class="owned-note">
          出战法术计入战力；未手动选择时按熟练自动取前 {{ battleSpellMax }} 门。炼丹/炼器不可出战。
        </text>
        <view v-if="!combatSpells.length" class="empty-tip">暂无战斗法术可出战</view>
        <view
          v-for="item in combatSpells"
          :key="item.id"
          class="row-item"
          @tap="onToggleBattleSpell(item.name)"
        >
          <SpellIcon :name="item.name" :fallback-char="item.name.slice(0, 1)" size="sm" />
          <view class="row-item__body">
            <view class="inline">
              <text class="row-item__title">{{ item.name }}</text>
              <text v-if="player.isBattleSpell(item.name)" class="tag tag--jade">出战</text>
            </view>
            <text class="row-item__desc">
              {{ item.grade }} · {{ item.attr }} · {{ item.proficiencyName || '初窥门径' }}
            </text>
          </view>
          <text class="side-meta" :class="{ gold: player.isBattleSpell(item.name) }">
            {{ player.isBattleSpell(item.name) ? '出战中' : '点选出战' }}
          </text>
        </view>
      </view>

      <view class="panel">
        <view class="section-title">
          <text class="section-title__main">已习法术</text>
          <text class="section-title__sub">{{ learnedSpells.length }} 门</text>
        </view>
        <view v-if="!learnedSpells.length" class="empty-tip">尚未修习法术（可同时多门）</view>
        <view v-for="item in learnedSpells" :key="item.id" class="row-item">
          <SpellIcon :name="item.name" :fallback-char="item.name.slice(0, 1)" size="sm" />
          <view class="row-item__body">
            <view class="inline">
              <text class="row-item__title">{{ item.name }}</text>
              <text class="tag tag--jade">{{ item.proficiencyName || '初窥门径' }}</text>
            </view>
            <text class="row-item__desc">
              {{ item.grade }} · {{ item.attr }} · {{ item.proficiencyLabel || '0/99' }}
            </text>
            <text class="row-item__desc">{{ loreText(item.proficiencyEffect || item.effect) }}</text>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import Taro from '@tarojs/taro'
import PageHeader from '../../components/PageHeader.vue'
import PlayerAvatar from '../../components/PlayerAvatar.vue'
import RootRadarChart from '../../components/RootRadarChart.vue'
import SpellIcon from '../../components/SpellIcon.vue'
import TechniqueIcon from '../../components/TechniqueIcon.vue'
import TreasureIcon from '../../components/TreasureIcon.vue'
import { BATTLE_SPELL_SLOT_MAX, isCombatSpellName } from '../../constants/combat-power'
import { alignCombatLoreText } from '../../constants/adventure-battle'
import {
  TREASURE_SLOTS,
  canWieldTreasureGrade,
  type TreasureGrade,
  type TreasureSlot
} from '../../constants/treasure'
import { visibleRootBones } from '../../constants/roots'
import { usePlayerStore } from '../../stores/player'
import { useSectStore } from '../../stores/sect'
import { getTreasurePowerBonus, useTreasureStore, type Treasure } from '../../stores/treasure'

const player = usePlayerStore()
const sect = useSectStore()
const treasure = useTreasureStore()

const treasureSlots = TREASURE_SLOTS
const battleSpellMax = BATTLE_SPELL_SLOT_MAX
const switchingSlot = ref<TreasureSlot | null>(null)
const activeTech = computed(() => sect.activeTechnique)
const ownedTechs = computed(() => sect.techniques.filter((item) => item.owned))
const learnedSpells = computed(() => sect.spells.filter((item) => item.owned))
const combatSpells = computed(() =>
  learnedSpells.value.filter((item) => isCombatSpellName(item.name))
)
const visibleRoots = computed(() => visibleRootBones(player.roots))

function onToggleBattleSpell(name: string) {
  const wasOn = player.isBattleSpell(name)
  if (!player.toggleBattleSpell(name)) {
    return toast(wasOn ? '取消失败' : `出战位已满（${battleSpellMax}）`)
  }
  toast(wasOn ? `已取消《${name}》出战` : `已令《${name}》出战`)
}

function slotItem(slot: TreasureSlot) {
  return treasure.getEquippedInSlot(slot)
}

function slotCandidates(slot: TreasureSlot) {
  return treasure.listForSlot(slot)
}

function slotBonus(slot: TreasureSlot) {
  const item = slotItem(slot)
  return item ? getTreasurePowerBonus(item) : 0
}

function powerBonus(item: Treasure) {
  return getTreasurePowerBonus(item)
}

function canWield(grade: TreasureGrade | string) {
  return canWieldTreasureGrade(player.realmState, grade)
}

function toast(title: string) {
  Taro.showToast({ title, icon: 'none' })
}

function loreText(text: string) {
  return alignCombatLoreText(text)
}

function toggleSlot(slot: TreasureSlot) {
  switchingSlot.value = switchingSlot.value === slot ? null : slot
}

function chooseTreasure(slot: TreasureSlot, id: string) {
  const item = treasure.list.find((t) => t.id === id)
  if (!item) return
  if (item.equipped && item.slot === slot) {
    switchingSlot.value = null
    return
  }
  if (!canWield(item.grade)) {
    toast(`境界不足，无法驾驭${item.grade}`)
    return
  }
  treasure.equipToSlot(id, slot)
  switchingSlot.value = null
  toast(`已切换至「${item.name}」`)
}

function unequipSlot(slot: TreasureSlot) {
  const item = slotItem(slot)
  if (!item) return
  treasure.unequip(item.id)
  switchingSlot.value = null
  toast('已卸下')
}

function goTreasure() {
  Taro.navigateTo({ url: '/pages/treasure/index' })
}

function goTech() {
  Taro.navigateTo({ url: '/pages/sect/technique' })
}
</script>

<style lang="scss">
.detail-page {
  padding: 2px 16px 20px;

.hero__main {
  display: flex;
  align-items: center;
  gap: 12px;
}

.hero__info {
  flex: 1;
  min-width: 0;
}

.hero__name {
  display: block;
  font-size: 17px;
  font-weight: 700;
  line-height: 1.2;
  letter-spacing: 0.02em;
  font-family: var(--font-serif);
}

.hero__meta {
  display: block;
  margin-top: 4px;
  font-size: 11px;
  color: var(--text-secondary);
  line-height: 1.3;
}

.hero__tags {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  margin-top: 6px;
}

.hero__tag {
  padding: 2px 7px;
  border-radius: 999px;
  font-size: 10px;
  line-height: 1.3;
  color: var(--text-secondary);
  background: var(--panel-2);
  border: 1px solid var(--border-soft);
}

.hero__tag--jade {
  color: var(--jade);
  border-color: rgba(91, 200, 168, 0.35);
  background: rgba(91, 200, 168, 0.1);
}
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

.detail-page .section-title {
  margin-bottom: 10px;
}

.spell-battle-panel .section-title {
  margin-bottom: 4px;
}

.equip-slot {
  border-radius: 10px;
  background: var(--panel-2);
  border: 1px solid var(--border-soft);
  overflow: hidden;
}

.equip-slot + .equip-slot {
  margin-top: 8px;
}

.equip-slot--open {
  border-color: rgba(217, 179, 108, 0.45);
}

.equip-slot__main {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 10px;
}

.equip-slot__badge {
  flex-shrink: 0;
  min-width: 44px;
  padding: 4px 6px;
  border-radius: 999px;
  text-align: center;
  font-size: 10px;
  color: var(--gold);
  background: rgba(217, 179, 108, 0.12);
  border: 1px solid rgba(217, 179, 108, 0.28);
}

.equip-slot__empty-icon {
  width: 36px;
  height: 36px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 11px;
  color: var(--text-muted);
  background: rgba(46, 59, 89, 0.45);
  border: 1px dashed var(--border-soft);
}

.muted-title {
  color: var(--text-muted);
}

.equip-slot__picker {
  border-top: 1px solid rgba(46, 59, 89, 0.55);
  padding: 6px 8px 8px;
}

.equip-slot__option {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 7px 6px;
  border-radius: 8px;
}

.equip-slot__option + .equip-slot__option {
  margin-top: 2px;
}

.equip-slot__option--on {
  background: rgba(217, 179, 108, 0.1);
}

.equip-slot__empty,
.equip-slot__unequip {
  padding: 8px 6px;
  font-size: 11px;
  color: var(--text-muted);
  text-align: center;
}

.equip-slot__unequip {
  margin-top: 4px;
  color: var(--hp);
}

.row-item--compact {
  padding: 6px 8px;
}

.spell-battle-panel .owned-note {
  display: block;
  margin: 0 0 4px;
  font-size: 10px;
  line-height: 1.25;
}

.side-meta {
  flex-shrink: 0;
  align-self: center;
  font-size: 10px;
  line-height: 1.25;
}

.owned-note {
  display: block;
  margin: 4px 0 0;
  font-size: 10px;
  color: var(--text-muted);
  line-height: 1.25;
}

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
  padding: 10px 4px;
  font-size: 12px;
  color: var(--text-muted);
  text-align: center;
}

/* 正道亮色：人物详情偏亮 */
[data-theme='zhengdao'] {
  .hero__tag {
    background: rgba(255, 255, 255, 0.78);
    border-color: rgba(120, 160, 180, 0.3);
  }

  .hero__tag--jade {
    background: rgba(42, 159, 136, 0.1);
    border-color: rgba(42, 159, 136, 0.32);
  }

  .stat-bar {
    background: linear-gradient(160deg, rgba(212, 176, 86, 0.16), #ffffff 55%, #eef7fb 100%);
    border-color: rgba(196, 154, 60, 0.32);
    box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.9);
  }

  .stat-bar__divider {
    background: rgba(196, 154, 60, 0.28);
  }

  .equip-slot {
    background: linear-gradient(180deg, #ffffff 0%, #eef7fb 100%);
    border-color: rgba(120, 160, 180, 0.26);
    box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.9);
  }

  .equip-slot--open {
    border-color: rgba(196, 154, 60, 0.45);
  }

  .equip-slot__badge {
    background: rgba(212, 176, 86, 0.14);
    border-color: rgba(196, 154, 60, 0.32);
  }

  .equip-slot__empty-icon {
    background: rgba(232, 243, 248, 0.9);
    border-color: rgba(120, 160, 180, 0.35);
  }

  .equip-slot__picker {
    border-top-color: rgba(120, 160, 180, 0.28);
  }

  .equip-slot__option--on {
    background: rgba(212, 176, 86, 0.12);
  }

  .row-item {
    background: linear-gradient(180deg, #ffffff 0%, #eef7fb 100%);
    border-color: rgba(120, 160, 180, 0.22);
  }
}
</style>
