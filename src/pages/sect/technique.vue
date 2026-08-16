<template>
  <view class="page page--sub">
    <PageHeader title="功法阁" subtitle="宗门 · 功法与法术" show-back />
    <SegmentTabs :model-value="mode" :items="modes" @update:model-value="onMode" />

    <view class="content">
      <view v-if="showCopy" class="panel">
        <view class="section-title">
          <text class="section-title__main">藏经阁抄录</text>
          <text class="section-title__sub">
            {{ copying ? `抄录中 ${copyLeft}s` : copyProgressText }}
          </text>
        </view>
        <text class="copy-hint">完成「藏经阁抄录」任务；持续抄录满 45 秒可更新进度。</text>
        <view
          class="btn btn--block"
          :class="copying ? 'btn--hp' : 'btn--jade'"
          @tap="toggleCopy"
        >
          {{ copying ? '停止抄录' : '开始抄录' }}
        </view>
      </view>

      <view class="panel tech-hero">
        <view class="tech-tabs">
          <view
            v-for="tab in gradeTabs"
            :key="tab"
            class="tech-tab"
            :class="[
              { 'tech-tab--active': activeTab === tab },
              tab !== '全部' ? `tech-tab--${tierKey(tab)}` : ''
            ]"
            @tap="activeTab = tab"
          >
            {{ tab === '全部' ? '全部' : tab.replace('阶', '') }}
          </view>
        </view>
      </view>

      <view class="panel">
        <view class="section-title">
          <text class="section-title__main">{{ listTitle }}</text>
          <text class="section-title__sub">{{ list.length }} {{ mode === '功法' ? '部' : '门' }}</text>
        </view>

        <view v-if="!list.length" class="empty-tip">该品阶暂无收录{{ mode }}</view>

        <!-- 功法列表 -->
        <template v-if="mode === '功法'">
          <view
            v-for="item in techList"
            :key="item.id"
            class="tech-card"
            :class="[
              `tech-card--${tierKey(item.gradeTier)}`,
              {
                'tech-card--owned': item.owned,
                'tech-card--active': item.active,
                'tech-card--locked': !item.owned && !canReachTech(item)
              }
            ]"
            @tap="openTech(item)"
          >
            <view class="tech-seal" :class="`tech-seal--${tierKey(item.gradeTier)}`">
              <TechniqueIcon :name="item.name" :fallback-char="item.name.slice(0, 1)" size="md" />
            </view>
            <view class="tech-card__body">
              <view class="tech-card__top">
                <text class="tech-card__name">{{ item.name }}</text>
                <text class="tech-card__school">{{ item.school }}</text>
              </view>
              <text class="tech-card__meta">
                {{ item.grade }} · {{ item.realmLabel }}
                {{ item.owned && item.proficiencyName ? ` · ${item.proficiencyName}` : '' }}
              </text>
            </view>
            <view class="tech-card__side">
              <text v-if="item.active" class="tech-badge tech-badge--active">修习中</text>
              <text v-else-if="item.owned" class="tech-badge tech-badge--owned">已收录</text>
              <text v-else-if="!canReachTech(item)" class="tech-badge tech-badge--lock">未及</text>
              <text v-else class="tech-card__cost">{{ formatCost(item.cost) }}</text>
              <text class="tech-card__chev">›</text>
            </view>
          </view>
        </template>

        <!-- 法术列表 -->
        <template v-else>
          <view
            v-for="item in spellList"
            :key="item.id"
            class="tech-card"
            :class="[
              `tech-card--${tierKey(item.gradeTier)}`,
              {
                'tech-card--owned': item.owned,
                'tech-card--locked': !item.owned && !canReachSpell(item)
              }
            ]"
            @tap="openSpell(item)"
          >
            <view class="tech-seal" :class="`tech-seal--${tierKey(item.gradeTier)}`">
              <SpellIcon :name="item.name" :fallback-char="item.name.slice(0, 1)" size="md" />
            </view>
            <view class="tech-card__body">
              <view class="tech-card__top">
                <text class="tech-card__name">{{ item.name }}</text>
                <text class="tech-card__school">{{ item.attr }}</text>
              </view>
              <text class="tech-card__meta">
                {{ item.grade }} · {{ item.type }}
                {{ item.owned && item.proficiencyName ? ` · ${item.proficiencyName}` : ` · ${item.realm}` }}
              </text>
              <text class="tech-card__effect">
                {{ item.owned ? item.proficiencyEffect || item.effect : item.effect }}
              </text>
            </view>
            <view class="tech-card__side">
              <text v-if="item.owned" class="tech-badge tech-badge--owned">已习</text>
              <text v-else-if="!canReachSpell(item)" class="tech-badge tech-badge--lock">未及</text>
              <text v-else class="tech-card__cost">{{ formatCost(item.cost) }}</text>
              <text class="tech-card__chev">›</text>
            </view>
          </view>
        </template>

        <text class="hint">
          {{
            mode === '功法'
              ? '功法同时仅一门；洞府修炼增长修为与熟练度；熟练度越高，战力与修为获取越高。由低品阶改修至更高品阶会损耗部分修为。'
              : '法术可同时修习多门；点开查看效果并以贡献兑换。'
          }}
        </text>
      </view>
    </view>

    <!-- 功法详情 -->
    <view v-if="activeTech" class="tech-mask" @tap="closeDetail">
      <view class="tech-sheet" @tap.stop>
        <view class="tech-sheet__handle" />
        <view class="tech-sheet__head">
          <view class="tech-seal tech-seal--lg" :class="`tech-seal--${tierKey(activeTech.gradeTier)}`">
            <TechniqueIcon :name="activeTech.name" :fallback-char="activeTech.name.slice(0, 1)" size="lg" />
          </view>
          <view class="tech-sheet__meta">
            <text class="tech-sheet__name">{{ activeTech.name }}</text>
            <view class="tech-sheet__tags">
              <text class="tag" :class="`tag--tier-${tierKey(activeTech.gradeTier)}`">{{ activeTech.grade }}</text>
              <text class="tag tag--gold">{{ activeTech.school }}</text>
              <text class="tag tag--jade">{{ activeTech.type }}</text>
              <text v-if="activeTech.active" class="tag tag--mp">修习中</text>
            </view>
          </view>
        </view>

        <view class="tech-sheet__block">
          <text class="tech-sheet__k">功法效果</text>
          <text class="tech-sheet__v gold">{{ activeTech.effect }}</text>
        </view>
        <view v-if="activeTech.owned" class="tech-sheet__block">
          <text class="tech-sheet__k">熟练度</text>
          <text class="tech-sheet__v">
            {{ activeTech.proficiencyLabel || '初窥门径 · 0/99' }}
          </text>
          <text class="tech-sheet__v gold">
            {{ activeTech.proficiencyEffect || '功法基础效果' }}
          </text>
        </view>
        <view class="tech-sheet__block">
          <text class="tech-sheet__k">适合境界</text>
          <text class="tech-sheet__v">{{ activeTech.realmLabel }}（最低 {{ activeTech.realm }}）</text>
        </view>
        <view class="tech-sheet__block">
          <text class="tech-sheet__k">流派</text>
          <text class="tech-sheet__v">{{ schoolHint(activeTech.school) }}</text>
        </view>
        <view class="tech-sheet__block">
          <text class="tech-sheet__k">获取</text>
          <text class="tech-sheet__v muted">{{ activeTech.origin }}</text>
        </view>
        <view v-if="switchLossPreview > 0" class="tech-sheet__block">
          <text class="tech-sheet__k">升阶损耗</text>
          <text class="tech-sheet__v hp">预计损失修为 {{ switchLossPreview }}（低品→高品）</text>
        </view>

        <template v-if="activeTech.active">
          <view class="tech-sheet__done"><text>正在修习此功法</text></view>
          <view class="btn btn--ghost tech-sheet__close" @tap="closeDetail">关闭</view>
        </template>
        <template v-else-if="activeTech.owned">
          <view class="tech-sheet__actions">
            <view class="btn btn--ghost tech-sheet__btn" @tap="closeDetail">关闭</view>
            <view class="btn btn--gold tech-sheet__btn" @tap="switchTech(activeTech)">改修此功法</view>
          </view>
        </template>
        <template v-else>
          <text v-if="!canReachTech(activeTech)" class="tech-sheet__warn">
            境界未及 · 需达{{ activeTech.realm }}方可修习
          </text>
          <view class="tech-sheet__actions">
            <view class="btn btn--ghost tech-sheet__btn" @tap="closeDetail">关闭</view>
            <view
              class="btn tech-sheet__btn"
              :class="canExchangeTech(activeTech) ? 'btn--gold' : 'btn--ghost'"
              @tap="exchangeTech(activeTech)"
            >
              {{ hasActiveTech ? '兑换并改修' : '兑换修习' }} · {{ activeTech.cost.toLocaleString() }}
            </view>
          </view>
        </template>
      </view>
    </view>

    <!-- 法术详情 -->
    <view v-if="activeSpell" class="tech-mask" @tap="closeDetail">
      <view class="tech-sheet" @tap.stop>
        <view class="tech-sheet__handle" />
        <view class="tech-sheet__head">
          <view class="tech-seal tech-seal--lg" :class="`tech-seal--${tierKey(activeSpell.gradeTier)}`">
            <SpellIcon :name="activeSpell.name" :fallback-char="activeSpell.name.slice(0, 1)" size="lg" />
          </view>
          <view class="tech-sheet__meta">
            <text class="tech-sheet__name">{{ activeSpell.name }}</text>
            <view class="tech-sheet__tags">
              <text class="tag" :class="`tag--tier-${tierKey(activeSpell.gradeTier)}`">{{ activeSpell.grade }}</text>
              <text class="tag tag--gold">{{ activeSpell.attr }}</text>
              <text class="tag tag--jade">{{ activeSpell.type }}</text>
            </view>
          </view>
        </view>

        <view class="tech-sheet__block">
          <text class="tech-sheet__k">法术效果</text>
          <text class="tech-sheet__v gold">{{ activeSpell.effect }}</text>
        </view>
        <view v-if="activeSpell.owned" class="tech-sheet__block">
          <text class="tech-sheet__k">熟练度</text>
          <text class="tech-sheet__v">
            {{ activeSpell.proficiencyLabel || '初窥门径 · 0/99' }}
          </text>
          <text class="tech-sheet__v gold">{{ activeSpell.proficiencyEffect || '法术基础效果' }}</text>
        </view>
        <view class="tech-sheet__block">
          <text class="tech-sheet__k">适合境界</text>
          <text class="tech-sheet__v">最低 {{ activeSpell.realm }}</text>
        </view>
        <view class="tech-sheet__block">
          <text class="tech-sheet__k">修习规则</text>
          <text class="tech-sheet__v muted">
            法术可同时修习多门；洞府演练增长熟练度（初窥门径→炉火纯青），与功法不可同时修炼。
          </text>
        </view>

        <template v-if="activeSpell.owned">
          <view class="tech-sheet__done"><text>已修习此法术</text></view>
          <view class="btn btn--ghost tech-sheet__close" @tap="closeDetail">关闭</view>
        </template>
        <template v-else>
          <text v-if="!canReachSpell(activeSpell)" class="tech-sheet__warn">
            境界未及 · 需达{{ activeSpell.realm }}方可修习
          </text>
          <view class="tech-sheet__actions">
            <view class="btn btn--ghost tech-sheet__btn" @tap="closeDetail">关闭</view>
            <view
              class="btn tech-sheet__btn"
              :class="canExchangeSpell(activeSpell) ? 'btn--gold' : 'btn--ghost'"
              @tap="exchangeSpell(activeSpell)"
            >
              兑换 · {{ activeSpell.cost.toLocaleString() }} 贡献
            </view>
          </view>
        </template>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, ref } from 'vue'
