import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type {
  TCollectionExtra,
  TApiArray,
  TItemsPerView,
  TCView,
  TApiPage,
  TPage,
  TCollectionView,
} from '@/js/types/collectionTypes'
import type { TFuncLoadPage } from '@/js/types/routesTypes'
import type { TModule, TApiPageMainTabularUnion } from '@/js/types/moduleTypes'
import { useModuleStore } from '../module'
import { useXhrStore } from '../xhr'
import { useMediaStore } from '../media'

export const useCollectionMainStore = defineStore('collectionMain', () => {
  const { send } = useXhrStore()
  const { buildMedia } = useMediaStore()
  const { tagAndSlugFromId } = useModuleStore()

  const itemsPerView = <TItemsPerView>{ Gallery: 18, Tabular: 20, Chips: 50 }

  const extra = ref<TCollectionExtra>({
    pageNoB1: 1,
    views: <TCView[]>[
      { name: 'Gallery', ipp: 18 },
      { name: 'Tabular', ipp: 50 },
      { name: 'Chips', ipp: 40 },
    ],
    viewIndex: 0,
  })

  const array = ref<TApiArray[]>([])

  const page = ref<TPage<'main', TCollectionView, TModule>[]>([])

  const collection = computed(() => {
    return {
      array: array.value,
      page: page.value, //computedPage.value,
      extra: extra.value,
    }
  })

  const ipp = computed(() => {
    return extra.value.views[extra.value.viewIndex].ipp
  })

  function setCollectionViews(views: TCollectionView[]) {
    extra.value.views = views.map((x) => {
      return { name: x, ipp: itemsPerView[x] }
    })
  }

  const loadPage: TFuncLoadPage = async function (
    pageNoB1: number,
    view: TCollectionView,
    pageLength: number,
    module: TModule,
  ) {
    const start = (pageNoB1 - 1) * pageLength

    console.log(
      `loadPage() c: main v: ${view} pageB1: ${pageNoB1}  length: ${pageLength} startIndex: ${start} endIndex: ${start + pageLength - 1} module: ${module}`,
    )

    //if view is chips, use a slice into the 'main' collection's array
    if (view === 'Chips') {
      extra.value.pageNoB1 = pageNoB1
      const slice = array.value.slice(start, start + pageLength)
      savePage(
        slice,
        // slice.map((x) => {
        //   return { id: x, ...tagAndSlugFromId(module, x) }
        // }),
        view,
        module,
      )
      return { success: true, message: '' }
    }

    //'Gallery' and 'Tabular' views require db access
    const ids = array.value.slice(start, start + pageLength)

    if (ids.length === 0) {
      console.log(`ids.length is 0 - returning`)
      savePage([], view, module)
      return { success: false, message: 'Error: page size 0.' }
    }

    const res = await send<TApiPage<'main', 'Gallery', 'Stone'>[]>('model/page', 'post', {
      module: module,
      view: view,
      ids,
    })
    if (res.success) {
      savePage(res.data, view, module)
      extra.value.pageNoB1 = pageNoB1
      return { success: true, message: '' }
    } else {
      console.log(`loadPage failed. err: ${JSON.stringify(res.message, null, 2)}`)
      return { success: false, message: res.message }
    }
  }

  function savePage<M extends TModule>(
    apiPage: TApiPage<'main', TCollectionView, TModule>[],
    view: TCollectionView,
    module: M,
  ): void {
    let toSave = []
    let typed = []
    //console.log(`savePage view: ${view.name} apiPage: ${JSON.stringify(apiPage, null, 2)}`)
    switch (view) {
      case 'Gallery':
        typed = apiPage as TApiPage<'main', 'Gallery', M>[]
        toSave = typed.map((x) => {
          const media = buildMedia(x.media, module)
          return { ...x, ...tagAndSlugFromId(module, x.id), media }
        })
        page.value = toSave
        break

      case 'Tabular':
        typed = apiPage as TApiPageMainTabularUnion[]
        toSave = typed.map((x) => {
          return { ...x, ...tagAndSlugFromId(module, x.id) }
        })
        page.value = toSave
        break

      case 'Chips':
        typed = apiPage as string[]
        toSave = typed.map((x) => {
          return { id: x, ...tagAndSlugFromId(module, x) }
        })
        page.value = toSave
        break
    }
    //console.log(`mainCollection.savePage() length: ${toSave.length}\npage:\n${JSON.stringify(page.value, null, 2)}`)
  }

  function itemIndexById<IDtype extends string | number>(id: IDtype) {
    const index = array.value.findIndex((x) => x === id)
    //console.log(`collectionMain.itemIndexById(id:${id}) array: ${JSON.stringify(array.value.slice(0,5), null, 2)} index: ${index}`)
    return index
  }

  function itemIsInPage<IDtype extends string | number>(id: IDtype) {
    return page.value.some((x) => (<TPage<'main', 'Gallery'>>x).id === id)
  }

  function removeItemIdFromMainArray(id: string): number {
    const index = array.value.indexOf(id)
    if (index > -1) {
      array.value.splice(index, 1)
    }

    const newArray = array.value.filter((x) => x !== id)
    array.value = newArray
    return newArray.length
  }

  function clear() {
    array.value = []
    page.value = []
    extra.value.pageNoB1 = 1
  }

  return {
    extra,
    ipp,
    array,
    page,
    loadPage,
    itemIndexById,
    setCollectionViews,
    collection,
    itemIsInPage,
    removeItemIdFromMainArray,
    clear,
  }
})
