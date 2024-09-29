// stores/module.ts
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type {
  TApiModuleInit,
  TModule,
  TObjIdTagAndSlugFuncsByModule,
  TItemsPerPageByView,
  TViewsForCollection,
  TModuleToUrlName,
  TUrlModuleNameToModule,
  TModuleBtnsInfo,
  TObjModuleDetails,
} from '../../types/moduleTypes'

import { TCName } from '@/types/collectionTypes'

export const useModuleStore = defineStore('module', () => {
  const module = ref<TModule>('Locus')
  const counts = ref({ items: 0, media: 0 })
  const welcomeText = ref<string>('')
  const firstSlug = ref<string>('')
  const itemsPerPage = ref<TItemsPerPageByView>({ Gallery: 0, Tabular: 0, Chips: 0 })
  const collectionViews = ref<TViewsForCollection>({ main: [], media: [], related: [] })

  const moduleToUrlModuleName = ref<TModuleToUrlName>({
    Ceramic: 'ceramics',
    Locus: 'loci',
    Stone: 'stones',
  })

  const urlModuleNameToModule = ref<TUrlModuleNameToModule>(inverse(moduleToUrlModuleName.value))

  function inverse<T extends TModuleToUrlName>(obj: T): TUrlModuleNameToModule {
    const tmpMap = new Map()
    let res: Partial<TUrlModuleNameToModule> = {}
    Object.entries(obj).forEach(([key, value]) => {
      tmpMap.set(value, key)
    })
    res = Object.fromEntries(tmpMap.entries())
    return res as TUrlModuleNameToModule
  }

  // This object is defined here (rather than having specific functions implemented in each module)
  // for better code splitting.
  const IdTagSlugObj: TObjIdTagAndSlugFuncsByModule = {
    Ceramic: {
      regexp: new RegExp(/^\d{2}.\d{1}$/),
      idToSlugTag: (id: string) => {
        return { slug: id, tag: id }
      },
    },
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
  }

  const details: TObjModuleDetails = {
    Ceramic: {
      regexp: new RegExp(/^\d{2}.\d{1}$/),
      idToSlugTag: (id: string) => {
        return { slug: id, tag: id }
      },
      categorizerObj: {},
    },
    Locus: {
      regexp: new RegExp(/^[a-zA-Z -]{2,10}.\d{1,3}.\d{1,3}$/),
      idToSlugTag: (id: string) => {
        return { slug: id, tag: id }
      },
      categorizerObj: {},
    },
    Stone: {
      regexp: new RegExp(/^B20\d{2}.\d{1}.\d{1,3}$/),
      idToSlugTag: (id: string) => {
        return { slug: id, tag: id }
      },
      categorizerObj: {
        old_museum_id: (val: string) => {
          // console.log(`old_museum_idCategorizer(${val})`)
          return val === null || (typeof val === 'string' && val.length === 0) ? 1 : 0
        },
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

  function getItemsPerPage(collectionName: TCName, collectionViewIndex: number): number {
    return itemsPerPage.value[collectionViews.value[collectionName]![collectionViewIndex]!]!
  }

  function getViewName(collectionName: TCName, collectionViewIndex: number) {
    return collectionViews.value[collectionName]![collectionViewIndex]!
  }

  function getCollectionViews(collectionName: TCName) {
    return collectionViews.value[collectionName]!
  }
  /*
   * if module is not included, use current (we include it e.g. when we want tags of related item)
   */
  function tagAndSlugFromId(id: string, m?: TModule) {
    const mod = m === undefined ? module.value : m
    // const store = await getStore(mod)
    // return store.idToTagAndSlug(id)
    const func = IdTagSlugObj[mod].idToSlugTag
    return func(id)
  }

  function getCategorizer() {
    return details[module.value].categorizerObj
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

  const moduleBtnsInfo = computed<TModuleBtnsInfo[]>(() => {
    const arr: TModuleBtnsInfo[] = []
    Object.entries(moduleToUrlModuleName.value).forEach(([k, v]) => {
      arr.push({
        title: k,
        url_module: v,
        module: <TModule>k,
      })
    })

    return arr
  })

  return {
    setModuleInfo,
    getStore,
    module,
    counts,
    welcomeText,
    firstSlug,
    itemsPerPage,
    collectionViews,
    urlModuleNameToModule,
    moduleToUrlModuleName,
    moduleBtnsInfo,
    slugToId,
    tagAndSlugFromId,
    getCollectionViews,
    getViewName,
    getItemsPerPage,
    getCategorizer,
  }
})
