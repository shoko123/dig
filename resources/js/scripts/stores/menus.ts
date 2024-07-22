// app.js
//Stores data common to the whole app:

import { defineStore, storeToRefs } from 'pinia'
import { computed } from 'vue'
import { useRoutesMainStore } from './routes/routesMain'
import appConfig from '../../scripts/app.config'

export const useMenusStore = defineStore('menus', () => {
  const { current } = storeToRefs(useRoutesMainStore())
  const { appName } = appConfig()
  const hasSubMenu = computed(() => {
    return ![
      'home',
      'register',
      'login',
      'forgot-password',
      'reset-password',
      'create',
      'update',
      'tag',
    ].includes(current.value.name)
  })

  const mainMenuType = computed(() => {
    const routeName = current.value.name
    switch (routeName) {
      case 'home':
      case 'welcome':
      case 'index':
      case 'show':
      case 'filter':
        return 'Read'

      case 'media':
      case 'create':
      case 'update':
      case 'tag':
        return 'Modify'

      case 'register':
      case 'login':
      case 'forgot-password':
      case 'reset-password':
        return 'Auth'

      default:
        return 'Admin'
    }
  })

  const title = computed(() => {
    let pageTxt = ''
    switch (current.value.name) {
      case 'home':
        pageTxt = ''
        break
      case 'show':
        pageTxt = ': Item Details'
        break
      case 'index':
        pageTxt = ': Collection Page'
        break
      case 'welcome':
        pageTxt = ': Welcome Page'
        break
      case 'filter':
        pageTxt = ': Filter Page'
        break
      default:
        pageTxt = `: ${current.value.name} Page`
        break
    }
    return `${appName}${current.value.module === undefined ? `` : `( ${current.value.module} )`}${pageTxt}`
  })
  return { hasSubMenu, mainMenuType, title }
})
