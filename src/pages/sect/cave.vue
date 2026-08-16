<template>
  <view class="page page--sub">
    <PageHeader title="洞府" :subtitle="`${sect.name || '宗门'}静修之所`" show-back />
    <view class="content">
      <view v-if="player.injured" class="panel injury-panel">
        <view class="injury-panel__row">
          <view class="injury-panel__text">
            <text class="injury-panel__title">伤势未愈</text>
            <text class="injury-panel__desc">
              战力暂减约 {{ injuryPenaltyPct }}%；可在洞府静养疗伤，或服用疗伤丹药
            </text>
          </view>
          <view class="btn btn--gold" @tap="onHealAtCave">疗伤</view>
        </view>
      </view>

      <view class="panel">
        <text class="title">{{ sect.name || '青云' }}洞府</text>
        <view class="cultivate" :class="{ 'cultivate--active': practicing, 'cultivate--ready': canBreakNow }">
          <text class="cultivate__title">{{ practiceTitle }}<text class="cultivate__time">{{ practiceHint }}</text></text>
          <view class="exp-row" :key="player.realm">
            <text>{{ player.realm }} · 本层修为</text>
            <text>{{ expText }} / {{ player.expMax.toLocaleString() }}</text>
          </view>
          <view class="progress"><view class="progress__bar" :style="{ width: expPercent }" /></view>
          <text v-if="practicing" class="practice-tip">{{ practiceActiveTip }}</text>
          <text v-else-if="canBreakNow" class="practice-tip">本层修为已满，可尝试突破</text>
        </view>
        <view v-if="canBreakNow" class="break-card">
          <view class="break-card__info">
            <text class="break-card__title">突破境界</text>
            <text class="break-card__desc">{{ breakthroughHint }}</text>
            <text v-if="breakthroughRateText" class="break-card__rate">{{ breakthroughRateText }}</text>
          </view>
          <view class="btn btn--gold break-card__btn" @tap="onBreakthrough">立即突破</view>
        </view>
        <view v-else class="break-hint">
          <text>{{ breakthroughHint }}</text>
        </view>
      </view>

      <view v-if="dualPartner" class="panel">
        <view class="section-title">
          <text class="section-title__main">双修</text>
          <text class="section-title__sub">每 5 秒仅增修为</text>
        </view>
        <view class="practice-row" :class="{ 'practice-row--dim': practicingTech || practicingSpell }">
          <view class="practice-row__body">
            <view class="inline">
              <text class="practice-row__title">与{{ dualPartner.name }}双修</text>
              <text v-if="practicingDual" class="tag tag--jade">双修中</text>
              <text v-else class="tag tag--gold">已邀</text>
            </view>
            <text class="practice-row__meta">
              {{ dualPartner.gender }} · 亲密 {{ dualIntimacyText }}
            </text>
            <text class="practice-row__progress">双修悟道，仅沉淀修为，不增熟练度</text>
          </view>
          <view class="dual-actions">
            <view
              class="btn"
              :class="practicingDual ? 'btn--ghost' : practicingTech || practicingSpell ? 'btn--ghost' : 'btn--gold'"
              @tap="togglePracticeDual"
            >
              {{ practicingDual ? '停止' : '双修' }}
            </view>
            <view v-if="!practicingDual" class="btn btn--ghost" @tap="onClearDual">请回</view>
          </view>
        </view>
      </view>

      <view class="panel">
        <view class="section-title">
          <text class="section-title__main">修炼功法</text>
          <text class="section-title__sub">悟性 + 对应根骨</text>
        </view>
        <view v-if="!activeTech" class="empty-tip">尚未修习功法，可前往功法阁兑换</view>
        <view v-else class="practice-row" :class="{ 'practice-row--dim': practicingSpell || practicingDual }">
          <TechniqueIcon :name="activeTech.name" size="md" />
          <view class="practice-row__body">
            <view class="inline">
              <text class="practice-row__title">{{ activeTech.name }}</text>
              <text v-if="isPracticingTech" class="tag tag--jade">修炼中</text>
              <text v-else class="tag tag--gold">本命</text>
            </view>
            <text class="practice-row__meta">{{ activeTech.grade }} · {{ activeTech.school }}</text>
            <text class="practice-row__progress">
              {{ activeTech.proficiencyProgress || '0/99' }}
              · {{ activeTech.proficiencyName || '初窥门径' }}
            </text>
          </view>
          <view
            class="btn"
            :class="isPracticingTech ? 'btn--ghost' : practicingSpell || practicingDual ? 'btn--ghost' : 'btn--gold'"
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
          <text class="section-title__sub">悟性影响速度</text>
        </view>
        <view v-if="!ownedSpells.length" class="empty-tip">尚未修习法术，可前往功法阁兑换</view>
        <view
          v-for="spell in ownedSpells"
          :key="spell.id"
          class="practice-row"
          :class="{ 'practice-row--dim': practicingTech || practicingDual }"
        >
          <SpellIcon :name="spell.name" size="md" />
          <view class="practice-row__body">
            <view class="inline">
              <text class="practice-row__title">{{ spell.name }}</text>
              <text v-if="isPracticingSpell(spell.name)" class="tag tag--jade">修炼中</text>
              <text v-else class="tag tag--gold">{{ spell.type }}</text>
            </view>
            <text class="practice-row__meta">{{ spell.grade }} · {{ spell.attr }}</text>
            <text class="practice-row__progress">
              {{ spell.proficiencyProgress || '0/99' }}
              · {{ spell.proficiencyName || '初窥门径' }}
            </text>
          </view>
          <view
            class="btn"
            :class="isPracticingSpell(spell.name) ? 'btn--ghost' : practicingTech || practicingDual ? 'btn--ghost' : 'btn--gold'"
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
import Taro, { useUnload } from '@tarojs/taro'
import PageHeader from '../../components/PageHeader.vue'
import TechniqueIcon from '../../components/TechniqueIcon.vue'
import SpellIcon from '../../components/SpellIcon.vue'
import {
  calcSpellPracticeSpeed,
  calcTechniquePracticeSpeed,
  formatRelationLabel,
  formatSpeedMult
} from '../../constants/practice-speed'
import { getRealmPracticeExpBase } from '../../constants/realm-exp'
import { rollSpellProficiencyGain } from '../../constants/spell-proficiency'
import { getTechniqueGradeExpMult } from '../../constants/technique-catalog'
import {
  getTechniqueProficiencyInfo,
  rollTechniqueProficiencyGain
} from '../../constants/technique-proficiency'
import { INJURY_POWER_MULT } from '../../constants/spar'
import {
  DUAL_CULTIVATION_INTIMACY_MIN,
  formatIntimacy
} from '../../constants/intimacy'
import { usePlayerStore } from '../../stores/player'
import { useSectStore } from '../../stores/sect'

