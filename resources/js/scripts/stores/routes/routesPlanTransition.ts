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
      module: <string>handle_to.params.module,
      slug: handle_to.params.slug,
    }
    const from = {
      name: handle_from.name,
      module: <string>handle_from.params.module,
      slug: handle_from.params.slug,
    }
    if (from.name === undefined) {
      from.name = 'home'
    }
    const changed = { module: false, name: false, slug: false, query: false }

    changed.module = to.module !== from.module
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
        return { success: true, data: ['item.clear', 'collection.clear', 'module.clear'] }

      case 'welcome':
        switch (from.name) {
          case 'home':
            return { success: true, data: ['module.load'] }

          case 'welcome':
            if (changed.module) {
              return { success: true, data: ['module.load', 'item.clear', 'collection.clear'] }
            } else {
              console.log('routes - welcome -> welcome with the same module')
              return { success: true, data: [] }
            }

          case 'filter':
            return {
              success: true,
              data: ['trio.reset.indices'],
            }
          case 'index':
            if (changed.module) {
              return {
                success: true,
                data: ['module.load', 'item.clear', 'collection.clear'],
              }
            } else {
              console.log("routes - 'filter' or 'index' -> 'welcome' with the same module")
              return { success: true, data: [] }
            }

          case 'show':
            if (changed.module) {
              return {
                success: true,
                data: ['item.clear', 'collection.clear', 'module.clear', 'module.load'],
              }
            } else {
              return { success: true, data: ['item.clear'] }
            }

          default:
            return { success: false, message: 'Error: Bad transition.' }
        }
        break

      case 'filter':
        switch (from.name) {
          case 'home':
            return { success: true, data: ['module.load'] }

          case 'index':
            return { success: true, data: ['collection.clear', 'item.clear'] }

          case 'welcome':
          case 'show':
            if (changed.module) {
              return { success: true, data: ['module.load', 'collection.clear', 'item.clear'] }
            } else {
              console.log('routes - filter from the same module')
              return { success: true, data: ['collection.clear', 'item.clear'] }
            }

          default:
            return { success: false, message: 'Error: Bad transition.' }
        }

      case 'index':
        switch (from.name) {
          case 'home':
            return { success: true, data: ['module.load', 'collection.load', 'page.load1'] }
          case 'welcome':
            if (changed.module) {
              return { success: true, data: ['module.load', 'collection.load', 'page.load1'] }
            } else {
              return { success: true, data: ['collection.load', 'page.load1'] }
            }

          case 'filter':
            return { success: true, data: ['collection.load', 'page.load1'] }

          case 'show':
            return { success: true, data: ['page.load', 'item.clear'] }
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
                  'item.clear',
                  'collection.clear',
                  'module.clear',
                  'module.load',
                  'collection.item.load',
                  'item.setIndexInCollection',
                ],
              }
            }
            if (changed.slug) {
              if (changed.query) {
                return {
                  success: true,
                  data: [
                    'item.clear',
                    'collection.clear',
                    'collection.item.load',
                    'item.setIndexInCollection',
                  ],
                }
              } else {
                return { success: true, data: ['item.load', 'item.setIndexInCollection'] }
              }
            }
            return { success: false, message: 'Error: Bad transition.' }

          case 'home':
            return {
              success: true,
              data: ['module.load', 'collection.item.load', 'item.setIndexInCollection'],
            }

          case 'welcome':
            return { success: true, data: ['collection.item.load', 'item.setIndexInCollection'] }

          case 'index':
            return { success: true, data: ['item.load', 'item.setIndexInCollection'] }

          case 'create':
            return { success: true, data: ['item.load', 'item.setIndexInCollection'] }

          case 'update':
            return { success: true, data: ['item.load'] }

          case 'tag':
            return { success: true, data: ['trio.reset.indices', 'item.load'] }

          case 'media':
            return { success: true, data: [] }
          default:
            return { success: false, message: 'Error: Bad transition.' }
        }
        break

      case 'create':
        switch (from.name) {
          case 'show':
            return { success: true, data: ['prepare.for.create'] }
          default:
            return { success: false, message: 'Error: Bad transition.' }
        }
      case 'update':
        switch (from.name) {
          case 'show':
            return { success: true, data: ['prepare.for.update'] }
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
            return { success: true, data: ['item.prepareForMedia'] }
          default:
            return { success: false, message: 'Error: Bad transition.' }
        }
      default:
        return { success: false, message: 'Error: Bad transition.' }
    }
  }
  return { planTransition }
})
