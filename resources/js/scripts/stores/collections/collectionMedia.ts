import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { TModule } from '@/types/moduleTypes'
import type { TFuncLoadPage } from '@/types/routesTypes'
import {
  TArray,
  TPage,
  TCollectionView,
  TArrayEqualFunc,
  TPageEqualFunc,
} from '@/types/collectionTypes'
import { useModuleStore } from '@/scripts/stores/module'
import { useMediaStore } from '../media'
import { useCollectionsStore } from './collections'

export const useCollectionMediaStore = defineStore('collectionMedia', () => {
  const { buildMedia } = useMediaStore()
  const { getConsumeableCollection } = useCollectionsStore()
  const { getItemsPerPage } = useModuleStore()

  const pageNoB1 = ref(1)
  const viewIndex = ref(0)

  // array
  const arrayData = ref<TArray<'media'>[]>([])

  function setArray(arr: TArray[]) {
    arrayData.value = arr as unknown as TArray<'media'>[]
  }

  const array = computed(() => {
    return arrayData.value
  })

  // page

  /* eslint-disable */
  const loadPage: TFuncLoadPage = async function (
    pageNo: number,
    view: TCollectionView,
    pageLength: number,
    module: TModule,
  ) {
    /* eslint-enable */
    //do nothing except setting pageNoB1
    pageNoB1.value = pageNo
    return { success: true, message: '' }
  }

  const page = computed(() => {
    const ipp = getItemsPerPage('media', viewIndex.value)
    const start = (pageNoB1.value - 1) * ipp
    const slice = arrayData.value.slice(start, start + ipp)
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
      arrayData.value.length,
    )
  })

  function clear() {
    console.log(`collectionMedia.clear()`)
    arrayData.value = []
    pageNoB1.value = 1
  }

  const arrayEqualFunc: TArrayEqualFunc = function (a: TArray, b: TArray) {
    const aMain = a as TArray<'media'>
    const bMain = b as TArray<'media'>
    return aMain.id === bMain.id
  }

  const pageEqualFunc: TPageEqualFunc = function (e: TArray, p: TPage) {
    const eMedia = e as TArray<'media'>
    const pMedia = p as TPage<'media', 'Gallery'>
    return eMedia.id === pMedia.id
  }

  function switchArrayItems(indexA: number, indexB: number) {
    const temp = arrayData.value[indexA]!
    arrayData.value[indexA] = arrayData.value[indexB]!
    arrayData.value[indexB] = temp
  }

  return {
    setArray,
    array,
    loadPage,
    page,
    pageNoB1,
    viewIndex,
    info,
    clear,
    arrayEqualFunc,
    pageEqualFunc,
    //specific
    switchArrayItems,
  }
})
