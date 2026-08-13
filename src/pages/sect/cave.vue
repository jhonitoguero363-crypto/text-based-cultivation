<template>
  <view class="page page--sub">
    <PageHeader title="洞府" :subtitle="`聚灵阵 Lv.${sect.caveLevel}`" show-back />
    <view class="content">
      <view class="panel">
        <view class="hero-row">
          <view>
            <text class="title">{{ sect.name || '青云' }}洞府</text>
            <text class="sub">灵气浓度 {{ sect.spiritDensity }}%</text>
          </view>
          <view class="level-badge">Lv.{{ sect.caveLevel }}</view>
        </view>
        <view class="stat-grid" style="margin-top: 12px">
          <view class="stat-cell">
            <text class="stat-cell__value">Lv.{{ sect.veinLevel }}</text>
            <text class="stat-cell__label">灵脉</text>
          </view>
          <view class="stat-cell">
            <text class="stat-cell__value">+{{ sect.cultivateBonus }}%</text>
            <text class="stat-cell__label">修炼加成</text>
          </view>
          <view class="stat-cell">
            <text class="stat-cell__value">×{{ sect.gatherSpeed }}</text>
            <text class="stat-cell__label">聚气速度</text>
          </view>
        </view>
        <view class="cultivate" :class="{ 'cultivate--active': practicing }">
          <text class="cultivate__title">{{ practiceTitle }}</text>
          <text class="cultivate__time">{{ practiceHint }}</text>
          <view class="exp-row">
            <text>修为</text>
            <text>{{ expText }} / {{ player.expMax.toLocaleString() }}</text>
          </view>
          <view class="progress"><view class="progress__bar" :style="{ width: expPercent }" /></view>
          <text v-if="practicing" class="practice-tip">{{ practiceActiveTip }}</text>
        </view>
        <view class="mini-stats">
          <text class="gold">战力 {{ player.combatPower.toLocaleString() }}</text>
        </view>
        <view class="break-card" @tap="onBreakthrough">
          <text class="break-card__title">突破境界</text>
          <text class="break-card__desc">{{ breakthroughHint }}</text>
        </view>
      </view>

      <view class="panel">
        <view class="section-title">
          <text class="section-title__main">修炼功法</text>
          <text class="section-title__sub">悟性 + 对应根骨 · 与法术互斥</text>
        </view>
        <view v-if="!activeTech" class="empty-tip">尚未修习功法，可前往功法阁兑换</view>
        <view v-else class="row-item" :class="{ 'row-item--dim': practicingSpell }">
          <view class="row-item__body">
            <view class="inline">
              <text class="row-item__title">{{ activeTech.name }}</text>
              <text v-if="isPracticingTech" class="tag tag--jade">修炼中</text>
              <text v-else class="tag tag--gold">本命</text>
            </view>
            <text class="row-item__desc">{{ activeTech.grade }} · {{ activeTech.school }}</text>
            <text class="row-item__desc gold">{{ activeTech.effect }}</text>
          </view>
          <view
            class="btn"
            :class="isPracticingTech ? 'btn--ghost' : practicingSpell ? 'btn--ghost' : 'btn--gold'"
            @tap="togglePracticeTech"
          >
            {{ isPracticingTech ? '停止' : '修炼' }}
          </view>
        </view>
        <view v-if="ownedTechs.length > 1" class="hint-line" @tap="goTech">
          另有 {{ ownedTechs.length - 1 }} 部已收录，可在功法阁改修 ›
        </view>
      </view>

      <view class="panel">
        <view class="section-title">
          <text class="section-title__main">修炼法术</text>
          <text class="section-title__sub">悟性影响速度 · 与功法互斥</text>
        </view>
        <view v-if="!ownedSpells.length" class="empty-tip">尚未修习法术，可前往功法阁兑换</view>
        <view
          v-for="spell in ownedSpells"
          :key="spell.id"
          class="row-item"
          :class="{ 'row-item--dim': practicingTech }"
        >
          <view class="row-item__body">
            <view class="inline">
              <text class="row-item__title">{{ spell.name }}</text>
              <text class="tag tag--jade">{{ spell.proficiencyName || '初窥门径' }}</text>
              <text v-if="isPracticingSpell(spell.name)" class="tag tag--gold">修炼中</text>
              <text v-else class="tag tag--gold">{{ spell.type }}</text>
            </view>
            <text class="row-item__desc">
              {{ spell.grade }} · {{ spell.attr }} · {{ spell.proficiencyLabel || '0/99' }}
            </text>
            <text class="row-item__desc gold">{{ spell.proficiencyEffect || spell.effect }}</text>
          </view>
          <view
            class="btn"
            :class="isPracticingSpell(spell.name) ? 'btn--ghost' : practicingTech ? 'btn--ghost' : 'btn--gold'"
            @tap="togglePracticeSpell(spell.name)"
          >
            {{ isPracticingSpell(spell.name) ? '停止' : '修炼' }}
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, ref } from 'vue'
import Taro, { useDidHide, useUnload } from '@tarojs/taro'
import PageHeader from '../../components/PageHeader.vue'
import {
  calcSpellPracticeSpeed,
  calcTechniquePracticeSpeed,
  formatSpeedMult
} from '../../constants/practice-speed'
import { rollSpellProficiencyGain } from '../../constants/spell-proficiency'
import { usePlayerStore } from '../../stores/player'
import { useSectStore } from '../../stores/sect'

