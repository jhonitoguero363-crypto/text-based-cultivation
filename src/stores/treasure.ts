import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import type { TreasureGrade, TreasureSlot } from '../constants/treasure'
import { getTreasureGradeDef, getTreasureSlot } from '../constants/treasure'
import { estimateTreasurePowerBonus } from '../constants/combat-power'
import type { RealmMajor } from '../constants/realm'

export interface Treasure {
  id: string
  name: string
  /** 品阶：法器 / 灵器 / 仙器 / 道器 / 镇界神器 / 先天至宝 */
  grade: TreasureGrade
  /** 展示品阶，如：下品法器、极品灵器 */
  gradeLabel?: string
  /** 攻击类 / 防御类 / 辅助类 / 特殊类 */
  type: string
  desc: string
  special?: string
  story?: string
  equipped: boolean
  slot?: TreasureSlot
  /** 战力加成（旧存档可能仍为 attackBonus） */
  powerBonus?: number
  /** @deprecated 使用 powerBonus */
  attackBonus?: number
  spirit?: number
  level?: number
  refine?: number
}

export function getTreasurePowerBonus(item: Treasure) {
  return item.powerBonus ?? item.attackBonus ?? 0
}

export const useTreasureStore = defineStore('treasure', () => {
  /** 初始无任何法宝 */
  const list = ref<Treasure[]>([])

  const forgeForm = ref({
    name: '',
    materials: '',
    cost: '',
    grade: '法器' as TreasureGrade
  })

  const activeId = ref<string | null>(null)

  const active = computed(() => list.value.find((item) => item.id === activeId.value) || null)

  const equippedCount = () => list.value.filter((item) => item.equipped).length

  function selectTreasure(id: string) {
    if (list.value.some((t) => t.id === id)) activeId.value = id
  }

  function equip(id: string) {
    return equipToSlot(id)
  }

  function unequip(id: string) {
    const item = list.value.find((t) => t.id === id)
    if (item) {
      item.equipped = false
      item.slot = undefined
    }
  }

  function getEquippedInSlot(slot: TreasureSlot) {
    return (
      list.value.find(
        (item) => item.equipped && (item.slot === slot || getTreasureSlot(item.type) === slot)
      ) || null
    )
  }

  /** 某装备位可选法宝（含已装备） */
  function listForSlot(slot: TreasureSlot) {
    return list.value.filter((item) => getTreasureSlot(item.type) === slot)
  }

  /** 装备到指定位；同部位仅一件 */
  function equipToSlot(id: string, slot?: TreasureSlot) {
    const item = list.value.find((t) => t.id === id)
    if (!item) return false
    const targetSlot = slot || getTreasureSlot(item.type)
    if (getTreasureSlot(item.type) !== targetSlot) return false
    for (const other of list.value) {
      if (other.id !== id && other.equipped && getTreasureSlot(other.type) === targetSlot) {
        other.equipped = false
        other.slot = undefined
      }
    }
    item.slot = targetSlot
    item.equipped = true
    activeId.value = id
    return true
  }

  function resetForge() {
    forgeForm.value = { name: '', materials: '', cost: '', grade: '法器' }
  }

  function resetOwned() {
    list.value = []
    activeId.value = null
  }

  function addTreasure(item: Treasure) {
    const next = { ...item }
    if (!(getTreasurePowerBonus(next) > 0)) {
      next.powerBonus = estimateTreasurePowerBonus(next.grade)
    }
    list.value.push(next)
    if (!activeId.value) activeId.value = next.id
  }

  function forgeTreasure(input: {
    name: string
    grade: TreasureGrade
    cost: number
    gradeLabel?: string
    type?: string
    desc?: string
    special?: string
    story?: string
    realm?: RealmMajor
  }) {
    const def = getTreasureGradeDef(input.grade)
    const fromCost = Math.max(2, Math.round(input.cost / 50))
    const fromGrade = estimateTreasurePowerBonus(input.grade, input.realm)
    const bonus = Math.max(fromCost, fromGrade)
    const item: Treasure = {
      id: `t-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      name: input.name,
      grade: input.grade,
      gradeLabel: input.gradeLabel || input.grade,
      type: input.type || '攻击类',
      desc: input.desc || (def ? def.trait : '新打造之法宝'),
      special: input.special,
      story: input.story,
      equipped: false,
      powerBonus: bonus,
      spirit: Math.min(99, 10 + Math.round(input.cost / 80)),
      level: 1,
      refine: 0
    }
    addTreasure(item)
    return item
  }

  /** 旧存档 / 零加成法宝：按品阶补齐 powerBonus */
  function migrateMissingPowerBonuses() {
    let changed = false
    list.value.forEach((item) => {
      if (getTreasurePowerBonus(item) > 0) return
      item.powerBonus = estimateTreasurePowerBonus(item.grade)
      changed = true
    })
    return changed
  }

  const equippedPowerBonus = computed(() =>
    list.value
      .filter((item) => item.equipped)
      .reduce((sum, item) => sum + getTreasurePowerBonus(item), 0)
  )

  return {
    list,
    forgeForm,
    active,
    activeId,
    equippedPowerBonus,
    equippedCount,
    selectTreasure,
    equip,
    unequip,
    getEquippedInSlot,
    listForSlot,
    equipToSlot,
    resetForge,
    resetOwned,
    addTreasure,
    forgeTreasure,
    migrateMissingPowerBonuses
  }
})
