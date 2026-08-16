<template>
  <view class="root-radar">
    <view class="root-radar__row">
      <view :id="hostId" class="root-radar__host" :style="canvasStyle">
        <canvas
          v-if="!isH5"
          :id="canvasId"
          :canvas-id="canvasId"
          type="2d"
          class="root-radar__canvas"
          :style="canvasStyle"
        />
      </view>

      <view v-if="roots.length" class="root-radar__info">
        <view v-for="root in roots" :key="root.name" class="root-radar__item">
          <text class="root-radar__item-name" :class="`tone-${root.color}`">{{ root.name }}</text>
          <text class="root-radar__item-value">{{ root.value }}</text>
          <text class="root-radar__item-grade">{{ root.grade }}</text>
        </view>
      </view>
      <view v-else class="root-radar__info empty-tip">暂无灵根数据</view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, watch } from 'vue'
import Taro, { useReady } from '@tarojs/taro'
import {
  Area,
  Axis,
  Canvas as F2Canvas,
  Chart,
  Line,
  Point,
  createElement as h
} from '@antv/f2'
import type { RootBone } from '../constants/roots'

const props = withDefaults(
  defineProps<{
    roots: RootBone[]
    size?: number
  }>(),
  { size: 148 }
)

const isH5 = process.env.TARO_ENV === 'h5'
const uid = Math.random().toString(36).slice(2, 9)
const hostId = `root-radar-host-${uid}`
const canvasId = `root-radar-${uid}`
const canvasStyle = computed(() => ({
  width: `${props.size}px`,
  height: `${props.size}px`
}))

type F2CanvasInstance = {
  destroy?: () => void
  render?: () => Promise<void> | void
}

let chart: F2CanvasInstance | null = null
let pageReady = false
let h5Canvas: HTMLCanvasElement | null = null

const chartData = computed(() =>
  props.roots.map((item) => ({
    name: item.name,
    value: item.value
  }))
)

function destroyChart() {
  if (chart?.destroy) chart.destroy()
  chart = null
}

function buildChart(
  context: CanvasRenderingContext2D,
  width: number,
  height: number,
  pixelRatio: number
) {
  destroyChart()
  const data = chartData.value
  if (!data.length) return

  const element = h(
    F2Canvas,
    {
      context,
      width,
      height,
      pixelRatio,
      padding: [10, 12, 10, 12]
    },
    h(
      Chart,
      {
        data,
        coord: 'polar',
        scale: {
          value: {
            min: 0,
            max: 100,
            nice: false,
            tickCount: 4
          }
        }
      },
      [
        h(Axis, {
          field: 'name',
          style: {
            label: { fill: '#a6b0c8', fontSize: 10 },
            line: null,
            grid: { stroke: 'rgba(46, 59, 89, 0.85)' }
          }
        }),
        h(Axis, {
          field: 'value',
          style: {
            label: { fill: 'transparent' },
            line: null,
            grid: {
              stroke: 'rgba(217, 179, 108, 0.22)',
              lineDash: [3, 3]
            }
          }
        }),
        h(Area, {
          x: 'name',
          y: 'value',
          color: 'rgba(217, 179, 108, 0.28)'
        }),
        h(Line, {
          x: 'name',
          y: 'value',
          color: '#d9b36c',
          style: { lineWidth: 2 }
        }),
        h(Point, {
          x: 'name',
          y: 'value',
          color: '#d9b36c',
          size: 2.5
        })
      ]
    )
  )

  chart = new F2Canvas(element.props) as F2CanvasInstance
  void chart.render?.()
}

function ensureH5Canvas(): HTMLCanvasElement | null {
  if (typeof document === 'undefined') return null
  const host = document.getElementById(hostId)
  if (!host) return null

  if (h5Canvas && host.contains(h5Canvas) && typeof h5Canvas.getContext === 'function') {
    return h5Canvas
  }

  const existing = host.querySelector('canvas')
  if (existing && typeof (existing as HTMLCanvasElement).getContext === 'function') {
    h5Canvas = existing as HTMLCanvasElement
    return h5Canvas
  }

  const canvas = document.createElement('canvas')
  canvas.className = 'root-radar__canvas'
  canvas.style.display = 'block'
  canvas.style.width = `${props.size}px`
  canvas.style.height = `${props.size}px`
  host.innerHTML = ''
  host.appendChild(canvas)
  h5Canvas = canvas
  return canvas
}

