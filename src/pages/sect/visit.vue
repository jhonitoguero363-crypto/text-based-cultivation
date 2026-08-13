<template>
  <view class="page page--sub">
    <PageHeader title="拜访" :subtitle="`${member?.name || ''} · ${member?.title || ''}`" show-back />
    <view class="content" v-if="member">
      <view class="panel">
        <view class="hero">
          <view class="avatar avatar--lg">{{ member.avatar }}</view>
          <view class="hero__body">
            <text class="name">{{ member.name }}{{ member.self ? ' · 我' : '' }}</text>
            <text class="meta">{{ member.title }} · {{ member.realm }}</text>
            <text class="meta">战力 {{ member.power.toLocaleString() }}</text>
            <view v-if="!member.self" class="favor">
              <text class="muted">态度</text>
              <text class="hp">{{ member.attitude || '中立' }}</text>
            </view>
          </view>
        </view>
      </view>

      <view class="panel">
        <view class="section-title">
          <text class="section-title__main">人物情报</text>
          <text class="section-title__sub">性格与专长</text>
        </view>
        <view class="info-row">
          <text class="info-label">性格</text>
          <text class="info-val">{{ member.personality || '未知' }}</text>
        </view>
        <view class="info-row">
          <text class="info-label">专长</text>
          <text class="info-val">{{ member.specialty || '未知' }}</text>
        </view>
        <view v-if="member.note" class="info-row">
          <text class="info-label">隐情</text>
          <text class="info-val jade">{{ member.note }}</text>
        </view>
      </view>

      <view class="panel">
        <view class="section-title">
          <text class="section-title__main">互动</text>
          <text class="section-title__sub">选择与对方的互动方式</text>
        </view>
        <view v-for="action in actions" :key="action.title" class="row-item" @tap="toast(action.title)">
          <view class="row-item__body">
            <text class="row-item__title">{{ action.title }}</text>
            <text class="row-item__desc">{{ action.desc }}</text>
          </view>
          <text class="arrow">›</text>
        </view>
      </view>
    </view>
    <view v-else class="content">
      <view class="panel">
        <view class="empty-tip">未找到该人物</view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import Taro from '@tarojs/taro'
import PageHeader from '../../components/PageHeader.vue'
import { memberGroupFromTitle } from '../../constants/member-catalog'
import { usePlayerStore } from '../../stores/player'
import { useSectStore, type Member } from '../../stores/sect'

const sect = useSectStore()
const player = usePlayerStore()

const selfMember = computed<Member>(() => {
  const rank = player.rank || '外门弟子'
  return {
    id: 'self',
    name: player.name || '散修',
    title: rank,
    realm: player.realm,
    power: player.combatPower,
    avatar: (player.name || '我').slice(0, 1),
    tone: 'jade',
    group: memberGroupFromTitle(rank),
    personality: '坚韧',
    specialty: '修行问道',
    note: '',
    attitude: '',
    sectId: (sect.sectId || 'qingyun') as Member['sectId'],
    self: true
  }
})

const member = computed(() => {
  if (sect.visitTargetId === 'self') return selfMember.value
  return sect.members.find((item) => item.id === sect.visitTargetId) || null
})

const actions = [
  { title: '邀请历练', desc: '结伴探索秘境，共获机缘' },
  { title: '切磋比武', desc: '点到为止，印证所学' },
  { title: '生死比斗', desc: '生死之约，谨慎开启' },
  { title: '赠送物品', desc: '赠予礼物，提升好感' },
  { title: '邀请双修', desc: '双修悟道，互益修为' }
]

function toast(title: string) {
  Taro.showToast({ title, icon: 'none' })
}
</script>

<style lang="scss">
.content { padding: 0 16px 20px; }
.hero { display: flex; gap: 12px; align-items: center; }
.hero__body { flex: 1; }
.name { display: block; font-size: 17px; font-weight: 700; }
.meta { display: block; margin-top: 4px; font-size: 11px; color: var(--text-secondary); }
.favor { display: flex; gap: 6px; margin-top: 8px; align-items: center; font-size: 10px; }
.muted { color: var(--text-muted); }
.hp { color: var(--hp); }
.jade { color: var(--jade); }
.arrow { color: var(--text-muted); font-size: 18px; }
.info-row {
  display: flex;
  gap: 10px;
  padding: 8px 0;
  border-bottom: 1px solid rgba(46, 59, 89, 0.35);
}
.info-row:last-child { border-bottom: none; }
.info-label {
  width: 40px;
  flex-shrink: 0;
  font-size: 12px;
  color: var(--text-secondary);
}
.info-val {
  flex: 1;
  font-size: 12px;
  color: var(--text);
  line-height: 1.4;
}
.empty-tip {
  padding: 16px 4px;
  text-align: center;
  font-size: 12px;
  color: var(--text-muted);
}
</style>
