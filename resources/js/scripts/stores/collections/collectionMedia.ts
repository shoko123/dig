import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { TModule } from '@/js/types/moduleTypes'
import type { TFuncLoadPage } from '@/js/types/routesTypes'
import {
  TArrayByCName,
  TCArray,
  TApiPage,
  TCollectionView,
  TArrayEqualFunc,
  TPageEqualFunc,
} from '@/js/types/collectionTypes'
import { useModuleStore } from '../module'
import { useMediaStore } from '../media'
import { useCollectionsStore } from './collections'

export const useCollectionMediaStore = defineStore('collectionMedia', () => {
  const { buildMedia } = useMediaStore()
  const { getConsumeableCollection } = useCollectionsStore()
  const { getItemsPerPage } = useModuleStore()

  const pageNoB1 = ref(1)
  const viewIndex = ref(0)

  const array = ref<TArrayByCName<'media'>[]>([])

  const page = computed<TArrayByCName<'media'>[]>(() => {
    const ipp = getItemsPerPage('media', viewIndex.value)
    const start = (pageNoB1.value - 1) * ipp
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

  const info = computed(() => {
    return getConsumeableCollection(
      'media',
      viewIndex.value,
      pageNoB1.value,
      page.value.length,
      array.value.length,
    )
  })

  function switchArrayItems(indexA: number, indexB: number) {
    const temp = { ...array.value[indexA] }
    array.value[indexA] = { ...array.value[indexB] }
    array.value[indexB] = { ...temp }
  }

  const loadPage: TFuncLoadPage = async function (
    pageNo: number,
    view: TCollectionView,
    pageLength: number,
    module: TModule,
  ) {
    //do nothing except setting pageNoB1
    view
    module
    pageLength
    pageNoB1.value = pageNo
    return { success: true, message: '' }
  }

  function clear() {
    console.log(`collectionMedia.clear()`)
    array.value = []
    pageNoB1.value = 1
  }

  function elementIsInPage<IDtype extends string | number>(id: IDtype) {
    return !!id
  }

  const arrayEqualFunc: TArrayEqualFunc = function (a: TCArray, b: TCArray) {
    const aMain = a as string
    const bMain = b as string
    return aMain === bMain
  }

  const pageEqualFunc: TPageEqualFunc<'media', TCollectionView, TModule> = function (
    a: TApiPage<'media', TCollectionView, TModule>,
    b: TApiPage<'media', TCollectionView, TModule>,
  ) {
    return a === b
  }

  return {
    array,
    page,
    pageNoB1,
    viewIndex,
    info,
    loadPage,
    clear,
    elementIsInPage,
    arrayEqualFunc,
    pageEqualFunc,
    //specific
    switchArrayItems,
  }
})
