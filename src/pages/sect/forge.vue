<template>
  <view class="page page--sub">
    <PageHeader title="器阁" subtitle="宗门 · 法宝买卖与打造" show-back />
    <SegmentTabs :model-value="mode" :items="['法宝买卖', '打造法宝']" @update:model-value="mode = $event" />

    <view class="content">
      <template v-if="mode === '打造法宝'">
        <view v-if="!canCraftForge" class="panel">
          <view class="section-title">
            <text class="section-title__main">尚未掌握炼器术</text>
            <text class="section-title__sub">生活法术</text>
          </view>
          <text class="lock-tip">需先在功法阁修习法术「炼器术」，方可打造法宝。</text>
          <view class="btn btn--gold btn--block" style="margin-top: 12px" @tap="goTech">前往功法阁</view>
        </view>

        <template v-else>
        <view class="panel">
          <view class="section-title">
            <text class="section-title__main">自由淬炼</text>
            <text class="section-title__sub">
              炼器术 · {{ forgeSpellLabel }} · 最高 {{ maxGrade }} · 灵石
              {{ player.spiritStones.toLocaleString() }}
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
          <view class="field">
            <text class="field__label">法宝名称</text>
            <input
              class="field__input"
              :value="forgeName"
              maxlength="8"
              placeholder="输入道器之名，2～8 字"
              @input="onNameInput"
            />
          </view>
          <view class="field">
            <text class="field__label">法宝类别</text>
            <view class="mode-filter">
              <view
                v-for="cat in treasureCategories"
                :key="cat"
                class="realm-chip"
                :class="{ 'realm-chip--active': forgeType === cat }"
                @tap="forgeType = cat"
              >
                {{ cat }}
              </view>
            </view>
          </view>
          <text class="hint">
            可投入矿石与历练材料；越多、品阶/境界越高，成品越强。自己炼制失败则投入尽毁，委托失败不发生。
          </text>
        </view>

        <view class="panel">
          <view class="section-title">
            <text class="section-title__main">投入材料</text>
            <text class="section-title__sub">已选 {{ selectedCount }} 种</text>
          </view>
          <view v-if="!bagCraftMats.length" class="empty-tip">
            背包暂无矿石或历练材料，可去矿洞挖掘或秘境击杀妖兽
          </view>
          <view v-for="item in bagCraftMats" :key="`${item.kind}-${item.name}`" class="mat-row">
            <OreIcon v-if="item.kind === '矿石'" :name="item.name" :level="item.level" size="md" />
            <view v-else class="mat-fallback">{{ item.name.slice(0, 1) }}</view>
            <view class="row-item__body">
              <text class="row-item__title">{{ item.name }}</text>
              <text class="row-item__desc">
                {{ item.kind }} · {{ item.level || item.originLabel || '历练' }} · 强度
                {{ item.unitStrength }} · 持有 {{ item.owned }}
              </text>
            </view>
            <view class="qty">
              <view class="qty__btn" @tap="decMat(item.name)">−</view>
              <text class="qty__val">{{ selectedMap[item.name] || 0 }}</text>
              <view class="qty__btn" @tap="incMat(item.name, item.owned)">+</view>
            </view>
          </view>
        </view>

        <view class="panel">
          <view class="section-title">
            <text class="section-title__main">淬炼预估</text>
            <text class="section-title__sub">实际成品仍会随机浮动</text>
          </view>
          <view class="preview-row">
            <text class="preview-label">法宝类别</text>
            <text class="preview-val">{{ forgeType }}</text>
          </view>
          <view class="preview-row">
            <text class="preview-label">材料强度</text>
            <text class="preview-val">{{ preview.strength }}</text>
          </view>
          <view class="preview-row">
            <text class="preview-label">成功率</text>
            <text class="preview-val">{{ successText }}</text>
          </view>
          <view class="preview-row">
            <text class="preview-label">预估品阶</text>
            <text class="preview-val gold">约 {{ preview.gradeHint }}</text>
          </view>
          <view class="preview-row">
            <text class="preview-label">{{ craftMode === 'entrust' ? '委托费' : '灵石消耗' }}</text>
            <text class="preview-val">
              {{ preview.spiritCost > 0 ? preview.spiritCost.toLocaleString() : '无需灵石' }}
            </text>
          </view>
          <view
            class="btn btn--block dig-btn"
            :class="canForge ? 'btn--gold' : 'btn--ghost dig-btn--disabled'"
            @tap="onForge"
          >
            {{ craftMode === 'entrust' ? '委托打造' : '自己打造' }}
          </view>
        </view>
        </template>
      </template>

      <template v-else>
        <view class="panel">
          <view class="section-title">
            <text class="section-title__main">法宝买卖</text>
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
            <text class="section-title__main">{{ shopRealm }}法宝</text>
            <text class="section-title__sub">共 {{ shopList.length }} 件</text>
          </view>
          <view v-for="item in shopList" :key="item.id" class="shop-item">
            <view class="shop-item__head">
            <TreasureIcon :name="item.name" :grade="item.gradeLabel" :type="item.type" size="md" />
              <view class="row-item__body">
                <text class="row-item__title">{{ item.name }}</text>
                <text class="row-item__desc">{{ item.gradeLabel }} · {{ item.type }}</text>
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
            <text class="shop-item__special">特技：{{ item.special }}</text>
            <text class="shop-item__story">{{ item.story }}</text>
            <text v-if="!canBuy(item)" class="shop-item__lock">境界未及 · 需达{{ item.realm }}方可购入</text>
            <text v-else-if="owned(item.name)" class="shop-item__owned">已拥有</text>
          </view>
        </view>

        <view class="panel">
          <view class="section-title">
            <text class="section-title__main">出售法宝</text>
            <text class="section-title__sub">将仓库法宝回售宗门</text>
          </view>
          <view v-if="!treasure.list.length" class="empty-tip">暂无可出售法宝</view>
          <view v-for="item in treasure.list" :key="item.id" class="row-item">
            <TreasureIcon :name="item.name" :grade="item.gradeLabel || item.grade" :type="item.type" size="md" />
            <view class="row-item__body">
              <text class="row-item__title">{{ item.name }}</text>
              <text class="row-item__desc">{{ item.gradeLabel || item.grade }} · {{ item.type }}</text>
            </view>
            <view class="btn btn--ghost" @tap="sell(item.id, item.name)">出售</view>
          </view>
        </view>
      </template>
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed, reactive, ref } from 'vue'
import Taro from '@tarojs/taro'
import OreIcon from '../../components/OreIcon.vue'
import PageHeader from '../../components/PageHeader.vue'
import SegmentTabs from '../../components/SegmentTabs.vue'
import TreasureIcon from '../../components/TreasureIcon.vue'
import {
  CRAFT_MODE_FROM_LABEL,
  CRAFT_MODE_LABELS,
  type CraftMode
} from '../../constants/craft-mode'
import {
  craftTreasureByMaterials,
  getForgeBagKind,
  getMaterialStrength,
  getOreLevelByName,
  previewForge
} from '../../constants/forge-craft'
import { getLootMaterial } from '../../constants/loot-material-catalog'
import { type RealmMajor } from '../../constants/realm'
import { SPELL_FORGE_CRAFT_NAME } from '../../constants/spell-catalog'
import {
  FORGE_SHOP_CATALOG,
  FORGE_SHOP_REALMS,
  type CatalogTreasure
} from '../../constants/treasure-catalog'
import {
  TREASURE_CATEGORIES,
  getMaxTreasureGrade,
  getRealmMajorIndex,
  type TreasureCategory
} from '../../constants/treasure'
import { usePlayerStore } from '../../stores/player'
import { useSectStore } from '../../stores/sect'
import { useTreasureStore } from '../../stores/treasure'

