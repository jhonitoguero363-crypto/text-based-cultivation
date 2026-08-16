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
            :key="`g-${tab}`"
            class="realm-chip"
            :class="{ 'realm-chip--active': group === tab }"
            @tap="group = tab"
          >
            {{ tab }}
          </view>
        </view>
        <view class="realm-filter realm-filter--second">
          <view
            v-for="tab in divisionTabs"
            :key="`d-${tab}`"
            class="realm-chip"
            :class="{ 'realm-chip--active': division === tab }"
            @tap="division = tab"
          >
            {{ tab }}
          </view>
        </view>
      </view>

      <view class="panel">
        <view class="section-title">
          <text class="section-title__main">{{ listTitle }}</text>
          <text class="section-title__sub">{{ displayList.length }} 人</text>
        </view>
        <view v-if="!displayList.length" class="empty-tip">该筛选下暂无名录人物</view>
        <view v-for="item in displayList" :key="item.id" class="member-row">
          <view class="member-row__face">
            <PlayerAvatar
              v-if="item.self"
              :gender="player.gender"
              :fallback-char="item.avatar"
              size="md"
            />
            <MemberAvatar v-else :name="item.name" :fallback-char="item.avatar" size="md" />
          </view>
          <view class="member-row__body">
            <text class="member-row__name">{{ item.name }}{{ item.self ? ' · 我' : '' }}</text>
            <view class="member-row__tags">
              <text class="tag tag--jade">{{ item.group }}</text>
              <text v-if="item.division && item.division !== '未划分'" class="tag tag--mp">{{ item.division }}</text>
              <text class="tag tag--gold">{{ item.title }}</text>
            </view>
            <text class="member-row__meta">
              {{ item.realm }} · 战力 {{ item.power.toLocaleString() }}
            </text>
            <text v-if="!item.self" class="member-row__intimacy">亲密 {{ intimacyOf(item) }}</text>
          </view>
          <view class="btn btn--gold member-row__btn" @tap="visit(item.id)">拜访</view>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import Taro from '@tarojs/taro'
import PageHeader from '../../components/PageHeader.vue'
import MemberAvatar from '../../components/MemberAvatar.vue'
import PlayerAvatar from '../../components/PlayerAvatar.vue'
import {
  MEMBER_DIVISIONS,
  MEMBER_GROUPS,
  memberGroupFromTitle,
  type MemberDivision,
  type MemberGroup
} from '../../constants/member-catalog'
import { formatIntimacy } from '../../constants/intimacy'
import { useAdventureStore } from '../../stores/adventure'
import { usePlayerStore } from '../../stores/player'
import { useSectStore, type Member } from '../../stores/sect'

const sect = useSectStore()
const player = usePlayerStore()
const group = ref<(typeof MEMBER_GROUPS)[number]>('全部')
const division = ref<(typeof MEMBER_DIVISIONS)[number]>('全部')
const groupTabs = MEMBER_GROUPS
const divisionTabs = MEMBER_DIVISIONS

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
    division: '未划分' as MemberDivision,
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

const listTitle = computed(() => {
  const parts: string[] = []
  if (group.value !== '全部') parts.push(group.value)
  if (division.value !== '全部') parts.push(division.value)
  return parts.length ? parts.join(' · ') : '全部名录'
})

const displayList = computed(() => {
  return allList.value.filter((item) => {
    if (group.value !== '全部' && item.group !== group.value) return false
    if (division.value !== '全部' && item.division !== division.value) return false
    return true
  })
})

function intimacyOf(item: Member) {
  return formatIntimacy(player.getIntimacy(item.id, item.attitude))
}

function visit(id: string) {
  const adventure = useAdventureStore()
  adventure.setVisitNpc(null)
  sect.setVisitTarget(id)
  Taro.navigateTo({ url: '/pages/sect/visit' })
}
</script>

<style lang="scss">
.content { padding: 0 16px 20px; }
.realm-filter {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}
.realm-filter--second {
  margin-top: 8px;
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
.member-row {
  display: flex;
  align-items: stretch;
  gap: 10px;
  padding: 8px 0;
  border-bottom: 1px solid rgba(46, 59, 89, 0.45);
}
.member-row:last-child {
  border-bottom: none;
}
.member-row__face {
  flex-shrink: 0;
  width: 54px;
  align-self: stretch;
  display: flex;
}
.member-row__face .member-avatar,
.member-row__face .player-avatar {
  width: 100%;
  height: 100%;
  min-height: 54px;
  border-radius: 10px;
}
.member-row__body {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 2px;
}
.member-row__name {
  display: block;
  font-size: 13px;
  font-weight: 600;
  color: var(--text-primary);
  line-height: 1.2;
}
.member-row__tags {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 4px;
  line-height: 1.15;
}
.member-row__tags .tag {
  padding: 1px 5px;
  font-size: 9px;
  line-height: 1.2;
}
.member-row__meta {
  display: block;
  font-size: 10px;
  color: var(--text-muted);
  line-height: 1.2;
}
.member-row__intimacy {
  display: block;
  font-size: 10px;
  color: var(--jade);
  line-height: 1.2;
}
.member-row__btn {
  align-self: center;
  flex-shrink: 0;
}
.empty-tip {
  padding: 12px 4px;
  text-align: center;
  font-size: 12px;
  color: var(--text-muted);
}
</style>
