<template>
  <view class="page page--sub">
    <PageHeader title="图鉴" subtitle="收录文字修仙全部设定" show-back />
    <SegmentTabs :model-value="codex.tab" :items="tabs" @update:model-value="onTab" />

    <view class="content">
      <view class="panel">
        <view class="section-title">
          <text class="section-title__main">{{ codex.tab }}图鉴</text>
          <text class="section-title__sub">{{ codex.progressText }}</text>
        </view>
        <view class="codex-grid">
          <view
            v-for="item in codex.currentList"
            :key="item.id"
            class="codex-cell"
            :class="{ 'codex-cell--locked': !item.unlocked }"
            @tap="openDetail(item)"
          >
            <view class="codex-cell__art">
              <OreIcon v-if="codex.tab === '矿石'" :name="item.name" size="lg" />
              <HerbIcon v-else-if="codex.tab === '药材'" :name="item.name" size="lg" />
              <PillIcon v-else-if="codex.tab === '丹药'" :name="item.name" size="lg" />
              <TreasureIcon
                v-else-if="codex.tab === '法宝'"
                :name="item.name"
                :type="item.origin"
                size="lg"
              />
              <TechniqueIcon v-else-if="codex.tab === '功法'" :name="item.name" size="lg" />
              <PortraitAvatar v-else-if="codex.tab === '人物'" :name="item.name" size="lg" />
              <PetIcon
                v-else-if="codex.tab === '灵兽' && item.icon !== 'beast'"
                :name="item.name"
                size="lg"
              />
              <BeastIcon
                v-else-if="codex.tab === '灵兽'"
                :name="item.name"
                size="lg"
              />
              <view v-else class="codex-glyph" :class="`tone-${tabTone}`">
                {{ glyphOf(item.name) }}
              </view>
            </view>
            <text class="codex-cell__name">{{ item.unlocked ? item.name : '？？？' }}</text>
          </view>
        </view>
      </view>
    </view>

    <view v-if="active" class="codex-mask" @tap="closeDetail">
      <view class="codex-sheet" @tap.stop>
        <view class="codex-sheet__head">
          <view class="codex-sheet__art">
            <OreIcon v-if="codex.tab === '矿石'" :name="active.name" size="lg" />
            <HerbIcon v-else-if="codex.tab === '药材'" :name="active.name" size="lg" />
            <PillIcon v-else-if="codex.tab === '丹药'" :name="active.name" size="lg" />
            <TreasureIcon
              v-else-if="codex.tab === '法宝'"
              :name="active.name"
              :type="active.origin"
              size="lg"
            />
            <TechniqueIcon v-else-if="codex.tab === '功法'" :name="active.name" size="lg" />
            <PortraitAvatar v-else-if="codex.tab === '人物'" :name="active.name" size="lg" />
            <PetIcon
              v-else-if="codex.tab === '灵兽' && active.icon !== 'beast'"
              :name="active.name"
              size="lg"
            />
            <BeastIcon
              v-else-if="codex.tab === '灵兽'"
              :name="active.name"
              size="lg"
            />
            <view v-else class="codex-glyph codex-glyph--xl" :class="`tone-${tabTone}`">
              {{ glyphOf(active.name) }}
            </view>
          </view>
          <view class="codex-sheet__meta">
            <text class="codex-sheet__name">{{ active.unlocked ? active.name : '未收录' }}</text>
            <text class="codex-sheet__tab">
              {{ codex.tab }}{{ active.origin ? ` · ${active.origin}` : '' }}
            </text>
          </view>
        </view>
        <text class="codex-sheet__detail">
          {{ active.unlocked ? active.detail : '尚未收录，获取后方可查看详情。' }}
        </text>
        <view class="btn btn--ghost codex-sheet__close" @tap="closeDetail">关闭</view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import BeastIcon from '../../components/BeastIcon.vue'
