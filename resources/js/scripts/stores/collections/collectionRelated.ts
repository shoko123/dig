import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { TModule } from '@/js/types/moduleTypes'
import type { TFuncLoadPage } from '@/js/types/routesTypes'
import { TCollectionView, TApiArray } from '@/js/types/collectionTypes'
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

  const collection = computed(() => {
    return {
      array: array.value,
      page: page.value, //computedPage.value,
      pageNoB1: pageNoB1.value,
      viewIndex: viewIndex.value,
    }
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

  function itemIndexById<IDtype extends string | number>(id: IDtype) {
    const index = array.value.findIndex((x) => x.id === id)
    return index
  }

  function itemIsInPage<IDtype extends string | number>(id: IDtype) {
    return page.value.some((x) => x.id === id)
  }

  // function itemByIndex(index: number): TApiArray<'related'> {
  //   return array.value[index]
  // }

  function clear() {
    console.log(`collectionRelated.clear()`)
    array.value = []
    pageNoB1.value = 1
  }

  return {
    pageNoB1,
    viewIndex,
    array,
    page,
    relatedTableHeaders,
    loadPage,
    itemIndexById,
    collection,
    itemIsInPage,
    clear,
    info,
  }
})
