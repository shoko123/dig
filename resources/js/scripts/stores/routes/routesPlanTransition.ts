// routesPlanTransition.ts
//decide on action needed before transitioning to a new route
import type { RouteLocationNormalized } from 'vue-router'
import type { TPlanResponse } from '../../../types/routesTypes'
import { defineStore } from 'pinia'

export const useRoutesPlanTransitionStore = defineStore('routesPlanTransition', () => {
  function planTransition(
    handle_to: RouteLocationNormalized,
    handle_from: RouteLocationNormalized,
  ): TPlanResponse {
    //console.log(`plan to: ${JSON.stringify(handle_to, null, 2)}\nfrom: ${JSON.stringify(handle_from, null, 2)} `)

    const to = {
      name: handle_to.name,
      url_module: <string>handle_to.params.url_module,
      slug: handle_to.params.slug,
    }
    const from = {
      name: handle_from.name,
      url_module: <string>handle_from.params.url_module,
      slug: handle_from.params.slug,
    }
    if (from.name === undefined) {
      from.name = 'home'
    }
    const changed = { module: false, name: false, slug: false, query: false }

    changed.module = to.url_module !== from.url_module
    changed.name = to.name !== from.name
    changed.slug = to.slug !== from.slug
    changed.query = JSON.stringify(handle_to.query) !== JSON.stringify(handle_from.query)

    //console.log(`changes: ${JSON.stringify(changed, null, 2)}`)

    if (
      ['login', 'register', 'reset-password', 'forgot-password'].includes(<string>to.name) ||
      ['login', 'register', 'reset-password', 'forgot-password'].includes(<string>from.name)
    ) {
      return { success: true, data: [] }
    }

    switch (to.name) {
      case 'home':
        return { success: true, data: ['clear.item', 'clear.collection', 'clear.module'] }

      case 'welcome':
        switch (from.name) {
          case 'home':
            return { success: true, data: ['load.module'] }

          case 'welcome':
            if (changed.module) {
              return { success: true, data: ['load.module', 'clear.item', 'clear.collection'] }
            } else {
              console.log('routes - welcome -> welcome with the same module')
              return { success: true, data: [] }
            }

          case 'filter':
            return {
              success: true,
              data: ['resetIndices.trio'],
            }
          case 'index':
            if (changed.module) {
              return {
                success: true,
                data: ['load.module', 'clear.item', 'clear.collection'],
              }
            } else {
              console.log("routes - 'filter' or 'index' -> 'welcome' with the same module")
              return { success: true, data: [] }
            }

          case 'show':
            if (changed.module) {
              return {
                success: true,
                data: ['clear.item', 'clear.collection', 'clear.module', 'load.module'],
              }
            } else {
              return { success: true, data: ['clear.item'] }
            }

          default:
            return { success: false, message: 'Error: Bad transition.' }
        }
        break

      case 'filter':
        switch (from.name) {
          case 'home':
            return { success: true, data: ['load.module'] }

          case 'index':
            return { success: true, data: ['clear.collection', 'clear.item'] }

          case 'welcome':
          case 'show':
            if (changed.module) {
              return { success: true, data: ['load.module', 'clear.collection', 'clear.item'] }
            } else {
              console.log('routes - filter from the same module')
              return { success: true, data: ['clear.collection', 'clear.item'] }
            }

          default:
            return { success: false, message: 'Error: Bad transition.' }
        }

      case 'index':
        switch (from.name) {
          case 'home':
            return { success: true, data: ['load.module', 'load.collection', 'load.firstPage'] }
          case 'welcome':
            if (changed.module) {
              return { success: true, data: ['load.module', 'load.collection', 'load.firstPage'] }
            } else {
              return { success: true, data: ['load.collection', 'load.firstPage'] }
            }

          case 'filter':
            return { success: true, data: ['load.collection', 'load.firstPage'] }

          case 'show':
            return { success: true, data: ['load.pageByIndex', 'clear.item'] }
          default:
            return { success: false, message: 'Error: Bad transition.' }
        }
        break

      case 'show':
        switch (from.name) {
          case 'show':
            if (changed.module) {
              return {
                success: true,
                data: [
                  'clear.item',
                  'clear.collection',
                  'clear.module',
                  'load.module',
                  'load.itemAndCollection',
                  'setIndex.ItemInMainCollection',
                ],
              }
            }
            if (changed.slug) {
              if (changed.query) {
                return {
                  success: true,
                  data: [
                    'clear.item',
                    'clear.collection',
                    'load.itemAndCollection',
                    'setIndex.ItemInMainCollection',
                  ],
                }
              } else {
                return { success: true, data: ['load.item', 'setIndex.ItemInMainCollection'] }
              }
            }
            return { success: false, message: 'Error: Bad transition.' }

          case 'home':
            return {
              success: true,
              data: ['load.module', 'load.itemAndCollection', 'setIndex.ItemInMainCollection'],
            }

          case 'welcome':
            return {
              success: true,
              data: ['load.itemAndCollection', 'setIndex.ItemInMainCollection'],
            }

          case 'index':
            return { success: true, data: ['load.item', 'setIndex.ItemInMainCollection'] }

          case 'create':
            return { success: true, data: ['load.item', 'setIndex.ItemInMainCollection'] }

          case 'update':
            return { success: true, data: ['load.item'] }

          case 'tag':
            return { success: true, data: ['resetIndices.trio', 'load.item'] }

          case 'media':
            return { success: true, data: [] }
          default:
            return { success: false, message: 'Error: Bad transition.' }
        }
        break

      case 'create':
        switch (from.name) {
          case 'show':
            return { success: true, data: ['prepareFor.create'] }
          default:
            return { success: false, message: 'Error: Bad transition.' }
        }
      case 'update':
        switch (from.name) {
          case 'show':
            return { success: true, data: ['prepareFor.update'] }
          default:
            return { success: false, message: 'Error: Bad transition.' }
        }
      case 'tag':
        switch (from.name) {
          case 'show':
            return { success: true, data: [] }
          default:
            return { success: false, message: 'Error: Bad transition.' }
        }
      case 'media':
        switch (from.name) {
          case 'show':
            return { success: true, data: ['prepareFor.media'] }
          default:
            return { success: false, message: 'Error: Bad transition.' }
        }
      default:
        return { success: false, message: 'Error: Bad transition.' }
    }
  }
  return { planTransition }
})
