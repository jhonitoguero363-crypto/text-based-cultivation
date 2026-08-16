<template>
  <view
    class="member-avatar"
    :class="[`member-avatar--${size}`, { 'member-avatar--empty': !src }]"
    :style="src ? { backgroundImage: `url('${src}')` } : undefined"
  >
    <text v-if="!src" class="member-avatar__fallback">{{ fallback }}</text>
  </view>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { getDefaultAvatarUrlByName } from '../constants/default-avatar-src'
import { getMemberIconUrl } from '../constants/member-icon-src'

const props = withDefaults(
  defineProps<{
    name: string
    /** 无图时回退文字，默认取姓名首字 */
    fallbackChar?: string
    size?: 'sm' | 'md' | 'lg'
  }>(),
  { size: 'md' }
)

const src = computed(
  () => getMemberIconUrl(props.name) || getDefaultAvatarUrlByName(props.name)
)
const fallback = computed(
  () => props.fallbackChar || props.name.slice(0, 1) || '人'
)
</script>

<style lang="scss">
.member-avatar {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 12px;
  background-color: #1a2740;
  background-repeat: no-repeat;
  background-position: center center;
  background-size: cover;
  border: 1px solid var(--border-soft);
  overflow: hidden;
  box-sizing: border-box;
  box-shadow: var(--shadow-panel);
}

.member-avatar--sm {
  width: 36px;
  height: 36px;
  border-radius: 10px;
}

.member-avatar--md {
  width: 48px;
  height: 48px;
}

.member-avatar--lg {
  width: 64px;
  height: 64px;
  border-radius: 16px;
}

.member-avatar__fallback {
  font-size: 18px;
  font-weight: 700;
  color: var(--gold);
}

.member-avatar--sm .member-avatar__fallback {
  font-size: 14px;
}

.member-avatar--lg .member-avatar__fallback {
  font-size: 26px;
}
</style>
