<template>
  <view class="page">
    <!-- 未入宗：首次进入选择宗门 -->
    <template v-if="!player.hasSect">
      <PageHeader title="择宗入门" subtitle="尚未加入宗门 · 请择一脉而入" />
      <view class="content">
        <view class="panel tip-panel">
          <text class="tip-panel__text">宗门一经选定不可更改，请谨慎抉择。</text>
        </view>
        <view
          v-for="item in sectOptions"
          :key="item.id"
          class="panel sect-option"
          @tap="onChoose(item)"
        >
          <view class="sect-option__head">
            <view class="sect-option__avatar" :class="`tone-${item.tone}`">{{ item.name.slice(0, 1) }}</view>
            <view class="sect-option__info">
              <text class="sect-option__name">{{ item.name }}</text>
              <view class="sect-option__tags">
                <text class="sect-option__tier">{{ item.tier }}</text>
                <text class="sect-option__faction">{{ item.faction }}</text>
                <text class="sect-option__tag" :class="`tone-${item.tone}`">{{ item.tag }}</text>
              </view>
            </view>
            <view class="btn btn--gold sect-option__join">加入</view>
          </view>
          <text class="sect-option__desc">{{ item.desc }}</text>
          <text class="sect-option__base">{{ item.base }}</text>
        </view>
      </view>
    </template>

    <!-- 已入宗：宗门主页 -->
    <template v-else>
      <PageHeader title="宗门" :subtitle="`${player.sect} · ${player.rank}`">
        <template #right>
          <StoneChip label="贡献" :value="player.contribution" />
        </template>
      </PageHeader>

      <view class="content">
        <view class="panel hero">
          <view class="hero__top">
            <view>
              <text class="hero__name">{{ sect.name }}</text>
              <text class="hero__desc">{{ sect.faction }} · {{ sect.tag }} · {{ sect.base }}</text>
            </view>
            <view class="tier-badge">{{ sect.tier }}</view>
          </view>
          <text class="hero__intro">{{ sect.desc }}</text>
          <text class="hero__stipend">{{ stipendHint }}</text>
          <text class="hero__theme">界面风格 · {{ themeLabel }}</text>
        </view>

        <view class="panel">
          <view class="facility-grid">
            <view
              v-for="item in sect.facilities"
              :key="item.key"
              class="facility-card"
              :class="`facility-card--${facilityTone(item.key)}`"
              @tap="go(item.path)"
            >
              <view class="facility-card__glyph">
                <FacilityIcon :name="item.key" />
              </view>
              <text class="facility-card__name">{{ item.name }}</text>
              <text class="facility-card__desc">{{ item.desc }}</text>
            </view>
          </view>
        </view>
      </view>
    </template>

    <AppTabBar current="sect" />
  </view>
</template>

<script setup lang="ts">
import Taro, { useDidShow } from '@tarojs/taro'
import { computed } from 'vue'
import AppTabBar from '../../components/AppTabBar.vue'
import FacilityIcon from '../../components/FacilityIcon.vue'
import PageHeader from '../../components/PageHeader.vue'
import StoneChip from '../../components/StoneChip.vue'
import { SECT_OPTIONS, type SectOption } from '../../constants/sects'
import { formatSectStipendHint } from '../../constants/sect-stipend'
import { sectIdToUiTheme, UI_THEME_LABEL } from '../../constants/ui-theme'
import { usePlayerStore } from '../../stores/player'
import { useSectStore } from '../../stores/sect'

const player = usePlayerStore()
const sect = useSectStore()
const sectOptions = SECT_OPTIONS
const stipendHint = computed(() => formatSectStipendHint(player.rank))
const themeLabel = computed(() => UI_THEME_LABEL[sectIdToUiTheme(player.sectId)])

useDidShow(() => {
  const notice = player.ensureMonthlyStipend()
  if (notice) Taro.showToast({ title: notice, icon: 'none', duration: 2500 })
})

function go(url: string) {
  Taro.navigateTo({ url })
}

const FACILITY_TONE: Record<string, 'jade' | 'gold' | 'mp' | 'hp'> = {
  pill: 'jade',
  forge: 'gold',
  tech: 'mp',
  cave: 'hp',
  mission: 'hp',
  members: 'jade',
  mine: 'gold',
  garden: 'jade',
  cliff: 'hp',
  tower: 'mp',
  beast: 'jade'
}