function paintOnCanvas(canvas: HTMLCanvasElement, widthHint?: number, heightHint?: number) {
  if (typeof canvas.getContext !== 'function') return

  const width = Math.max(1, Math.floor(widthHint || canvas.clientWidth || props.size))
  const height = Math.max(1, Math.floor(heightHint || canvas.clientHeight || props.size))
  const pixelRatio = Math.min(Number(Taro.getSystemInfoSync().pixelRatio) || 2, 3)

  canvas.width = width * pixelRatio
  canvas.height = height * pixelRatio
  canvas.style.width = `${width}px`
  canvas.style.height = `${height}px`

  const context = canvas.getContext('2d')
  if (!context) return
  buildChart(context, width, height, pixelRatio)
}

function renderRadarH5() {
  const canvas = ensureH5Canvas()
  if (!canvas) return
  paintOnCanvas(canvas, props.size, props.size)
}

function renderRadarMini() {
  Taro.createSelectorQuery()
    .select(`#${canvasId}`)
    .fields({ node: true, size: true })
    .exec((res) => {
      const result = res?.[0] as
        | { node?: HTMLCanvasElement; width?: number; height?: number }
        | undefined
      const canvas = result?.node
      if (!canvas || typeof canvas.getContext !== 'function') return
      paintOnCanvas(canvas, result.width || props.size, result.height || props.size)
    })
}

function renderRadar() {
  if (!pageReady) return
  if (!props.roots.length) {
    destroyChart()
    return
  }
  if (isH5) renderRadarH5()
  else renderRadarMini()
}

function markReadyAndRender() {
  pageReady = true
  nextTick(() => renderRadar())
}

useReady(markReadyAndRender)
onMounted(markReadyAndRender)

watch(
  () => props.roots.map((item) => `${item.name}:${item.value}`).join('|'),
  () => {
    if (!pageReady) return
    nextTick(() => renderRadar())
  }
)

onBeforeUnmount(() => {
  destroyChart()
  h5Canvas = null
})
</script>

<style lang="scss">
.root-radar {
  width: 100%;
}

.root-radar__row {
  display: flex;
  align-items: stretch;
  gap: 12px;
}

.root-radar__host {
  flex: 0 0 auto;
  width: 148px;
  height: 148px;
  overflow: hidden;
  border-radius: 12px;
  background: linear-gradient(180deg, rgba(217, 179, 108, 0.06), rgba(31, 43, 69, 0.35));
  border: 1px solid rgba(217, 179, 108, 0.18);
}

.root-radar__canvas {
  display: block;
  width: 148px;
  height: 148px;
}

.root-radar__info {
  flex: 1;
  min-width: 0;
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 6px;
  align-content: center;
}

.root-radar__item {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 8px;
  border-radius: 8px;
  background: var(--panel-2);
  border: 1px solid var(--border-soft);
}

.root-radar__item-name {
  width: 1.2em;
  flex-shrink: 0;
  font-size: 13px;
  font-weight: 700;
  line-height: 1;
}

.root-radar__item-value {
  flex: 1;
  min-width: 0;
  font-size: 12px;
  color: var(--text-secondary);
  font-variant-numeric: tabular-nums;
}

.root-radar__item-grade {
  flex-shrink: 0;
  font-size: 10px;
  color: var(--text-muted);
}

.tone-gold { color: var(--gold); }
.tone-jade { color: var(--jade); }
.tone-mp { color: var(--mp); }
.tone-hp { color: var(--hp); }

.empty-tip {
  padding: 10px 4px;
  font-size: 12px;
  color: var(--text-muted);
  text-align: center;
}
</style>
