import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { TModule } from '@/js/types/moduleTypes'
import type { TFuncLoadPage } from '@/js/types/routesTypes'
import {
  TArray,
  TPage,
  TCollectionView,
  TArrayEqualFunc,
  TCName,
  TViewsByCName,
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

  const array = ref<TArray<'media'>[]>([])

  const page = computed(() => {
    const ipp = getItemsPerPage('media', viewIndex.value)
    const start = (pageNoB1.value - 1) * ipp
    const slice = array.value.slice(start, start + ipp)
    const res = slice.map((x) => {
      const media = buildMedia({ full: x.urls.full, tn: x.urls.tn })
      return {
        id: x.id,
        order_column: x.order_column,
        media,
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

  const arrayEqualFunc: TArrayEqualFunc = function (a: TArray, b: TArray) {
    const aMain = a as TArray<'media'>
    const bMain = b as TArray<'media'>
    return aMain.id === bMain.id
  }

  const pageEqualFunc: TPageEqualFunc = function <
    C extends TCName,
    V extends TViewsByCName<C>,
    M extends TModule = 'Stone',
  >(e: TArray, p: TPage<C, V, M>) {
    const eMedia = e as TArray<'media'>
    const pMedia = p as TPage<'media', 'Gallery'>
    return eMedia.id === pMedia.id
  }

  return {
    array,
    page,
    pageNoB1,
    viewIndex,
    info,
    loadPage,
    clear,
    arrayEqualFunc,
    pageEqualFunc,
    //specific
    switchArrayItems,
  }
})
