// stores/module.ts
import { defineStore, storeToRefs } from 'pinia'
import { ref, computed } from 'vue'
import type {
  TApiModuleInit,
  TModule,
  TObjIdTagAndSlugFuncsByModule,
  TItemsPerPageByView,
  TViewsForCollection,
} from '../../types/moduleTypes'
import { useMainStore } from './main'
import { useRoutesMainStore } from './routes/routesMain'
import { TCollectionName } from '@/js/types/collectionTypes'

export const useModuleStore = defineStore('module', () => {
  const { bucketUrl } = storeToRefs(useMainStore())
  const { current } = storeToRefs(useRoutesMainStore())
  const module = ref<TModule>('Locus')
  const counts = ref({ items: 0, media: 0 })
  const welcomeText = ref<string>('')
  const firstSlug = ref<string>('')

  const itemsPerPage = ref<TItemsPerPageByView>({ Gallery: 0, Tabular: 0, Chips: 0 })
  const collectionViews = ref<TViewsForCollection>({ main: [], media: [], related: [] })

  // This object is defined here (rather than having specific functions implemented in each module)
  // for better code splitting.
  const IdTagSlugObj: TObjIdTagAndSlugFuncsByModule = {
    Locus: {
      regexp: new RegExp(/^[a-zA-Z -]{2,10}.\d{1,3}.\d{1,3}$/),
      idToSlugTag: (id: string) => {
        return { slug: id, tag: id }
      },
    },
    Stone: {
      regexp: new RegExp(/^B20\d{2}.\d{1}.\d{1,3}$/),
      idToSlugTag: (id: string) => {
        return { slug: id, tag: id }
      },
    },
    Ceramic: {
      regexp: new RegExp(/^\d{2}.\d{1}$/),
      idToSlugTag: (id: string) => {
        return { slug: id, tag: id }
      },
    },
  }

  async function setModuleInfo(initData: TApiModuleInit) {
    module.value = initData.module
    counts.value = initData.counts
    welcomeText.value = initData.welcome_text
    const ts = tagAndSlugFromId(initData.first_id, initData.module)
    firstSlug.value = ts.slug
    itemsPerPage.value = initData.display_options.items_per_page
    collectionViews.value = initData.display_options.collection_views
  }

  function getItemsPerPage(collectionName: TCollectionName, collectionViewIndex: number): number {
    return itemsPerPage.value[collectionViews.value[collectionName][collectionViewIndex]]
  }

  function getViewName(collectionName: TCollectionName, collectionViewIndex: number) {
    return collectionViews.value[collectionName][collectionViewIndex]
  }

  function getCollectionViews(collectionName: TCollectionName) {
    return collectionViews.value[collectionName]
  }
  /*
   * if module is not included, use current (we include it e.g. when we want tags of related item)
   */
  function tagAndSlugFromId(id: string, m?: TModule) {
    const mod = m === undefined ? module.value : m
    const func = IdTagSlugObj[mod].idToSlugTag
    return func(id)
  }

  function slugToId(m: TModule, slug: string) {
    if (!IdTagSlugObj[m].regexp.test(slug)) {
      return {
        success: false,
        message: `Unsupported ${module.value} slug: ${slug}`,
      }
    }
    return {
      success: true,
      id: slug,
    }
  }

  // function beforeStore(isCreate: boolean) {
  //   return isCreate
  //   // const store = getStore(module.value)
  //   // return store.beforeStore(isCreate)
  // }

  // const moduleNewFields = computed(() => {
  //   return 'res'
  //   // const store = getStore(module.value)
  //   // return store.newFields
  // })

  const backgroundImage = computed(() => {
    switch (current.value.name) {
      case 'welcome':
        return {
          fullUrl: `${bucketUrl.value}app/background/${module.value}.jpg`,
          tnUrl: `${bucketUrl.value}app/background/${module.value}-tn.jpg`,
        }
      case 'login':
      case 'register':
      case 'forgot-password':
      case 'reset-password':
        return {
          fullUrl: `${bucketUrl.value}app/background/Auth.jpg`,
          tnUrl: `${bucketUrl.value}app/background/Auth-tn.jpg`,
        }
      default:
        return undefined
    }
  })

  async function getStore(m?: TModule) {
    const mod = m === undefined ? module.value : m

    switch (mod) {
      case 'Locus':
        {
          const { useLocusStore } = await import('./modules/Locus')
          return useLocusStore()
        }
        break
      case 'Stone':
        {
          const { useStoneStore } = await import('./modules/Stone')
          return useStoneStore()
        }
        break
      case 'Ceramic': {
        const { useCeramicStore } = await import('./modules/Ceramic')
        return useCeramicStore()
      }
    }
  }

  return {
    setModuleInfo,
    getStore,
    module,
    counts,
    welcomeText,
    firstSlug,
    itemsPerPage,
    collectionViews,
    backgroundImage,
    slugToId,
    tagAndSlugFromId,
    getCollectionViews,
    getViewName,
    getItemsPerPage,
  }
})