const treasure = useTreasureStore()
const player = usePlayerStore()
const sect = useSectStore()
const mode = ref('法宝买卖')
const craftModeLabel = ref<(typeof CRAFT_MODE_LABELS)[number]>('自己炼制')
const craftModeLabels = CRAFT_MODE_LABELS
const shopRealm = ref<RealmMajor>('炼气')
const realmTabs = FORGE_SHOP_REALMS
const forgeName = ref('')
const forgeType = ref<TreasureCategory>('攻击类')
const treasureCategories = TREASURE_CATEGORIES
const selectedMap = reactive<Record<string, number>>({})

const canCraftForge = computed(() => sect.hasOwnedSpell(SPELL_FORGE_CRAFT_NAME))
const craftMode = computed<CraftMode>(
  () => CRAFT_MODE_FROM_LABEL[craftModeLabel.value] || 'self'
)
const forgeSpellLevel = computed(() => sect.getSpellLevel(SPELL_FORGE_CRAFT_NAME) || 1)
const forgeSpellLabel = computed(() => {
  const spell = sect.spells.find((item) => item.name === SPELL_FORGE_CRAFT_NAME)
  return spell?.proficiencyName || '初窥门径'
})
const craftModeHint = computed(() =>
  craftMode.value === 'entrust'
    ? '委托炼制：缴纳灵石，由器阁长老代铸，必定成功。'
    : `自己炼制：不耗灵石，成功率由炼器术熟练度（${forgeSpellLabel.value}）与预估品阶决定；失败则材料尽毁。`
)
const maxGrade = computed(() => getMaxTreasureGrade(player.realmState))
const shopList = computed(() => FORGE_SHOP_CATALOG.filter((item) => item.realm === shopRealm.value))

