import { getPillByName, PILL_SHOP_CATALOG, type CatalogPill } from './pill-catalog'
import { PILL_MARKET_RARE_CATALOG, PILL_MARKET_RARE_MECHANICS } from './pill-market-rare'
import type { RealmMajor } from './realm'
import { getRealmMajorIndex } from './treasure'
import type { RootName } from './roots'

/**
 * 丹药效果八大方向（与目录 `type` 一致）
 */
export const PILL_EFFECT_CATEGORIES = [
  '灵根丹',
  '悟性丹',
  '修为丹',
  '聚灵丹',
  '战斗丹',
  '突破丹',
  '保命丹',
  '特殊丹'
] as const

export type PillEffectCategory = (typeof PILL_EFFECT_CATEGORIES)[number]

export const PILL_EFFECT_CATEGORY_DESC: Record<PillEffectCategory, string> = {
  灵根丹: '永久提升角色资质（根骨）',
  悟性丹: '临时提升功法、法术领悟速度',
  修为丹: '直接增加本层修为',
  聚灵丹: '临时提高洞府闭关 / 吐纳收益',
  战斗丹: '服用后临时提高战力倍率（可含疗伤）；非战斗中使用',
  突破丹: '破境时可选择服用，提高成功率',
  保命丹: '身死时自动触发；依丹药效果进入正常或受伤状态',
  特殊丹: '气运、心境、神魂、幻术等特殊玩法（部分待开放）'
}

/** 临时增益槽 */
export type PillBuffKey = 'comprehension' | 'cultivate' | 'battle'

export interface PillBuffState {
  key: PillBuffKey
  /** 叠乘倍率，如 1.2 = +20%；纯点数增益时为 1 */
  mult: number
  /** 悟性等临时加点（与 mult 可并存） */
  flat?: number
  endsAt: number
  source: string
}

export interface PillMechanic {
  category: PillEffectCategory
  /** 永久灵根加点 */
  rootBonus?: number
  /** 加点目标：主灵根（默认）/ 指定 / 五行 */
  rootTargets?: RootName[] | 'primary' | 'wuxing'
  /** 极低概率强化风/冰/雷 */
  rareRootAwakenChance?: number
  /** 直接修为 */
  expGain?: number
  /** 悟性向临时倍率与持续毫秒 */
  comprehensionMult?: number
  /** 悟性临时加点 */
  comprehensionFlat?: number
  comprehensionMs?: number
  /** 闭关/吐纳临时倍率与持续 */
  cultivateMult?: number
  cultivateMs?: number
  /** 战斗战力临时倍率与持续 */
  battleMult?: number
  battleMs?: number
  /** 保命次数（服用后储备） */
  lifesaveCharges?: number
  /** 保命丹：不可背包手动服，身死时自动从背包触发 */
  lifesaveOnly?: boolean
  /** 保命触发后：healthy=正常 · injured=受伤 */
  lifesaveOutcome?: 'healthy' | 'injured'
  /** 可疗伤 */
  healInjury?: boolean
  /** 突破专用：不可手动服用，破境时可选 */
  breakthroughOnly?: boolean
  /** 特殊玩法占位说明 */
  specialHint?: string
}

function hours(n: number) {
  return Math.round(n * 60 * 60 * 1000)
}

function minutes(n: number) {
  return Math.round(n * 60 * 1000)
}

/** 按境界估算一枚修为丹的修为量 */
export function estimatePillExpGain(realm: RealmMajor, base = 200) {
  const idx = Math.max(0, getRealmMajorIndex(realm === '无修为' ? '炼气' : realm))
  return Math.max(50, Math.round(base * (1 + idx * 0.85)))
}

/**
 * 丹药名 → 效果机制（未列出的按目录 type 推断）
 */
