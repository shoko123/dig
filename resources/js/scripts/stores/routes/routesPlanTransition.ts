// routesPlanTransition.ts
//decide on action needed before transitioning to a new route
import type { RouteLocationNormalized } from 'vue-router'
import type { TPageName, TPlanResponse } from '../../../types/routesTypes'
import type { TUrlModule } from '@/types/moduleTypes'
import { defineStore } from 'pinia'

export const useRoutesPlanTransitionStore = defineStore('routesPlanTransition', () => {
  function planTransition(
    handle_to: RouteLocationNormalized,
    handle_from: RouteLocationNormalized,
  ): TPlanResponse {
    //console.log(`plan to: ${JSON.stringify(handle_to, null, 2)}\nfrom: ${JSON.stringify(handle_from, null, 2)} `)

    const to = {
      name: handle_to.name as TPageName,
      url_module: handle_to.params.url_module as TUrlModule | undefined,
      slug: handle_to.params.slug as string | undefined,
    }
    const from = {
      name: handle_from.name as TPageName,
      url_module: handle_from.params.url_module as TUrlModule | undefined,
      slug: handle_from.params.slug as string | undefined,
    }

    if (from.name === undefined) {
      from.name = 'undefined-route-name'
    }

    const changed = {
      module: to.url_module !== from.url_module,
      name: to.name !== from.name,
      slug: to.slug !== from.slug,
      query: JSON.stringify(handle_to.query) !== JSON.stringify(handle_from.query),
    }

    //console.log(`changes: ${JSON.stringify(changed, null, 2)}`)

    if (
      ['login', 'register', 'reset-password', 'forgot-password'].includes(to.name as string) ||
      ['login', 'register', 'reset-password', 'forgot-password'].includes(from.name as string)
    ) {
      return { success: true, data: [] }
    }

    switch (from.name) {
      case 'undefined-route-name':
        //////////////////////////
        switch (to.name) {
          case 'home':
            return { success: true, data: [] }
          case 'welcome':
            return { success: true, data: ['load.module'] }

          case 'filter':
            return { success: true, data: ['load.module'] }
          case 'index':
            return { success: true, data: ['load.module', 'load.collection', 'load.firstPage'] }
          case 'show':
            return {
              success: true,
              data: ['load.module', 'load.itemAndCollection'],
            }
          default:
            return badTransition(from.name, to.name)
        }

      case 'home':
        //////////
        switch (to.name) {
          case 'welcome':
            return { success: true, data: ['load.module'] }
          default:
            return badTransition(from.name, to.name)
        }

      case 'welcome':
        /////////////
        switch (to.name) {
          case 'home':
            return { success: true, data: ['clear.module'] }

          case 'welcome':
            if (changed.module) {
              console.log('welcome -> welcome (different module')
              return {
                success: true,
                data: ['resetIndices.trio', 'load.module', 'clear.item', 'clear.collection'],
              }
            } else {
              console.log('routes - welcome -> welcome with the same module')
              return { success: true, data: [] }
            }
          case 'index':
            return { success: true, data: ['load.collection', 'load.firstPage'] }

          case 'filter':
            console.log('welcome -> filter')
            return { success: true, data: [] }

          case 'show':
            return {
              success: true,
              data: ['load.itemAndCollection'],
            }
          default:
            return badTransition(from.name, to.name)
        }

      case 'filter':
        ////////////
        switch (to.name) {
          case 'home':
            return { success: true, data: ['clear.module'] }

          case 'welcome':
            if (changed.module) {
              console.log('filter -> welcome (different module')
              return {
                success: true,
                data: ['resetIndices.trio', 'load.module', 'clear.item', 'clear.collection'],
              }
            } else {
              return { success: true, data: [] }
            }
          case 'index':
            return { success: true, data: ['load.collection', 'load.firstPage'] }

          default:
            return badTransition(from.name, to.name)
        }

      case 'index':
        ///////////
        switch (to.name) {
          case 'home':
            return { success: true, data: ['clear.module'] }

          case 'welcome':
            if (changed.module) {
              console.log('index -> welcome (different module')
              return {
                success: true,
                data: ['resetIndices.trio', 'load.module', 'clear.collection'],
              }
            } else {
              return { success: true, data: ['clear.collection'] }
            }
          case 'filter':
            return { success: true, data: ['clear.collection'] }

          case 'show':
            return { success: true, data: ['load.item', 'setIndex.ItemInMainCollection'] }

          default:
            return badTransition(from.name, to.name)
        }

      case 'show':
        //////////
        switch (to.name) {
          case 'home':
            return { success: true, data: ['clear.module'] }

          case 'welcome':
            if (changed.module) {
              console.log('index -> welcome (different module')
              return {
                success: true,
                data: ['resetIndices.trio', 'clear.item', 'clear.collection'],
              }
            } else {
              return { success: true, data: ['clear.collection'] }
            }
          case 'filter':
            return { success: true, data: ['clear.collection'] }

          case 'index':
            return { success: true, data: ['load.collection', 'load.pageByIndex'] }

          case 'show':
            if (changed.module) {
              console.log('show -> show (different module)')
              return {
                success: true,
                data: ['resetIndices.trio', 'clear.item', 'load.module', 'load.itemAndCollection'],
              }
            } else {
              if (changed.query) {
                console.log('show -> show (same module, different query)')
                return {
                  success: true,
                  data: ['resetIndices.trio', 'load.itemAndCollection'],
                }
              } else {
                console.log('show -> show (same module, same query)')
                return {
                  success: true,
                  data: ['load.item', 'setIndex.ItemInMainCollection'],
                }
              }
            }

          case 'create':
            return { success: true, data: ['prepareFor.create'] }

          case 'update':
            return { success: true, data: ['prepareFor.update'] }

          case 'media':
            return { success: true, data: ['prepareFor.media'] }

          case 'tag':
            return { success: true, data: ['resetIndices.trio', 'prepareFor.tag'] }

          default:
            return badTransition(from.name, to.name)
        }

      case 'create':
        ////////////
        switch (to.name) {
          case 'show':
            return { success: true, data: [] }

          default:
            return badTransition(from.name, to.name)
        }

      case 'update':
        ////////////
        switch (to.name) {
          case 'show':
            return { success: true, data: [] }

          default:
            return badTransition(from.name, to.name)
        }

      case 'media':
        ///////////
        switch (to.name) {
          case 'show':
            return { success: true, data: [] }

          default:
            return badTransition(from.name, to.name)
        }

      case 'tag':
        /////////
        switch (to.name) {
          case 'show':
            return { success: true, data: ['resetIndices.trio'] }

          default:
            return badTransition(from.name, to.name)
        }

      default:
        //////
        return badTransition(from.name, to.name)
    }
  }

  function badTransition(from: TPageName, to: TPageName): { success: false; message: string } {
    return { success: false, message: `*** Bad transition from ${from} to ${to}` }
  }

  return { planTransition }
})
