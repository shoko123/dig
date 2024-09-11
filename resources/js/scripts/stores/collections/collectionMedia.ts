// collection.ts
//handles all collections and loading of pages
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { TModule } from '@/js/types/moduleTypes'
import type { TFuncLoadPage } from '@/js/types/routesTypes'
import { TCollectionExtra, TApiArray, TCollectionView } from '@/js/types/collectionTypes'
import { useModuleStore } from '../module'
import { useMediaStore } from '../media'
import { useCollectionsStore } from './collections'

export const useCollectionMediaStore = defineStore('collectionMedia', () => {
  const { buildMedia } = useMediaStore()
  const { getConsumeableCollection } = useCollectionsStore()
  const { getItemsPerPage } = useModuleStore()
  const extra = ref<TCollectionExtra>({
    pageNoB1: 1,
    viewIndex: 0,
  })

  const array = ref<TApiArray<'media'>[]>([])

  const collection = computed(() => {
    return {
      array: array.value,
      page: page.value,
      extra: extra.value,
    }
  })

  const all = computed(() => {
    return getConsumeableCollection(
      'media',
      extra.value.viewIndex,
      extra.value.pageNoB1,
      page.value.length,
      array.value.length,
    )
  })

  const page = computed<TApiArray<'media'>[]>(() => {
    const ipp = getItemsPerPage('media', extra.value.viewIndex)
    const start = (extra.value.pageNoB1 - 1) * ipp
    const slice = array.value.slice(start, start + ipp)
    const res = slice.map((x) => {
      const media = buildMedia({ full: x.urls.full, tn: x.urls.tn })
      return {
        id: x.id,
        order_column: x.order_column,
        urls: media.urls,
      }
    })
    return res
  })

  function switchArrayItems(indexA: number, indexB: number) {
    const temp = { ...array.value[indexA] }
    array.value[indexA] = { ...array.value[indexB] }
    array.value[indexB] = { ...temp }
  }

  const loadPage: TFuncLoadPage = async function (
    pageNoB1: number,
    view: TCollectionView,
    pageLength: number,
    module: TModule,
  ) {
    view
    module
    pageLength
    extra.value.pageNoB1 = pageNoB1
    return { success: true, message: '' }
  }

  function itemIndexById<IDtype extends string | number>(id: IDtype) {
    const index = array.value.findIndex((x) => x['id'] === id)
    return index
  }

  function itemIsInPage<IDtype extends string | number>(id: IDtype) {
    return page.value.some((x) => x.id === id)
  }

  function clear() {
    array.value = []
    extra.value.pageNoB1 = 1
  }

  return {
    extra,
    array,
    page,
    loadPage,
    itemIndexById,
    switchArrayItems,
    collection,
    itemIsInPage,
    clear,
    all,
  }
})
