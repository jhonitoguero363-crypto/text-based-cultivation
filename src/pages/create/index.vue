<template>
  <view class="page page--sub create-page">
    <view class="safe-top" />
    <view class="create-hero">
      <text class="create-hero__brand">青云修仙</text>
      <text class="create-hero__title">铸就道基</text>
      <text class="create-hero__desc">写下道号，选定阴阳，叩开仙门</text>
    </view>

    <view class="content">
      <view class="panel">
        <view class="field">
          <text class="field__label">角色名称</text>
          <input
            class="field__input"
            :value="formName"
            maxlength="8"
            placeholder="请输入道号，最多 8 字"
            @input="onNameInput"
          />
        </view>

        <view class="field">
          <text class="field__label">性别</text>
          <view class="gender-row">
            <view
              class="gender-card"
              :class="{ 'gender-card--active': gender === '男' }"
              @tap="gender = '男'"
            >
              <PlayerAvatar gender="男" size="lg" />
              <text class="gender-card__name">男</text>
            </view>
            <view
              class="gender-card"
              :class="{ 'gender-card--active': gender === '女' }"
              @tap="gender = '女'"
            >
              <PlayerAvatar gender="女" size="lg" />
              <text class="gender-card__name">女</text>
            </view>
          </view>
        </view>

        <text class="hint">确认后将随机生成金木水火土与风冰雷灵根，以及悟性。冰、风、雷高灵根极为稀有，且默认隐匿，唯当其为最高灵根时方在人物详情中显示。</text>
        <view class="btn btn--gold btn--block" @tap="onConfirm">踏上仙途</view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import Taro, { useDidShow } from '@tarojs/taro'
import PlayerAvatar from '../../components/PlayerAvatar.vue'
import { usePlayerStore, type Gender } from '../../stores/player'

const player = usePlayerStore()
const formName = ref('')
const gender = ref<Gender>('男')

useDidShow(() => {
  player.hydrate()
  if (player.created) {
    Taro.reLaunch({ url: '/pages/character/index' })
  }
})

function onNameInput(e: { detail?: { value?: string } }) {
  formName.value = e.detail?.value || ''
}

function onConfirm() {
  const name = formName.value.trim()
  if (!name) {
    Taro.showToast({ title: '请输入角色名称', icon: 'none' })
    return
  }
  if (name.length < 2) {
    Taro.showToast({ title: '名称至少 2 个字', icon: 'none' })
    return
  }

  player.createCharacter(name, gender.value)
  const primary = player.rootBone
  Taro.showModal({
    title: '灵根已定',
    content: `道号「${player.name}」\n主灵根：${primary}\n悟性：${player.comprehension}\n战力：${player.combatPower}`,
    showCancel: false,
    success: () => {
      Taro.reLaunch({ url: '/pages/character/index' })
    }
  })
}
</script>

<style lang="scss">
.safe-top {
  height: env(safe-area-inset-top);
}

.create-page {
  min-height: 100vh;
  background:
    radial-gradient(ellipse at top, rgba(217, 179, 108, 0.12), transparent 55%),
    var(--bg);
}

.create-hero {
  padding: 36px 24px 16px;
}

.create-hero__brand {
  display: block;
  font-size: 12px;
  letter-spacing: 0.28em;
  color: var(--gold);
}

.create-hero__title {
  display: block;
  margin-top: 8px;
  font-size: 30px;
  font-weight: 700;
  letter-spacing: -0.02em;
  color: var(--text-primary);
  line-height: 1.15;
}

.create-hero__desc {
  display: block;
  margin-top: 8px;
  font-size: 12px;
  color: var(--text-secondary);
  line-height: 1.5;
}

.gender-row {
  display: flex;
  gap: 12px;
}

.gender-card {
  flex: 1;
  min-height: 112px;
  padding: 12px 8px 10px;
  border-radius: 14px;
  border: 1px solid var(--border-soft);
  background: var(--panel-2);
  box-shadow: var(--shadow-panel);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.gender-card--active {
  border-color: rgba(217, 179, 108, 0.55);
  background: linear-gradient(180deg, rgba(217, 179, 108, 0.22), rgba(200, 154, 75, 0.08));
  box-shadow: var(--shadow-panel), 0 0 0 1px rgba(217, 179, 108, 0.18);
}

.gender-card__name {
  font-size: 14px;
  color: var(--text-primary);
}
</style>