export const PILL_MECHANICS: Record<string, PillMechanic> = {
  // —— 灵根丹 ——
  洗髓丹: { category: '灵根丹', rootBonus: 5 },

  // —— 修为丹 ——
  聚气丹: {
    category: '修为丹',
    expGain: 120,
    cultivateMult: 1.2,
    cultivateMs: hours(1)
  },

  // —— 聚灵丹 ——
  紫灵丹: { category: '聚灵丹', cultivateMult: 1.3, cultivateMs: hours(12) },
  天元丹: { category: '聚灵丹', cultivateMult: 1.5, cultivateMs: hours(24) },

  // —— 悟性丹 ——
  太虚悟道丹: { category: '悟性丹', comprehensionMult: 1.5, comprehensionMs: hours(3) },
  万道丹: { category: '悟性丹', comprehensionMult: 1.35, comprehensionMs: hours(6) },
  鸿蒙悟道丹: { category: '悟性丹', comprehensionMult: 1.8, comprehensionMs: hours(8) },

  // —— 战斗丹（含疗伤）——
  回灵丹: { category: '战斗丹', healInjury: true, battleMult: 1.05, battleMs: minutes(30) },
  凝血丹: { category: '战斗丹', healInjury: true, battleMult: 1.05, battleMs: minutes(30) },
  九转回元丹: { category: '战斗丹', healInjury: true, battleMult: 1.12, battleMs: hours(1) },
  金刚丹: { category: '战斗丹', battleMult: 1.2, battleMs: minutes(30) },
  赤阳丹: { category: '战斗丹', battleMult: 1.25, battleMs: hours(1) },
  万灵丹: { category: '战斗丹', battleMult: 1.15, battleMs: hours(2) },
  九转玄丹: { category: '战斗丹', battleMult: 1.25, battleMs: hours(2), healInjury: true },
  混元丹: { category: '战斗丹', battleMult: 1.35, battleMs: hours(2) },
  九天玄丹: { category: '战斗丹', battleMult: 1.5, battleMs: hours(3) },
  阴阳造化丹: { category: '战斗丹', healInjury: true, battleMult: 1.1, battleMs: hours(1) },
  造化神丹: { category: '战斗丹', healInjury: true, battleMult: 1.2, battleMs: hours(2) },
  雷元丹: { category: '战斗丹', battleMult: 1.3, battleMs: hours(2) },

  // —— 突破丹 ——
  筑基丹: { category: '突破丹', breakthroughOnly: true },
  结金丹: { category: '突破丹', breakthroughOnly: true },
  婴灵丹: { category: '突破丹', breakthroughOnly: true },
  化神丹: { category: '突破丹', breakthroughOnly: true },
  合道丹: { category: '突破丹', breakthroughOnly: true },
  大乘丹: { category: '突破丹', breakthroughOnly: true },
  渡劫丹: { category: '突破丹', breakthroughOnly: true },
  飞升丹: { category: '突破丹', breakthroughOnly: true },

  // —— 保命丹（背包不可手动服，身死时自动从背包触发）——
  涅槃丹: { category: '保命丹', lifesaveOnly: true, lifesaveOutcome: 'healthy' },
  逆命丹: { category: '保命丹', lifesaveOnly: true, lifesaveOutcome: 'healthy' },
  九死还魂丹: { category: '保命丹', lifesaveOnly: true, lifesaveOutcome: 'injured' },
  九转轮回丹: { category: '保命丹', lifesaveOnly: true, lifesaveOutcome: 'injured' },

  // —— 特殊丹 ——
  养魂丹: {
    category: '特殊丹',
    specialHint: '神魂稳固，降低心魔侵扰（心境玩法待开放）'
  },
  太阴丹: {
    category: '特殊丹',
    specialHint: '阴属性神魂加持（夜间机缘待开放）'
  },
  九窍养神丹: {
    category: '特殊丹',
    specialHint: '神识增强，利于幻术与神魂交锋（待开放）'
  },
  天魂丹: {
    category: '特殊丹',
    specialHint: '神魂大进，极低概率留存残识（待开放）'
  },
  虚空丹: {
    category: '特殊丹',
    specialHint: '短暂感知空间裂隙（空间玩法待开放）'
  },
  天命丹: {
    category: '特殊丹',
    specialHint: '气运上扬，提高机缘事件概率（气运系统待开放）'
  },
  偷天丹: {
    category: '特殊丹',
    specialHint: '隐匿气息，降低天道锁定（渡劫玩法待开放）'
  },
  九转仙丹: {
    category: '特殊丹',
    specialHint: '重塑肉身神魂，趋向仙体（体质玩法待开放）'
  },
  太初神丹: {
    category: '特殊丹',
    specialHint: '短暂贴近创世感悟（大道玩法待开放）'
  },
  无极道丹: {
    category: '特殊丹',
    specialHint: '冲击大道极限（终局玩法待开放）'
  }
}