const PRACTICE_INTERVAL_MS = 5_000

type PracticeTarget =
  | { kind: 'tech'; name: string }
  | { kind: 'spell'; name: string }
  | { kind: 'dual'; name: string }
  | null

const player = usePlayerStore()
const sect = useSectStore()
const practiceTarget = ref<PracticeTarget>(null)
const countdown = ref(5)
const sessionGain = ref(0)
const sessionProfGain = ref(0)
const sessionTechProfGain = ref(0)

let practiceTimer: ReturnType<typeof setInterval> | null = null
let tickTimer: ReturnType<typeof setInterval> | null = null
let nextTickAt = 0

const practicing = computed(() => !!practiceTarget.value)
const practicingTech = computed(() => practiceTarget.value?.kind === 'tech')
const practicingSpell = computed(() => practiceTarget.value?.kind === 'spell')
const practicingDual = computed(() => practiceTarget.value?.kind === 'dual')
const isPracticingTech = computed(
  () => practiceTarget.value?.kind === 'tech' && practiceTarget.value.name === activeTech.value?.name
)

const dualPartner = computed(() => player.dualPartner)
const dualIntimacyText = computed(() => {
  const p = dualPartner.value
  if (!p) return '—'
  return formatIntimacy(player.getIntimacy(p.id, p.attitude))
})

const expPercent = computed(() => `${Math.min(100, (player.exp / player.expMax) * 100)}%`)
const expText = computed(() => formatExp(player.exp))
const canBreakNow = computed(() => player.canBreakthrough)
const sessionGainText = computed(() => formatExp(sessionGain.value))
const sessionProfText = computed(() => formatExp(sessionProfGain.value))
const sessionTechProfText = computed(() => formatExp(sessionTechProfGain.value))

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
  if (practiceTarget.value.kind === 'dual') {
    return `双修中 · ${practiceTarget.value.name}`
  }
  return `演练法术中 · ${practiceTarget.value.name}`
})

const practicingSpellObj = computed(() => {
  if (!practicingSpell.value || !practiceTarget.value || practiceTarget.value.kind !== 'spell') {
    return null
  }
  return ownedSpells.value.find((item) => item.name === practiceTarget.value?.name) || null
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
    roots: player.roots,
    spellAttr: practicingSpellObj.value?.attr || '',
    cultivateBonus: sect.cultivateBonus,
    gatherSpeed: sect.gatherSpeed
  })
)

