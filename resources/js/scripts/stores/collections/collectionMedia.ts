// collection.ts
//handles all collections and loading of pages
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { TModule } from '@/js/types/moduleTypes'
import type { TFuncLoadPage } from '@/js/types/routesTypes'
import {
  TCollectionExtra,
  TApiArray,
  TCollectionView,
  TItemsPerView,
} from '@/js/types/collectionTypes'
import { useMediaStore } from '../media'
import { useCollectionsStore } from './collections'

export const useCollectionMediaStore = defineStore('collectionMedia', () => {
  const { buildMedia } = useMediaStore()
  const { getConsumeableCollection } = useCollectionsStore()
  const itemsPerView = <TItemsPerView>{ Gallery: 18, Tabular: 20, Chips: 50 }
  const extra = ref<TCollectionExtra>({
    pageNoB1: 1,
    views: [{ name: 'Gallery', ipp: 36 }],
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

  const ipp = computed(() => {
    return extra.value.views[extra.value.viewIndex].ipp
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
    const start = (extra.value.pageNoB1 - 1) * ipp.value
    const slice = array.value.slice(start, start + ipp.value)
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

  function setCollectionViews(views: TCollectionView[]) {
    extra.value.views = views.map((x) => {
      return { name: x, ipp: itemsPerView[x] }
    })
  }

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
    ipp,
    array,
    page,
    loadPage,
    itemIndexById,
    setCollectionViews,
    switchArrayItems,
    collection,
    itemIsInPage,
    clear,
    all,
  }
})
