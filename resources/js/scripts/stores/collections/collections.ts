// collection.ts
//handles all collections and loading of pages
import { computed } from 'vue'
import { defineStore, storeToRefs } from 'pinia'
import type {
  TCollectionName,
  TCollectionMeta,
  TCView,
  TCollectionView,
  TApiArray,
} from '@/js/types/collectionTypes'
import type { TModule } from '@/js/types/moduleTypes'
import { useModuleStore } from '../module'
import { useCollectionMainStore } from './collectionMain'
import { useCollectionMediaStore } from './collectionMedia'
import { useCollectionRelatedStore } from './collectionRelated'

export const useCollectionsStore = defineStore('collections', () => {
  const { getItemsPerPage, getViewName, getCollectionViews } = useModuleStore()
  const { module } = storeToRefs(useModuleStore())

  function getCollectionStore(source: TCollectionName) {
    switch (source) {
      case 'main':
        return useCollectionMainStore()
      case 'media':
        return useCollectionMediaStore()
      case 'related':
        return useCollectionRelatedStore()
    }
  }

  function collectionMeta(name: TCollectionName): TCollectionMeta {
    const c = getCollectionStore(name)
    const arrLength = c.array.length
    const extra = c.extra
    const page = c.page

    //console.log(`collectionMeta("${name}")`)
    const view = extra.views[extra.viewIndex]
    const ipp = c.ipp //getIpp(view)
    const noOfPages = Math.floor(arrLength / ipp) + (arrLength % ipp === 0 ? 0 : 1)

    return {
      views: extra.views, //.map(x => ECollectionViews[x]),
      viewIndex: extra.viewIndex,
      view: view,
      itemsPerPage: ipp,
      pageNoB1: extra.pageNoB1,
      noOfItems: arrLength,
      noOfPages,
      noOfItemsInCurrentPage: page.length,
      firstItemNo: (extra.pageNoB1 - 1) * ipp + 1,
      lastItemNo: (extra.pageNoB1 - 1) * ipp + page.length,
      length: arrLength,
    }
  }

  function getConsumeableCollection(
    name: TCollectionName,
    viewIndex: number,
    pageNoB1: number,
    pageLength: number,
    arrayLength: number,
  ) {
    const itemsPerPage = getItemsPerPage(name, viewIndex) as number
    return {
      views: getCollectionViews(name), //.map(x => ECollectionViews[x]),
      viewIndex,
      view: getViewName(name, viewIndex),
      itemsPerPage,
      pageNoB1,
      noOfItems: arrayLength,
      noOfPages:
        Math.floor(arrayLength / itemsPerPage) + (arrayLength % itemsPerPage === 0 ? 0 : 1),
      noOfItemsInCurrentPage: pageLength,
      firstItemNo: (pageNoB1 - 1) * itemsPerPage + 1,
      lastItemNo: (pageNoB1 - 1) * itemsPerPage + pageLength,
      length: arrayLength,
    }
  }

  async function loadGenericPage(
    name: TCollectionName,
    pageNoB1: number,
    view: TCView,
    module: TModule,
  ) {
    //console.log(`loadPage() source: ${name}  module: ${module} view: ${view} pageB1: ${pageNoB1}  ipp: ${ipp} startIndex: ${start} endIndex: ${start + ipp - 1}`);

    const c = getCollectionStore(name)

    const res = await c.loadPage(pageNoB1, view.name, view.ipp, module)
    return res
  }

  async function loadPageByItemIndex(
    collectionName: TCollectionName,
    view: TCView,
    index: number,
    module: TModule,
  ) {
    const ipp = view.ipp
    const pageNoB0 = Math.floor(index / ipp)
    //console.log(`loadPageByItemIndex() collectionName: ${collectionName} view: ${view} index: ${index} module: ${module}`)
    return await loadGenericPage(collectionName, pageNoB0 + 1, view, module)
  }

  async function toggleCollectionView(name: TCollectionName) {
    const meta = collectionMeta(name)
    const currentView = meta.views[meta.viewIndex]
    const newViewIndex = (meta.viewIndex + 1) % meta.views.length
    const newView = meta.views[newViewIndex]
    const index = meta.firstItemNo - 1
    console.log(
      `toggleCollectionView() collection: ${name}  module: ${module.value} views: ${meta.itemsPerPage}  current view: ${currentView.name}  new view: ${newView.name} index: ${index}`,
    )
    await loadPageByItemIndex(name, newView, index, module.value)
    const c = getCollectionStore(name)
    c.extra.viewIndex = newViewIndex
  }

  function itemIndexById<IDtype extends string | number>(id: IDtype) {
    const c = getCollectionStore('main')
    return c.itemIndexById<IDtype>(id)
  }

  function itemIsInPage<IDtype extends string | number>(id: IDtype) {
    const c = getCollectionStore('main')
    return c.itemIsInPage(id)
  }

  function itemByIndex(name: TCollectionName, index: number): TApiArray<TCollectionName> {
    const c = getCollectionStore(name)
    return c.array[index]
    //return c.itemByIndex(index)
  }

  function next(
    name: TCollectionName,
    index: number,
    isRight: boolean,
  ): { item: TApiArray<TCollectionName>; index: number } {
    const c = getCollectionStore(name)
    const length = c.array.length
    let newIndex

    if (isRight) {
      newIndex = index === length - 1 ? 0 : index + 1
    } else {
      newIndex = index === 0 ? length - 1 : index - 1
    }
    return { item: c.array[newIndex], index: newIndex }
  }

  function clear(collections: TCollectionName[]) {
    collections.forEach((x) => {
      const c = getCollectionStore(<TCollectionName>x)
      return c.clear()
    })
  }

  function setCollectionViews(collection: TCollectionName, views: TCollectionView[]) {
    const c = getCollectionStore(<TCollectionName>collection)
    c.setCollectionViews(views)
  }

  function resetCollectionsViewIndex() {
    ;['main', 'media', 'related'].forEach((x) => {
      const c = getCollectionStore(<TCollectionName>x)
      c.extra.viewIndex = 0
    })
  }

  const mainCollection = computed(() => {
    const c = getCollectionStore('main')
    return {
      array: c.array,
      page: c.page,
      meta: collectionMeta('main'),
    }
  })

  const mediaCollection = computed(() => {
    const c = getCollectionStore('media')
    return {
      array: c.array,
      page: c.page,
      meta: collectionMeta('media'),
    }
  })

  const relatedCollection = computed(() => {
    const c = getCollectionStore('related')
    return {
      array: c.array,
      page: c.page,
      meta: collectionMeta('related'),
    }
  })

  function collection(name: TCollectionName) {
    switch (name) {
      case 'main':
        return mainCollection
      case 'related':
        return relatedCollection
      case 'media':
        return mediaCollection
    }
  }

  // mainCollection, mediaCollection, main and media for debug only.
  //Note : computed collection will only e reactive only if state (main, media) is exposed.
  return {
    collection,
    itemByIndex,
    //setArray,
    loadGenericPage,
    setCollectionViews,
    toggleCollectionView,
    clear,
    resetCollectionsViewIndex,
    itemIndexById,
    loadPageByItemIndex,
    itemIsInPage,
    next,
    getConsumeableCollection,
  }
})