const PRACTICE_INTERVAL_MS = 5_000

type PracticeTarget =
  | { kind: 'tech'; name: string }
  | { kind: 'spell'; name: string }
  | null

const player = usePlayerStore()
const sect = useSectStore()
const practiceTarget = ref<PracticeTarget>(null)
const countdown = ref(5)
const sessionGain = ref(0)
const sessionProfGain = ref(0)

let practiceTimer: ReturnType<typeof setInterval> | null = null
let tickTimer: ReturnType<typeof setInterval> | null = null
let nextTickAt = 0

const practicing = computed(() => !!practiceTarget.value)
const practicingTech = computed(() => practiceTarget.value?.kind === 'tech')
const practicingSpell = computed(() => practiceTarget.value?.kind === 'spell')
const isPracticingTech = computed(
  () => practiceTarget.value?.kind === 'tech' && practiceTarget.value.name === activeTech.value?.name
)

const expPercent = computed(() => `${Math.min(100, (player.exp / player.expMax) * 100)}%`)
const expText = computed(() => formatExp(player.exp))
const sessionGainText = computed(() => formatExp(sessionGain.value))
const sessionProfText = computed(() => formatExp(sessionProfGain.value))

const activeTech = computed(() => sect.activeTechnique)
const ownedTechs = computed(() => sect.techniques.filter((item) => item.owned))
const ownedSpells = computed(() => {
  // 依赖熟练度变化以刷新标签
  void player.spellProficiency
  return sect.spells.filter((item) => item.owned)
})

const practiceTitle = computed(() => {
  if (!practiceTarget.value) return `洞府静修 · ${activeTech.value?.name || '尚未选定功法'}`
  if (practiceTarget.value.kind === 'tech') {
    return `修炼功法中 · ${practiceTarget.value.name}`
  }
  return `演练法术中 · ${practiceTarget.value.name}`
})

const techSpeed = computed(() =>
  calcTechniquePracticeSpeed({
    comprehension: player.comprehension,
    roots: player.roots,
    techniqueType: activeTech.value?.type,
    techniqueSchool: activeTech.value?.school,
    cultivateBonus: sect.cultivateBonus,
    gatherSpeed: sect.gatherSpeed
  })
)

const spellSpeed = computed(() =>
  calcSpellPracticeSpeed({
    comprehension: player.comprehension,
    cultivateBonus: sect.cultivateBonus,
    gatherSpeed: sect.gatherSpeed
  })
)

const currentSpeed = computed(() =>
  practicingSpell.value ? spellSpeed.value : techSpeed.value
)

const speedHint = computed(() => {
  const s = currentSpeed.value
  const parts = [`悟性 ${formatSpeedMult(s.comprehension)}`]
  if (practicingTech.value || (!practicing.value && activeTech.value)) {
    if (s.rootName) {
      parts.push(`${s.rootName}根骨 ${formatSpeedMult(s.root)}`)
    } else {
      parts.push('无对应根骨')
    }
  }
  return `${parts.join(' · ')} · 合计 ${formatSpeedMult(s.total)}`
})

