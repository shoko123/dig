// collection.ts
//handles all collections and loading of pages
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { TModule } from '@/js/types/moduleTypes'
import type { TFuncLoadPage } from '@/js/types/routesTypes'
import {
  TCollectionExtra,
  TCollectionView,
  TItemsPerView,
  TCView,
  TApiArray,
} from '@/js/types/collectionTypes'
import { useMediaStore } from '../media'
import { useModuleStore } from '../module'

export const useCollectionRelatedStore = defineStore('collectionRelated', () => {
  const { buildMedia } = useMediaStore()
  const { tagAndSlugFromId } = useModuleStore()

  const itemsPerView = <TItemsPerView>{ Gallery: 36, Tabular: 100, Chips: 200 }

  const extra = ref<TCollectionExtra>({
    pageNoB1: 1,
    views: <TCView[]>[
      { name: 'Tabular', ipp: 36 },
      { name: 'Chips', ipp: 200 },
    ],
    viewIndex: 0,
  })

  const array = ref<TApiArray<'related'>[]>([])

  const ipp = computed(() => {
    return extra.value.views[extra.value.viewIndex].ipp
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
    //let ipp = c.getIpp("Gallery")
    const start = (extra.value.pageNoB1 - 1) * ipp.value
    const slice = array.value.slice(start, start + ipp.value)
    let res = []

    switch (extra.value.views[extra.value.viewIndex].name) {
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
      extra: extra.value,
    }
  })

  function setCollectionViews(views: TCollectionView[]) {
    extra.value.views = views.map((x) => {
      return { name: x, ipp: itemsPerView[x] }
    })
  }

  const loadPage: TFuncLoadPage = async function (
    pageNoB1: number,
    view: TCollectionView,
    pageLength: number,
    module: TModule,
  ) {
    //related page is a sub-array of array, determined by computed(array, pageNoB1). So, just set pageNoB1
    view
    module
    extra.value.pageNoB1 = pageNoB1
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
    array.value = []
    extra.value.pageNoB1 = 1
  }

  return {
    extra,
    ipp,
    array,
    page,
    relatedTableHeaders,
    loadPage,
    itemIndexById,
    setCollectionViews,
    collection,
    itemIsInPage,
    clear,
  }
})