const bagCraftMats = computed(() => {
  const list = player.bag
    .filter((item) => (item.category === '矿石' || item.category === '材料') && item.count > 0)
    .map((item) => {
      const kind = item.category === '矿石' ? ('矿石' as const) : ('材料' as const)
      const level = kind === '矿石' ? getOreLevelByName(item.name) : ''
      const loot = kind === '材料' ? getLootMaterial(item.name) : null
      return {
        name: item.name,
        owned: item.count,
        kind,
        level,
        originLabel: loot?.origin || '',
        unitStrength: getMaterialStrength(item.name, level || undefined)
      }
    })
  return list.sort(
    (a, b) => b.unitStrength - a.unitStrength || a.name.localeCompare(b.name, 'zh-CN')
  )
})

const selectedMaterials = computed(() =>
  Object.entries(selectedMap)
    .filter(([, count]) => count > 0)
    .map(([name, count]) => {
      const kind = getForgeBagKind(name)
      const level = kind === '矿石' ? getOreLevelByName(name) : ''
      return {
        name,
        count,
        level: level || undefined,
        kind
      }
    })
)

const selectedCount = computed(() => selectedMaterials.value.length)

const preview = computed(() =>
  previewForge(selectedMaterials.value, player.realmState, {
    mode: craftMode.value,
    spellLevel: forgeSpellLevel.value
  })
)

const successText = computed(() => {
  if (preview.value.strength <= 0) return '—'
  return `${Math.round(preview.value.successRate * 100)}%`
})

const canForge = computed(() => {
  const name = forgeName.value.trim()
  if (name.length < 2 || name.length > 8) return false
  if (!selectedMaterials.value.length) return false
  if (player.spiritStones < preview.value.spiritCost) return false
  return selectedMaterials.value.every(
    (mat) => player.getBagCount(mat.name, mat.kind) >= mat.count
  )
})

function onNameInput(e: { detail?: { value?: string } }) {
  forgeName.value = e.detail?.value || ''
}

function incMat(name: string, owned: number) {
  const cur = selectedMap[name] || 0
  if (cur >= owned) return
  selectedMap[name] = cur + 1
}

function decMat(name: string) {
  const cur = selectedMap[name] || 0
  if (cur <= 0) return
  selectedMap[name] = cur - 1
  if (selectedMap[name] <= 0) delete selectedMap[name]
}

function clearSelection() {
  Object.keys(selectedMap).forEach((key) => {
    delete selectedMap[key]
  })
}

function toast(title: string) {
  Taro.showToast({ title, icon: 'none', duration: 2200 })
}

function owned(name: string) {
  return treasure.list.some((item) => item.name === name)
}

function canBuy(item: CatalogTreasure) {
  return getRealmMajorIndex(player.realmState.major) >= getRealmMajorIndex(item.realm)
}

function goTech() {
  Taro.navigateTo({ url: '/pages/sect/technique' })
}