const practiceHint = computed(() => {
  if (!practiceTarget.value) {
    return `功法涨修为；法术仅涨熟练度（每 5 秒 0～0.5）· ${speedHint.value}`
  }
  if (practiceTarget.value.kind === 'spell') {
    return `下次吐纳 ${countdown.value}s · 熟练 +${sessionProfText.value} · ${speedHint.value}`
  }
  return `下次吐纳 ${countdown.value}s · 本次 +${sessionGainText.value} · ${speedHint.value}`
})

const practiceActiveTip = computed(() => {
  if (practicingSpell.value) {
    return `演练中 · 不涨修为 · 熟练 +${sessionProfText.value} · ${speedHint.value} · 离开自动停止`
  }
  return `修炼中 · 本次 +${sessionGainText.value} · ${speedHint.value} · 离开洞府将自动停止`
})

const breakthroughHint = computed(() => {
  if (!player.nextRealm) return `${player.realm} · 已达巅峰`
  if (player.canBreakthrough) return `${player.realm} → ${player.nextRealm} · 修为已满`
  return `${player.realm} → ${player.nextRealm} · 修为未满`
})

function formatExp(n: number) {
  const v = Math.round(n * 10) / 10
  return Number.isInteger(v) ? v.toLocaleString() : v.toFixed(1)
}

function toast(title: string) {
  Taro.showToast({ title, icon: 'none' })
}

function isPracticingSpell(name: string) {
  return practiceTarget.value?.kind === 'spell' && practiceTarget.value.name === name
}

function clearTimers() {
  if (practiceTimer) {
    clearInterval(practiceTimer)
    practiceTimer = null
  }
  if (tickTimer) {
    clearInterval(tickTimer)
    tickTimer = null
  }
}

function rollPracticeGain(speedMult: number) {
  const base = Math.random() * 0.5
  return Math.round(base * Math.max(0.2, speedMult) * 10) / 10
}

function practiceTick() {
  if (!practiceTarget.value) return
  const speed =
    practiceTarget.value.kind === 'spell'
      ? calcSpellPracticeSpeed({
          comprehension: player.comprehension,
          cultivateBonus: sect.cultivateBonus,
          gatherSpeed: sect.gatherSpeed
        })
      : calcTechniquePracticeSpeed({
          comprehension: player.comprehension,
          roots: player.roots,
          techniqueType: activeTech.value?.type,
          techniqueSchool: activeTech.value?.school,
          cultivateBonus: sect.cultivateBonus,
          gatherSpeed: sect.gatherSpeed
        })

  if (practiceTarget.value.kind === 'spell') {
    const profGain = rollSpellProficiencyGain(speed.total)
    if (profGain > 0) {
      const result = player.addSpellProficiency(practiceTarget.value.name, profGain)
      sessionProfGain.value = Math.round((sessionProfGain.value + result.gain) * 10) / 10
      sect.applySpellProficiency(player.spellProficiency)
      if (result.tierUp) {
        toast(`《${practiceTarget.value.name}》熟练度进境：${result.name}`)
      }
    }
  } else {
    const gain = rollPracticeGain(speed.total)
    if (gain > 0) {
      player.addExp(gain)
      sessionGain.value = Math.round((sessionGain.value + gain) * 10) / 10
    }
  }
  player.persist()
  nextTickAt = Date.now() + PRACTICE_INTERVAL_MS
  countdown.value = 5
}

function startPractice(target: Exclude<PracticeTarget, null>, startToast: string) {
  practiceTarget.value = target
  sessionGain.value = 0
  sessionProfGain.value = 0
  practiceTick()
  clearTimers()
  practiceTimer = setInterval(() => {
    if (!practiceTarget.value) return
    practiceTick()
  }, PRACTICE_INTERVAL_MS)
  tickTimer = setInterval(() => {
    if (!practiceTarget.value) return
    const left = Math.max(0, Math.ceil((nextTickAt - Date.now()) / 1000))
    countdown.value = left || 5
  }, 250)
  toast(startToast)
}

function stopPractice(reason?: string) {
  if (!practiceTarget.value && !practiceTimer && !tickTimer) return
  const gained = sessionGainText.value
  const prof = sessionProfText.value
  practiceTarget.value = null
  countdown.value = 5
  clearTimers()
  player.persist()
  if (reason) {
    toast(reason.replace('{gain}', gained).replace('{prof}', prof))
  }
}

