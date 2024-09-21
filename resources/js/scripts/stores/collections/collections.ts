import { defineStore, storeToRefs } from 'pinia'

import type { TArray, TCName, TCollectionView } from '@/js/types/collectionTypes'
import type { TModule } from '@/js/types/moduleTypes'

import { useModuleStore } from '../module'
import { useCollectionMainStore } from './collectionMain'
import { useCollectionMediaStore } from './collectionMedia'
import { useCollectionRelatedStore } from './collectionRelated'

export const useCollectionsStore = defineStore('collections', () => {
  const { getItemsPerPage, getViewName, getCollectionViews } = useModuleStore()
  const { module } = storeToRefs(useModuleStore())

  function getCollectionStore(source: TCName) {
    switch (source) {
      case 'main':
        return useCollectionMainStore()
      case 'media':
        return useCollectionMediaStore()
      case 'related':
        return useCollectionRelatedStore()
    }
  }

  function setCollectionArray(name: TCName, array: TArray[]) {
    const c = getCollectionStore(name)
    c.setArray(array)
  }

  function getConsumeableCollection(
    name: TCName,
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
    name: TCName,
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
    collectionName: TCName,
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

  async function toggleCollectionView(name: TCName) {
    const c = getCollectionStore(name)
    const info = getConsumeableCollection(
      name,
      c.viewIndex,
      c.pageNoB1,
      getItemsPerPage(name, c.viewIndex),
      c.array.length,
    )

    const nextViewIndex = (info.viewIndex + 1) % info.views.length
    const nextItemsPerPage = getItemsPerPage(name, nextViewIndex)
    const nextView = info.views[nextViewIndex]
    const nextIndex = info.firstItemNo - 1

    console.log(
      `toggleCollectionView() c: ${name}  module: ${module.value} currentView: ${info.viewName} nextView: ${nextView} index: ${nextIndex}`,
    )
    await loadPageByItemIndex(name, nextView, nextItemsPerPage, nextIndex, module.value)
    c.viewIndex = nextViewIndex
  }

  function clear(collections: TCName[]) {
    collections.forEach((x) => {
      const c = getCollectionStore(<TCName>x)
      return c.clear()
    })
  }

  function resetCollectionsViewIndex() {
    ;['main', 'media', 'related'].forEach((x) => {
      const c = getCollectionStore(<TCName>x)
      c.viewIndex = 0
    })
  }

  //Note: computed collection will only be reactive only if state (main, media) is exposed.
  return {
    setCollectionArray,
    getCollectionStore,
    getConsumeableCollection,
    loadPageByItemIndex,
    loadGenericPage,
    toggleCollectionView,
    clear,
    resetCollectionsViewIndex,
  }
})
