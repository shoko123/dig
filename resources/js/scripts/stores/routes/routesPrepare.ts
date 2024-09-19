//routesPrepare
//At this point the new route is assured to have a correct form and all
//relevant fields are stored in routesStore.from+.to. Actions needed
//to complete the transition to the new route are stored in TPlanAction[].
//Here we execute the loading of assets (collection, page, item)and other
//activities (e.g. clear, copy current -> new,), before
//proceeding to the new route.

import { ref } from 'vue'
import { defineStore, storeToRefs } from 'pinia'
import type { TPlanAction } from '@/js/types/routesTypes'
import type { TApiFieldsUnion, TApiModuleInit, TModule } from '@/js/types/moduleTypes'
import type { TApiItemShow } from '@/js/types/itemTypes'
import type { LocationQuery } from 'vue-router'
import { useXhrStore } from '../xhr'

import { useCollectionsStore } from '../collections/collections'
import { useElementAndCollectionStore } from '../collections/elementAndCollection'
import { useCollectionMainStore } from '../collections/collectionMain'
import { useModuleStore } from '../module'
import { useNotificationsStore } from '../notifications'
import { useItemStore } from '../item'

import { useRoutesMainStore } from './routesMain'
import { useRoutesParserStore } from './routesParser'
import { TArray } from '@/js/types/collectionTypes'

export const useRoutesPrepareStore = defineStore('routesPrepare', () => {
  const { send } = useXhrStore()
  const n = useNotificationsStore()
  const c = useCollectionsStore()
  const i = useItemStore()
  const r = useRoutesMainStore()
  const { parseSlug, parseUrlQuery } = useRoutesParserStore()

  const { setModuleInfo, tagAndSlugFromId } = useModuleStore()

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
            // const { useTrioStore } = await import('../trio/trio')
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
          c.clear(['main', 'media', 'related'])
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
          c.clear(['media', 'related'])
          break

        case 'item.setIndexInCollection':
          if (!setItemIndexInCollectionMain()) {
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

        case 'item.prepareForUpdate':
          await routesPrepareForNew(module, false)
          break

        case 'item.prepareForCreate':
          await routesPrepareForNew(module, true)

          break

        default:
          console.log(`PrepareForNewRoute() Bad Action: ${x}`)
          return { success: false, message: 'Error: Routing Unexpected error' }
      }
    }
    //console.log(`PrepareForNewRoute() success after completing queue`)
    return { success: true, message: '' }
  }

  async function loadModule(module: TModule): Promise<{ success: boolean; message: string }> {
    const { useTrioStore } = await import('../trio/trio')
    const { setTrio, resetTrio } = useTrioStore()
    resetTrio()

    const res = await send<TApiModuleInit>('module/init', 'post', { module: module })
    if (!res.success) {
      return { success: false, message: `Error: failed to load module ${module}` }
    }
    await setModuleInfo(res.data)
    c.resetCollectionsViewIndex()
    c.clear(['main', 'media', 'related'])
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
    const { array } = storeToRefs(useCollectionMainStore())
    const { useTrioStore } = await import('../trio/trio')
    // const { useFilterStore } = await import('../trio/filter')
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
      array.value = res2.data
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

    const res = await send<TApiItemShow<TApiFieldsUnion>>('module/show', 'post', {
      module,
      id: sp.id,
    })

    if (!res.success) {
      return { success: false, message: res.message }
    }

    // console.log(`loadItem() success! res: ${JSON.stringify(res, null, 2)}`)
    r.to.slug = tagAndSlugFromId(res.data.fields.id, module).slug
    await i.saveitemFieldsPlus(res.data)
    return { success: true, message: '' }
  }

  async function loadPage(firstPage: boolean): Promise<{ success: boolean; message: string }> {
    const info = c.getCollectionStore('main').info
    const res = await c.loadPageByItemIndex(
      'main',
      info.viewName,
      info.itemsPerPage,
      firstPage ? 0 : i.itemIndex,
      <TModule>r.to.module,
    )
    return res
  }

  function setItemIndexInCollectionMain() {
    //console.log(`prepare.setItemIndexInCollectionMain()`)
    const { indexByArrayElement } = useElementAndCollectionStore()

    const itemIndex = indexByArrayElement('main', i.fields!.id)
    if (itemIndex === -1) {
      i.itemIndex = -1
      return false
    } else {
      i.itemIndex = itemIndex
      return true
    }
  }

  async function routesPrepareForNew(module: TModule, isCreate: boolean) {
    const { useItemNewStore } = await import('../itemNew')
    const { prepareForNew } = useItemNewStore()

    console.log(`routesPrepareForNew()`)
    if (isCreate) {
      const res = await send<TArray<'main'>[]>('module/index', 'post', {
        module,
      })
      if (res.success) {
        await prepareForNew(true, res.data)
      } else {
        return { success: false, message: `Error: failed to load current ids` }
      }
    } else {
      await prepareForNew(false)
    }
  }

  function prepareForMedia(): void {
    console.log(`prepareForMedia()`)
  }

  return { prepareForNewRoute }
})
