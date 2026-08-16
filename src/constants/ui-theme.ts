import Taro from '@tarojs/taro'
import type { SectFaction } from './sects'
import { getSectOption } from './sects'

/** UI 主题 id：对应正道 / 魔道 / 妖族三套视觉 */
export type UiThemeId = 'zhengdao' | 'modao' | 'yaozu'

export const UI_THEME_STORAGE_KEY = 'cultivation_ui_theme'

export const UI_THEME_LABEL: Record<UiThemeId, string> = {
  zhengdao: '正道',
  modao: '魔道',
  yaozu: '妖族'
}

/** 派系 → 主题；未入宗默认魔道（当前主视觉） */
export function factionToUiTheme(faction: SectFaction | string | null | undefined): UiThemeId {
  if (faction === '正道') return 'zhengdao'
  if (faction === '妖族') return 'yaozu'
  return 'modao'
}

export function sectIdToUiTheme(sectId: string | null | undefined): UiThemeId {
  const opt = getSectOption(sectId)
  return factionToUiTheme(opt?.faction)
}

export function applyUiTheme(theme: UiThemeId) {
  const id = theme || 'modao'
  try {
    if (typeof document !== 'undefined') {
      document.documentElement.setAttribute('data-theme', id)
      if (document.body) document.body.setAttribute('data-theme', id)
      const app = document.getElementById('app')
      if (app) app.setAttribute('data-theme', id)
    }
  } catch {
    // ignore
  }
  try {
    Taro.setStorageSync(UI_THEME_STORAGE_KEY, id)
  } catch {
    // ignore
  }
}

/** 按宗门 id 应用主题 */
export function applyUiThemeForSect(sectId: string | null | undefined) {
  applyUiTheme(sectIdToUiTheme(sectId))
}

/** 启动时恢复主题（有宗门跟宗门；否则魔道） */
export function restoreUiTheme(sectId?: string | null) {
  if (sectId) {
    applyUiThemeForSect(sectId)
    return
  }
  applyUiTheme('modao')
}
