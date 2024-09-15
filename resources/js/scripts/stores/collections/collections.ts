// import { computed } from 'vue'
import { defineStore, storeToRefs } from 'pinia'
import type {
  TCollectionName,
  TCollectionView,
  // TCollectionArrays,
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

  function getConsumeableCollection(
    name: TCollectionName,
    viewIndex: number,
    pageNoB1: number,
    pageLength: number,
    arrayLength: number,
  ) {
    const itemsPerPage = getItemsPerPage(name, viewIndex)
    return {
      views: getCollectionViews(name), //.map(x => ECollectionViews[x]),
      viewIndex,
      viewName: getViewName(name, viewIndex),
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
    viewName: TCollectionView,
    pageLength: number,
    module: TModule,
  ) {
    //console.log(`loadPage() source: ${name}  module: ${module} view: ${view} pageB1: ${pageNoB1}  ipp: ${ipp} startIndex: ${start} endIndex: ${start + ipp - 1}`);

    const c = getCollectionStore(name)

    const res = await c.loadPage(pageNoB1, viewName, pageLength, module)
    return res
  }

  async function loadPageByItemIndex(
    collectionName: TCollectionName,
    viewName: TCollectionView,
    pageLength: number,
    index: number,
    module: TModule,
  ) {
    // const ipp = view.ipp
    const pageNoB0 = Math.floor(index / pageLength)
    console.log(
      `loadPageByItemIndex() collectionName: ${collectionName} view: ${viewName} ipp: ${pageLength} index: ${index} module: ${module} pageB1: ${pageNoB0 + 1}`,
    )
    return await loadGenericPage(collectionName, pageNoB0 + 1, viewName, pageLength, module)
  }

  async function toggleCollectionView(name: TCollectionName) {
    const col = getCollectionStore(name)

    const info = getConsumeableCollection(
      name,
      col.viewIndex,
      col.pageNoB1,
      getItemsPerPage(name, col.viewIndex),
      col.array.length,
    )

    const nextViewIndex = (info.viewIndex + 1) % info.views.length
    const nextItemsPerPage = getItemsPerPage(name, nextViewIndex)
    const nextView = info.views[nextViewIndex]
    const nextIndex = info.firstItemNo - 1

    console.log(
      `toggleCollectionView() c: ${name}  module: ${module.value} currentView: ${info.viewName} nextView: ${nextView} index: ${nextIndex}`,
    )
    await loadPageByItemIndex(name, nextView, nextItemsPerPage, nextIndex, module.value)
    //  await loadPageByItemIndex(name, newView, index, module.value)

    col.viewIndex = nextViewIndex
  }

  // function itemIndexById<IDtype extends string | number>(id: IDtype) {
  //   const c = getCollectionStore('main')
  //   return c.itemIndexById<IDtype>(id)
  // }

  // function itemIsInPage<IDtype extends string | number>(id: IDtype) {
  //   const c = getCollectionStore('main')
  //   return c.itemIsInPage(id)
  // }

  // function itemByIndex(name: TCollectionName, index: number): TCollectionArrays {
  //   const c = getCollectionStore(name)
  //   return c.array[index]
  // }

  // function next(
  //   name: TCollectionName,
  //   index: number,
  //   isRight: boolean,
  // ): { item: TCollectionArrays; index: number } {
  //   const c = getCollectionStore(name)
  //   const length = c.array.length
  //   let newIndex

  //   if (isRight) {
  //     newIndex = index === length - 1 ? 0 : index + 1
  //   } else {
  //     newIndex = index === 0 ? length - 1 : index - 1
  //   }
  //   return { item: c.array[newIndex], index: newIndex }
  // }

  function clear(collections: TCollectionName[]) {
    collections.forEach((x) => {
      const c = getCollectionStore(<TCollectionName>x)
      return c.clear()
    })
  }

  function resetCollectionsViewIndex() {
    ;['main', 'media', 'related'].forEach((x) => {
      const c = getCollectionStore(<TCollectionName>x)
      c.viewIndex = 0
    })
  }

  //Note : computed collection will only e reactive only if state (main, media) is exposed.
  return {
    // collection,
    // itemByIndex,
    //setArray,
    loadGenericPage,
    toggleCollectionView,
    clear,
    resetCollectionsViewIndex,
    // itemIndexById,
    loadPageByItemIndex,
    // itemIsInPage,
    // next,
    getConsumeableCollection,
    getCollectionStore,
  }
})
