<template>
  <view class="page page--sub">
    <PageHeader title="人物" :subtitle="`${sect.name} · 弟子名录`" show-back />
    <view class="content">
      <view class="panel">
        <view class="section-title">
          <text class="section-title__main">宗门人物</text>
          <text class="section-title__sub">共 {{ allCount }} 人</text>
        </view>
        <view class="realm-filter">
          <view
            v-for="tab in groupTabs"
            :key="tab"
            class="realm-chip"
            :class="{ 'realm-chip--active': group === tab }"
            @tap="group = tab"
          >
            {{ tab }}
          </view>
        </view>
        <text class="hint">
          身份：宗主 · 长老 · 执事 · 亲传弟子 · 内门弟子 · 外门弟子 · 杂役弟子
        </text>
      </view>

      <view class="panel">
        <view class="section-title">
          <text class="section-title__main">{{ group === '全部' ? '全部名录' : group }}</text>
          <text class="section-title__sub">{{ displayList.length }} 人</text>
        </view>
        <view v-if="!displayList.length" class="empty-tip">该身份暂无名录人物</view>
        <view v-for="item in displayList" :key="item.id" class="shop-item">
          <view class="shop-item__head">
            <view class="avatar">{{ item.avatar }}</view>
            <view class="row-item__body">
              <view class="inline">
                <text class="row-item__title">{{ item.name }}{{ item.self ? ' · 我' : '' }}</text>
                <text class="tag tag--jade">{{ item.group }}</text>
                <text class="tag tag--gold">{{ item.title }}</text>
              </view>
              <text class="row-item__desc">{{ item.realm }} · 战力 {{ item.power.toLocaleString() }}</text>
              <text v-if="item.personality" class="row-item__desc">性格 · {{ item.personality }}</text>
              <text v-if="item.specialty" class="row-item__desc gold">专长 · {{ item.specialty }}</text>
            </view>
            <view class="btn btn--gold" @tap="visit(item.id)">拜访</view>
          </view>
          <text v-if="item.attitude && !item.self" class="meta-line">对玩家 · {{ item.attitude }}</text>
          <text v-if="item.note && !item.self" class="meta-line muted">{{ item.note }}</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import Taro from '@tarojs/taro'
import PageHeader from '../../components/PageHeader.vue'
import {
  MEMBER_GROUPS,
  memberGroupFromTitle,
  type MemberGroup
} from '../../constants/member-catalog'
import { usePlayerStore } from '../../stores/player'
import { useSectStore, type Member } from '../../stores/sect'

const sect = useSectStore()
const player = usePlayerStore()
const group = ref<(typeof MEMBER_GROUPS)[number]>('全部')
const groupTabs = MEMBER_GROUPS

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
    group: memberGroupFromTitle(rank) as MemberGroup,
    personality: '坚韧',
    specialty: '修行问道',
    note: '',
    attitude: '',
    sectId: (sect.sectId || 'qingyun') as Member['sectId'],
    self: true
  }
})

const allList = computed(() => {
  const list = [...sect.members]
  if (sect.joined) list.push(selfMember.value)
  return list
})

const allCount = computed(() => allList.value.length)

const displayList = computed(() => {
  if (group.value === '全部') return allList.value
  return allList.value.filter((item) => item.group === group.value)
})

function visit(id: string) {
  sect.setVisitTarget(id)
  Taro.navigateTo({ url: '/pages/sect/visit' })
}
</script>

<style lang="scss">
.content { padding: 0 16px 20px; }
.inline { display: flex; align-items: center; gap: 6px; flex-wrap: wrap; }
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
.hint {
  display: block;
  margin-top: 10px;
  font-size: 11px;
  color: var(--text-muted);
  line-height: 1.5;
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
.meta-line {
  display: block;
  margin-top: 6px;
  padding-left: 50px;
  font-size: 11px;
  color: var(--text-secondary);
}
.meta-line.muted { color: var(--text-muted); }
.gold { color: var(--gold); }
.empty-tip {
  padding: 12px 4px;
  text-align: center;
  font-size: 12px;
  color: var(--text-muted);
}
</style>
