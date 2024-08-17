// app.js
//Stores data common to the whole app:

import { defineStore, storeToRefs } from 'pinia'
import { computed } from 'vue'
import { useRoutesMainStore } from './routes/routesMain'

export const useMenusStore = defineStore('menus', () => {
  const { current } = storeToRefs(useRoutesMainStore())

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

  return { hasSubMenu, mainMenuType }
})
