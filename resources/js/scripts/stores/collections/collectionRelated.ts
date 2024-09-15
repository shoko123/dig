import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { TModule } from '@/js/types/moduleTypes'
import type { TFuncLoadPage } from '@/js/types/routesTypes'
import {
  TCollectionView,
  TApiArray,
  TCollectionArrays,
  TApiPage,
  TArrayEqualFunc,
  TPageEqualFunc,
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

  const array = ref<TApiArray<'related'>[]>([])

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
          const media = buildMedia(x.media, x.module)
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

  function itemIsInPage<IDtype extends string | number>(id: IDtype) {
    return page.value.some((x) => x.id === id)
  }

  const arrayEqualFunc: TArrayEqualFunc = function (a: TCollectionArrays, b: TCollectionArrays) {
    const aMain = a as string
    const bMain = b as string
    return aMain === bMain
  }

  const pageEqualFunc: TPageEqualFunc<'related', TCollectionView, TModule> = function (
    a: TApiPage<'related', TCollectionView, TModule>,
    b: TApiPage<'related', TCollectionView, TModule>,
  ) {
    return a === b
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
    itemIsInPage,
    arrayEqualFunc,
    pageEqualFunc,
    //specific
    relatedTableHeaders,
  }
})
