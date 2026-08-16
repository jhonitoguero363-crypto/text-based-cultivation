import { createApp } from 'vue'
import { createPinia } from 'pinia'
import Taro from '@tarojs/taro'

import './app.scss'
import { restoreUiTheme } from './constants/ui-theme'
import { usePlayerStore } from './stores/player'

const CLIFF_ROUTE = 'pages/sect/cliff'

function ensureCliffLock() {
  try {
    const player = usePlayerStore()
    player.clearCliffIfExpired()
    if (!player.onCliff) return
    const pages = Taro.getCurrentPages()
    const cur = pages[pages.length - 1] as { route?: string } | undefined
    const route = (cur?.route || '').replace(/^\//, '')
    if (route === CLIFF_ROUTE) return
    Taro.reLaunch({ url: '/pages/sect/cliff' })
  } catch {
    /* pinia 未就绪时忽略 */
  }
}

const App = createApp({
  onShow() {
    try {
      const raw = Taro.getStorageSync('cultivation_player_profile')
      restoreUiTheme(raw?.sectId || null)
    } catch {
      restoreUiTheme(null)
    }
    ensureCliffLock()
  }
})

App.use(createPinia())

export default App
