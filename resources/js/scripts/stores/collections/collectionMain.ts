import { defineStore, storeToRefs } from 'pinia'
import { ref, computed } from 'vue'
import type {
  TArray,
  TApiPage,
  TPage,
  TCollectionView,
  TArrayEqualFunc,
  TPageEqualFunc,
} from '@/js/types/collectionTypes'
import type { TFuncLoadPage } from '@/js/types/routesTypes'
import type { TModule } from '@/js/types/moduleTypes'
import { useModuleStore } from '../module'
import { useXhrStore } from '../xhr'
import { useMediaStore } from '../media'
import { useCollectionsStore } from './collections'

export const useCollectionMainStore = defineStore('collectionMain', () => {
  const { send } = useXhrStore()
  const { buildMedia } = useMediaStore()
  const { tagAndSlugFromId } = useModuleStore()
  const { module } = storeToRefs(useModuleStore())
  const { getConsumeableCollection } = useCollectionsStore()

  const pageNoB1 = ref(1)
  const viewIndex = ref(0)
  const array = ref<TArray<'main'>[]>([])

  const apiPage = ref<TApiPage<'main', TCollectionView, TModule>[]>([])

  function setArray(arr: TArray[]) {
    array.value = arr as unknown as TArray<'main'>[]
  }

  const page = computed(() => {
    return apiPage.value.map((x) => {
      const tagAndSlug = tagAndSlugFromId(x.id)
      let y = { ...x, ...tagAndSlug }
      if ('urls' in y) {
        const media = buildMedia(y.urls, module.value)
        y = { ...y, ...{ media } }
      }
      return y
    })
  })

  const info = computed(() => {
    return getConsumeableCollection(
      'main',
      viewIndex.value,
      pageNoB1.value,
      page.value.length,
      array.value.length,
    )
  })

  const loadPage: TFuncLoadPage = async function (
    pageNo: number,
    view: TCollectionView,
    pageLength: number,
    module: TModule,
  ) {
    if (pageLength === 0) {
      apiPage.value = []
      return { success: false, message: 'Error: page size is 0.' }
    }
    const start = (pageNo - 1) * pageLength
    const slice = array.value.slice(start, start + pageLength)
    console.log(`loadPage(main) v: ${view} pNo: ${pageNo}  len: ${pageLength} startIndex: ${start}`)

    switch (view) {
      case 'Chips': {
        apiPage.value = <TApiPage<'main', 'Chips', TModule>[]>slice.map((x) => {
          return { id: x }
        })
        pageNoB1.value = pageNo
        return { success: true, message: '' }
      }
      default: {
        //views Gallery or Tabular require db access
        const res = await send<TApiPage<'main', 'Gallery'>[]>('module/page', 'post', {
          module: module,
          view: view,
          ids: slice,
        })
        if (res.success) {
          apiPage.value = res.data
          pageNoB1.value = pageNo
          return { success: true, message: '' }
        } else {
          console.log(`loadPage failed. err: ${JSON.stringify(res.message, null, 2)}`)
          return { success: false, message: res.message }
        }
      }
    }
  }

  const arrayEqualFunc: TArrayEqualFunc = function (a: TArray, b: TArray) {
    const aMain = a as TArray<'main'>
    const bMain = b as TArray<'main'>
    return aMain === bMain
  }

  const pageEqualFunc: TPageEqualFunc = function (e: TArray, p: TPage) {
    const eMain = e as TArray<'main'>
    const pMain = p as TPage<'main', TCollectionView>
    return eMain === pMain.id
  }

  function clear() {
    console.log(`collectionMain.clear()`)
    array.value = []
    apiPage.value = []
    pageNoB1.value = 1
  }

  return {
    array,
    page,
    apiPage,
    pageNoB1,
    viewIndex,
    info,
    setArray,
    loadPage,
    clear,
    arrayEqualFunc,
    pageEqualFunc,
  }
})