import Taro from '@tarojs/taro'
import PageHeader from '../../components/PageHeader.vue'
import SegmentTabs from '../../components/SegmentTabs.vue'
import TechniqueIcon from '../../components/TechniqueIcon.vue'
import SpellIcon from '../../components/SpellIcon.vue'
import type { RealmMajor } from '../../constants/realm'
import { canLearnSpell } from '../../constants/spell-catalog'
import {
  calcTechniqueSwitchExpLoss,
  canLearnTechnique,
  getSchoolDef,
  TECHNIQUE_GRADE_TABS
} from '../../constants/technique-catalog'
import { usePlayerStore } from '../../stores/player'
import { useSectStore, type SectSpell, type SectTechnique } from '../../stores/sect'

const sect = useSectStore()
const player = usePlayerStore()

const modes = ['功法', '法术'] as const
const mode = ref<(typeof modes)[number]>('功法')
const activeTab = ref<(typeof TECHNIQUE_GRADE_TABS)[number]>('全部')
const gradeTabs = TECHNIQUE_GRADE_TABS

const activeTech = ref<SectTechnique | null>(null)
const activeSpell = ref<SectSpell | null>(null)
const copying = ref(false)
const copyLeft = ref(45)
let copyTimer: ReturnType<typeof setInterval> | null = null
let copyElapsed = 0