function onForge() {
  if (!canCraftForge.value) return toast('需先修习法术「炼器术」')
  const name = forgeName.value.trim()
  if (name.length < 2) return toast('请输入法宝名称（至少 2 字）')
  if (!selectedMaterials.value.length) return toast('请投入材料')
  if (owned(name)) return toast('已拥有同名法宝')

  const previewNow = previewForge(selectedMaterials.value, player.realmState, {
    mode: craftMode.value,
    spellLevel: forgeSpellLevel.value
  })
  if (player.spiritStones < previewNow.spiritCost) return toast('灵石不足')

  for (const mat of selectedMaterials.value) {
    if (player.getBagCount(mat.name, mat.kind) < mat.count) return toast(`${mat.name}不足`)
  }

  const cost = previewNow.spiritCost
  if (cost > 0 && !player.spendStones(cost)) return toast('灵石不足')
  for (const mat of selectedMaterials.value) {
    if (!player.removeBagItem(mat.name, mat.kind, mat.count)) {
      if (cost > 0) player.earnStones(cost)
      return toast('材料不足')
    }
  }

  const result = craftTreasureByMaterials({
    name,
    materials: selectedMaterials.value,
    realm: player.realmState,
    mode: craftMode.value,
    spellLevel: forgeSpellLevel.value,
    type: forgeType.value
  })

  if (!result.ok || !result.treasure) {
    player.persist()
    clearSelection()
    return toast(result.reason || '炼器失败')
  }

  treasure.forgeTreasure(result.treasure)
  player.addBagItem(result.treasure.name, '法宝')
  sect.reportMissionProgress('forge_success', 1)
  player.persist()
  clearSelection()
  forgeName.value = ''
  toast(
    craftMode.value === 'entrust'
      ? `委托成功：${result.treasure.gradeLabel}·${result.treasure.type}·${result.treasure.name}`
      : `自炼成功：${result.treasure.gradeLabel}·${result.treasure.type}·${result.treasure.name}`
  )
}

function buy(item: CatalogTreasure) {
  if (!canBuy(item)) return toast(`需达${item.realm}境界方可购入`)
  if (owned(item.name)) return toast('已拥有该法宝')
  if (!player.spendStones(item.price)) return toast('灵石不足')

  treasure.forgeTreasure({
    name: item.name,
    grade: item.grade,
    gradeLabel: item.gradeLabel,
    type: item.type,
    desc: item.effect,
    special: item.special,
    story: item.story,
    cost: item.price
  })
  player.addBagItem(item.name, '法宝')
  player.persist()
  toast(`已购入${item.name}`)
}

function sell(id: string, name: string) {
  const index = treasure.list.findIndex((item) => item.id === id)
  if (index < 0) return
  const refund = 60
  treasure.list.splice(index, 1)
  if (treasure.activeId === id) {
    treasure.activeId = treasure.list[0]?.id || null
  }
  player.earnStones(refund)
  player.persist()
  toast(`已出售${name}，获得 ${refund} 灵石`)
}
</script>

<style lang="scss">
.content { padding: 0 16px 20px; }
.mode-filter {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 10px;
}
.mode-hint {
  display: block;
  margin-top: 10px;
  margin-bottom: 8px;
  font-size: 11px;
  color: var(--text-muted);
  line-height: 1.5;
}
.hint {
  display: block;
  margin-top: 4px;
  font-size: 11px;
  color: var(--text-muted);
  line-height: 1.5;
}
.lock-tip {
  display: block;
  font-size: 13px;
  color: var(--text-secondary);
  line-height: 1.6;
}
.mat-row {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 0;
  border-bottom: 1px solid rgba(46, 59, 89, 0.35);
}
.mat-row:last-child { border-bottom: none; }
.mat-fallback {
  width: 40px;
  height: 40px;
  border-radius: 8px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--icon-well);
  border: 1px solid var(--border-soft);
  color: var(--gold);
  font-size: 14px;
  font-weight: 600;
}
.qty {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
}
.qty__btn {
  width: 28px;
  height: 28px;
  border-radius: 8px;
  background: var(--panel-2);
  border: 1px solid var(--border-soft);
  color: var(--text-primary);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  line-height: 1;
}
.qty__val {
  min-width: 20px;
  text-align: center;
  font-size: 13px;
  color: var(--gold);
  font-weight: 600;
}
.preview-row {
  display: flex;
  justify-content: space-between;
  gap: 10px;
  padding: 8px 0;
  border-bottom: 1px solid rgba(46, 59, 89, 0.35);
}
.preview-row:last-of-type { border-bottom: none; }
.preview-label {
  font-size: 12px;
  color: var(--text-secondary);
}
.preview-val {
  font-size: 12px;
  color: var(--text-primary);
  font-weight: 600;
}
.dig-btn { margin-top: 12px; }
.dig-btn--disabled {
  opacity: 0.55;
  pointer-events: none;
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
.gold { color: var(--gold); }
.empty-tip {
  padding: 12px 4px;
  text-align: center;
  font-size: 12px;
  color: var(--text-muted);
}
</style>
