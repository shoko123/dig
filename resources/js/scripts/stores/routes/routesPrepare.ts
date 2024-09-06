//routesPrepare
//At this point the new route is assured to have a correct form and all
//relevant fields are stored in routesStore.from and .to. Actions needed
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
import { useCollectionMainStore } from '../collections/collectionMain'
import { useCollectionRelatedStore } from '../collections/collectionRelated'
import { useMediaStore } from '../media'
import { useModuleStore } from '../module'
import { useNotificationsStore } from '../notifications'
import { useItemStore } from '../item'

import { useRoutesMainStore } from './routesMain'
import { useRoutesParserStore } from './routesParser'
import { TApiArray } from '@/js/types/collectionTypes'

export const useRoutesPrepareStore = defineStore('routesPrepare', () => {
  const { send } = useXhrStore()
  const n = useNotificationsStore()
  const c = useCollectionsStore()
  const i = useItemStore()
  const r = useRoutesMainStore()
  const { parseSlug, parseUrlQuery } = useRoutesParserStore()

  const { setModuleInfo, tagAndSlugFromId } = useModuleStore()
  const { setItemMedia } = useMediaStore()

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
            //trioReset()
            n.showSpinner('Loading module data ...')
            const res = await loadModule(module)
            n.showSpinner(false)
            if (!res.success) {
              return res
            }
          }
          break

        case 'module.clear':
          // trioReset()
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
          if (!itemSetIndexInCollection()) {
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
    const { setTrio, trioReset } = useTrioStore()
    trioReset()
    console.log(`loadModule ** 1 **`)
    const res = await send<TApiModuleInit>('module/init', 'post', { module: module })
    console.log(`loadModule ** 2 **`)
    if (!res.success) {
      return { success: false, message: `Error: failed to load module ${module}` }
    }
    await setModuleInfo({
      module: res.data.module,
      counts: res.data.counts,
      welcomeText: res.data.welcome_text,
      firstId: res.data.first_id,
    })
    c.resetCollectionsViewIndex()
    i.setItemViewIndex(0)
    i.itemViews = res.data.display_options.item_views
    c.clear(['main', 'media', 'related'])
    console.log(`loadModule ** 3 **`)
    await setTrio(res.data.trio)
    console.log(`loadModule ** 4 **`)
    c.setCollectionViews('main', res.data.display_options.main_collection_views)
    c.setCollectionViews('related', res.data.display_options.related_collection_views)
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
    const { useFilterStore } = await import('../trio/filter')
    const { clearSelectedFilters } = useFilterStore()
    const { apiQueryPayload } = storeToRefs(useFilterStore())

    clearSelectedFilters()
    const resParseUrl = await parseUrlQuery(query)
    console.log(`parseUrlQuery result: ${JSON.stringify(resParseUrl, null, 2)}`)

    if (!resParseUrl.success) {
      console.log(`parseQuery() failed`)
      clearSelectedFilters()
      return { success: false, message: resParseUrl.message! }
    }

    const res2 = await send<TApiArray[]>('module/index', 'post', {
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
    const { array } = storeToRefs(useCollectionRelatedStore())
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
    setItemMedia(res.data.media)
    array.value = res.data.related
    await i.saveitemFieldsPlus(res.data)
    return { success: true, message: '' }
  }

  async function loadPage(firstPage: boolean): Promise<{ success: boolean; message: string }> {
    const res = await c.loadPageByItemIndex(
      'main',
      c.collection('main').value.meta.view,
      firstPage ? 0 : i.itemIndex,
      <TModule>r.to.module,
    )
    return res
  }

  function itemSetIndexInCollection() {
    //console.log(`prepare.itemSetIndexInCollection()`)
    const itemIndex = c.itemIndexById(i.id)
    if (itemIndex === -1) {
      console.log(`Item not found in mainCollection - set itemIndex to -1, clear page`)
      //c.mainPageArray = []
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
      const res = await send<TApiArray[]>('module/index', 'post', {
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