function togglePracticeTech() {
  if (!activeTech.value) return toast('尚未选定功法')
  if (isPracticingTech.value) {
    stopPractice('已停止修炼功法 · 本次修为 +{gain}')
    return
  }
  if (practicingSpell.value) {
    return toast('正在演练法术，请先停止后再修炼功法')
  }
  startPractice(
    { kind: 'tech', name: activeTech.value.name },
    `开始修炼《${activeTech.value.name}》· 持续吐纳增修为`
  )
}

function togglePracticeSpell(name: string) {
  if (isPracticingSpell(name)) {
    stopPractice(`已停止演练《${name}》· 熟练 +{prof}`)
    return
  }
  if (practicingTech.value) {
    return toast('正在修炼功法，请先停止后再演练法术')
  }
  // 同时仅一门法术；若在演练其他法术，需先停止
  if (practicingSpell.value) {
    return toast('正在演练其他法术，请先停止')
  }
  player.ensureSpellProficiency(name)
  const detail = player.getSpellProficiencyDetail(name)
  startPractice(
    { kind: 'spell', name },
    `开始演练《${name}》· ${detail.name} · 仅增熟练度（不涨修为）`
  )
}

function onBreakthrough() {
  if (practicing.value) return toast('修炼中，请先停止')
  if (!player.nextRealm) {
    toast('已是飞升大圆满')
    return
  }
  if (!player.canBreakthrough) {
    toast('修为未满，暂不可突破')
    return
  }
  const result = player.breakthrough()
  if (result) toast(`突破成功：${result}`)
}

function goTech() {
  if (practicing.value) return toast('修炼中，请先停止')
  Taro.navigateTo({ url: '/pages/sect/technique' })
}

useDidHide(() => {
  stopPractice()
})

useUnload(() => {
  stopPractice()
})

onBeforeUnmount(() => {
  stopPractice()
})
</script>

<style lang="scss">
.content { padding: 0 16px 20px; }
.hero-row { display: flex; justify-content: space-between; align-items: flex-start; }
.title { display: block; font-size: 16px; font-weight: 700; }
.sub { display: block; margin-top: 4px; font-size: 10px; color: var(--jade); }
.level-badge {
  min-width: 44px;
  height: 28px;
  padding: 0 10px;
  border-radius: 999px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(217, 179, 108, 0.16);
  color: var(--gold);
  font-size: 12px;
  font-weight: 600;
}
.cultivate {
  margin-top: 14px;
  padding: 12px;
  border-radius: 12px;
  background: var(--panel-2);
  border: 1px solid var(--border-soft);
}
.cultivate--active {
  border-color: rgba(91, 200, 168, 0.45);
  background: rgba(91, 200, 168, 0.08);
}
.cultivate__title {
  display: block;
  font-size: 13px;
  font-weight: 600;
}
.cultivate--active .cultivate__title {
  color: var(--jade);
}
.cultivate__time {
  display: block;
  margin-top: 4px;
  font-size: 11px;
  color: var(--text-muted);
}
.practice-tip {
  display: block;
  margin-top: 8px;
  font-size: 11px;
  color: var(--jade);
  line-height: 1.45;
}
.exp-row {
  display: flex;
  justify-content: space-between;
  margin-top: 10px;
  font-size: 11px;
  color: var(--text-secondary);
}
.mini-stats {
  display: flex;
  flex-wrap: wrap;
  gap: 8px 12px;
  margin-top: 12px;
  font-size: 11px;
  color: var(--text-secondary);
}
.break-card {
  margin-top: 12px;
  padding: 12px;
  border-radius: 12px;
  background: rgba(217, 179, 108, 0.1);
  border: 1px solid rgba(217, 179, 108, 0.28);
}
.break-card__title {
  display: block;
  font-size: 13px;
  font-weight: 600;
  color: var(--gold);
}
.break-card__desc {
  display: block;
  margin-top: 4px;
  font-size: 11px;
  color: var(--text-secondary);
}
.inline {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
}
.empty-tip {
  padding: 12px 4px;
  text-align: center;
  font-size: 12px;
  color: var(--text-muted);
}
.hint-line {
  margin-top: 8px;
  font-size: 11px;
  color: var(--text-muted);
}
.row-item--dim {
  opacity: 0.5;
}
.gold { color: var(--gold); }
</style>