const showCopy = computed(() => sect.activeMission?.objective?.kind === 'technique_copy')
const copyProgressText = computed(() => {
  const m = sect.activeMission
  if (!m?.objective || m.objective.kind !== 'technique_copy') return '持续 45 秒'
  return `${m.progress || 0}/${m.objective.target} · 持续 45 秒`
})

function clearCopy() {
  if (copyTimer) clearInterval(copyTimer)
  copyTimer = null
  copying.value = false
  copyLeft.value = 45
  copyElapsed = 0
}

function toggleCopy() {
  if (!showCopy.value) {
    clearCopy()
    return
  }
  if (copying.value) {
    clearCopy()
    return toast('已停止抄录')
  }
  copying.value = true
  copyLeft.value = 45
  copyElapsed = 0
  copyTimer = setInterval(() => {
    if (!showCopy.value) {
      clearCopy()
      return
    }
    copyElapsed += 1
    copyLeft.value = Math.max(0, 45 - copyElapsed)
    if (copyElapsed >= 45) {
      sect.reportMissionProgress('technique_copy', 1)
      player.addExp(5)
      player.persist()
      clearCopy()
      toast('抄录完成，任务进度已更新')
    }
  }, 1000)
  toast('开始抄录')
}

onBeforeUnmount(() => clearCopy())