import HerbIcon from '../../components/HerbIcon.vue'
import OreIcon from '../../components/OreIcon.vue'
import PetIcon from '../../components/PetIcon.vue'
import PillIcon from '../../components/PillIcon.vue'
import PortraitAvatar from '../../components/PortraitAvatar.vue'
import TreasureIcon from '../../components/TreasureIcon.vue'
import TechniqueIcon from '../../components/TechniqueIcon.vue'
import PageHeader from '../../components/PageHeader.vue'
import SegmentTabs from '../../components/SegmentTabs.vue'
import { CODEX_TABS, useCodexStore, type CodexEntry, type CodexTab } from '../../stores/codex'

const codex = useCodexStore()
const tabs = CODEX_TABS
const active = ref<CodexEntry | null>(null)

const tabTone = computed(() => {
  const map: Record<CodexTab, string> = {
    灵兽: 'jade',
    法宝: 'gold',
    功法: 'mp',
    法术: 'hp',
    丹药: 'hp',
    药材: 'jade',
    矿石: 'mp',
    材料: 'gold',
    人物: 'gold'
  }
  return map[codex.tab] || 'jade'
})

function glyphOf(name: string) {
  return name.slice(0, 1) || '？'
}

function onTab(value: string) {
  active.value = null
  codex.setTab(value as CodexTab)
}

function openDetail(item: CodexEntry) {
  active.value = item
}

function closeDetail() {
  active.value = null
}
</script>

<style lang="scss">
.content {
  padding-bottom: 20px;
}

.codex-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
}

.codex-cell {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  padding: 10px 6px 8px;
  background: var(--panel-2);
  border: 1px solid var(--border-soft);
  border-radius: 10px;
  box-shadow: var(--shadow-panel);
}

.codex-cell__art {
  width: 56px;
  height: 56px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.codex-cell__name {
  width: 100%;
  text-align: center;
  font-size: 11px;
  color: var(--text-primary);
  font-weight: 600;
  line-height: 1.3;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.codex-cell--locked {
  opacity: 0.62;
}

.codex-cell--locked .codex-cell__name {
  color: var(--text-muted);
}

.codex-glyph {
  width: 56px;
  height: 56px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 22px;
  font-weight: 700;
  color: var(--text-primary);
  background: radial-gradient(circle at 50% 35%, var(--panel-2) 0%, var(--bg) 75%);
  border: 1px solid var(--border-soft);
}

.codex-glyph--xl {
  width: 64px;
  height: 64px;
  font-size: 26px;
}

.codex-glyph.tone-jade {
  color: var(--jade);
  box-shadow: inset 0 0 0 1px rgba(91, 200, 168, 0.18);
}

.codex-glyph.tone-gold {
  color: var(--gold);
  box-shadow: inset 0 0 0 1px rgba(217, 179, 108, 0.2);
}

.codex-glyph.tone-mp {
  color: var(--mp);
  box-shadow: inset 0 0 0 1px rgba(111, 168, 220, 0.2);
}

.codex-glyph.tone-hp {
  color: var(--hp);
  box-shadow: inset 0 0 0 1px rgba(224, 123, 108, 0.2);
}

.codex-mask {
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

.codex-sheet {
  width: 100%;
  max-width: 390px;
  background: var(--panel);
  border: 1px solid var(--border-soft);
  border-radius: 16px 16px 12px 12px;
  padding: 16px;
  box-shadow: var(--shadow-panel);
}

.codex-sheet__head {
  display: flex;
  gap: 12px;
  align-items: center;
}

.codex-sheet__art {
  flex-shrink: 0;
}

.codex-sheet__meta {
  flex: 1;
  min-width: 0;
}

.codex-sheet__name {
  display: block;
  font-size: 18px;
  font-weight: 700;
  color: var(--text-primary);
}

.codex-sheet__tab {
  display: block;
  margin-top: 4px;
  font-size: 11px;
  color: var(--text-muted);
  letter-spacing: 0.08em;
}

.codex-sheet__detail {
  display: block;
  margin-top: 14px;
  font-size: 13px;
  line-height: 1.55;
  color: var(--jade);
}

.codex-sheet__close {
  margin-top: 16px;
  width: 100%;
}
</style>
