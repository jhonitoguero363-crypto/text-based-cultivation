<template>
  <view
    class="facility-icon"
    :style="{ backgroundImage: `url('${src}')` }"
  />
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { FACILITY_ICON_SRC } from '../constants/facility-icons'

const props = defineProps<{
  name: string
}>()

const src = computed(() => FACILITY_ICON_SRC[props.name] || FACILITY_ICON_SRC.members)
</script>

<style lang="scss">
.facility-icon {
  width: 24px;
  height: 24px;
  flex-shrink: 0;
  background-repeat: no-repeat;
  background-position: center center;
  background-size: 24px 24px;
}
</style>