const currentSpeed = computed(() =>
  practicingSpell.value ? spellSpeed.value : techSpeed.value
)

const speedHint = computed(() => {
  if (practicingDual.value) {
    const p = dualPartner.value
    const intimacy = p ? player.getIntimacy(p.id, p.attitude) : 0
    const bonus = 1 + Math.min(0.2, Math.max(0, intimacy - DUAL_CULTIVATION_INTIMACY_MIN) * 0.01)
    return `双修 · 亲密加成 ${formatSpeedMult(bonus)}`
  }
  const s = currentSpeed.value
  const parts = [`悟性 ${formatSpeedMult(s.comprehension)}`]
  if (s.relation === 'none') {
    parts.push('无属性')
  } else if (s.relation === 'match' && s.rootName) {
    parts.push(`同属${s.rootName} ${formatSpeedMult(s.root)}`)
  } else if (s.relation === 'restrain' && s.rootName) {
    parts.push(`相克${s.rootName} ${formatSpeedMult(s.root)}`)
  } else if (s.rootName) {
    parts.push(`${formatRelationLabel(s.relation)}${s.rootName} ${formatSpeedMult(s.root)}`)
  }
  return `${parts.join(' · ')} · 合计 ${formatSpeedMult(s.total)}`
})

const practiceHint = computed(() => {
  if (!practiceTarget.value) {
    return ``
  }
  return `下次吐纳 ${countdown.value}s`
})

const practiceActiveTip = computed(() => {
  if (practicingDual.value) {
    return `双修中 · 修为 +${sessionGainText.value} · ${speedHint.value}`
  }
  if (practicingSpell.value) {
    return `演练中 · 熟练 +${sessionProfText.value} · ${speedHint.value}`
  }
  if (canBreakNow.value) {
    return `修炼中 · 修为已满仅增熟练 · 熟练 +${sessionTechProfText.value} · ${speedHint.value}`
  }
  return `修炼中 · 修为 +${sessionGainText.value} · 熟练 +${sessionTechProfText.value} · ${speedHint.value}`
})

const breakthroughHint = computed(() => {
  if (!player.nextRealm) return `${player.realm} · 已达巅峰`
  if (player.canBreakthrough) {
    const preview = player.getBreakthroughPreview()
    const kind = preview?.isMajor ? '大境界' : '小境界'
    return `${player.realm} → ${player.nextRealm} · ${kind} · 本层已满`
  }
  return `${player.realm} → ${player.nextRealm} · 本层需 ${player.expMax.toLocaleString()}`
})

const breakthroughRateText = computed(() => {
  if (!player.canBreakthrough) return ''
  const preview = player.getBreakthroughPreview()
  if (!preview) return ''
  const pillPart = preview.pillName
    ? preview.hasPill
      ? ` · 将服${preview.pillName}(+${preview.pillBonus}%)`
      : ` · 未备${preview.pillName}`
    : ''
  return `成功率 ${preview.rate}%${pillPart}`
})

function formatExp(n: number) {
  const v = Math.round(n * 10) / 10
  return Number.isInteger(v) ? v.toLocaleString() : v.toFixed(1)
}

const injuryPenaltyPct = Math.round((1 - INJURY_POWER_MULT) * 100)

function toast(title: string) {
  Taro.showToast({ title, icon: 'none' })
}

