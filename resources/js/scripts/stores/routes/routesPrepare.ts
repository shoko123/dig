//routesPrepare
//At this point the new route is assured to have a correct form and all
//relevant fields are stored in routesStore.from+.to. Actions needed
//to complete the transition to the new route are stored in TPlanAction[].
//Here we execute the loading of assets (collection, page, item)and other
//activities (e.g. clear, copy current -> new,), before
//proceeding to the new route.

import { ref } from 'vue'
import { defineStore, storeToRefs } from 'pinia'
import type { TPlanAction } from '@/types/routesTypes'
import type { TApiFields, TApiModuleInit, TModule } from '@/types/moduleTypes'
import type { TApiItemShow } from '@/types/itemTypes'
import type { LocationQuery } from 'vue-router'
import type { TArray } from '@/types/collectionTypes'

import { useRoutesMainStore } from './routesMain'
import { useRoutesParserStore } from './routesParser'
import { useXhrStore } from '../xhr'
import { useModuleStore } from '../module'
import { useTrioStore } from '../trio/trio'

import { useNotificationsStore } from '../notifications'
import { useCollectionsStore } from '../collections/collections'
import { useItemStore } from '../item'
import { useElementAndCollectionStore } from '../collections/elementAndCollection'

export const useRoutesPrepareStore = defineStore('routesPrepare', () => {
  const r = useRoutesMainStore()

  const n = useNotificationsStore()
  const c = useCollectionsStore()
  const i = useItemStore()

  const { parseSlug, parseUrlQuery } = useRoutesParserStore()
  const { send } = useXhrStore()
  const { setModuleInfo } = useModuleStore()

  const { indices } = storeToRefs(useElementAndCollectionStore())
  const { setIndexByElement } = useElementAndCollectionStore()

  const fromUndef = ref<boolean>(false)

  async function prepareForNewRoute(
    module: TModule,
    query: LocationQuery,
    slug: string,
    plan: TPlanAction[],
    fromUndefined: boolean,
  ): Promise<{ success: boolean; message: string }> {
    fromUndef.value = fromUndefined
    for (const x of plan) {
      switch (x) {
        case 'module.load':
          {
            n.showSpinner('Loading module data ...')
            const res = await loadModule(module)
            n.showSpinner(false)
            if (!res.success) {
              return res
            }
          }
          break

        case 'module.clear':
          {
            //TODO commented because it forces an unnecessary loading of the trio store on landing page
            // const { resetTrio } = useTrioStore()
            // resetTrio()
          }
          break

        case 'collection.item.load':
          {
            n.showSpinner('Loading collection and item...')
            const res = await loadCollectionAndItem(module, query, slug)
            n.showSpinner(false)
            if (!res.success) {
              return res
            }
          }
          break

        case 'collection.load':
          {
            n.showSpinner(`Loading ${module} collection...`)
            const res = await loadMainCollection(module, query)
            n.showSpinner(false)

            if (!res.success) {
              return res
            }
          }
          break

        case 'collection.clear':
          c.clear(['main'])
          break

        case 'item.load':
          {
            n.showSpinner(`Loading ${module} item...`)
            const res = await loadItem(module, slug)
            n.showSpinner(false)
            if (!res.success) {
              return res
            }
          }
          break

        case 'item.clear':
          i.itemClear()
          break

        case 'item.setIndexInCollection':
          setItemIndexInCollectionMain()
          if (indices.value.Show.index === -1) {
            return { success: false, message: 'Error: Item not found in Collection.' }
          }
          break

        case 'page.load':
          {
            n.showSpinner(`Loading ${module} page...`)
            const res = await loadPage(false)
            n.showSpinner(false)
            if (!res.success) {
              return res
            }
          }
          break

        case 'page.load1':
          {
            n.showSpinner(`Loading ${module} page...`)
            const res = await loadPage(true)
            n.showSpinner(false)
            if (!res.success) {
              return res
            }
          }
          break

        case 'item.prepareForMedia':
          prepareForMedia()
          break

        case 'prepare.for.create':
        case 'prepare.for.update':
          {
            n.showSpinner(`Loading ${module} ids...`)
            const res = await prepareForNewItem(module, x === 'prepare.for.create')
            n.showSpinner(false)
            if (!res.success) {
              return res
            }
          }
          break

        case 'trio.reset.indices':
          await trioResetIndices()
          break

        default:
          console.log(`PrepareForNewRoute() Bad Action: ${x}`)
          return { success: false, message: 'Error: Routing Unexpected error' }
      }
    }
    //console.log(`PrepareForNewRoute() success after completing queue`)
    return { success: true, message: '' }
  }

  async function trioResetIndices() {
    const { resetCategoryAndGroupIndices } = useTrioStore()
    resetCategoryAndGroupIndices()
  }

  async function loadModule(module: TModule): Promise<{ success: boolean; message: string }> {
    const { setTrio, resetTrio } = useTrioStore()
    resetTrio()

    const res = await send<TApiModuleInit>('module/init', 'post', { module: module })
    if (!res.success) {
      return { success: false, message: `Error: failed to load module ${module}` }
    }
    setModuleInfo(res.data)
    c.resetCollectionsViewIndex()
    c.clear(['main'])
    i.itemClear()
    i.setItemViewIndex(0)
    i.itemViews = res.data.display_options.item_views

    await setTrio(res.data.trio)
    return { success: true, message: '' }
  }

  async function loadCollectionAndItem(module: TModule, query: LocationQuery, slug: string) {
    console.log(`prepare.loadCollectionAndItem()`)

    const res = await Promise.all([loadMainCollection(module, query), loadItem(module, slug)])

    for (const x of res) {
      if (!x.success) {
        return x
      }
    }
    return res[0]
  }

  async function loadMainCollection(
    module: TModule,
    query: LocationQuery,
  ): Promise<{ success: boolean; message: string }> {
    const { setCollectionArray } = useCollectionsStore()
    const { clearFilterOptions } = useTrioStore()
    const { apiQueryPayload } = storeToRefs(useTrioStore())

    clearFilterOptions()
    const resParseUrl = await parseUrlQuery(query)
    console.log(`parseUrlQuery result: ${JSON.stringify(resParseUrl, null, 2)}`)

    if (!resParseUrl.success) {
      console.log(`parseQuery() failed`)
      clearFilterOptions()
      return { success: false, message: resParseUrl.message! }
    }

    const res2 = await send<TArray[]>('module/index', 'post', {
      module: module,
      query: apiQueryPayload.value,
    })

    if (res2.success) {
      if (res2.data.length === 0) {
        console.log(`loadMainCollection() err: empty result set`)
        return { success: false, message: 'Error: Empty result set' }
      }
      r.to.queryParams = query
      setCollectionArray('main', res2.data)
      // array.value = res2.data
      return { success: true, message: '' }
    } else {
      console.log(`loadMainCollection() err: ${res2.message}`)
      return { success: false, message: res2.message }
    }
  }

  async function loadItem(
    module: TModule,
    slug: string,
  ): Promise<{ success: boolean; message: string }> {
    console.log(`loadItem() slug: ${slug}`)
    const sp = parseSlug(module, slug)
    if (!sp.success) {
      console.log(`parseSlug() failed`)
      return { success: false, message: sp.message! }
    }

    const res = await send<TApiItemShow<TApiFields>>('module/show', 'post', {
      module,
      id: sp.id,
    })

    if (!res.success) {
      return { success: false, message: res.message }
    }

    // console.log(`loadItem() success! res: ${JSON.stringify(res, null, 2)}`)
    await i.saveitemFieldsPlus(res.data)
    return { success: true, message: '' }
  }

  async function loadPage(firstPage: boolean): Promise<{ success: boolean; message: string }> {
    const info = c.getCollectionStore('main').info
    const res = await c.loadPageByItemIndex(
      'main',
      info.viewName,
      info.itemsPerPage,
      firstPage ? 0 : indices.value.Show.index,
      <TModule>r.to.module,
    )
    return res
  }

  function setItemIndexInCollectionMain() {
    //console.log(`prepare.setItemIndexInCollectionMain()`)

    setIndexByElement('Show', 'main', i.fields.id!)
    // const itemIndex = indexByArrayElement('main', i.fields.id!)
    // if (itemIndex === -1) {
    //   i.itemIndex = -1
    //   return false
    // } else {
    //   i.itemIndex = itemIndex
    //   return true
    // }
  }

  async function prepareForNewItem(module: TModule, isCreate: boolean) {
    const { useItemNewStore } = await import('../itemNew')
    const { prepareForNewItem } = useItemNewStore()
    return await prepareForNewItem(module, isCreate)
  }

  function prepareForMedia(): void {
    console.log(`prepareForMedia()`)
  }

  return { prepareForNewRoute }
})
