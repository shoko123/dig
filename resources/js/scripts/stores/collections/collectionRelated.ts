import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { TModule } from '@/types/moduleTypes'
import type { TFuncLoadPage } from '@/types/routesTypes'
import {
  TCollectionView,
  TArray,
  TPage,
  TArrayEqualFunc,
  TPageEqualFunc,
} from '@/types/collectionTypes'
import { useMediaStore } from '../media'
import { useModuleStore } from '../module'
import { useCollectionsStore } from './collections'

export const useCollectionRelatedStore = defineStore('collectionRelated', () => {
  const { buildMedia } = useMediaStore()
  const { tagAndSlugFromId, getViewName, getItemsPerPage } = useModuleStore()
  const { getConsumeableCollection } = useCollectionsStore()

  const pageNoB1 = ref(1)
  const viewIndex = ref(0)

  // array
  const arrayData = ref<TArray<'related'>[]>([])

  function setArray(arr: TArray[]) {
    arrayData.value = arr as unknown as TArray<'related'>[]
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
    //related page is a sub-array of array, determined by computed(array, pageNoB1). So, just set pageNoB1

    pageNoB1.value = pageNo
    return { success: true, message: '' }
  }

  const page = computed(() => {
    const ipp = getItemsPerPage('related', viewIndex.value)
    const viewName = getViewName('related', viewIndex.value)
    const start = (pageNoB1.value - 1) * ipp
    const slice = arrayData.value.slice(start, start + ipp)
    let res: unknown[] = []

    switch (viewName) {
      case 'Tabular':
        res = slice.map((x) => {
          const tas = tagAndSlugFromId(x.id, x.module)
          return {
            ...x,
            slug: tas.slug,
            tag: `${x.module} ${tas.tag}`,
          }
        })
        break

      case 'Gallery':
        res = slice.map((x) => {
          const media = buildMedia(x.urls, x.module)
          const tas = tagAndSlugFromId(x.id, x.module)
          return { ...x, tag: tas.tag, slug: tas.slug, media }
        })
        break

      case 'Chips':
        res = slice.map((x) => {
          const tas = tagAndSlugFromId(x.id, x.module)
          return {
            relation_name: x.relation_name,
            module: x.module,
            id: x.id,
            ...tas,
          }
        })
        break
    }
    return res
  })

  const info = computed(() => {
    return getConsumeableCollection(
      'related',
      viewIndex.value,
      pageNoB1.value,
      page.value.length,
      arrayData.value.length,
    )
  })

  const arrayEqualFunc: TArrayEqualFunc = function (a: TArray, b: TArray) {
    const aArr = a as TArray<'related'>
    const bArr = b as TArray<'related'>
    return (
      aArr.relation_name === bArr.relation_name &&
      aArr.module === bArr.module &&
      aArr.id === bArr.id
    )
  }

  const pageEqualFunc: TPageEqualFunc = function (e: TArray, p: TPage) {
    const eRelated = e as TArray<'related'>
    const pRelated = p as TPage<'related', TCollectionView>
    return eRelated.module === pRelated.module && eRelated.id === pRelated.id
  }

  function clear() {
    console.log(`collectionRelated.clear()`)
    arrayData.value = []
    pageNoB1.value = 1
  }

  //relatedTableHeaders for the related.Tabular view
  const relatedTableHeaders = computed(() => {
    return [
      { title: 'Tag', align: 'start', key: 'tag' },
      { title: 'Relation', align: 'start', key: 'relation_name' },
      { title: 'Short Description', align: 'start', key: 'short' },
    ]
  })

  return {
    array,
    page,
    pageNoB1,
    viewIndex,
    info,
    setArray,
    loadPage,
    clear,
    arrayEqualFunc,
    pageEqualFunc,
    //specific
    relatedTableHeaders,
  }
})