function onHealAtCave() {
  const result = player.healInjuryAtCave()
  if (!result.ok) return toast('当前并无伤势')
  toast('洞府静养，伤势已愈')
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
          roots: player.roots,
          spellAttr:
            ownedSpells.value.find((item) => item.name === practiceTarget.value?.name)?.attr || '',
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

  if (practiceTarget.value.kind === 'dual') {
    if (player.exp < player.expMax) {
      const p = dualPartner.value
      const intimacy = p ? player.getIntimacy(p.id, p.attitude) : 0
      const dualBonus = 1 + Math.min(0.2, Math.max(0, intimacy - DUAL_CULTIVATION_INTIMACY_MIN) * 0.01)
      const realmBase = getRealmPracticeExpBase(player.realmState)
      const gradeMult = getTechniqueGradeExpMult(activeTech.value?.grade || '黄阶下品')
      const gain =
        Math.round(rollPracticeGain(speed.total) * realmBase * gradeMult * dualBonus * 10) / 10
      if (gain > 0) {
        const before = player.exp
        player.addExp(gain)
        const actual = Math.round((player.exp - before) * 10) / 10
        if (actual > 0) {
          sessionGain.value = Math.round((sessionGain.value + actual) * 10) / 10
        }
      }
    }
  } else if (practiceTarget.value.kind === 'spell') {
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
    // 修为已满：不再涨修为，仍可刷功法熟练度
    if (player.exp < player.expMax) {
      const techInfo = getTechniqueProficiencyInfo(
        player.getTechniqueProficiency(practiceTarget.value.name)
      )
      const realmBase = getRealmPracticeExpBase(player.realmState)
      const gradeMult = getTechniqueGradeExpMult(activeTech.value?.grade || '黄阶下品')
      const gain =
        Math.round(
          rollPracticeGain(speed.total) * realmBase * gradeMult * (1 + techInfo.expGainBonus) * 10
        ) / 10
      if (gain > 0) {
        const before = player.exp
        player.addExp(gain)
        const actual = Math.round((player.exp - before) * 10) / 10
        if (actual > 0) {
          sessionGain.value = Math.round((sessionGain.value + actual) * 10) / 10
        }
      }
    }
    const profGain = rollTechniqueProficiencyGain(speed.total)
    if (profGain > 0) {
      const result = player.addTechniqueProficiency(practiceTarget.value.name, profGain)
      sessionTechProfGain.value = Math.round((sessionTechProfGain.value + result.gain) * 10) / 10
      sect.applyTechniqueProficiency(player.techniqueProficiency)
      if (result.tierUp) {
        toast(`《${practiceTarget.value.name}》熟练度进境：${result.name}`)
      }
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
  sessionTechProfGain.value = 0
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
  const spellProf = sessionProfText.value
  const techProf = sessionTechProfText.value
  const wasTech = practiceTarget.value?.kind === 'tech'
  practiceTarget.value = null
  countdown.value = 5
  clearTimers()
  player.persist()
  if (reason) {
    toast(
      reason
        .replace('{gain}', gained)
        .replace('{prof}', wasTech ? techProf : spellProf)
        .replace('{techProf}', techProf)
    )
  }
}

function togglePracticeTech() {
  if (!activeTech.value) return toast('尚未选定功法')
  if (isPracticingTech.value) {
    stopPractice('已停止修炼功法 · 修为 +{gain} · 熟练 +{techProf}')
    return
  }
  if (practicingSpell.value) {
    return toast('正在演练法术，请先停止后再修炼功法')
  }
  if (practicingDual.value) {
    return toast('正在双修，请先停止后再修炼功法')
  }
  const startTip =
    player.exp >= player.expMax
      ? `开始修炼《${activeTech.value.name}》· 修为已满，仅增熟练度`
      : `开始修炼《${activeTech.value.name}》· 吐纳增修为与熟练度`
  startPractice({ kind: 'tech', name: activeTech.value.name }, startTip)
}

function togglePracticeSpell(name: string) {
  if (isPracticingSpell(name)) {
    stopPractice(`已停止演练《${name}》· 熟练 +{prof}`)
    return
  }
  if (practicingTech.value) {
    return toast('正在修炼功法，请先停止后再演练法术')
  }
  if (practicingDual.value) {
    return toast('正在双修，请先停止后再演练法术')
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

function togglePracticeDual() {
  const partner = dualPartner.value
  if (!partner) return toast('尚未邀请双修对象')
  if (practicingDual.value) {
    stopPractice(`已停止与${partner.name}双修 · 修为 +{gain}`)
    return
  }
  if (practicingTech.value) {
    return toast('正在修炼功法，请先停止后再双修')
  }
  if (practicingSpell.value) {
    return toast('正在演练法术，请先停止后再双修')
  }
  const intimacy = player.getIntimacy(partner.id, partner.attitude)
  if (intimacy < DUAL_CULTIVATION_INTIMACY_MIN) {
    player.clearDualPartner()
    player.persist()
    return toast(`亲密不足 ${DUAL_CULTIVATION_INTIMACY_MIN}，对方已离开洞府`)
  }
  if (player.exp >= player.expMax) {
    return toast('本层修为已满，双修暂无收益')
  }
  startPractice(
    { kind: 'dual', name: partner.name },
    `开始与${partner.name}双修 · 每 5 秒沉淀修为`
  )
}

function onClearDual() {
  if (practicingDual.value) return toast('双修中，请先停止')
  const name = dualPartner.value?.name || '对方'
  player.clearDualPartner()
  player.persist()
  toast(`已请${name}回`)
}

async function onBreakthrough() {
  if (practicing.value) return toast('修炼中，请先停止')
  if (!player.nextRealm) {
    toast('已是飞升大圆满')
    return
  }
  if (!player.canBreakthrough) {
    toast('修为未满，暂不可突破')
    return
  }
  const preview = player.getBreakthroughPreview()
  if (!preview) return
  const pillLine = preview.pillName
    ? preview.hasPill
      ? `\n将服用${preview.pillName}（成败均消耗）`
      : `\n未备${preview.pillName}，成功率较低`
    : ''
  const res = await Taro.showModal({
    title: preview.isMajor ? '大境界突破' : '小境界突破',
    content: `${preview.fromLabel} → ${preview.toLabel}\n成功率 ${preview.rate}%${pillLine}\n失败则修为降至八成`,
    confirmText: '确认突破'
  })
  if (!res.confirm) return
  const beforeRealm = player.realm
  const result = player.breakthrough()
  if (!result) {
    toast('突破未生效，请重试')
    return
  }
  if (result.ok) {
    sessionGain.value = 0
    const pillTip = result.usedPill ? ` · 已服${result.usedPill}` : ''
    toast(`突破成功：${beforeRealm} → ${result.realm} · 本层修为归零重计${pillTip}`)
  } else {
    const pillTip = result.usedPill ? ` · 已服${result.usedPill}` : ''
    toast(`突破失败，仍为${player.realm} · 修为降至 ${formatExp(result.expAfter)}${pillTip}`)
  }
}

function goTech() {
  if (practicing.value) return toast('修炼中，请先停止')
  Taro.navigateTo({ url: '/pages/sect/technique' })
}

/** 仅退出洞府（卸载页面）或手动停止时结束；页面短暂隐藏不中断 */
useUnload(() => {
  stopPractice()
})

onBeforeUnmount(() => {
  stopPractice()
})
</script>

<style lang="scss">
.content { padding: 0 16px 20px; }
.injury-panel {
  border-color: rgba(224, 92, 106, 0.4);
  background: rgba(224, 92, 106, 0.08);
}
.injury-panel__row {
  display: flex;
  align-items: center;
  gap: 12px;
}
.injury-panel__text {
  flex: 1;
  min-width: 0;
}
.injury-panel__title {
  display: block;
  font-size: 14px;
  font-weight: 700;
  color: var(--hp);
}
.injury-panel__desc {
  display: block;
  margin-top: 4px;
  font-size: 11px;
  color: var(--text-secondary);
  line-height: 1.4;
}
.title { display: block; font-size: 16px; font-weight: 700; }
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
.cultivate--ready {
  border-color: rgba(217, 179, 108, 0.5);
  background: rgba(217, 179, 108, 0.1);
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
  margin-left: 4px;
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
  margin-top: 2px;
  font-size: 11px;
  color: var(--text-secondary);
}
.break-card {
  margin-top: 12px;
  padding: 12px;
  border-radius: 12px;
  background: rgba(217, 179, 108, 0.1);
  border: 1px solid rgba(217, 179, 108, 0.28);
  display: flex;
  align-items: center;
  gap: 12px;
}
.break-card__info {
  flex: 1;
  min-width: 0;
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
.break-card__rate {
  display: block;
  margin-top: 6px;
  font-size: 12px;
  font-weight: 600;
  color: var(--jade);
}
.break-card__btn {
  flex-shrink: 0;
}
.break-hint {
  margin-top: 12px;
  font-size: 11px;
  color: var(--text-muted);
  line-height: 1.45;
}
.inline {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
  min-height: 16px;
}
.practice-row {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 0;
  border-bottom: 1px solid rgba(46, 59, 89, 0.35);
}
.practice-row:last-child {
  border-bottom: none;
}
.practice-row__body {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 1px;
  min-height: 42px;
}
.dual-actions {
  display: flex;
  flex-direction: column;
  gap: 6px;
  flex-shrink: 0;
}
.practice-row__title {
  font-size: 13px;
  color: var(--text-primary);
  font-weight: 500;
  line-height: 1.2;
}
.practice-row__meta {
  display: block;
  font-size: 10px;
  color: var(--text-muted);
  line-height: 1.2;
}
.practice-row__progress {
  display: block;
  font-size: 10px;
  color: var(--jade);
  line-height: 1.2;
}
/* 图标与右侧三行文案等高齐平 */
.practice-row .technique-icon,
.practice-row .spell-icon {
  width: 42px;
  height: 42px;
  border-radius: 8px;
}
.practice-row--dim {
  opacity: 0.5;
}
.empty-tip {
  padding: 12px 4px;
  text-align: center;
  font-size: 12px;
  color: var(--text-muted);
}
.hint-line {
  margin-top: 6px;
  font-size: 11px;
  color: var(--text-muted);
}
</style>