function inferFromCatalog(pill: CatalogPill): PillMechanic {
  if (pill.type === '突破丹') {
    return { category: '突破丹', breakthroughOnly: true }
  }
  if (pill.type === '灵根丹') {
    return { category: '灵根丹', rootBonus: 5 }
  }
  if (pill.type === '修为丹') {
    return { category: '修为丹', expGain: 120 }
  }
  if (pill.type === '聚灵丹') {
    return { category: '聚灵丹', cultivateMult: 1.2, cultivateMs: hours(6) }
  }
  if (pill.type === '悟性丹') {
    return { category: '悟性丹', comprehensionMult: 1.3, comprehensionMs: hours(4) }
  }
  if (pill.type === '保命丹') {
    return { category: '保命丹', lifesaveOnly: true, lifesaveOutcome: 'healthy' }
  }
  if (pill.type === '战斗丹') {
    return {
      category: '战斗丹',
      battleMult: 1.1,
      battleMs: hours(1),
      healInjury: /回灵|凝血|回元|造化|玄丹/.test(pill.name)
    }
  }
  return {
    category: '特殊丹',
    specialHint: pill.special || pill.effect || '特殊效果待开放'
  }
}

export function getPillMechanic(pillName: string): PillMechanic | null {
  const rare = PILL_MARKET_RARE_MECHANICS[pillName]
  if (rare) return rare
  const mapped = PILL_MECHANICS[pillName]
  if (mapped) return mapped
  const pill = getPillByName(pillName)
  if (!pill) return null
  return inferFromCatalog(pill)
}

export function getPillEffectCategory(pillName: string): PillEffectCategory | null {
  return getPillMechanic(pillName)?.category || null
}

export function canUsePillManually(pillName: string) {
  const m = getPillMechanic(pillName)
  if (!m) return false
  if (m.breakthroughOnly || m.category === '突破丹') return false
  if (m.lifesaveOnly || m.category === '保命丹') return false
  return true
}

/** 列出背包中的保命丹名（高价优先） */
export function listLifesavePillNames(bagNames: string[]) {
  const ranked = bagNames
    .map((name) => {
      const m = getPillMechanic(name)
      if (!m || m.category !== '保命丹') return null
      const pill = getPillByName(name)
      return { name, price: pill?.price || 0 }
    })
    .filter((item): item is { name: string; price: number } => !!item)
  ranked.sort((a, b) => b.price - a.price)
  return ranked.map((item) => item.name)
}

/** 交手前保命提示一行 */
export function formatLifesavePreviewLine(input: {
  bagNames: string[]
  charges?: number
}) {
  const names = listLifesavePillNames(input.bagNames)
  const charges = Math.max(0, Number(input.charges) || 0)
  if (names.length) {
    const extra = names.length > 1 ? ` 等${names.length}枚` : ''
    return `持有保命丹：${names[0]}${extra}`
  }
  if (charges > 0) return `保命储备 ${charges} 次`
  return '未持保命丹（阵亡不可免）'
}

/** 是否具备疗伤能力（战斗丹等） */
export function pillCanHealInjury(pillName: string) {
  const m = getPillMechanic(pillName)
  if (m?.healInjury) return true
  return /疗伤|凝血|回春|续命|回灵|回血|疗体/.test(pillName || '')
}

export function formatPillBuffRemain(endsAt: number, now = Date.now()) {
  const ms = Math.max(0, endsAt - now)
  if (ms <= 0) return '已失效'
  const totalMin = Math.ceil(ms / 60000)
  if (totalMin < 60) return `约 ${totalMin} 分钟`
  const h = Math.floor(totalMin / 60)
  const m = totalMin % 60
  return m ? `约 ${h} 时 ${m} 分` : `约 ${h} 小时`
}

export function isPillBuffActive(buff: PillBuffState | null | undefined, now = Date.now()) {
  if (!buff || buff.endsAt <= now) return false
  return buff.mult > 1 || (buff.flat ?? 0) > 0
}

export function activePillBuffMult(
  buff: PillBuffState | null | undefined,
  now = Date.now()
) {
  return isPillBuffActive(buff, now) ? Math.max(1, buff!.mult) : 1
}

export function activePillBuffFlat(
  buff: PillBuffState | null | undefined,
  now = Date.now()
) {
  return isPillBuffActive(buff, now) ? Math.max(0, buff!.flat ?? 0) : 0
}

/** 按效果方向汇总目录（文档 / 图鉴） */
export function groupPillsByEffectCategory() {
  const groups: Record<PillEffectCategory, string[]> = {
    灵根丹: [],
    悟性丹: [],
    修为丹: [],
    聚灵丹: [],
    战斗丹: [],
    突破丹: [],
    保命丹: [],
    特殊丹: []
  }
  for (const pill of [...PILL_SHOP_CATALOG, ...PILL_MARKET_RARE_CATALOG]) {
    const cat = getPillEffectCategory(pill.name) || '特殊丹'
    groups[cat].push(pill.name)
  }
  return groups
}
