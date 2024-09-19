import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { TModule } from '@/js/types/moduleTypes'
import type { TFuncLoadPage } from '@/js/types/routesTypes'
import {
  TCollectionView,
  TArrayByCName,
  TCArray,
  TPage,
  TArrayEqualFunc,
  TPageEqualFunc,
  TCName,
  TViewsByCName,
} from '@/js/types/collectionTypes'
import { useMediaStore } from '../media'
import { useModuleStore } from '../module'
import { useCollectionsStore } from './collections'

export const useCollectionRelatedStore = defineStore('collectionRelated', () => {
  const { buildMedia } = useMediaStore()
  const { tagAndSlugFromId, getViewName, getItemsPerPage } = useModuleStore()
  const { getConsumeableCollection } = useCollectionsStore()

  const pageNoB1 = ref(1)
  const viewIndex = ref(0)

  const array = ref<TArrayByCName<'related'>[]>([])

  const info = computed(() => {
    return getConsumeableCollection(
      'related',
      viewIndex.value,
      pageNoB1.value,
      page.value.length,
      array.value.length,
    )
  })

  //relatedTableHeaders for the related.Tabular view
  const relatedTableHeaders = computed(() => {
    return [
      { title: 'Tag', align: 'start', key: 'tag' },
      { title: 'Relation', align: 'start', key: 'relation_name' },
      { title: 'Short Description', align: 'start', key: 'short' },
    ]
  })

  const page = computed(() => {
    const ipp = getItemsPerPage('related', viewIndex.value)
    const viewName = getViewName('related', viewIndex.value)
    const start = (pageNoB1.value - 1) * ipp
    const slice = array.value.slice(start, start + ipp)
    let res = []

    switch (viewName) {
      case 'Tabular':
        res = slice.map((x) => {
          return {
            ...x,
            ...tagAndSlugFromId(x.id, x.module),
            tag: `${x.module} ${tagAndSlugFromId(x.id, x.module)}`,
          }
        })
        break

      case 'Gallery':
        res = slice.map((x) => {
          const media = buildMedia(x.urls, x.module)
          return { ...x, media }
        })
        break

      case 'Chips':
        res = slice.map((x) => {
          const res = tagAndSlugFromId(x.id, x.module)
          return {
            relation_name: x.relation_name,
            module: x.module,
            id: x.id,
            slug: res.slug,
            tag: `${x.module} ${res.tag}`,
          }
        })
        break
    }
    return res
  })

  const loadPage: TFuncLoadPage = async function (
    pageNo: number,
    view: TCollectionView,
    pageLength: number,
    module: TModule,
  ) {
    //related page is a sub-array of array, determined by computed(array, pageNoB1). So, just set pageNoB1
    view
    module
    pageNoB1.value = pageNo
    return { success: true, message: '' }
  }

  const arrayEqualFunc: TArrayEqualFunc = function (a: TCArray, b: TCArray) {
    const aArr = a as TArrayByCName<'related'>
    const bArr = b as TArrayByCName<'related'>
    return (
      aArr.relation_name === bArr.relation_name &&
      aArr.module === bArr.module &&
      aArr.id === bArr.id
    )
  }

  const pageEqualFunc: TPageEqualFunc = function <
    A extends TCArray,
    C extends TCName,
    V extends TViewsByCName<C>,
    M extends TModule = 'Stone',
  >(e: A, p: TPage<C, V, M>) {
    const eRelated = e as TArrayByCName<'related'>
    const pRelated = p as TPage<'related', TCollectionView>
    return eRelated.module === pRelated.module && eRelated.id === pRelated.id
  }

  function clear() {
    console.log(`collectionRelated.clear()`)
    array.value = []
    pageNoB1.value = 1
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
    relatedTableHeaders,
  }
})