const techList = computed(() => {
  if (activeTab.value === '全部') return sect.techniques
  return sect.techniques.filter((item) => item.gradeTier === activeTab.value)
})

const spellList = computed(() => {
  if (activeTab.value === '全部') return sect.spells
  return sect.spells.filter((item) => item.gradeTier === activeTab.value)
})

const list = computed(() => (mode.value === '功法' ? techList.value : spellList.value))

const ownedSpellCount = computed(() => sect.ownedSpellCount)
const hasActiveTech = computed(() => !!sect.activeTechnique)
const activeTechName = computed(() => sect.activeTechnique?.name || '')

/** 打开详情且将改修为更高品阶时的修为损耗预估 */
const switchLossPreview = computed(() => {
  const next = activeTech.value
  const current = sect.activeTechnique
  if (!next || !current || next.id === current.id || next.active) return 0
  return calcTechniqueSwitchExpLoss({
    fromGrade: current.grade,
    toGrade: next.grade,
    exp: player.exp
  })
})

const listTitle = computed(() => {
  const kind = mode.value
  if (activeTab.value === '全部') return `全部${kind}`
  return `${activeTab.value}${kind}`
})

function onMode(value: string) {
  mode.value = value as (typeof modes)[number]
  activeTab.value = '全部'
  closeDetail()
}

function tierKey(tier: string) {
  const map: Record<string, string> = {
    黄阶: 'huang',
    玄阶: 'xuan',
    地阶: 'di',
    天阶: 'tian',
    仙阶: 'xian'
  }
  return map[tier] || 'huang'
}

function schoolHint(school: string) {
  const def = getSchoolDef(school)
  return def ? `${school} · ${def.attrs} · ${def.playStyle}` : school
}

function formatCost(n: number) {
  if (n >= 10000) return `${(n / 10000).toFixed(n % 10000 === 0 ? 0 : 1)}万`
  if (n >= 1000) return `${(n / 1000).toFixed(n % 1000 === 0 ? 0 : 1)}千`
  return String(n)
}

function canReachTech(item: SectTechnique) {
  return canLearnTechnique(player.realmState.major, item.realm as RealmMajor)
}

function canReachSpell(item: SectSpell) {
  return canLearnSpell(player.realmState.major, item.realm as RealmMajor)
}

function canExchangeTech(item: SectTechnique) {
  return canReachTech(item) && player.contribution >= item.cost
}

function canExchangeSpell(item: SectSpell) {
  return canReachSpell(item) && player.contribution >= item.cost
}

function openTech(item: SectTechnique) {
  activeSpell.value = null
  activeTech.value = item
}

function openSpell(item: SectSpell) {
  activeTech.value = null
  activeSpell.value = item
}