function facilityTone(key: string) {
  return FACILITY_TONE[key] || 'gold'
}

function onChoose(item: SectOption) {
  Taro.showModal({
    title: `加入${item.name}`,
    content: `${item.tier} · ${item.faction} · ${item.tag}\n${item.desc}\n确认后将以「外门弟子」身份入门。`,
    success: (res) => {
      if (!res.confirm) return
      const result = player.joinSect(item.id, item.name)
      if (!result) {
        Taro.showToast({ title: '你已加入宗门', icon: 'none' })
        return
      }
      const gift =
        result.techniqueName && result.spellName
          ? `获赠《${result.techniqueName}》《${result.spellName}》`
          : '入门成功'
      const stipend =
        result.stipendAmount > 0 ? ` · 月俸灵石 +${result.stipendAmount}` : ''
      Taro.showToast({
        title: `已加入${item.name}，${gift}${stipend}`,
        icon: 'none',
        duration: 2800
      })
      // 入宗时已弹月俸，清空待提示避免再弹一次
      player.ensureMonthlyStipend()
    }
  })
}
</script>

<style lang="scss">
.tip-panel {
  padding: 12px 14px;
}

.tip-panel__text {
  font-size: 12px;
  color: var(--gold);
  line-height: 1.5;
}

.sect-option {
  transition: border-color 0.15s ease, transform 0.15s ease;
}

.sect-option:active {
  transform: scale(0.99);
  border-color: rgba(217, 179, 108, 0.45);
}

.sect-option + .sect-option {
  margin-top: 10px;
}

.sect-option__head {
  display: flex;
  align-items: center;
  gap: 10px;
}

.sect-option__join {
  height: 32px;
  min-width: 58px;
  padding: 0 14px;
  border-radius: 999px;
  font-size: 13px;
  font-weight: 700;
  letter-spacing: 0.08em;
  flex-shrink: 0;
}

.sect-option__avatar {
  width: 44px;
  height: 44px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  font-weight: 700;
  background: var(--panel-2);
  border: 1px solid var(--border-soft);
  box-shadow: var(--shadow-panel);
  flex-shrink: 0;
}

.sect-option__info {
  flex: 1;
  min-width: 0;
}

.sect-option__name {
  display: block;
  font-size: 16px;
  font-weight: 700;
  letter-spacing: -0.01em;
}

.sect-option__tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: 4px;
  align-items: center;
}

.sect-option__tier {
  font-size: 11px;
  color: var(--gold);
  font-weight: 600;
}

.sect-option__faction {
  font-size: 11px;
  color: var(--jade);
  font-weight: 600;
}

.sect-option__tag {
  font-size: 11px;
}

.sect-option__desc {
  display: block;
  margin-top: 8px;
  font-size: 11px;
  color: var(--text-secondary);
  line-height: 1.45;
}

.sect-option__base {
  display: block;
  margin-top: 4px;
  font-size: 10px;
  color: var(--text-muted);
}

.hero__top {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.hero__name {
  display: block;
  font-size: 18px;
  font-weight: 700;
  color: var(--text-primary);
  letter-spacing: -0.01em;
}

.hero__desc {
  display: block;
  margin-top: 4px;
  font-size: 11px;
  color: var(--text-secondary);
}

.hero__intro {
  display: block;
  margin-top: 10px;
  font-size: 12px;
  color: var(--text-secondary);
  line-height: 1.5;
}

.hero__stipend {
  display: block;
  margin-top: 8px;
  font-size: 11px;
  color: var(--gold);
  line-height: 1.45;
}

.hero__theme {
  display: block;
  margin-top: 4px;
  font-size: 10px;
  color: var(--jade);
  line-height: 1.4;
}

.tier-badge {
  flex-shrink: 0;
  padding: 5px 10px;
  border-radius: 8px;
  background: linear-gradient(180deg, #e6c27a, var(--gold-strong));
  color: var(--ink);
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.02em;
  box-shadow: var(--shadow-gold);
  white-space: nowrap;
}

.tone-gold { color: var(--gold); }
.tone-jade { color: var(--jade); }
.tone-mp { color: var(--mp); }
.tone-hp { color: var(--hp); }
</style>