function closeDetail() {
  activeTech.value = null
  activeSpell.value = null
}

function persistActive() {
  player.activeTechniqueId = sect.activeTechniqueId
  player.persist()
}

/** 低品阶改修高品阶时损失修为；返回实际扣除量 */
function applyUpgradeExpLoss(from: SectTechnique | null | undefined, to: SectTechnique) {
  if (!from || from.id === to.id) return 0
  const loss = calcTechniqueSwitchExpLoss({
    fromGrade: from.grade,
    toGrade: to.grade,
    exp: player.exp
  })
  if (loss <= 0) return 0
  return player.loseExp(loss)
}

function formatLossToast(name: string, loss: number, isFirstLearn: boolean) {
  if (isFirstLearn && loss <= 0) return `已修习《${name}》`
  if (loss > 0) return `已改修《${name}》· 升阶损耗修为 ${loss}`
  return `已改修《${name}》`
}

function exchangeTech(item: SectTechnique) {
  if (item.owned) return
  if (!canReachTech(item)) return toast(`需达${item.realm}境界方可修习`)
  if (player.contribution < item.cost) return toast('贡献不足')
  const prev = sect.activeTechnique
  const loss = applyUpgradeExpLoss(prev, item)
  player.contribution -= item.cost
  sect.learnTechnique(item.id)
  player.addBagItem(item.name, '功法')
  persistActive()
  activeTech.value = sect.techniques.find((t) => t.id === item.id) || null
  toast(formatLossToast(item.name, loss, !prev))
}

function switchTech(item: SectTechnique) {
  if (!item.owned || item.active) return
  const prev = sect.activeTechnique
  const loss = applyUpgradeExpLoss(prev, item)
  sect.setActiveTechnique(item.id)
  persistActive()
  activeTech.value = sect.techniques.find((t) => t.id === item.id) || null
  toast(formatLossToast(item.name, loss, false))
}

function exchangeSpell(item: SectSpell) {
  if (item.owned) return
  if (!canReachSpell(item)) return toast(`需达${item.realm}境界方可修习`)
  if (player.contribution < item.cost) return toast('贡献不足')
  player.contribution -= item.cost
  sect.learnSpell(item.id)
  player.addBagItem(item.name, '法术')
  player.ensureSpellProficiency(item.name)
  sect.applySpellProficiency(player.spellProficiency)
  player.persist()
  activeSpell.value = sect.spells.find((s) => s.id === item.id) || null
  toast(`已修习《${item.name}》· 初窥门径`)
}

function toast(title: string) {
  Taro.showToast({ title, icon: 'none' })
}
</script>

<style lang="scss">
.content {
  padding: 0 16px 20px;
}

.tech-hero {
  padding-bottom: 12px;
}

.copy-hint {
  display: block;
  margin-bottom: 10px;
  font-size: 11px;
  color: var(--text-muted);
  line-height: 1.45;
}
.tech-hero__row {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  margin-bottom: 14px;
  gap: 10px;
}
.tech-hero__label {
  display: block;
  font-size: 10px;
  color: var(--text-muted);
  letter-spacing: 0.12em;
}
.tech-hero__value {
  display: block;
  margin-top: 4px;
  font-size: 22px;
  font-weight: 700;
  color: var(--gold);
  letter-spacing: -0.02em;
  font-family: var(--font-serif);
}
.tech-hero__stats {
  display: flex;
  align-items: center;
  gap: 6px;
  max-width: 58%;
  padding: 6px 10px;
  border-radius: 999px;
  background: var(--scrim-soft);
  border: 1px solid var(--border-soft);
}
.tech-hero__stat {
  font-size: 11px;
  color: var(--text-secondary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.tech-hero__divider {
  color: var(--text-muted);
  font-size: 11px;
}

.tech-tabs {
  display: flex;
  gap: 6px;
}
.tech-tab {
  flex: 1;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  font-size: 12px;
  color: var(--text-secondary);
  background: var(--panel-2);
  border: 1px solid transparent;
}
.tech-tab--active {
  font-weight: 600;
  color: var(--gold);
  border-color: var(--gold-soft);
  background: rgba(217, 179, 108, 0.12);
}
.tech-tab--huang.tech-tab--active {
  color: #e0b86a;
  border-color: rgba(224, 184, 106, 0.45);
  background: rgba(224, 184, 106, 0.12);
}
.tech-tab--xuan.tech-tab--active {
  color: var(--mp);
  border-color: rgba(111, 168, 220, 0.45);
  background: rgba(111, 168, 220, 0.12);
}
.tech-tab--di.tech-tab--active {
  color: var(--jade);
  border-color: rgba(91, 200, 168, 0.45);
  background: rgba(91, 200, 168, 0.12);
}
.tech-tab--tian.tech-tab--active {
  color: #c9d4f0;
  border-color: rgba(201, 212, 240, 0.4);
  background: rgba(201, 212, 240, 0.1);
}
.tech-tab--xian.tech-tab--active {
  color: #f0d9a8;
  border-color: rgba(240, 217, 168, 0.5);
  background: rgba(240, 217, 168, 0.14);
}

.tech-card {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 8px;
  margin: 0 -4px;
  border-radius: 10px;
  border: 1px solid transparent;
  border-left: 3px solid transparent;
}
.tech-card + .tech-card {
  margin-top: 2px;
}
.tech-card:active {
  background: rgba(31, 43, 69, 0.55);
}
.tech-card--huang {
  border-left-color: rgba(224, 184, 106, 0.55);
}
.tech-card--xuan {
  border-left-color: rgba(111, 168, 220, 0.55);
}
.tech-card--di {
  border-left-color: rgba(91, 200, 168, 0.55);
}
.tech-card--tian {
  border-left-color: rgba(201, 212, 240, 0.5);
}
.tech-card--xian {
  border-left-color: rgba(240, 217, 168, 0.65);
}
.tech-card--owned {
  background: rgba(91, 200, 168, 0.04);
}
.tech-card--active {
  background: rgba(217, 179, 108, 0.08);
  border-color: rgba(217, 179, 108, 0.22);
}
.tech-card--locked {
  opacity: 0.72;
}

.tech-seal {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  padding: 0;
  overflow: hidden;
  background: linear-gradient(145deg, rgba(42, 58, 92, 0.9), rgba(20, 28, 48, 0.95));
  border: 1px solid var(--border-soft);
  box-shadow: var(--shadow-panel);
}
.tech-seal .technique-icon,
.tech-seal .spell-icon {
  border: none;
  box-shadow: none;
  border-radius: 0;
  width: 100%;
  height: 100%;
}
.tech-seal--lg {
  width: 56px;
  height: 56px;
  border-radius: 14px;
}
.tech-seal__char {
  font-size: 18px;
  font-weight: 700;
  font-family: var(--font-serif);
  line-height: 1;
}
.tech-seal--lg .tech-seal__char {
  font-size: 24px;
}
.tech-seal--huang .tech-seal__char {
  color: #e0b86a;
}
.tech-seal--xuan .tech-seal__char {
  color: var(--mp);
}
.tech-seal--di .tech-seal__char {
  color: var(--jade);
}
.tech-seal--tian .tech-seal__char {
  color: #c9d4f0;
}
.tech-seal--xian .tech-seal__char {
  color: #f0d9a8;
}
.tech-seal--huang {
  box-shadow: inset 0 0 0 1px rgba(224, 184, 106, 0.22);
}
.tech-seal--xuan {
  box-shadow: inset 0 0 0 1px rgba(111, 168, 220, 0.22);
}
.tech-seal--di {
  box-shadow: inset 0 0 0 1px rgba(91, 200, 168, 0.22);
}
.tech-seal--tian {
  box-shadow: inset 0 0 0 1px rgba(201, 212, 240, 0.2);
}
.tech-seal--xian {
  box-shadow: inset 0 0 0 1px rgba(240, 217, 168, 0.28);
}

.tech-card__body {
  flex: 1;
  min-width: 0;
}
.tech-card__top {
  display: flex;
  align-items: center;
  gap: 6px;
  min-width: 0;
}
.tech-card__name {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-primary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.tech-card__school {
  flex-shrink: 0;
  font-size: 10px;
  color: var(--gold);
  padding: 1px 5px;
  border-radius: 4px;
  background: rgba(217, 179, 108, 0.12);
  border: 1px solid rgba(217, 179, 108, 0.28);
}
.tech-card__meta {
  display: block;
  margin-top: 3px;
  font-size: 10px;
  color: var(--text-muted);
}
.tech-card__effect {
  display: block;
  margin-top: 3px;
  font-size: 11px;
  color: var(--text-secondary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.tech-card__side {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 4px;
  flex-shrink: 0;
  min-width: 44px;
}
.tech-card__cost {
  font-size: 12px;
  font-weight: 600;
  color: var(--gold);
}
.tech-card__chev {
  font-size: 16px;
  color: var(--text-muted);
  line-height: 1;
}
.tech-badge {
  font-size: 10px;
  padding: 2px 6px;
  border-radius: 4px;
}
.tech-badge--owned {
  color: var(--jade);
  background: rgba(91, 200, 168, 0.14);
  border: 1px solid rgba(91, 200, 168, 0.3);
}
.tech-badge--active {
  color: var(--ink);
  background: linear-gradient(180deg, #e6c27a 0%, var(--gold-strong) 100%);
  border: 1px solid rgba(200, 154, 75, 0.5);
  font-weight: 600;
}
.tech-badge--lock {
  color: var(--hp);
  background: rgba(224, 123, 108, 0.12);
  border: 1px solid rgba(224, 123, 108, 0.28);
}

.hint {
  display: block;
  margin-top: 12px;
  font-size: 11px;
  color: var(--text-muted);
  line-height: 1.5;
}
.muted {
  color: var(--text-muted);
}
.hp {
  color: var(--hp);
}
.gold {
  color: var(--gold);
}
.empty-tip {
  padding: 16px 4px;
  text-align: center;
  font-size: 12px;
  color: var(--text-muted);
}

.tag--tier-huang {
  color: #e0b86a;
  background: rgba(224, 184, 106, 0.14);
}
.tag--tier-xuan {
  color: var(--mp);
  background: rgba(111, 168, 220, 0.14);
}
.tag--tier-di {
  color: var(--jade);
  background: rgba(91, 200, 168, 0.14);
}
.tag--tier-tian {
  color: #c9d4f0;
  background: rgba(201, 212, 240, 0.12);
}
.tag--tier-xian {
  color: #f0d9a8;
  background: rgba(240, 217, 168, 0.14);
}

.tech-mask {
  position: fixed;
  inset: 0;
  z-index: 100;
  background: var(--overlay);
  display: flex;
  align-items: flex-end;
  justify-content: center;
  padding: 16px;
  padding-bottom: calc(16px + env(safe-area-inset-bottom));
}
.tech-sheet {
  width: 100%;
  max-width: 390px;
  background: var(--panel);
  border: 1px solid var(--border-soft);
  border-radius: 18px 18px 14px 14px;
  padding: 12px 16px 16px;
  box-shadow: 0 -8px 32px rgba(0, 0, 0, 0.35), var(--shadow-panel);
}
.tech-sheet__handle {
  width: 36px;
  height: 4px;
  border-radius: 999px;
  background: rgba(166, 176, 200, 0.28);
  margin: 0 auto 14px;
}
.tech-sheet__head {
  display: flex;
  gap: 12px;
  align-items: center;
}
.tech-sheet__meta {
  flex: 1;
  min-width: 0;
}
.tech-sheet__name {
  display: block;
  font-size: 20px;
  font-weight: 700;
  font-family: var(--font-serif);
  color: var(--text-primary);
  letter-spacing: 0.04em;
}
.tech-sheet__tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: 8px;
}
.tech-sheet__block {
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid rgba(46, 59, 89, 0.4);
}
.tech-sheet__k {
  display: block;
  font-size: 10px;
  color: var(--text-muted);
  letter-spacing: 0.1em;
  margin-bottom: 4px;
}
.tech-sheet__v {
  display: block;
  font-size: 13px;
  line-height: 1.5;
  color: var(--text-primary);
}
.tech-sheet__warn {
  display: block;
  margin-top: 14px;
  font-size: 12px;
  color: var(--hp);
}
.tech-sheet__done {
  margin-top: 16px;
  padding: 12px;
  text-align: center;
  border-radius: 10px;
  background: rgba(91, 200, 168, 0.1);
  border: 1px solid rgba(91, 200, 168, 0.28);
  color: var(--jade);
  font-size: 13px;
}
.tech-sheet__actions {
  display: flex;
  gap: 8px;
  margin-top: 16px;
}
.tech-sheet__btn {
  flex: 1;
}
.tech-sheet__close {
  margin-top: 12px;
  width: 100%;
}
</style>
